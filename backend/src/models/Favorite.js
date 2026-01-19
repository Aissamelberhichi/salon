const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  salonId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'salons',
      key: 'id'
    }
  }
}, {
  tableName: 'favorites',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['clientId', 'salonId']
    }
  ]
});

module.exports = Favorite;
