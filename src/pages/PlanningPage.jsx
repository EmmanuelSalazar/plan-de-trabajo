import React, { useState, useEffect, useMemo } from 'react';
import { useProduction } from '../context/ProductionContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { StrictMode } from 'react';
import { Calendar, Clock, Package, AlertTriangle, CheckCircle, GripVertical, Calculator, Filter } from 'lucide-react';
import { formatDate, calculateWorkEndDate } from '../utils/dateUtils';

export const PlanningPage = () => {
  const { orders, loading } = useProduction();
  const [plannedOrders, setPlannedOrders] = useState([]);
  const [totalWorkDays, setTotalWorkDays] = useState(0);
  const [finalEndDate, setFinalEndDate] = useState(null);
  const [selectedModule, setSelectedModule] = useState('all');

  // Filter orders that are ready for production and not completed
  const readyOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const hasMaterieles = order.materialesEnBodega === true;
      const progress = (order.unidadesProducidas / order.cantidadEntrada) * 100;
      const notCompleted = progress < 100;
      
      /* console.log(`📋 [PLANNING] Orden ${order.ordenProduccion}:`, {
        materialesEnBodega: order.materialesEnBodega,
        hasMaterieles,
        progress: progress.toFixed(1) + '%',
        notCompleted,
        modulo: order.modulo,
        incluir: hasMaterieles && notCompleted
      }); */
      
      return hasMaterieles && notCompleted;
    });

    // Filter by module if not 'all'
    if (selectedModule !== 'all') {
      filtered = filtered.filter(order => order.modulo === parseInt(selectedModule));
    }
    
    return filtered;
  }, [orders, selectedModule]);

  useEffect(() => {
    calculateTimeline();
  }, [readyOrders]);

  const calculateTimeline = () => {
    if (readyOrders.length === 0) {
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
      
      /* console.log(`📅 [PLANNING] Orden ${order.ordenProduccion}:`, {
        remaining,
        workDays,
        startDate: startDate.toLocaleDateString(),
        endDate: endDate.toLocaleDateString()
      }); */
      
      return {
        ...order,
        plannedStartDate: startDate,
        plannedEndDate: endDate,
        workDays,
        remaining,
        sequenceOrder: index
      };
    });

    /* console.log('📊 [PLANNING] Timeline calculado:', {
      totalOrders: ordersWithDates.length,
      totalDays,
      finalEndDate: ordersWithDates[ordersWithDates.length - 1]?.plannedEndDate
    }); */

    setPlannedOrders(ordersWithDates);
    setTotalWorkDays(totalDays);
    setFinalEndDate(ordersWithDates[ordersWithDates.length - 1]?.plannedEndDate);
  };

  const handleDragEnd = (result) => {
    
    if (!result.destination) {
      return;
    }

    if (result.source.index === result.destination.index) {
      return;
    }

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

  // Calculate module-specific stats
  const moduleStats = useMemo(() => {
    const moduleOrders = selectedModule === 'all' ? readyOrders : readyOrders.filter(o => o.modulo === parseInt(selectedModule));
    const totalDays = moduleOrders.reduce((sum, order) => {
      const remaining = order.cantidadEntrada - order.unidadesProducidas;
      return sum + Math.ceil(remaining / order.promedioProduccion);
    }, 0);
    
    return {
      orders: moduleOrders.length,
      totalDays,
      startDate: plannedOrders.length > 0 ? plannedOrders[0]?.plannedStartDate : null,
      endDate: plannedOrders.length > 0 ? plannedOrders[plannedOrders.length - 1]?.plannedEndDate : null
    };
  }, [readyOrders, selectedModule, plannedOrders]);

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Planificación de Producción</h2>
            <p className="text-gray-600">Organiza el orden de las órdenes de producción y visualiza la línea de tiempo</p>
          </div>
          
          {/* Module Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los módulos</option>
              <option value="1">Módulo 1</option>
              <option value="2">Módulo 2</option>
              <option value="3">Módulo 3</option>
              <option value="4">Módulo 4</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">
                {selectedModule === 'all' ? 'Órdenes En Proceso o Preparadas' : `Módulo ${selectedModule} - Órdenes`}
              </p>
              <p className="text-2xl font-bold text-blue-900">{moduleStats.orders}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center space-x-3">
            <Calculator className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Días Totales de trabajo</p>
              <p className="text-2xl font-bold text-green-900">{moduleStats.totalDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Inicio</p>
              <p className="text-lg font-bold text-purple-900">
                {moduleStats.startDate ? moduleStats.startDate.toLocaleDateString('es-ES') : 'N/A'}
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
                {moduleStats.endDate ? moduleStats.endDate.toLocaleDateString('es-ES') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders not ready warning */}
      {orders.filter(order => !order.materialesEnBodega && (selectedModule === 'all' || order.modulo === parseInt(selectedModule))).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800">
              <span className="font-medium">
                {orders.filter(order => !order.materialesEnBodega && (selectedModule === 'all' || order.modulo === parseInt(selectedModule))).length} órdenes
              </span> {selectedModule !== 'all' ? `del módulo ${selectedModule}` : ''} no están listas para producción (materiales no disponibles)
            </p>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {/* <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">
          Debug Info {selectedModule !== 'all' ? `- Módulo ${selectedModule}` : ''}:
        </h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Total órdenes: {selectedModule === 'all' ? orders.length : orders.filter(o => o.modulo === parseInt(selectedModule)).length}</p>
          <p>Órdenes con materiales: {selectedModule === 'all' ? orders.filter(o => o.materialesEnBodega).length : orders.filter(o => o.materialesEnBodega && o.modulo === parseInt(selectedModule)).length}</p>
          <p>Órdenes incompletas: {selectedModule === 'all' ? orders.filter(o => (o.unidadesProducidas / o.cantidadEntrada) < 1).length : orders.filter(o => (o.unidadesProducidas / o.cantidadEntrada) < 1 && o.modulo === parseInt(selectedModule)).length}</p>
          <p>Órdenes listas para planificación: {readyOrders.length}</p>
          <p>Órdenes en timeline: {plannedOrders.length}</p>
        </div>
      </div> */}

      {/* Timeline */}
      {plannedOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay órdenes listas para planificar {selectedModule !== 'all' ? `en el módulo ${selectedModule}` : ''}
          </h3>
          <p className="text-gray-500">
            Asegúrate de marcar las órdenes como "Materiales en Bodega" para incluirlas en la planificación
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Línea de Tiempo de Producción {selectedModule !== 'all' ? `- Módulo ${selectedModule}` : ''}
          </h3>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="planning-timeline">
              {(provided, snapshot) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef} 
                  className={`space-y-4 min-h-[200px] p-4 rounded-lg transition-colors ${
                    snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : 'bg-gray-50'
                  }`}
                >
                  {plannedOrders.map((order, index) => {
                    const progress = calculateProgress(order);
                    const uniqueId = `order-${order.id}`;
                    
                    return (
                      <Draggable 
                        key={uniqueId}
                        draggableId={uniqueId}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border rounded-lg p-4 bg-white transition-all ${
                              snapshot.isDragging 
                                ? 'shadow-2xl bg-blue-50 border-blue-300 rotate-2 scale-105' 
                                : 'shadow-sm border-gray-200 hover:shadow-md hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              {/* Drag Handle */}
                              <div 
                                {...provided.dragHandleProps} 
                                className="cursor-grab active:cursor-grabbing hover:bg-gray-100 p-2 rounded"
                              >
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