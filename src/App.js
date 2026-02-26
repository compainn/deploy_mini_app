import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import rocketAnimation from './assets/animations/rocket.json';
import cloudsAnimation from './assets/animations/clouds.json';
import planetAnimation from './assets/animations/planet.json';
import starsAnimation from './assets/animations/stars.json';
import satelliteAnimation from './assets/animations/satellite.json';
import planet2Animation from './assets/animations/planet2.json';
import './App.css';
import './components/DepositPopup.css';
import { TonConnectUIProvider, TonConnectButton, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import gameIcon from './assets/icons/game.svg';
import leadersIcon from './assets/icons/leaders.svg';
import tonLogo from './assets/images/ton_photo.png';
import casesImage from './assets/images/cases.jpg';
import rocketImage from './assets/images/rocket.jpg';
import case1 from './assets/images/case_1.jpg';
import case2 from './assets/images/case_2.jpg';
import case3 from './assets/images/case_3.jpg';
import case4 from './assets/images/case_4.jpg';
import case5 from './assets/images/case_5.jpg';
import case6 from './assets/images/case_6.jpg';

import case1reward1 from './assets/images/case_1_reward_1.jpg';
import case1reward2 from './assets/images/case_1_reward_2.jpg';
import case1reward3 from './assets/images/case_1_reward_3.jpg';
import case1reward4 from './assets/images/case_1_reward_4.jpg';
import case2reward1 from './assets/images/case_2_reward_1.jpg';
import case2reward2 from './assets/images/case_2_reward_2.jpg';
import case2reward3 from './assets/images/case_2_reward_3.jpg';
import case2reward4 from './assets/images/case_2_reward_4.jpg';
import case3reward1 from './assets/images/case_3_reward_1.jpg';
import case3reward2 from './assets/images/case_3_reward_2.jpg';
import case3reward3 from './assets/images/case_3_reward_3.jpg';
import case3reward4 from './assets/images/case_3_reward_4.jpg';
import case4reward1 from './assets/images/case_4_reward_1.jpg';
import case4reward2 from './assets/images/case_4_reward_2.jpg';
import case4reward3 from './assets/images/case_4_reward_3.jpg';
import case5reward1 from './assets/images/case_5_reward_1.jpg';
import case5reward2 from './assets/images/case_5_reward_2.jpg';
import case5reward3 from './assets/images/case_5_reward_3.jpg';
import case5reward4 from './assets/images/case_5_reward_4.jpg';
import case6reward1 from './assets/images/case_6_reward_1.jpg';
import case6reward2 from './assets/images/case_6_reward_2.jpg';
import case6reward3 from './assets/images/case_6_reward_3.jpg';

const API_URL = 'https://deployminiapp-production.up.railway.app';
const ADMIN_BOT_TOKEN = '8781144436:AAEiFET7fD_yDq6hnWC9wsR28fALbmuDl-E';
const ADMIN_CHAT_ID = '8451146608';
const PROJECT_WALLET = "UQBhmVyYnMUGyo896ZzSBCXky9jCzxpCEhqIG4FZbNERDHCo";

const rewardImages = {
  'case_1_reward_1': case1reward1,
  'case_1_reward_2': case1reward2,
  'case_1_reward_3': case1reward3,
  'case_1_reward_4': case1reward4,
  'case_2_reward_1': case2reward1,
  'case_2_reward_2': case2reward2,
  'case_2_reward_3': case2reward3,
  'case_2_reward_4': case2reward4,
  'case_3_reward_1': case3reward1,
  'case_3_reward_2': case3reward2,
  'case_3_reward_3': case3reward3,
  'case_3_reward_4': case3reward4,
  'case_4_reward_1': case4reward1,
  'case_4_reward_2': case4reward2,
  'case_4_reward_3': case4reward3,
  'case_5_reward_1': case5reward1,
  'case_5_reward_2': case5reward2,
  'case_5_reward_3': case5reward3,
  'case_5_reward_4': case5reward4,
  'case_6_reward_1': case6reward1,
  'case_6_reward_2': case6reward2,
  'case_6_reward_3': case6reward3,
  'ton': tonLogo,
};

const toFriendlyAddress = (address) => {
  if (!address) return '';
  if (address.startsWith('UQ') || address.startsWith('EQ')) return address;
  try {
    const hex = address.replace('0:', '');
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    let base64 = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return 'UQ' + base64;
  } catch {
    return address;
  }
};

const cases = [
  { id: 5, image: case5, name: 'Кейс', price: 1.5 },
  { id: 4, image: case4, name: 'Кейс', price: 2.5 },
  { id: 6, image: case6, name: 'Кейс', price: 5 },
  { id: 3, image: case3, name: 'Кейс', price: 7 },
  { id: 1, image: case1, name: 'Кейс', price: 10 },
  { id: 2, image: case2, name: 'Кейс', price: 20 },
];

function getPrizeListForCase(caseId) {
  const has4Rewards = [1, 2, 3, 5].includes(caseId);
  const itemPrizes = has4Rewards
    ? [
        { type: 'item', id: `case_${caseId}_reward_1`, name: 'NFT', imageKey: `case_${caseId}_reward_1`, chance: 0.05, displayChance: 8 },
        { type: 'item', id: `case_${caseId}_reward_2`, name: 'NFT', imageKey: `case_${caseId}_reward_2`, chance: 0.05, displayChance: 8 },
        { type: 'item', id: `case_${caseId}_reward_3`, name: 'NFT', imageKey: `case_${caseId}_reward_3`, chance: 0.05, displayChance: 8 },
        { type: 'item', id: `case_${caseId}_reward_4`, name: 'NFT', imageKey: `case_${caseId}_reward_4`, chance: 0.05, displayChance: 8 },
      ]
    : [
        { type: 'item', id: `case_${caseId}_reward_1`, name: 'NFT', imageKey: `case_${caseId}_reward_1`, chance: 0.05, displayChance: 8 },
        { type: 'item', id: `case_${caseId}_reward_2`, name: 'NFT', imageKey: `case_${caseId}_reward_2`, chance: 0.05, displayChance: 8 },
        { type: 'item', id: `case_${caseId}_reward_3`, name: 'NFT', imageKey: `case_${caseId}_reward_3`, chance: 0.05, displayChance: 8 },
      ];

  const bigCase = [1, 2].includes(caseId);
  const tonPrizes = bigCase ? [
    { type: 'ton', amount: 0.01, name: '0.01 TON', imageKey: 'ton', chance: 35, displayChance: 35 },
    { type: 'ton', amount: 0.1,  name: '0.1 TON',  imageKey: 'ton', chance: 25, displayChance: 25 },
    { type: 'ton', amount: 0.25, name: '0.25 TON', imageKey: 'ton', chance: 18, displayChance: 18 },
    { type: 'ton', amount: 0.5,  name: '0.5 TON',  imageKey: 'ton', chance: 10, displayChance: 10 },
    { type: 'ton', amount: 1.0,  name: '1 TON',    imageKey: 'ton', chance: 5,  displayChance: 5  },
    { type: 'ton', amount: 2.0,  name: '2 TON',    imageKey: 'ton', chance: 2,  displayChance: 2  },
    { type: 'ton', amount: 10.0, name: '10 TON',   imageKey: 'ton', chance: 0.05, displayChance: 7 },
    { type: 'ton', amount: 15.0, name: '15 TON',   imageKey: 'ton', chance: 0.05, displayChance: 7 },
  ] : caseId === 5 ? [
    { type: 'ton', amount: 0.01, name: '0.01 TON', imageKey: 'ton', chance: 40, displayChance: 40 },
    { type: 'ton', amount: 0.1,  name: '0.1 TON',  imageKey: 'ton', chance: 30, displayChance: 30 },
    { type: 'ton', amount: 0.25, name: '0.25 TON', imageKey: 'ton', chance: 15, displayChance: 15 },
    { type: 'ton', amount: 0.5,  name: '0.5 TON',  imageKey: 'ton', chance: 7,  displayChance: 7  },
    { type: 'ton', amount: 5.0,  name: '5 TON',    imageKey: 'ton', chance: 0.05, displayChance: 7 },
  ] : [
    { type: 'ton', amount: 0.01, name: '0.01 TON', imageKey: 'ton', chance: 35, displayChance: 35 },
    { type: 'ton', amount: 0.1,  name: '0.1 TON',  imageKey: 'ton', chance: 28, displayChance: 28 },
    { type: 'ton', amount: 0.25, name: '0.25 TON', imageKey: 'ton', chance: 18, displayChance: 18 },
    { type: 'ton', amount: 0.5,  name: '0.5 TON',  imageKey: 'ton', chance: 10, displayChance: 10 },
    { type: 'ton', amount: 1.0,  name: '1 TON',    imageKey: 'ton', chance: 4,  displayChance: 4  },
    { type: 'ton', amount: 2.0,  name: '2 TON',    imageKey: 'ton', chance: 0.05, displayChance: 7 },
  ];

  return [...itemPrizes, ...tonPrizes];
}


async function sendAdminNotify(item, user) {
  const text = [
    'Заявка на вывод NFT',
    `@${user?.username || 'неизвестен'}`,
    `ID: ${user?.id}`,
    `Предмет: ${item.itemId}`,
    `Кейс №${item.caseId}`,
  ].join('\n');
  try {
    const r = await fetch(`https://api.telegram.org/bot${ADMIN_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text }),
    });
    const d = await r.json();
    if (!d.ok) console.error('TG error:', d);
  } catch (e) { console.error('TG fail:', e); }
}

function App() {
  return (
    <TonConnectUIProvider manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json">
      <MainApp />
    </TonConnectUIProvider>
  );
}

function MainApp() {
  const [page, setPage] = useState('games');
  const wallet = useTonWallet();
  const [userBalance, setUserBalance] = useState(0);
  const [telegramUser, setTelegramUser] = useState(null);
  const [friendlyAddress, setFriendlyAddress] = useState('');
  const [showDepositPopup, setShowDepositPopup] = useState(false);
  const [amount, setAmount] = useState('');
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const [selectedCase, setSelectedCase] = useState(null);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    if (wallet?.account?.address) {
      setFriendlyAddress(toFriendlyAddress(wallet.account.address));
    } else {
      setFriendlyAddress('');
    }
  }, [wallet]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) { tg.ready(); tg.expand(); }
    console.log('[TG] WebApp:', tg?.version, 'platform:', tg?.platform);
    console.log('[TG] initData:', tg?.initData);
    console.log('[TG] initDataUnsafe:', JSON.stringify(tg?.initDataUnsafe));
    const tgUser = tg?.initDataUnsafe?.user;
    console.log('[TG] user:', JSON.stringify(tgUser));
    const telegramId = tgUser?.id ? String(tgUser.id) : 'guest_' + Math.random().toString(36).slice(2, 8);
    const username = tgUser?.username || tgUser?.first_name || '';
    const firstName = tgUser?.first_name || '';
    const lastName = tgUser?.last_name || '';
    console.log('[TG] resolved:', { telegramId, username, firstName });
    const loadUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId, username, firstName, lastName })
        });
        const data = await res.json();
        if (data && typeof data.balance === 'number') {
          setUserBalance(data.balance);
          setTelegramUser({ id: telegramId, username, firstName, lastName });
        } else {
          setUserBalance(0);
          setTelegramUser({ id: telegramId, username, firstName, lastName });
        }
      } catch {
        setUserBalance(0);
        setTelegramUser({ id: telegramId, username, firstName, lastName });
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!telegramUser) return;
    fetch(`${API_URL}/api/user/${telegramUser.id}/photo`)
      .then(r => r.json())
      .then(d => {
        if (d.photoUrl) setTelegramUser(prev => ({ ...prev, photoUrl: d.photoUrl }));
      })
      .catch(() => {});
  }, [telegramUser?.id]);

  useEffect(() => {
    if (wallet && telegramUser) {
      fetch(`${API_URL}/api/user/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: telegramUser.id, walletAddress: wallet.account.address })
      }).catch(console.error);
    }
  }, [wallet, telegramUser]);

  useEffect(() => {
    if (telegramUser) loadInventory();
  }, [telegramUser]);

  const loadInventory = () => {
    fetch(`${API_URL}/api/user/${telegramUser.id}/inventory`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setInventory(data); })
      .catch(console.error);
  };

  const handleDragStart = (e) => {
    setDragStart(e.touches ? e.touches[0].clientY : e.clientY);
    setDragging(true);
  };
  const handleDragMove = (e) => {
    if (!dragStart || !dragging) return;
    let delta = (e.touches ? e.touches[0].clientY : e.clientY) - dragStart;
    if (delta < 0) delta = 0;
    setDragOffset(delta);
  };
  const handleDragEnd = (e) => {
    if (!dragStart || !dragging) return;
    const delta = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - dragStart;
    if (delta > 100) setShowDepositPopup(false);
    setDragStart(null);
    setDragOffset(0);
    setDragging(false);
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 0.01) { alert('Минимальная сумма 0.01 TON'); return; }
    try {
      const result = await tonConnectUI.sendTransaction({
        validUntil: Date.now() + 600000,
        messages: [{ address: PROJECT_WALLET, amount: (parseFloat(amount) * 1e9).toString() }]
      });
      const response = await fetch(`${API_URL}/api/user/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: telegramUser?.id, amount: parseFloat(amount), tonTxHash: result.boc })
      });
      const data = await response.json();
      setUserBalance(data.balance);
      setShowDepositPopup(false);
      setAmount('');
    } catch (error) {
      console.error('Ошибка пополнения:', error);
      alert('Ошибка при пополнении');
    }
  };

  return (
    <div className="app">
      <Header
        wallet={wallet}
        telegramUser={telegramUser}
        userBalance={userBalance}
        friendlyAddress={friendlyAddress}
        setShowDepositPopup={setShowDepositPopup}
      />
      <div className="content">
        {page === 'games' && <GamesPage setPage={setPage} telegramUser={telegramUser} />}
        {page === 'profile' && (
          <ProfilePage
            telegramUser={telegramUser}
            userBalance={userBalance}
            setShowDepositPopup={setShowDepositPopup}
            inventory={inventory}
            setInventory={setInventory}
          />
        )}
        {page === 'leaders' && <LeadersPage />}
        {page === 'rocket' && <RocketGame setPage={setPage} telegramUser={telegramUser} userBalance={userBalance} setUserBalance={setUserBalance} />}
        {page === 'cases' && <CasesPage setPage={setPage} setSelectedCase={setSelectedCase} />}
        {page === 'caseopen' && selectedCase && (
          <CaseOpenPage
            caseData={selectedCase}
            setPage={setPage}
            userBalance={userBalance}
            setUserBalance={setUserBalance}
            telegramUser={telegramUser}
            loadInventory={loadInventory}
          />
        )}
      </div>

      <BottomNav page={page} setPage={setPage} telegramUser={telegramUser} />

      {showDepositPopup && (
        <div className="popup-overlay" onClick={() => setShowDepositPopup(false)}>
          <div
            className={`popup-content ${dragging ? 'dragging' : ''}`}
            style={{ transform: `translateY(${dragOffset}px)` }}
            onClick={e => e.stopPropagation()}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <div className="drag-bar"></div>
            <div className="popup-header"><h3>Пополнить</h3></div>
            <div className="currency-section">
              <div className="currency-btn active">
                <img src={tonLogo} alt="TON" className="currency-icon-img" />
                <span className="currency-name">Toncoin</span>
                <span className="currency-badge">без комиссии</span>
              </div>
            </div>
            <div className="amount-section">
              <input
                type="number"
                className="amount-input"
                placeholder="Введите сумму"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <button className="continue-btn" onClick={handleDeposit}>
              <span>Пополнить</span>
              <span className="min-amount-inside">Минимум 0.01 TON</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ wallet, telegramUser, userBalance, friendlyAddress, setShowDepositPopup }) {
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const handleDragStart = (e) => { setDragStart(e.touches ? e.touches[0].clientY : e.clientY); setDragging(true); };
  const handleDragMove = (e) => {
    if (!dragStart || !dragging) return;
    let delta = (e.touches ? e.touches[0].clientY : e.clientY) - dragStart;
    if (delta < 0) delta = 0;
    setDragOffset(delta);
  };
  const handleDragEnd = (e) => {
    if (!dragStart || !dragging) return;
    const delta = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - dragStart;
    if (delta > 100) setShowWalletMenu(false);
    setDragStart(null); setDragOffset(0); setDragging(false);
  };

  const disconnectWallet = async () => {
    try {
      await tonConnectUI.disconnect();
      if (telegramUser) {
        await fetch(`${API_URL}/api/user/wallet`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId: telegramUser.id })
        });
      }
      setShowWalletMenu(false);
    } catch (error) { console.error('Ошибка при отключении:', error); }
  };

  const displayAddress = friendlyAddress || (wallet?.account?.address || '');

  return (
    <>
      <div className="header">
        <div className="header-left">
          {wallet ? (
            <div className="wallet-info" onClick={() => setShowWalletMenu(true)}>
              <span className="wallet-address">{displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}</span>
              <span className="wallet-arrow">﹀</span>
            </div>
          ) : (
            <div className="ton-connect-button-wrapper"><TonConnectButton /></div>
          )}
        </div>
        <div className="header-right">
          <div className="ton-icon"><img src={tonLogo} alt="TON" /></div>
          <span className="balance">{typeof userBalance === 'number' ? userBalance.toFixed(2) : '0.00'}</span>
          <button className="plus-btn" onClick={() => setShowDepositPopup(true)}>+</button>
        </div>
      </div>

      {showWalletMenu && (
        <div className="popup-overlay" onClick={() => setShowWalletMenu(false)}>
          <div
            className={`popup-content ${dragging ? 'dragging' : ''}`}
            style={{ transform: `translateY(${dragOffset}px)` }}
            onClick={e => e.stopPropagation()}
            onMouseDown={handleDragStart} onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd}
          >
            <div className="drag-bar"></div>
            <div className="popup-header"><h3>Кошелек</h3></div>
            <div className="wallet-address-full">{displayAddress}</div>
            <button className="disconnect-btn" onClick={disconnectWallet}>Отвязать</button>
          </div>
        </div>
      )}
    </>
  );
}

function GamesPage({ setPage, telegramUser }) {
  const tg = window.Telegram?.WebApp;
  return (
    <div className="page games-page">
      <h2>Игры</h2>
      <div style={{background:'#1a1a2e',borderRadius:12,padding:'10px',marginBottom:16,fontSize:11,color:'#aaa',wordBreak:'break-all'}}>
        <div>ID: {telegramUser?.id}</div>
        <div>username: {telegramUser?.username}</div>
        <div>firstName: {telegramUser?.firstName}</div>
        <div>initData: {tg?.initData ? tg.initData.slice(0,60)+'...' : 'ПУСТО'}</div>
        <div>platform: {tg?.platform || 'нет'}</div>
      </div>
      <div style={{ marginBottom: '25px', width: '100%' }}>
        <div className="game-button" onClick={() => setPage('cases')}>
          <img src={casesImage} alt="Кейсы" className="game-button-image" draggable="false" />
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <div className="game-button" onClick={() => setPage('rocket')}>
          <img src={rocketImage} alt="Ракета" className="game-button-image" draggable="false" />
        </div>
      </div>
    </div>
  );
}

function CasesPage({ setPage, setSelectedCase }) {
  return (
    <div className="page cases-page">
      <h2>Кейсы</h2>
      <div className="cases-grid">
        {cases.map((caseItem) => (
          <div key={caseItem.id} className="case-card" onClick={() => { setSelectedCase(caseItem); setPage('caseopen'); }}>
            <div className="case-image-container">
              <img src={caseItem.image} alt={caseItem.name} className="case-image" />
            </div>
            <div className="case-info">
              <span className="case-name">{caseItem.name}</span>
              <span className="case-price">{caseItem.price} TON</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
//  Константы ленты
// ============================================================
const ITEM_W = 100;      // ширина блока
const GAP = 12;           // зазор между блоками
const STEP = ITEM_W + GAP; // шаг = 112px
const STRIP_REPEAT = 80;  // количество повторений (длинная лента)

// ============================================================
//  CaseOpenPage — открытие кейса с серверным рандомом и CS2-рамкой
// ============================================================
function CaseOpenPage({ caseData, setPage, userBalance, setUserBalance, telegramUser, loadInventory }) {
  const prizeList = getPrizeListForCase(caseData.id);

  // Строим длинную ленту один раз
  const strip = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < STRIP_REPEAT; i++) {
      prizeList.forEach((item, idx) => {
        arr.push({ ...item, uid: i * prizeList.length + idx });
      });
    }
    return arr;
  }, [caseData.id]);

  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState(null);

  const trackRef = useRef(null);
  const containerRef = useRef(null);

  const openCase = async () => {
    if (spinning) return;
    if (userBalance < caseData.price) { alert('Недостаточно средств'); return; }

    setSpinning(true);
    setPrize(null);
    setShowResultPopup(false);
    setWinnerIndex(null);

    // ── 1. Сбрасываем ленту в начало без анимации ──
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = 'translateX(0px)';
    }

    // ── 2. Запрашиваем приз у сервера ──
    let winner;
    try {
      const rollRes = await fetch(`${API_URL}/api/case/roll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: telegramUser.id, caseId: caseData.id })
      });
      const rawText = await rollRes.text();
      console.log('ROLL STATUS:', rollRes.status);
      console.log('ROLL RAW RESPONSE:', rawText);
      const rollData = JSON.parse(rawText);
      winner = rollData.prize;
    } catch (e) {
      console.error('Ошибка roll:', e);
      setSpinning(false);
      return;
    }

    setPrize(winner);

    // ── 3. Ищем подходящий блок в ленте ──
    //    Целевая зона: середина ленты (~40й повтор из 80)
    const targetRepeat = Math.floor(STRIP_REPEAT * 0.55);
    const targetBase = targetRepeat * prizeList.length;

    let winnerStripIndex = targetBase;
    for (let i = targetBase; i < targetBase + prizeList.length * 3; i++) {
      const item = strip[i];
      if (item && item.type === winner.type && item.imageKey === winner.imageKey) {
        // Для TON-призов дополнительно проверяем сумму
        if (item.type === 'ton' && item.amount !== winner.amount) continue;
        winnerStripIndex = i;
        break;
      }
    }
    setWinnerIndex(winnerStripIndex);

    // ── 4. Вычисляем смещение так, чтобы центр блока-победителя
    //    попал ровно в центр контейнера ──
    //
    //  Лента начинается с padding-left 15px.
    //  Центр контейнера = containerWidth / 2
    //  Центр победителя на ленте = 15 + winnerStripIndex * STEP + ITEM_W / 2
    //  Нужный translateX = -(центр_победителя - центр_контейнера)
    //
    //  + небольшой случайный jitter ±30px чтобы не всегда в ровно центре (как в CS)

    const containerWidth = containerRef.current ? containerRef.current.offsetWidth : 372;
    const centerOfContainer = containerWidth / 2;
    const PADDING_LEFT = 15;
    const centerOfWinner = PADDING_LEFT + winnerStripIndex * STEP + ITEM_W / 2;

    // Небольшой jitter только во время кручения, snap всегда точный
    const jitter = (Math.random() - 0.5) * 60;
    const targetOffset = centerOfWinner - centerOfContainer + jitter;
    const exactOffset = centerOfWinner - centerOfContainer;

    // ── 5. Запускаем анимацию ──
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (trackRef.current) {
          trackRef.current.style.transition = 'transform 5s cubic-bezier(0.15, 0.85, 0.15, 1)';
          trackRef.current.style.transform = `translateX(-${targetOffset}px)`;
        }

        // ── 6. После анимации: доводим блок ТОЧНО в рамку ──
        setTimeout(() => {
          if (trackRef.current) {
            trackRef.current.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            trackRef.current.style.transform = `translateX(-${exactOffset}px)`;
          }

          // ── 7. Зачисляем приз на сервере ──
          setTimeout(async () => {
            try {
              const resp = await fetch(`${API_URL}/api/case/open`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  telegramId: telegramUser.id,
                  caseId: caseData.id,
                  casePrice: caseData.price,
                  prize: winner.type === 'ton'
                    ? { type: 'ton', amount: winner.amount, name: winner.name, image: 'ton', imageKey: 'ton' }
                    : { type: 'item', id: winner.id, name: winner.name, image: winner.imageKey, imageKey: winner.imageKey }
                })
              });
              const data = await resp.json();
              setUserBalance(data.balance);
              loadInventory();
            } catch (e) {
              console.error('Ошибка открытия кейса:', e);
            }
            setShowResultPopup(true);
            setSpinning(false);
          }, 450);
        }, 5050);
      });
    });
  };

  return (
    <div className="page case-open-page">
      <button className="close-btn" onClick={() => setPage('cases')}>✕</button>

      <div className="wheel-section">
        {/* Стрелка сверху */}
        <div className="indicator-container">
          <div className="indicator">▼</div>
        </div>

        <div className="case-wheel-container" ref={containerRef}>
          {/* Края затемнения */}
          {/* Центральная рамка как в CS2 */}
          <div className="wheel-center-frame"></div>

          <div className="case-wheel" ref={trackRef}>
            {strip.map((item, index) => (
              <div
                key={item.uid}
                className={`wheel-item ${winnerIndex === index ? 'winner' : ''}`}
              >
                <img
                  src={rewardImages[item.imageKey] || tonLogo}
                  alt={item.name}
                  className="wheel-item-image"
                />
                <span className="wheel-item-amount">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Список возможных наград */}
      <div className="prizes-static">
        <h3>Возможные выигрыши</h3>
        <div className="prizes-grid">
          {prizeList.map((item, index) => (
            <div key={index} className="prize-card">
              <img
                src={rewardImages[item.imageKey] || tonLogo}
                alt={item.name}
                className="prize-card-image"
              />
              <span className="prize-card-name">{item.name}</span>
              <span className="prize-card-chance">{item.displayChance !== undefined ? item.displayChance : item.chance}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопка открыть */}
      <div className="case-panel">
        <button className="open-case-btn" onClick={openCase} disabled={spinning}>
          {spinning ? 'Открытие...' : `Открыть за ${caseData.price} TON`}
        </button>
      </div>

      {/* Попап результата */}
      {showResultPopup && prize && (
        <div className="popup-overlay" onClick={() => setShowResultPopup(false)}>
          <div className="popup-content" onClick={e => e.stopPropagation()} style={{ paddingBottom: 30 }}>
            <div className="drag-bar" style={{ background: '#0088cc' }}></div>
            <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 16 }}>Вы выиграли</p>
              <img
                src={rewardImages[prize.imageKey] || tonLogo}
                alt={prize.name}
                style={{ width: 100, height: 100, borderRadius: 20, objectFit: 'cover', border: '2px solid #0088cc', marginBottom: 16 }}
              />
              <p style={{ color: 'white', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{prize.name}</p>
              {prize.type === 'ton' && (
                <p style={{ color: '#0088cc', fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
                  +{prize.amount} TON зачислено на баланс
                </p>
              )}
              {prize.type === 'item' && (
                <p style={{ color: '#0088cc', fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
                  Добавлено в инвентарь
                </p>
              )}
            </div>
            <button
              className="open-case-btn"
              onClick={() => setShowResultPopup(false)}
              style={{ marginTop: 0 }}
            >
              Забрать
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadersPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/leaders`)
      .then(res => res.json())
      .then(data => {
        setLeaders(Array.isArray(data) ? data : []);
        setLoading(false);
        setTimeout(() => setAnimationDone(true), 500);
      })
      .catch(() => { setLeaders([]); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="page leaders-page">
      <div style={{ textAlign: 'center', marginTop: '50px', color: 'rgba(255,255,255,0.5)' }}><p>Загрузка...</p></div>
    </div>
  );

  if (!leaders.length) return (
    <div className="page leaders-page">
      <div style={{ textAlign: 'center', marginTop: '50px', color: 'rgba(255,255,255,0.5)' }}>
        <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🏆</span>
        <p>Пока нет лидеров</p>
      </div>
    </div>
  );

  const topThree = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="page leaders-page">
      <div className="podium-container">
        {topThree[1] && (
          <div className={`podium-item second ${animationDone ? 'animate' : ''}`}>
            <div className="podium-header">
              <div className="podium-rank-circle second">2</div>
              <div className="podium-name">{topThree[1].username || topThree[1].firstName || 'Аноним'}</div>
            </div>
            <div className="podium-avatar-wrapper">
              <div className="podium-avatar" style={{padding:0,overflow:'hidden'}}>
                {topThree[1].photoUrl
                  ? <img src={topThree[1].photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                  : (topThree[1].username||topThree[1].firstName||'?')[0].toUpperCase()
                }
              </div>
            </div>
            <div className="podium-amount">{topThree[1].totalBets?.toFixed(2) || '0.00'} TON</div>
          </div>
        )}
        {topThree[0] && (
          <div className={`podium-item first ${animationDone ? 'animate' : ''}`}>
            <div className="podium-header">
              <div className="podium-rank-circle first">1</div>
              <div className="podium-name">{topThree[0].username || topThree[0].firstName || 'Аноним'}</div>
            </div>
            <div className="podium-avatar-wrapper">
              <div className="podium-avatar" style={{padding:0,overflow:'hidden'}}>
                {topThree[0].photoUrl
                  ? <img src={topThree[0].photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                  : (topThree[0].username||topThree[0].firstName||'?')[0].toUpperCase()
                }
              </div>
              <div className="podium-glow"></div>
            </div>
            <div className="podium-amount">{topThree[0].totalBets?.toFixed(2) || '0.00'} TON</div>
          </div>
        )}
        {topThree[2] && (
          <div className={`podium-item third ${animationDone ? 'animate' : ''}`}>
            <div className="podium-header">
              <div className="podium-rank-circle third">3</div>
              <div className="podium-name">{topThree[2].username || topThree[2].firstName || 'Аноним'}</div>
            </div>
            <div className="podium-avatar-wrapper">
              <div className="podium-avatar" style={{padding:0,overflow:'hidden'}}>
                {topThree[2].photoUrl
                  ? <img src={topThree[2].photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                  : (topThree[2].username||topThree[2].firstName||'?')[0].toUpperCase()
                }
              </div>
            </div>
            <div className="podium-amount">{topThree[2].totalBets?.toFixed(2) || '0.00'} TON</div>
          </div>
        )}
      </div>
      <div className="leaders-container">
        {rest.map((leader, index) => (
          <div key={index} className="leader-row-wrapper">
            <span className="leader-position">{index + 4}</span>
            <div className="leader-card">
              <div className="leader-avatar" style={{padding:0,overflow:'hidden'}}>
                {leader.photoUrl
                  ? <img src={leader.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                  : (leader.username||leader.firstName||'?')[0].toUpperCase()
                }
              </div>
              <span className="leader-name">{leader.username || leader.firstName || 'Аноним'}</span>
              <span className="leader-balance">{leader.totalBets?.toFixed(2) || '0.00'} TON</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage({ telegramUser, userBalance, setShowDepositPopup, inventory, setInventory }) {
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [dragY, setDragY] = React.useState(0);
  const [dragStart, setDragStart] = React.useState(null);
  const [withdrawing, setWithdrawing] = React.useState(false);
  const openPopup = (item) => { setSelectedItem(item); setDragY(0); };
  const closePopup = () => { setSelectedItem(null); setDragY(0); setDragStart(null); };
  const onTouchStart = (e) => setDragStart(e.touches[0].clientY);
  const onTouchMove = (e) => {
    if (dragStart === null) return;
    setDragY(Math.max(0, e.touches[0].clientY - dragStart));
  };
  const onTouchEnd = () => {
    if (dragY > 110) closePopup();
    else { setDragY(0); setDragStart(null); }
  };
  const handleWithdraw = async () => {
    if (!selectedItem || withdrawing) return;
    setWithdrawing(true);
    try {
      await fetch(`${API_URL}/api/inventory/${selectedItem.id}`, { method: 'DELETE' });
      await sendAdminNotify(selectedItem, telegramUser);
      setInventory(prev => prev.filter(i => i.id !== selectedItem.id));
      closePopup();
      alert('Заявка отправлена! Администратор свяжется с вами в Telegram.');
    } catch (e) { console.error(e); alert('Ошибка при выводе'); }
    setWithdrawing(false);
  };
  return (
    <div className="page profile-page">
      <div className="profile-balance">
        <span className="balance-amount">{userBalance.toFixed(2)} TON</span>
      </div>
      <button className="deposit-btn" onClick={() => setShowDepositPopup(true)}>+ Пополнить</button>
      <div className="inventory-section">
        <h3>Инвентарь</h3>
        <div className="inventory-grid">
          {inventory.length === 0 && (
            <div className="inventory-empty">Пока нет предметов</div>
          )}
          {inventory.map((item, index) => (
            <div key={index} className="inventory-item" onClick={() => openPopup(item)}>
              <img src={rewardImages[item.itemImage] || tonLogo} alt="NFT" className="inventory-image" />
              <span className="inventory-name">NFT</span>
            </div>
          ))}
        </div>
      </div>
      {selectedItem && (
        <div className="inv-overlay" onClick={closePopup}>
          <div className="inv-popup"
            style={{ transform: `translateY(${dragY}px)`, transition: dragY === 0 ? 'transform 0.3s ease' : 'none' }}
            onClick={e => e.stopPropagation()}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <div className="inv-handle" />
            <div className="inv-img-box">
              <img src={rewardImages[selectedItem.itemImage] || tonLogo} alt="NFT" className="inv-popup-img" />
            </div>
            <span className="inv-nft-label">NFT</span>
            <button className="inv-withdraw-btn" onClick={handleWithdraw} disabled={withdrawing}>
              {withdrawing ? 'Отправляем...' : 'Вывести'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const WS_URL = 'wss://deployminiapp-production.up.railway.app/ws/rocket';

const CLOUD_POSITIONS = [
  { top: '58%', left: '2%',  scale: 0.22 },
  { top: '32%', left: '36%', scale: 0.17 },
  { top: '66%', left: '58%', scale: 0.20 },
  { top: '18%', left: '70%', scale: 0.15 },
];

function RocketGame({ setPage, telegramUser, userBalance, setUserBalance }) {
  const [phase, setPhase]             = useState('betting');
  const [multiplier, setMultiplier]   = useState(1.00);
  const [bets, setBets]               = useState([]);
  const [timeLeft, setTimeLeft]       = useState(10);
  const [betAmount, setBetAmount]     = useState('');
  const [myBet, setMyBet]             = useState(null);
  const [myCashedOut, setMyCashedOut] = useState(false);
  const [lastWin, setLastWin]         = useState(null);
  const [rocketX, setRocketX]         = useState(5);
  const [rocketY, setRocketY]         = useState(78);
  const [crashed, setCrashed]         = useState(false);
  const [showRedFlash, setShowRedFlash] = useState(false);
  const [skyP, setSkyP]               = useState(0);
  const [crashMult, setCrashMult]     = useState(null);

  const wsRef          = useRef(null);
  const rocketXRef     = useRef(5);
  const rocketYRef     = useRef(78);
  const phaseRef       = useRef('betting');   // ВСЕГДА актуальный phase
  const myBetRef       = useRef(null);        // ВСЕГДА актуальная ставка
  const betSentRef     = useRef(false);
  const tickRef        = useRef(0);

  const doReset = () => {
    rocketXRef.current = 5;
    rocketYRef.current = 78;
    tickRef.current    = 0;
    setRocketX(5);
    setRocketY(78);
    setSkyP(0);
    setCrashMult(null);
  };

  useEffect(() => {
    let ws;
    let destroyed = false; // защита от StrictMode двойного mount

    const connect = () => {
      if (destroyed) return;
      ws = new window.WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => console.log('[WS] connected');

      ws.onmessage = (e) => {
        let msg;
        try { msg = JSON.parse(e.data); } catch { return; }
        if (msg.type !== 'tick') console.log('[WS] msg:', msg.type, msg);

        if (msg.type === 'state') {
          const prevPhase = phaseRef.current;
          phaseRef.current = msg.phase;
          setPhase(msg.phase);
          setMultiplier(msg.multiplier || 1);
          setBets(msg.bets || []);
          setTimeLeft(msg.timeLeft || 10);

          if (msg.phase === 'betting') {
            // Только если это реальная смена фазы — сбрасываем
            if (prevPhase !== 'betting') {
              setCrashed(false);
              setShowRedFlash(false);
              myBetRef.current  = null;
              betSentRef.current = false;
              setMyBet(null);
              setMyCashedOut(false);
              setLastWin(null);
              doReset();
            }
          } else {
            // Реконнект во время flying/crashed — восстанавливаем ставку
            const myTgId = telegramUser?.id;
            if (myTgId) {
              const myServerBet = (msg.bets || []).find(b => b.telegramId === myTgId);
              if (myServerBet && !myBetRef.current) {
                console.log('[RECONNECT] Restoring bet from server:', myServerBet);
                myBetRef.current   = { amount: myServerBet.amount };
                betSentRef.current = true;
                setMyBet({ amount: myServerBet.amount });
                if (myServerBet.cashedOut) setMyCashedOut(true);
              }
            }
            if (msg.phase === 'crashed') {
              setCrashed(true);
            }
          }
        }

        if (msg.type === 'countdown') {
          setTimeLeft(msg.timeLeft);
        }

        if (msg.type === 'tick') {
          setMultiplier(msg.multiplier);
          tickRef.current += 1;
          const t  = tickRef.current;
          const sx = 0.08 + t * 0.0022;
          const sy = 0.06 + t * 0.0016;
          rocketXRef.current = Math.min(rocketXRef.current + sx, 84);
          rocketYRef.current = Math.max(rocketYRef.current - sy, 7);
          const sp = Math.max(0, Math.min(1, 1 - (rocketYRef.current - 7) / 71));
          setRocketX(rocketXRef.current);
          setRocketY(rocketYRef.current);
          setSkyP(sp);
        }

        if (msg.type === 'crash') {
          setCrashMult(msg.crashAt);
          setMultiplier(msg.crashAt);
          setCrashed(true);
          setShowRedFlash(true);
          phaseRef.current = 'crashed';
          setPhase('crashed');
          setBets(msg.bets || []);
          setTimeout(() => setShowRedFlash(false), 2500);
          setTimeout(() => {
            phaseRef.current   = 'betting';
            myBetRef.current   = null;
            betSentRef.current = false;
            setPhase('betting');
            setCrashed(false);
            setMyBet(null);
            setMyCashedOut(false);
            doReset();
          }, 3000);
        }

        if (msg.type === 'betOk') {
          setUserBalance(msg.balance);
          // гарантируем что myBet выставлен
          if (myBetRef.current) setMyBet({ ...myBetRef.current });
        }

        if (msg.type === 'cashoutOk') {
          setMyCashedOut(true);
          setLastWin({ multiplier: msg.multiplier, winAmount: msg.winAmount });
          setUserBalance(msg.balance);
        }

        if (msg.type === 'error') {
          // Не сбрасываем ставку если она уже принята сервером
          // (дубликат-ошибки от нескольких WS-соединений)
          const alreadyPlaced = msg.text === 'Ставка уже сделана';
          if (!alreadyPlaced) {
            myBetRef.current   = null;
            betSentRef.current = false;
            setMyBet(null);
          }
          console.log('[ERROR]', msg.text, 'alreadyPlaced=', alreadyPlaced);
          if (!alreadyPlaced) alert(msg.text);
        }
      };

      ws.onclose = () => {
        console.log('[WS] closed');
        if (!destroyed) setTimeout(connect, 2000);
      };
      ws.onerror = () => ws.close();
    };

    connect();
    return () => {
      destroyed = true;
      try { ws.close(); } catch {}
    };
  }, []);

  const placeBet = () => {
    const amount = parseFloat(betAmount);
    console.log('[BET] placeBet called', { amount, phase: phaseRef.current, myBet: myBetRef.current, betSent: betSentRef.current, wsState: wsRef.current?.readyState });
    if (isNaN(amount) || amount <= 0)  { alert('Введите корректную сумму'); return; }
    if (amount > userBalance)           { alert('Недостаточно средств'); return; }
    if (myBetRef.current)               { console.log('[BET] already placed'); alert('Ставка уже сделана'); return; }
    if (betSentRef.current)             { console.log('[BET] already sent'); return; }
    if (phaseRef.current !== 'betting') { console.log('[BET] wrong phase:', phaseRef.current); alert('Ставки только до старта'); return; }
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log('[BET] ws not open, state:', wsRef.current?.readyState);
      alert('Нет соединения'); return;
    }

    betSentRef.current = true;
    const bet = { amount };
    myBetRef.current = bet;
    setMyBet(bet);
    console.log('[BET] sending bet', bet);

    wsRef.current.send(JSON.stringify({
      type:       'bet',
      telegramId: telegramUser?.id,
      username:   telegramUser?.username || 'Аноним',
      amount,
    }));
  };

  const cashout = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'cashout', telegramId: telegramUser?.id }));
  };

  const lerpColor = (c1, c2, t) => {
    const h = s => parseInt(s, 16);
    const r = (a, b) => Math.round(h(a) + (h(b) - h(a)) * t).toString(16).padStart(2, '0');
    return '#' + r(c1.slice(1,3),c2.slice(1,3)) + r(c1.slice(3,5),c2.slice(3,5)) + r(c1.slice(5,7),c2.slice(5,7));
  };
  const getBg = () => {
    if (crashed) return 'linear-gradient(to bottom,#1a0000,#050005)';
    const stops = [
      { p: 0.00, top: '#5baad6', bot: '#87ceeb' },
      { p: 0.20, top: '#2a5fa8', bot: '#4a90d4' },
      { p: 0.45, top: '#0d2255', bot: '#1a3a8e' },
      { p: 0.65, top: '#050f2e', bot: '#080e3a' },
      { p: 1.00, top: '#000000', bot: '#020510' },
    ];
    let s0 = stops[0], s1 = stops[stops.length-1];
    for (let i = 0; i < stops.length-1; i++) {
      if (skyP >= stops[i].p && skyP <= stops[i+1].p) { s0 = stops[i]; s1 = stops[i+1]; break; }
    }
    const t = s1.p === s0.p ? 0 : (skyP - s0.p) / (s1.p - s0.p);
    return `linear-gradient(to bottom,${lerpColor(s0.top,s1.top,t)},${lerpColor(s0.bot,s1.bot,t)})`;
  };

  const multColor = crashed ? '#ff4444' : myCashedOut ? '#00e676' : '#ffffff';

  // Кнопка определяется через REFS а не state — нет лага
  const renderPanel = () => {
    const p  = phaseRef.current;
    const mb = myBetRef.current;
    console.log('[PANEL] render', { p, mb, myCashedOut });

    if (mb && myCashedOut) {
      return <button className="rw-action-btn rw-btn-cashed" disabled>Выведено</button>;
    }
    if (mb && p === 'crashed') {
      return <button className="rw-action-btn rw-btn-crashed" disabled>Краш</button>;
    }
    if (mb && p === 'flying') {
      return (
        <button className="rw-action-btn rw-btn-cashout" onClick={cashout}>
          Забрать {(mb.amount * multiplier).toFixed(2)} TON
        </button>
      );
    }
    if (mb && p === 'betting') {
      return <button className="rw-action-btn rw-btn-waiting" disabled>Ставка {mb.amount} TON принята</button>;
    }
    // Нет ставки
    return (
      <>
        <div className="rw-input-row">
          <input
            className="rw-input"
            type="number"
            placeholder="0.00"
            value={betAmount}
            onChange={e => setBetAmount(e.target.value)}
            disabled={p !== 'betting'}
          />
          <button className="rw-max-btn" onClick={() => setBetAmount(String(userBalance))} disabled={p !== 'betting'}>
            MAX
          </button>
        </div>
        <button className="rw-action-btn" onClick={placeBet} disabled={p !== 'betting'}>
          {p === 'betting' ? 'Сделать ставку' : 'Ждите следующего раунда'}
        </button>
      </>
    );
  };

  return (
    <div className="rocket-game-page">
      <div className="rocket-window" style={{ background: getBg(), transition: 'background 1.5s ease', position: 'relative' }}>
        {showRedFlash && <div className="crash-flash" />}
        <div className="rw-static-stars" style={{ opacity: Math.min(skyP * 3, 1) }}>
          {[...Array(28)].map((_, i) => (
            <div key={i} className="rw-dot-star" style={{
              left:   `${(i * 41 + 7) % 100}%`,
              top:    `${(i * 67 + 13) % 90}%`,
              width:  i % 4 === 0 ? 2.5 : 1.5,
              height: i % 4 === 0 ? 2.5 : 1.5,
              opacity: 0.4 + (i % 5) * 0.12,
            }} />
          ))}
        </div>

        {skyP > 0.25 && (
          <div className="rw-lottie-layer rw-stars-layer" style={{ opacity: Math.min((skyP-0.25)*3, 0.9) }}>
            <Lottie animationData={starsAnimation} loop autoplay style={{ width:'100%', height:'100%' }} />
          </div>
        )}
        {skyP > 0.35 && (
          <div className="rw-lottie-layer rw-planet-layer" style={{ opacity: Math.min((skyP-0.35)*5, 1) }}>
            <Lottie animationData={planetAnimation} loop autoplay style={{ width:90, height:90 }} />
          </div>
        )}
        {skyP > 0.5 && (
          <div className="rw-lottie-layer rw-planet2-layer" style={{ opacity: Math.min((skyP-0.5)*6, 1) }}>
            <Lottie animationData={planet2Animation} loop autoplay style={{ width:75, height:75 }} />
          </div>
        )}
        {skyP > 0.45 && (
          <div className="rw-lottie-layer rw-satellite-layer" style={{ opacity: Math.min((skyP-0.45)*6, 1) }}>
            <Lottie animationData={satelliteAnimation} loop autoplay style={{ width:55, height:55 }} />
          </div>
        )}
        {skyP < 0.35 && !crashed && CLOUD_POSITIONS.map((pos, i) => (
          <div key={i} className="rw-cloud-item" style={{
            top: pos.top, left: pos.left,
            opacity: Math.max((0.35-skyP)*3, 0),
            transform: `scale(${pos.scale})`,
            animationDelay: `${i*1.4}s`,
          }}>
            <Lottie animationData={cloudsAnimation} loop autoplay style={{ width:200, height:200 }} />
          </div>
        ))}

        <div className="rw-multiplier" style={{ color: multColor }}>{multiplier.toFixed(2)}x</div>
        {crashed && <div className="rw-crash-label">УЛЕТЕЛА</div>}
        {phase === 'betting' && <div className="rw-countdown">Ставки {timeLeft}с</div>}

        {!crashed && (
          <div className="rw-rocket" style={{ left:`${rocketX}%`, top:`${rocketY}%` }}>
            <Lottie animationData={rocketAnimation} loop autoplay style={{ width:64, height:64 }} />
          </div>
        )}
        {crashed && <div className="rw-crash-burst" style={{ left:`${rocketXRef.current}%`, top:`${rocketYRef.current}%` }} />}
        {phase === 'flying' && !crashed && (
          <svg className="rw-trail" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline points={`5,78 ${rocketX},${rocketY}`} stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" fill="none" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* СПИСОК СТАВОК — скроллится */}
      <div className="rw-bets-list">
        {bets.length === 0
          ? <div className="rw-bets-empty">Ставок пока нет</div>
          : bets.map((b, i) => (
            <div key={i} className={`rw-bet-row${b.cashedOut ? ' cashed' : ''}`}>
              <div className="rw-bet-avatar" style={{padding:0,overflow:'hidden'}}>
        {b.photoUrl
          ? <img src={b.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
          : (b.username||'?')[0].toUpperCase()
        }
      </div>
              <div className="rw-bet-info">
                <span className="rw-bet-name">{b.username||'Аноним'}</span>
                <span className="rw-bet-ton">{b.amount} TON</span>
              </div>
              <div className="rw-bet-right">
                {b.cashedOut
                  ? <span className="rw-bet-win">+{(b.amount*b.cashoutMultiplier).toFixed(2)} TON<br/><span className="rw-bet-mult">{b.cashoutMultiplier}x</span></span>
                  : (phase === 'crashed' || b.crashed)
                    ? <span className="rw-bet-lost">-{b.amount} TON</span>
                    : <span className="rw-bet-pending">В игре</span>}
              </div>
            </div>
          ))
        }
      </div>

      {/* ПАНЕЛЬ — fixed к низу, всегда видна */}
      <div className="rw-panel">
        {renderPanel()}
      </div>
    </div>
  );
}
function BottomNav({ page, setPage, telegramUser }) {
  return (
    <div className="bottom-nav">
      <button className={page === 'leaders' ? 'active' : ''} onClick={() => setPage('leaders')}>
        <img src={leadersIcon} alt="Лидеры" className={`icon-img ${page === 'leaders' ? 'active' : ''}`} />
        <span>Лидеры</span>
      </button>
      <button className={page === 'games' ? 'active' : ''} onClick={() => setPage('games')}>
        <img src={gameIcon} alt="Игры" className={`icon-img ${page === 'games' ? 'active' : ''}`} />
        <span>Игры</span>
      </button>
      <button className={page === 'profile' ? 'active' : ''} onClick={() => setPage('profile')}>
        <div className="avatar-icon" style={{padding: 0, overflow: 'hidden'}}>
          {telegramUser?.photoUrl
            ? <img src={telegramUser.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
            : (telegramUser?.username?.[0] || telegramUser?.firstName?.[0] || '?').toUpperCase()
          }
        </div>
        <span>Профиль</span>
      </button>
    </div>
  );
}

export default App;
