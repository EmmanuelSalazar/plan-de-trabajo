const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  addProduction,
  deleteProductionEntry,
  getOrdersInProduction,
} = require('../controllers/orderController');

// Rutas de órdenes
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

// Ruta para agregar producción
router.post('/:id/production', addProduction);
router.delete('/production-entry/:id', deleteProductionEntry);

// Ruta para obtener órdenes en producción
router.get('/ext/onProduction', getOrdersInProduction);
// Ruta para actualizar secuencia
/* router.put('/sequence', updateOrderSequence);
 */module.exports = router;