const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductionOrder = sequelize.define('production_orders', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fechaEntrada: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_entrada'
  },
  ordenProduccion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'orden_produccion'
  },
  referencia: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  promedioProduccion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'promedio_produccion'
  },
  cantidadEntrada: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'cantidad_entrada'
  },
  modulo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 4
    }
  },
  unidadesProducidas: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'unidades_producidas'
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'fecha_creacion'
  },
  fechaFinalizacion: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_finalizacion'
  },
  materialesEnBodega: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'materiales_en_bodega'
  },
  sequenceOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sequence_order'
  }
}, {
  tableName: 'production_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ProductionOrder;