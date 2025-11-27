const { ProductionOrder, ProductionEntry, ColorSizeBreakdown } = require('../models');
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
      }, {
        model: ColorSizeBreakdown,
        as: 'colorBreakdowns'
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
      materialesEnBodega: order.materialesEnBodega || false,
      enProduccion: order.enProduccion || false,
      colorBreakdowns: order.colorBreakdowns ? order.colorBreakdowns.map(breakdown => ({
        id: breakdown.id,
        color: breakdown.color,
        size32: breakdown.size32,
        size34: breakdown.size34,
        size36: breakdown.size36,
        size38: breakdown.size38,
        size40: breakdown.size40,
        size42: breakdown.size42,
        totalUnits: breakdown.totalUnits
      })) : [],
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
      }, {
        model: ColorSizeBreakdown,
        as: 'colorBreakdowns'
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
      materialesEnBodega: order.materialesEnBodega || false,
      colorBreakdowns: order.colorBreakdowns ? order.colorBreakdowns.map(breakdown => ({
        id: breakdown.id,
        color: breakdown.color,
        size32: breakdown.size32,
        size34: breakdown.size34,
        size36: breakdown.size36,
        size38: breakdown.size38,
        size40: breakdown.size40,
        size42: breakdown.size42,
        totalUnits: breakdown.totalUnits
      })) : [],
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
  // 1. Iniciar la transacción
  const t = await ProductionOrder.sequelize.transaction();

  try {
    const {
      fechaEntrada,
      ordenProduccion,
      referencia,
      ref_id,
      color,
      promedioProduccion,
      cantidadEntrada,
      modulo,
      materialesEnBodega,
      enProduccion
    } = req.body;

    // Validaciones
    if (!fechaEntrada || !ordenProduccion || !referencia || !ref_id || !color || 
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

    const numericModulo = Number(modulo);
    if (![1, 2, 3, 4].includes(numericModulo)) {
      return res.status(400).json({ 
        error: 'El módulo debe ser 1, 2, 3 o 4' 
      });
    }

    const existingOrder = await ProductionOrder.findOne({
      where: { ordenProduccion },
      transaction: t
    });

    if (existingOrder) {
      // Revertir la transacción si falla la validación
      await t.rollback(); 
      return res.status(400).json({ 
        error: 'Ya existe una orden con este número' 
      });
    }

    const isEnProduccion = enProduccion || false;
    
    // 2. Si la nueva orden está en producción, desactivar las demás en el mismo módulo
    if (isEnProduccion) {
      await ProductionOrder.update(
        { enProduccion: false },
        {
          where: { 
            modulo: numericModulo,
            en_produccion: true // Opcional: solo actualizar las que ya están activas
          },
          transaction: t // Importante: usar la transacción
        }
      );
      // ¡Ahora todas las demás órdenes en este módulo están desactivadas (en_produccion = 0)!
    }

    const workDays = cantidadEntrada / promedioProduccion;
    const fechaFinalizacion = calculateWorkEndDate(fechaEntrada, workDays);

    // Crear la orden (usando la transacción)
    const newOrder = await ProductionOrder.create({
      fechaEntrada,
      ordenProduccion,
      referencia,
      ref_id,
      color,
      promedioProduccion: Number(promedioProduccion),
      cantidadEntrada: Number(cantidadEntrada),
      modulo: numericModulo,
      unidadesProducidas: 0,
      fechaCreacion: new Date(),
      fechaFinalizacion,
      materialesEnBodega: materialesEnBodega || false,
      enProduccion: isEnProduccion
    }, { transaction: t });

    // Guardar colorBreakdowns si existen (usando la transacción)
    if (req.body.colorBreakdowns && req.body.colorBreakdowns.length > 0) {
      const colorBreakdownsData = req.body.colorBreakdowns.map(breakdown => ({
        orderId: newOrder.id,
        color: breakdown.color,
        size32: breakdown.size32 || 0,
        size34: breakdown.size34 || 0,
        size36: breakdown.size36 || 0,
        size38: breakdown.size38 || 0,
        size40: breakdown.size40 || 0,
        size42: breakdown.size42 || 0,
        totalUnits: breakdown.totalUnits || 0
      }));

      await ColorSizeBreakdown.bulkCreate(colorBreakdownsData, { transaction: t });
    }

    // Obtener la orden creada con relaciones (usando la transacción)
    // Nota: findByPk también debe estar en la transacción si quieres que lea los datos recién insertados
    const createdOrder = await ProductionOrder.findByPk(newOrder.id, {
      include: [{
        model: ProductionEntry,
        as: 'historialProduccion'
      }, {
        model: ColorSizeBreakdown,
        as: 'colorBreakdowns'
      }],
      transaction: t // Importante: usar la transacción
    });

    // 3. Confirmar la transacción
    await t.commit(); 

    // Formatear y devolver la respuesta
    const formattedOrder = {
      id: createdOrder.id.toString(),
      fechaEntrada: createdOrder.fechaEntrada,
      ordenProduccion: createdOrder.ordenProduccion,
      referencia: createdOrder.referencia,
      ref_id: createdOrder.ref_id,
      color: createdOrder.color,
      promedioProduccion: createdOrder.promedioProduccion,
      cantidadEntrada: createdOrder.cantidadEntrada,
      modulo: createdOrder.modulo,
      unidadesProducidas: createdOrder.unidadesProducidas,
      fechaCreacion: createdOrder.fechaCreacion,
      fechaFinalizacion: createdOrder.fechaFinalizacion,
      materialesEnBodega: createdOrder.materialesEnBodega || false,
      enProduccion: createdOrder.enProduccion || false,
      historialProduccion: createdOrder.historialProduccion || [],
      colorBreakdowns: createdOrder.colorBreakdowns || []
    };

    res.status(201).json(formattedOrder);
  } catch (error) {
    // 4. Si hay un error, revertir la transacción
    if (t) await t.rollback();

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
  // 1. Iniciar la transacción
  const t = await ProductionOrder.sequelize.transaction();
  const { id } = req.params;

  try {
    console.log('📝 [UPDATE_ORDER] Iniciando actualización de orden...');
    const updateData = req.body;
    
    console.log('📝 [UPDATE_ORDER] ID de orden:', id);
    console.log('📝 [UPDATE_ORDER] Datos a actualizar:', updateData);

    // 2. Buscar la orden dentro de la transacción
    const order = await ProductionOrder.findByPk(id, { transaction: t });
    
    if (!order) {
      console.log('❌ [UPDATE_ORDER] Orden no encontrada con ID:', id);
      await t.rollback();
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Validar que la nueva cantidad no sea menor a las unidades ya producidas
    if (updateData.cantidadEntrada && updateData.cantidadEntrada < order.unidadesProducidas) {
      console.log('❌ [UPDATE_ORDER] Cantidad menor a unidades producidas');
      await t.rollback();
      return res.status(400).json({ 
        error: `La cantidad no puede ser menor a las unidades ya producidas (${order.unidadesProducidas})` 
      });
    }

    // Si se actualiza la cantidad o promedio, recalcular fecha de finalización
    if (updateData.cantidadEntrada || updateData.promedioProduccion) {
      const cantidadTotal = updateData.cantidadEntrada || order.cantidadEntrada;
      const promedio = updateData.promedioProduccion || order.promedioProduccion;
      const remaining = cantidadTotal - order.unidadesProducidas;
      
      if (remaining > 0) {
        const remainingDays = remaining / promedio;
        const startDate = updateData.fechaEntrada || order.fechaEntrada; 
        const newEndDate = calculateWorkEndDate(startDate, remainingDays);
        updateData.fechaFinalizacion = newEndDate;
        console.log('📅 [UPDATE_ORDER] Nueva fecha de finalización calculada:', newEndDate);
      }
    }

    // Se ejecuta SOLAMENTE si se intenta poner esta orden 'enProduccion = true'
    const isActivatingProduction = updateData.enProduccion === true || updateData.enProduccion === 1;
    
    if (isActivatingProduction) {
      // Usar el módulo existente si no se está actualizando
      const moduloToUpdate = updateData.modulo || order.modulo;

      console.log(`⚠️ Desactivando otras órdenes en Módulo ${moduloToUpdate}...`);
      
      // 3. Desactivar todas las demás órdenes en producción para ese módulo
      await ProductionOrder.update(
        { enProduccion: false },
        {
          where: { 
            modulo: moduloToUpdate,
            id: { [Op.ne]: id }, // Excluir la orden actual
            en_produccion: true
          },
          transaction: t
        }
      );
      console.log('✅ Desactivación de órdenes previas completada.');
    }
    // 🌟 FIN LÓGICA DE NEGOCIO 🌟

    // 4. Actualizar la orden dentro de la transacción
    await order.update(updateData, { transaction: t });
    console.log('✅ [UPDATE_ORDER] Orden actualizada correctamente');

    // 5. Buscar la orden actualizada con relaciones (dentro de la transacción)
    const updatedOrder = await ProductionOrder.findByPk(id, {
      include: [{
        model: ProductionEntry,
        as: 'historialProduccion',
        order: [['created_at', 'DESC']]
      }, {
        model: ColorSizeBreakdown,
        as: 'colorBreakdowns'
      }],
      transaction: t // ¡Fundamental!
    });

    // 6. Confirmar la transacción
    await t.commit(); 

    // Formatear y devolver la respuesta (fuera de la transacción)
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
      materialesEnBodega: updatedOrder.materialesEnBodega || false,
      enProduccion: updatedOrder.enProduccion || false,
      colorBreakdowns: updatedOrder.colorBreakdowns ? updatedOrder.colorBreakdowns.map(breakdown => ({
        id: breakdown.id,
        color: breakdown.color,
        size32: breakdown.size32,
        size34: breakdown.size34,
        size36: breakdown.size36,
        size38: breakdown.size38,
        size40: breakdown.size40,
        size42: breakdown.size42,
        totalUnits: breakdown.totalUnits
      })) : [],
      historialProduccion: updatedOrder.historialProduccion.map(entry => ({
        id: entry.id.toString(),
        cantidad: entry.cantidad,
        fecha: entry.fecha,
        hora: entry.hora
      }))
    };

    res.json(formattedOrder);
  } catch (error) {
    // 7. Si hay un error, revertir la transacción
    if (t) await t.rollback(); 

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

    // Eliminar breakdowns de colores relacionados
    await ColorSizeBreakdown.destroy({
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

const updateOrderSequence = "";

// OBTENER ORDENES QUE SE ENCUENTRAN EN PRODUCCIÓN
const getOrdersInProduction = async (req, res) => {
  try {
    const orders = await ProductionOrder.findAll({
      where: {
        enProduccion: true
      },
      attributes: ['ordenProduccion', 'referencia', 'modulo', 'unidadesProducidas', 'cantidadEntrada', 'promedioProduccion', 'ref_id']
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders in production:', error);
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
  deleteProductionEntry,
  getOrdersInProduction,
  updateOrderSequence
};