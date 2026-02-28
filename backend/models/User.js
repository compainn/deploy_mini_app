const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const User = sequelize.define('User', {
  telegramId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  walletAddressRaw: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  walletAddressFriendly: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  walletConnectedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  balance: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  totalGames: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalWins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalBets: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  totalProfit: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  bestMultiplier: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0
  },
  rank: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  photoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

const Transaction = sequelize.define('Transaction', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('deposit', 'withdraw', 'bet', 'win'),
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tonTxHash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  }
}, {
  timestamps: true
});

const InventoryItem = sequelize.define('InventoryItem', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  itemId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  itemName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  itemImage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  caseId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  openedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(InventoryItem, { foreignKey: 'userId' });
InventoryItem.belongsTo(User, { foreignKey: 'userId' });

sequelize.sync({ alter: true });

module.exports = { User, Transaction, InventoryItem, sequelize };
