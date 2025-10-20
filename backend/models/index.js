const sequelize = require('../config/database');
const ProductionOrder = require('./ProductionOrder');
const ProductionEntry = require('./ProductionEntry');
const ColorSizeBreakdown = require('./ColorSizeBreakdown');

// Definir relaciones
ProductionOrder.hasMany(ProductionEntry, {
  foreignKey: 'orderId',
  as: 'historialProduccion'
});

ProductionEntry.belongsTo(ProductionOrder, {
  foreignKey: 'orderId',
  as: 'order'
});

ProductionOrder.hasMany(ColorSizeBreakdown, {
  foreignKey: 'orderId',
  as: 'colorBreakdowns'
});

ColorSizeBreakdown.belongsTo(ProductionOrder, {
  foreignKey: 'orderId',
  as: 'order'
});

module.exports = {
  sequelize,
  ProductionOrder,
  ProductionEntry,
  ColorSizeBreakdown
};