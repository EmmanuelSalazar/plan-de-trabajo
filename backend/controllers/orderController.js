const { ProductionOrder, ProductionEntry } = require('../models');
const { Op } = require('sequelize');

// Función auxiliar para calcular fecha de finalización
const calculateWorkEndDate = (startDate, workDays) => {
  const start = new Date(startDate);
  const endDate = new Date(start);
  
  let daysToAdd = Math.ceil(workDays);
  let currentDate = new Date(start);
  
  while (daysToAdd > 0) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Saltar fines de semana (Sábado = 6, Domingo = 0)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysToAdd--;
    }
  }
  
  return currentDate;
};

// Obtener todas las órdenes
const getAllOrders = async (req, res) => {
  try {
    const orders = await ProductionOrder.findAll({
      include: [{
        model: ProductionEntry,
        as: 'historialProduccion',
        order: [['created_at', 'DESC']]
      }],
      order: [['created_at', 'DESC']]
    });

    // Formatear datos para el frontend
    const formattedOrders = orders.map(order => ({
      id: order.id.toString(),
      fechaEntrada: order.fechaEntrada,
      ordenProduccion: order.ordenProduccion,
      referencia: order.referencia,
      color: order.color,
      promedioProduccion: order.promedioProduccion,
      cantidadEntrada: order.cantidadEntrada,
      modulo: order.modulo,
      unidadesProducidas: order.unidadesProducidas,
      fechaCreacion: order.fechaCreacion,
      fechaFinalizacion: order.fechaFinalizacion,
      historialProduccion: order.historialProduccion.map(entry => ({
        id: entry.id.toString(),
        cantidad: entry.cantidad,
        fecha: entry.fecha,
        hora: entry.hora
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
};

// Obtener orden por ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await ProductionOrder.findByPk(id, {
      include: [{
        model: ProductionEntry,
        as: 'historialProduccion',
        order: [['created_at', 'DESC']]
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const formattedOrder = {
      id: order.id.toString(),
      fechaEntrada: order.fechaEntrada,
      ordenProduccion: order.ordenProduccion,
      referencia: order.referencia,
      color: order.color,
      promedioProduccion: order.promedioProduccion,
      cantidadEntrada: order.cantidadEntrada,
      modulo: order.modulo,
      unidadesProducidas: order.unidadesProducidas,
      fechaCreacion: order.fechaCreacion,
      fechaFinalizacion: order.fechaFinalizacion,
      historialProduccion: order.historialProduccion.map(entry => ({
        id: entry.id.toString(),
        cantidad: entry.cantidad,
        fecha: entry.fecha,
        hora: entry.hora
      }))
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
};

// Crear nueva orden
const createOrder = async (req, res) => {
  try {
    const {
      fechaEntrada,
      ordenProduccion,
      referencia,
      color,
      promedioProduccion,
      cantidadEntrada,
      modulo
    } = req.body;

    // Validaciones
    if (!fechaEntrada || !ordenProduccion || !referencia || !color || 
        !promedioProduccion || !cantidadEntrada || !modulo) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios' 
      });
    }

    if (promedioProduccion <= 0 || cantidadEntrada <= 0) {
      return res.status(400).json({ 
        error: 'El promedio de producción y cantidad deben ser mayores a 0' 
      });
    }

    if (![1, 2, 3, 4].includes(Number(modulo))) {
      return res.status(400).json({ 
        error: 'El módulo debe ser 1, 2, 3 o 4' 
      });
    }

    // Verificar que la orden no exista
    const existingOrder = await ProductionOrder.findOne({
      where: { ordenProduccion }
    });

    if (existingOrder) {
      return res.status(400).json({ 
        error: 'Ya existe una orden con este número' 
      });
    }

    // Calcular fecha de finalización
    const workDays = cantidadEntrada / promedioProduccion;
    const fechaFinalizacion = calculateWorkEndDate(fechaEntrada, workDays);

    // Crear la orden
    const newOrder = await ProductionOrder.create({
      fechaEntrada,
      ordenProduccion,
      referencia,
      color,
      promedioProduccion: Number(promedioProduccion),
      cantidadEntrada: Number(cantidadEntrada),
      modulo: Number(modulo),
      unidadesProducidas: 0,
      fechaCreacion: new Date(),
      fechaFinalizacion
    });

    // Obtener la orden creada con relaciones
    const createdOrder = await ProductionOrder.findByPk(newOrder.id, {
      include: [{
        model: ProductionEntry,
        as: 'historialProduccion'
      }]
    });

    const formattedOrder = {
      id: createdOrder.id.toString(),
      fechaEntrada: createdOrder.fechaEntrada,
      ordenProduccion: createdOrder.ordenProduccion,
      referencia: createdOrder.referencia,
      color: createdOrder.color,
      promedioProduccion: createdOrder.promedioProduccion,
      cantidadEntrada: createdOrder.cantidadEntrada,
      modulo: createdOrder.modulo,
      unidadesProducidas: createdOrder.unidadesProducidas,
      fechaCreacion: createdOrder.fechaCreacion,
      fechaFinalizacion: createdOrder.fechaFinalizacion,
      historialProduccion: []
    };

    res.status(201).json(formattedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Ya existe una orden con este número' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
};

// Actualizar orden
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const order = await ProductionOrder.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    await order.update(updateData);

    const updatedOrder = await ProductionOrder.findByPk(id, {
      include: [{
        model: ProductionEntry,
        as: 'historialProduccion',
        order: [['created_at', 'DESC']]
      }]
    });

    const formattedOrder = {
      id: updatedOrder.id.toString(),
      fechaEntrada: updatedOrder.fechaEntrada,
      ordenProduccion: updatedOrder.ordenProduccion,
      referencia: updatedOrder.referencia,
      color: updatedOrder.color,
      promedioProduccion: updatedOrder.promedioProduccion,
      cantidadEntrada: updatedOrder.cantidadEntrada,
      modulo: updatedOrder.modulo,
      unidadesProducidas: updatedOrder.unidadesProducidas,
      fechaCreacion: updatedOrder.fechaCreacion,
      fechaFinalizacion: updatedOrder.fechaFinalizacion,
      historialProduccion: updatedOrder.historialProduccion.map(entry => ({
        id: entry.id.toString(),
        cantidad: entry.cantidad,
        fecha: entry.fecha,
        hora: entry.hora
      }))
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
};

// Eliminar orden
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await ProductionOrder.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Eliminar entradas de producción relacionadas
    await ProductionEntry.destroy({
      where: { orderId: id }
    });

    // Eliminar la orden
    await order.destroy();

    res.json({ message: 'Orden eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
};

// Agregar producción a una orden
const addProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ 
        error: 'La cantidad debe ser mayor a 0' 
      });
    }

    const order = await ProductionOrder.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Verificar que no se exceda la cantidad total
    const newTotal = order.unidadesProducidas + Number(cantidad);
    if (newTotal > order.cantidadEntrada) {
      return res.status(400).json({ 
        error: 'La cantidad excede el total de la orden' 
      });
    }

    const now = new Date();
    
    // Crear entrada de producción
    await ProductionEntry.create({
      orderId: id,
      cantidad: Number(cantidad),
      fecha: now.toISOString().split('T')[0],
      hora: now.toTimeString().split(' ')[0].substring(0, 5)
    });

    // Actualizar unidades producidas
    await order.update({
      unidadesProducidas: newTotal
    });

    // Recalcular fecha de finalización si no está completo
    if (newTotal < order.cantidadEntrada) {
      const remaining = order.cantidadEntrada - newTotal;
      const remainingDays = remaining / order.promedioProduccion;
      const newEndDate = calculateWorkEndDate(new Date(), remainingDays);
      
      await order.update({
        fechaFinalizacion: newEndDate
      });
    }

    res.json({ 
      message: 'Producción agregada exitosamente',
      unidadesProducidas: newTotal
    });
  } catch (error) {
    console.error('Error adding production:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
};
// ELIMINAR ENTRADAS DE PRODUCCION
const deleteProductionEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await ProductionEntry.findByPk(id);

    if (!entry) {
      return res.status(404).json({ error: 'Entrada de producción no encontrada' });
    }

    await entry.destroy();

    res.json({ message: 'Entrada de producción eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting production entry:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};



module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  addProduction,
  deleteProductionEntry
};