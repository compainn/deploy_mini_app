const express = require('express');
const router = express.Router();
const { User, Transaction, InventoryItem } = require('../models/User');
const { Sequelize } = require('sequelize');

// Хранит результат roll до вызова open (ключ: telegramId)
const pendingRolls = new Map();

const convertToFriendlyAddress = (rawAddress) => {
  if (!rawAddress) return null;
  if (rawAddress.startsWith('UQ') || rawAddress.startsWith('EQ')) return rawAddress;
  
  try {
    const hex = rawAddress.replace('0:', '');
    const bytes = Buffer.from(hex, 'hex');
    let base64 = bytes.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return 'UQ' + base64;
  } catch {
    return rawAddress;
  }
};

// ============================================================
//  Таблица призов для каждого кейса (должна совпадать с фронтом)
// ============================================================
function getPrizeListForCase(caseId) {
  const has4Rewards = [1, 2, 3, 5].includes(caseId);
  const itemPrizes = has4Rewards
    ? [
        { type: 'item', id: `case_${caseId}_reward_1`, name: 'NFT', imageKey: `case_${caseId}_reward_1`, chance: 0.05 },
        { type: 'item', id: `case_${caseId}_reward_2`, name: 'NFT', imageKey: `case_${caseId}_reward_2`, chance: 0.05 },
        { type: 'item', id: `case_${caseId}_reward_3`, name: 'NFT', imageKey: `case_${caseId}_reward_3`, chance: 0.05 },
        { type: 'item', id: `case_${caseId}_reward_4`, name: 'NFT', imageKey: `case_${caseId}_reward_4`, chance: 0.05 },
      ]
    : [
        { type: 'item', id: `case_${caseId}_reward_1`, name: 'NFT', imageKey: `case_${caseId}_reward_1`, chance: 0.05 },
        { type: 'item', id: `case_${caseId}_reward_2`, name: 'NFT', imageKey: `case_${caseId}_reward_2`, chance: 0.05 },
        { type: 'item', id: `case_${caseId}_reward_3`, name: 'NFT', imageKey: `case_${caseId}_reward_3`, chance: 0.05 },
      ];

  // ПОЛНЫЙ набор TON-призов — те же суммы что на ленте фронта
  const bigCase = [1, 2].includes(caseId);
  const tonPrizes = [
    { type: 'ton', amount: 0.01, name: '0.01 TON', imageKey: 'ton', chance: caseId === 5 ? 3  : bigCase ? 3  : 5  },
    { type: 'ton', amount: 0.1,  name: '0.1 TON',  imageKey: 'ton', chance: caseId === 5 ? 7  : bigCase ? 5  : 8  },
    { type: 'ton', amount: 0.25, name: '0.25 TON', imageKey: 'ton', chance: caseId === 5 ? 10 : bigCase ? 7  : 12 },
    { type: 'ton', amount: 0.5,  name: '0.5 TON',  imageKey: 'ton', chance: caseId === 5 ? 15 : bigCase ? 8  : 15 },
    { type: 'ton', amount: 1.0,  name: '1 TON',    imageKey: 'ton', chance: caseId === 5 ? 25 : bigCase ? 10 : 20 },
    { type: 'ton', amount: 2.0,  name: '2 TON',    imageKey: 'ton', chance: caseId === 5 ? 22 : bigCase ? 15 : 22 },
    { type: 'ton', amount: 3.0,  name: '3 TON',    imageKey: 'ton', chance: caseId === 5 ? 15 : bigCase ? 20 : 15 },
    { type: 'ton', amount: 5.0,  name: '5 TON',    imageKey: 'ton', chance: caseId === 5 ? 3  : bigCase ? 15 : 3  },
    { type: 'ton', amount: 10.0, name: '10 TON',   imageKey: 'ton', chance: bigCase ? 12 : 0.01 },
    { type: 'ton', amount: 15.0, name: '15 TON',   imageKey: 'ton', chance: bigCase ? 5  : 0.01 },
  ];

  return [...tonPrizes, ...itemPrizes];
}

// Выбирает приз по шансам на сервере
function rollPrize(prizeList) {
  const total = prizeList.reduce((s, i) => s + i.chance, 0);
  const rand = Math.random() * total;
  let cum = 0;
  for (const item of prizeList) {
    cum += item.chance;
    if (rand < cum) return item;
  }
  return prizeList[0];
}

// ============================================================
//  НОВЫЙ ЭНДПОИНТ: крутим барабан — сервер выбирает приз
//  Клиент вызывает ЭТО перед анимацией, получает prize,
//  запускает анимацию, а потом /api/case/open для зачисления.
// ============================================================
router.post('/case/roll', async (req, res) => {
  try {
    const { telegramId, caseId } = req.body;
    const user = await User.findOne({ where: { telegramId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const prizeList = getPrizeListForCase(caseId);
    const prize = rollPrize(prizeList);

    // Сохраняем приз на сервере — фронт не может подменить
    pendingRolls.set(String(telegramId), { prize, caseId, ts: Date.now() });

    res.json({ prize });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
//  Пользователи
// ============================================================
router.post('/user', async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName } = req.body;
    let user = await User.findOne({ where: { telegramId } });
    if (!user) {
      user = await User.create({ telegramId, username, firstName, lastName });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/user/wallet', async (req, res) => {
  try {
    const { telegramId, walletAddress } = req.body;
    const user = await User.findOne({ where: { telegramId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const friendlyAddress = convertToFriendlyAddress(walletAddress);
    user.walletAddressRaw = walletAddress;
    user.walletAddressFriendly = friendlyAddress;
    user.walletConnectedAt = new Date();
    await user.save();
    res.json({ walletAddressRaw: user.walletAddressRaw, walletAddressFriendly: user.walletAddressFriendly });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/user/wallet', async (req, res) => {
  try {
    const { telegramId } = req.body;
    const user = await User.findOne({ where: { telegramId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.walletAddressRaw = null;
    user.walletAddressFriendly = null;
    user.walletConnectedAt = null;
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/user/deposit', async (req, res) => {
  try {
    const { telegramId, amount, tonTxHash } = req.body;
    const user = await User.findOne({ where: { telegramId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.balance += amount;
    await user.save();
    await Transaction.create({ userId: user.id, type: 'deposit', amount, tonTxHash, status: 'completed' });
    res.json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/user/bet', async (req, res) => {
  try {
    const { telegramId, amount } = req.body;
    const user = await User.findOne({ where: { telegramId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.balance < amount) return res.status(400).json({ error: 'Недостаточно средств' });
    user.balance -= amount;
    user.totalBets += amount;
    user.totalGames += 1;
    await user.save();
    await Transaction.create({ userId: user.id, type: 'bet', amount, status: 'completed' });
    res.json({ balance: user.balance, totalBets: user.totalBets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/user/win', async (req, res) => {
  try {
    const { telegramId, amount, multiplier } = req.body;
    const user = await User.findOne({ where: { telegramId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.balance += amount;
    user.totalWins += 1;
    user.totalProfit += amount;
    if (multiplier > user.bestMultiplier) user.bestMultiplier = multiplier;
    await user.save();
    await Transaction.create({ userId: user.id, type: 'win', amount, status: 'completed' });
    res.json({ balance: user.balance, totalWins: user.totalWins });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
//  Открытие кейса — зачисление после анимации
//  Приз передаётся с фронта (тот самый, что вернул /case/roll)
// ============================================================
router.post('/case/open', async (req, res) => {
  try {
    const { telegramId, caseId, casePrice } = req.body;
    const user = await User.findOne({ where: { telegramId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.balance < casePrice) return res.status(400).json({ error: 'Недостаточно средств' });

    // Берём приз с сервера — игнорируем то что прислал фронт
    const pending = pendingRolls.get(String(telegramId));
    if (!pending || pending.caseId !== caseId) {
      return res.status(400).json({ error: 'Roll not found — call /case/roll first' });
    }
    const prize = pending.prize;
    pendingRolls.delete(String(telegramId)); // чистим после использования

    user.balance -= casePrice;
    user.totalBets += casePrice;
    user.totalGames += 1;

    if (prize.type === 'ton') {
      user.balance += prize.amount;
      user.totalWins += 1;
      user.totalProfit += prize.amount;
      await Transaction.create({ userId: user.id, type: 'win', amount: prize.amount, status: 'completed' });
    } else {
      await InventoryItem.create({
        userId: user.id,
        itemId: prize.id,
        itemName: prize.name,
        itemImage: prize.image || prize.imageKey,
        caseId: caseId
      });
    }

    await user.save();
    res.json({ success: true, balance: user.balance, prize });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/user/:telegramId/inventory', async (req, res) => {
  try {
    const user = await User.findOne({ where: { telegramId: req.params.telegramId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const items = await InventoryItem.findAll({ where: { userId: user.id }, order: [['openedAt', 'DESC']] });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/user/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({
      where: { telegramId: req.params.telegramId },
      include: [
        { model: Transaction,    limit: 10, order: [['createdAt', 'DESC']] },
        { model: InventoryItem,  limit: 20, order: [['openedAt', 'DESC']] }
      ]
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/leaders', async (req, res) => {
  try {
    const leaders = await User.findAll({
      where: { totalBets: { [Sequelize.Op.gt]: 0 } },
      order: [['totalBets', 'DESC']],
      limit: 100,
      attributes: ['username', 'firstName', 'photoUrl', 'walletAddressFriendly', 'totalBets', 'totalGames', 'totalWins']
    });
    res.json(leaders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/inventory/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    await item.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
