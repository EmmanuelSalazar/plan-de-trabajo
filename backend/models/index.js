const sequelize = require('../config/database');
const ProductionOrder = require('./ProductionOrder');
const ProductionEntry = require('./ProductionEntry');

// Definir relaciones
ProductionOrder.hasMany(ProductionEntry, {
  foreignKey: 'orderId',
  as: 'historialProduccion'
});

ProductionEntry.belongsTo(ProductionOrder, {
  foreignKey: 'orderId',
  as: 'order'
});

module.exports = {
  sequelize,
  ProductionOrder,
  ProductionEntry
};