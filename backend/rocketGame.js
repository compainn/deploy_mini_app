// rocketGame.js
const ws = require('ws');
const WebSocketServer = ws.Server;
const WebSocket = ws;
const { User, Transaction } = require('./models/User');

function generateCrashPoint() {
  const x = Math.floor(Math.random() * 1000000);
  const y = (1000000 / (x + 1)) * (1 - 0.07);
  return Math.max(1.01, parseFloat(y.toFixed(2)));
}

let state = {
  phase: 'betting',
  multiplier: 1.00,
  crashAt: 1.00,
  bets: [],
  roundId: 0,
  timeLeft: 10,
};

// Храним клиентов с их telegramId для реконнекта
// Map: ws -> { telegramId }
const clients = new Map();

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const [wsClient] of clients) {
    if (wsClient.readyState === WebSocket.OPEN) {
      wsClient.send(msg);
    }
  }
}

function getPublicState() {
  return {
    type: 'state',
    phase: state.phase,
    multiplier: state.multiplier,
    crashAt: state.phase === 'crashed' ? state.crashAt : null,
    bets: state.bets.map(b => ({
      telegramId: b.telegramId,
      username: b.username,
      amount: b.amount,
      cashedOut: b.cashedOut,
      cashoutMultiplier: b.cashoutMultiplier,
    })),
    roundId: state.roundId,
    timeLeft: state.timeLeft,
  };
}

function startBetting() {
  state.phase = 'betting';
  state.multiplier = 1.00;
  state.crashAt = generateCrashPoint();
  state.bets = [];
  state.roundId++;
  state.timeLeft = 10;

  console.log(`[ROCKET] Round ${state.roundId} betting starts, crashAt=${state.crashAt}`);
  broadcast(getPublicState());

  let tick = 10;
  const countdown = setInterval(() => {
    tick--;
    state.timeLeft = tick;
    broadcast({ type: 'countdown', timeLeft: tick });
    if (tick <= 0) {
      clearInterval(countdown);
      startFlying();
    }
  }, 1000);
}

function startFlying() {
  state.phase = 'flying';
  state.multiplier = 1.00;
  console.log(`[ROCKET] Flying started, crashAt=${state.crashAt}`);
  broadcast(getPublicState());

  const startTime = Date.now();

  const flyInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    state.multiplier = parseFloat((Math.pow(Math.E, 0.12 * elapsed)).toFixed(2));
    if (state.multiplier < 1) state.multiplier = 1.00;

    broadcast({ type: 'tick', multiplier: state.multiplier });

    if (state.multiplier >= state.crashAt) {
      clearInterval(flyInterval);
      crash();
    }
  }, 100);
}

async function crash() {
  state.phase = 'crashed';
  state.multiplier = state.crashAt;
  console.log(`[ROCKET] CRASH at ${state.crashAt}x`);
  broadcast({
    type: 'crash',
    crashAt: state.crashAt,
    bets: state.bets.map(b => ({
      username: b.username,
      amount: b.amount,
      cashedOut: b.cashedOut,
      cashoutMultiplier: b.cashoutMultiplier,
    })),
  });
  setTimeout(startBetting, 3000);
}

function initRocketWS(server) {
  const wss = new WebSocketServer({ server, path: '/ws/rocket' });

  wss.on('connection', (wsClient) => {
    clients.set(wsClient, { telegramId: null });
    console.log(`[WS] Client connected, total: ${clients.size}`);

    // Шлём текущее состояние сразу
    wsClient.send(JSON.stringify(getPublicState()));

    // Ping каждые 25 сек чтобы не разрывалось
    const pingInterval = setInterval(() => {
      if (wsClient.readyState === WebSocket.OPEN) {
        wsClient.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 25000);

    wsClient.on('pong', () => {
      // соединение живо
    });

    wsClient.on('message', async (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      // Сохраняем telegramId клиента
      if (msg.telegramId) {
        const info = clients.get(wsClient) || {};
        info.telegramId = msg.telegramId;
        clients.set(wsClient, info);
      }

      // ── Ставка ──
      if (msg.type === 'bet') {
        console.log(`[BET] ${msg.telegramId} wants to bet ${msg.amount}, phase=${state.phase}`);

        if (state.phase !== 'betting') {
          wsClient.send(JSON.stringify({ type: 'error', text: 'Ставки только до старта' }));
          return;
        }

        const { telegramId, username, amount } = msg;
        if (!telegramId || !amount || amount <= 0) return;

        // Проверяем дубликат
        if (state.bets.find(b => b.telegramId === telegramId)) {
          wsClient.send(JSON.stringify({ type: 'error', text: 'Ставка уже сделана' }));
          return;
        }

        try {
          const user = await User.findOne({ where: { telegramId } });
          if (!user) {
            wsClient.send(JSON.stringify({ type: 'error', text: 'Пользователь не найден' }));
            return;
          }
          if (user.balance < amount) {
            wsClient.send(JSON.stringify({ type: 'error', text: 'Недостаточно средств' }));
            return;
          }

          user.balance -= amount;
          user.totalBets += amount;
          user.totalGames += 1;
          await user.save();
          await Transaction.create({ userId: user.id, type: 'bet', amount, status: 'completed' });

          state.bets.push({
            telegramId,
            username: username || 'Аноним',
            amount,
            cashedOut: false,
            cashoutMultiplier: null,
          });

          console.log(`[BET] OK: ${telegramId} bet ${amount}, balance now ${user.balance}`);
          broadcast(getPublicState());
          wsClient.send(JSON.stringify({ type: 'betOk', balance: user.balance }));
        } catch (e) {
          console.error('[BET] Error:', e.message);
          wsClient.send(JSON.stringify({ type: 'error', text: e.message }));
        }
      }

      // ── Кешаут ──
      if (msg.type === 'cashout') {
        if (state.phase !== 'flying') {
          wsClient.send(JSON.stringify({ type: 'error', text: 'Нельзя вывести сейчас' }));
          return;
        }

        const { telegramId } = msg;
        const bet = state.bets.find(b => b.telegramId === telegramId && !b.cashedOut);
        if (!bet) {
          wsClient.send(JSON.stringify({ type: 'error', text: 'Ставка не найдена' }));
          return;
        }

        bet.cashedOut = true;
        bet.cashoutMultiplier = state.multiplier;
        const winAmount = parseFloat((bet.amount * state.multiplier).toFixed(4));

        try {
          const user = await User.findOne({ where: { telegramId } });
          user.balance += winAmount;
          user.totalWins += 1;
          user.totalProfit += winAmount - bet.amount;
          if (state.multiplier > user.bestMultiplier) user.bestMultiplier = state.multiplier;
          await user.save();
          await Transaction.create({ userId: user.id, type: 'win', amount: winAmount, status: 'completed' });

          console.log(`[CASHOUT] ${telegramId} cashed out at ${state.multiplier}x, won ${winAmount}`);
          broadcast(getPublicState());
          wsClient.send(JSON.stringify({ type: 'cashoutOk', multiplier: state.multiplier, winAmount, balance: user.balance }));
        } catch (e) {
          console.error('[CASHOUT] Error:', e.message);
          wsClient.send(JSON.stringify({ type: 'error', text: e.message }));
        }
      }
    });

    wsClient.on('close', () => {
      clearInterval(pingInterval);
      clients.delete(wsClient);
      console.log(`[WS] Client disconnected, total: ${clients.size}`);
    });

    wsClient.on('error', (err) => {
      console.error('[WS] Client error:', err.message);
      clients.delete(wsClient);
    });
  });

  startBetting();
  console.log('Rocket WebSocket на /ws/rocket');
}

module.exports = { initRocketWS };