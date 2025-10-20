const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ColorSizeBreakdown = sequelize.define('color_size_breakdowns', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_id',
    references: {
      model: 'production_orders',
      key: 'id'
    }
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  size32: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'size_32'
  },
  size34: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'size_34'
  },
  size36: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'size_36'
  },
  size38: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'size_38'
  },
  size40: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'size_40'
  },
  size42: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'size_42'
  },
  totalUnits: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_units'
  }
}, {
  tableName: 'color_size_breakdowns',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeSave: (breakdown) => {
      // Calcular total automáticamente
      breakdown.totalUnits = 
        (breakdown.size32 || 0) + 
        (breakdown.size34 || 0) + 
        (breakdown.size36 || 0) + 
        (breakdown.size38 || 0) + 
        (breakdown.size40 || 0) + 
        (breakdown.size42 || 0);
    }
  }
});

module.exports = ColorSizeBreakdown;