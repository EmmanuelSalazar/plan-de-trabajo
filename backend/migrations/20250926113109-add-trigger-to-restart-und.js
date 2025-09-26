'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const sql = `

CREATE TRIGGER eliminar_produccion_ingresada
BEFORE DELETE ON production_entries
FOR EACH ROW
BEGIN
    -- Actualiza la tabla production_orders
    -- Resta la 'cantidad' del registro que se está eliminando (accedido vía OLD)
    -- de la columna 'unidades_producidas' en la orden correspondiente.
    UPDATE production_orders
    SET unidades_producidas = unidades_producidas - OLD.cantidad
    WHERE id = OLD.order_id;
END;
`;

    await queryInterface.sequelize.query(sql);
  },  

  async down (queryInterface, Sequelize) {
    const sql = `DROP TRIGGER IF EXISTS eliminar_produccion_ingresada;`;
    await queryInterface.sequelize.query(sql);
  }
};
