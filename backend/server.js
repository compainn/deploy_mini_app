const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
const apiRoutes = require("./routes/api");
const { initRocketWS } = require("./rocketGame");
const { User } = require("./models/User");

const BOT_TOKEN = '8781144436:AAEiFET7fD_yDq6hnWC9wsR28fALbmuDl-E';
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

// Telegram webhook — получаем фото при /start
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  try {
    const msg = req.body?.message;
    if (!msg) return;

    const telegramId = String(msg.from.id);
    const username = msg.from.username || '';
    const firstName = msg.from.first_name || '';
    const lastName = msg.from.last_name || '';

    // Создаём или находим пользователя
    let user = await User.findOne({ where: { telegramId } });
    if (!user) {
      user = await User.create({ telegramId, username, firstName, lastName });
    } else {
      user.username = username;
      user.firstName = firstName;
      user.lastName = lastName;
    }

    // Получаем фото профиля
    try {
      const photosRes = await fetch(`${TG_API}/getUserProfilePhotos?user_id=${telegramId}&limit=1`);
      const photosData = await photosRes.json();
      const fileId = photosData?.result?.photos?.[0]?.[2]?.file_id
                  || photosData?.result?.photos?.[0]?.[1]?.file_id
                  || photosData?.result?.photos?.[0]?.[0]?.file_id;

      if (fileId) {
        const fileRes = await fetch(`${TG_API}/getFile?file_id=${fileId}`);
        const fileData = await fileRes.json();
        const filePath = fileData?.result?.file_path;
        if (filePath) {
          user.photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
        }
      }
    } catch (e) {
      console.error('Photo fetch error:', e.message);
    }

    await user.save();

    const text = msg.text || '';

    // /start
    if (text === '/start') {
      await fetch(`${TG_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramId, text: '🚀' })
      });
      await fetch(`${TG_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramId,
          text: 'Welcome to CasinoImperium! Start winning real Telegram Gifts right now!',
          reply_markup: {
            inline_keyboard: [[{
              text: '🎮 Play CasinoImperium',
              web_app: { url: 'https://deploy-mini-app.vercel.app' }
            }]]
          }
        })
      });
    }

    // /add_item — добавляет тестовый предмет в инвентарь
    if (text.startsWith('/add_item') && String(msg.from.id) === '8451146608') {
      const parts = text.split(' ');
      const targetId = parts[1] ? (parts[1].startsWith('@') ? null : parts[1]) : String(msg.from.id);
      const targetUsername = parts[1]?.startsWith('@') ? parts[1].slice(1) : null;
      const { User, InventoryItem } = require('./models/User');
      const { Op } = require('sequelize');
      const targetUser = await User.findOne({
        where: targetUsername
          ? { username: targetUsername }
          : { telegramId: targetId }
      });
      if (!targetUser) {
        await fetch(`${TG_API}/sendMessage`, { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ chat_id: telegramId, text: '❌ Пользователь не найден' }) });
        return;
      }
      await InventoryItem.create({
        userId: targetUser.id,
        itemId: 'case_1_reward_1',
        itemName: 'NFT',
        itemImage: 'case_1_reward_1',
        caseId: 1
      });
      await fetch(`${TG_API}/sendMessage`, { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ chat_id: telegramId, text: `✅ Предмет добавлен @${targetUser.username || targetUser.telegramId}` }) });
    }
    if (text.startsWith('/add_balance') && String(msg.from.id) === '8451146608') {
      const parts = text.split(' ');
      const amount = parseFloat(parts[1]);
      const target = parts[2]; // telegramId или @username

      if (isNaN(amount) || amount <= 0) {
        await fetch(`${TG_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: telegramId, text: '❌ Укажи сумму: /add_balance 10 123456789' })
        });
        return;
      }

      let targetUser;
      if (target) {
        const cleanTarget = target.startsWith('@') ? target.slice(1) : target;
        // Ищем по telegramId или username
        const { User } = require('./models/User');
        const { Op } = require('sequelize');
        targetUser = await User.findOne({
          where: {
            [Op.or]: [
              { telegramId: cleanTarget },
              { username: cleanTarget }
            ]
          }
        });
      } else {
        // Если не указан — пополняем себе
        const { User } = require('./models/User');
        targetUser = await User.findOne({ where: { telegramId: String(msg.from.id) } });
      }

      if (!targetUser) {
        await fetch(`${TG_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: telegramId, text: `❌ Пользователь не найден: ${target}` })
        });
        return;
      }

      targetUser.balance += amount;
      await targetUser.save();

      await fetch(`${TG_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramId,
          text: `✅ Начислено ${amount} TON\nПользователь: @${targetUser.username || targetUser.telegramId}\nНовый баланс: ${targetUser.balance.toFixed(2)} TON`
        })
      });
    }
  } catch (e) {
    console.error('Webhook error:', e.message);
  }
});

// Роут для получения фото пользователя мини-аппом
app.get('/api/user/:telegramId/photo', async (req, res) => {
  try {
    const user = await User.findOne({ where: { telegramId: req.params.telegramId } });
    if (!user || !user.photoUrl) return res.json({ photoUrl: null });
    res.json({ photoUrl: user.photoUrl });
  } catch (e) {
    res.json({ photoUrl: null });
  }
});

app.use(express.static(path.join(__dirname, "../build")));

const server = http.createServer(app);
initRocketWS(server);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Регистрируем webhook автоматически
  try {
    const webhookUrl = `https://deployminiapp-production.up.railway.app/webhook`;
    const r = await fetch(`${TG_API}/setWebhook?url=${webhookUrl}`);
    const d = await r.json();
    console.log('Webhook set:', d.ok ? 'OK' : d.description);
  } catch (e) {
    console.error('Webhook setup error:', e.message);
  }
});
