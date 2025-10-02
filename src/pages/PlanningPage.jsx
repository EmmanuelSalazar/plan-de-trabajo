import React, { useState, useEffect, useMemo } from 'react';
import { useProduction } from '../context/ProductionContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Clock, Package, AlertTriangle, CheckCircle, GripVertical, Calculator } from 'lucide-react';
import { formatDate, calculateWorkEndDate } from '../utils/dateUtils';

export const PlanningPage = () => {
  const { orders, loading, updateOrderSequence } = useProduction();
  const [plannedOrders, setPlannedOrders] = useState([]);
  const [totalWorkDays, setTotalWorkDays] = useState(0);
  const [finalEndDate, setFinalEndDate] = useState(null);

  // Filter orders that are ready for production and not completed
  const readyOrders = useMemo(() => {
    console.log('🔍 [PLANNING] Todas las órdenes:', orders);
    const filtered = orders.filter(order => {
      const hasMaterieles = order.materialesEnBodega === true;
      const progress = (order.unidadesProducidas / order.cantidadEntrada) * 100;
      const notCompleted = progress < 100;
      
      console.log(`📋 [PLANNING] Orden ${order.ordenProduccion}:`, {
        materialesEnBodega: order.materialesEnBodega,
        hasMaterieles,
        progress: progress.toFixed(1) + '%',
        notCompleted,
        incluir: hasMaterieles && notCompleted
      });
      
      return hasMaterieles && notCompleted;
    });
    
    console.log('✅ [PLANNING] Órdenes listas para planificación:', filtered.length);
    return filtered;
  }, [orders]);

  useEffect(() => {
    console.log('🔄 [PLANNING] Recalculando timeline...');
    calculateTimeline();
  }, [readyOrders]);

  const calculateTimeline = () => {
    if (readyOrders.length === 0) {
      console.log('⚠️ [PLANNING] No hay órdenes listas');
      setPlannedOrders([]);
      setTotalWorkDays(0);
      setFinalEndDate(null);
      return;
    }

    const today = new Date();
    let currentStartDate = new Date(today);
    let totalDays = 0;
    
    const ordersWithDates = readyOrders.map((order, index) => {
      const remaining = order.cantidadEntrada - order.unidadesProducidas;
      const workDays = Math.ceil(remaining / order.promedioProduccion);
      
      const startDate = new Date(currentStartDate);
      const endDate = calculateWorkEndDate(startDate, workDays);
      
      // Next order starts the day after this one ends
      currentStartDate = new Date(endDate);
      currentStartDate.setDate(currentStartDate.getDate() + 1);
      
      totalDays += workDays;
      
      console.log(`📅 [PLANNING] Orden ${order.ordenProduccion}:`, {
        remaining,
        workDays,
        startDate: startDate.toLocaleDateString(),
        endDate: endDate.toLocaleDateString()
      });
      
      return {
        ...order,
        plannedStartDate: startDate,
        plannedEndDate: endDate,
        workDays,
        remaining,
        sequenceOrder: index
      };
    });

    console.log('📊 [PLANNING] Timeline calculado:', {
      totalOrders: ordersWithDates.length,
      totalDays,
      finalEndDate: ordersWithDates[ordersWithDates.length - 1]?.plannedEndDate
    });

    setPlannedOrders(ordersWithDates);
    setTotalWorkDays(totalDays);
    setFinalEndDate(ordersWithDates[ordersWithDates.length - 1]?.plannedEndDate);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(plannedOrders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Recalculate dates with new order
    const today = new Date();
    let currentStartDate = new Date(today);
    let totalDays = 0;

    const reorderedWithDates = items.map((order, index) => {
      const remaining = order.cantidadEntrada - order.unidadesProducidas;
      const workDays = Math.ceil(remaining / order.promedioProduccion);
      
      const startDate = new Date(currentStartDate);
      const endDate = calculateWorkEndDate(startDate, workDays);
      
      currentStartDate = new Date(endDate);
      currentStartDate.setDate(currentStartDate.getDate() + 1);
      
      totalDays += workDays;
      
      return {
        ...order,
        plannedStartDate: startDate,
        plannedEndDate: endDate,
        workDays,
        remaining,
        sequenceOrder: index
      };
    });

    setPlannedOrders(reorderedWithDates);
    setTotalWorkDays(totalDays);
    setFinalEndDate(reorderedWithDates[reorderedWithDates.length - 1]?.plannedEndDate);

    // Update sequence in backend if function exists
    if (updateOrderSequence) {
      updateOrderSequence(reorderedWithDates.map(order => ({
        id: order.id,
        sequenceOrder: order.sequenceOrder
      })));
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const calculateProgress = (order) => {
    return Number(((order.unidadesProducidas / order.cantidadEntrada) * 100).toFixed(1));
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Cargando planificación...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Planificación de Producción</h2>
        <p className="text-gray-600">Organiza el orden de las órdenes de producción y visualiza la línea de tiempo</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Órdenes Listas</p>
              <p className="text-2xl font-bold text-blue-900">{readyOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center space-x-3">
            <Calculator className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Días Totales</p>
              <p className="text-2xl font-bold text-green-900">{totalWorkDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Inicio</p>
              <p className="text-lg font-bold text-purple-900">
                {plannedOrders.length > 0 ? plannedOrders[0].plannedStartDate.toLocaleDateString('es-ES') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-orange-600 font-medium">Finalización</p>
              <p className="text-lg font-bold text-orange-900">
                {finalEndDate ? finalEndDate.toLocaleDateString('es-ES') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders not ready warning */}
      {orders.filter(order => !order.materialesEnBodega).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800">
              <span className="font-medium">
                {orders.filter(order => !order.materialesEnBodega).length} órdenes
              </span> no están listas para producción (materiales no disponibles)
            </p>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Debug Info:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Total órdenes: {orders.length}</p>
          <p>Órdenes con materiales: {orders.filter(o => o.materialesEnBodega).length}</p>
          <p>Órdenes incompletas: {orders.filter(o => (o.unidadesProducidas / o.cantidadEntrada) < 1).length}</p>
          <p>Órdenes listas para planificación: {readyOrders.length}</p>
        </div>
      </div>

      {/* Timeline */}
      {plannedOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes listas para planificar</h3>
          <p className="text-gray-500">
            Asegúrate de marcar las órdenes como "Materiales en Bodega" para incluirlas en la planificación
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Línea de Tiempo de Producción</h3>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="timeline">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {plannedOrders.map((order, index) => {
                    const progress = calculateProgress(order);
                    
                    return (
                      <Draggable key={`order-${order.id}`} draggableId={`order-${order.id}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border rounded-lg p-4 transition-all ${
                              snapshot.isDragging 
                                ? 'shadow-lg bg-blue-50 border-blue-300' 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              {/* Drag Handle */}
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>

                              {/* Order Number */}
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </div>
                              </div>

                              {/* Order Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{order.ordenProduccion}</h4>
                                    <p className="text-sm text-gray-600">{order.referencia} - {order.color}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">Módulo {order.modulo}</p>
                                    <p className="text-xs text-gray-500">{order.workDays} días laborales</p>
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-3">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-600">Progreso</span>
                                    <span className="text-xs text-gray-600">{progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                                      style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Dates and Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-500">Inicio Planificado</p>
                                    <p className="font-medium">{order.plannedStartDate.toLocaleDateString('es-ES')}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Fin Planificado</p>
                                    <p className="font-medium">{order.plannedEndDate.toLocaleDateString('es-ES')}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Restante</p>
                                    <p className="font-medium">{order.remaining.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Promedio/día</p>
                                    <p className="font-medium">{order.promedioProduccion.toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Status Icon */}
                              <div className="flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  );
};