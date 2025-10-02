'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     // 1. Añadir la columna 'materiales_en_bodega' (Field Name)
    await queryInterface.addColumn('production_orders', 'materiales_en_bodega', {
      type: Sequelize.BOOLEAN,
      allowNull: false,        // Lo hacemos NOT NULL, ya que el modelo le da un valor por defecto
      defaultValue: false      // Importante establecer el default value para las filas existentes
    });

    // 2. Añadir la columna 'sequence_order' (Field Name)
    await queryInterface.addColumn('production_orders', 'sequence_order', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down (queryInterface, Sequelize) {
     // Definimos las acciones para deshacer los cambios
    await queryInterface.removeColumn('production_orders', 'sequence_order');
    await queryInterface.removeColumn('production_orders', 'materiales_en_bodega');
  }
};
