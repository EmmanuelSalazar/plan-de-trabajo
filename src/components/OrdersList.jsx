import React, { useState } from 'react';
import { useProduction } from '../context/ProductionContext';
import { ProductionModal } from './ProductionModal';
import { HistoryModal } from './HistoryModal';
import { Plus, History, Calendar, Package, Target, Clock, Users, CalendarDays, Filter } from 'lucide-react';
import { formatDate, getRelativeDateString, calculateRemainingWorkEndDate } from '../utils/dateUtils';

export const OrdersList = () => {
  const { orders, addProduction, loading } = useProduction();
  const [productionModalOpen, setProductionModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedModule, setSelectedModule] = useState('all');

  // Filter orders by module
  const filteredOrders = selectedModule === 'all' 
    ? orders 
    : orders.filter(order => order.modulo === parseInt(selectedModule));

  const calculateWorkDays = (cantidadEntrada, promedioProduccion) => {
    return Number((cantidadEntrada / promedioProduccion).toFixed(1));
  };

  const calculateRemainingDays = (order) => {
    const remaining = order.cantidadEntrada - order.unidadesProducidas;
    return Number((remaining / order.promedioProduccion).toFixed(1));
  };
  const calculateProgress = (order) => {
    return Number(((order.unidadesProducidas / order.cantidadEntrada) * 100).toFixed(1));
  };

  const openProductionModal = (order) => {
    setSelectedOrder(order);
    setProductionModalOpen(true);
  };

  const openHistoryModal = (order) => {
    setSelectedOrder(order);
    setHistoryModalOpen(true);
  };

  const handleAddProduction = async (cantidad) => {
    if (selectedOrder) {
      try {
        await addProduction(selectedOrder.id, cantidad);
      } catch (error) {
        console.error('Error adding production:', error);
      }
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (order) => {
    const progress = calculateProgress(order);
    if (progress >= 100) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completado</span>;
    }
    if (progress >= 75) {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Avanzado</span>;
    }
    if (progress >= 25) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">En Progreso</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Iniciando</span>;
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Órdenes de Producción</h2>
            <p className="text-gray-600 mt-1">Gestiona y monitorea el progreso de las órdenes</p>
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

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Cargando órdenes...</p>
        </div>
      )}

      {!loading && filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes registradas</h3>
          <p className="text-gray-500 mb-4">Comienza creando tu primera orden de producción</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const workDays = calculateWorkDays(order.cantidadEntrada, order.promedioProduccion);
            const remainingDays = calculateRemainingDays(order);
            const progress = calculateProgress(order);
            const remaining = order.cantidadEntrada - order.unidadesProducidas;
            const endDate = calculateRemainingWorkEndDate(order);
            return (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {order.ordenProduccion}
                      </h3>
                      <p className="text-gray-600">{order.referencia} - {order.color}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(order)}
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>Módulo {order.modulo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Progreso</span>
                      <span className="text-sm text-gray-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600">Fecha Entrada</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(order.fechaEntrada).toLocaleDateString('es-ES')}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-gray-600">Cantidad Total</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.cantidadEntrada.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Package className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-600">Producido</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.unidadesProducidas.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-gray-600">Días Restantes</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {remainingDays > 0 ? remainingDays : 0}
                      </p>
                    </div>
                  </div>

                  {/* Work End Date Section */}
                  {progress < 100 && (
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CalendarDays className="w-5 h-5 text-purple-600" />
                        <h4 className="font-medium text-purple-900">Fecha Estimada de Finalización</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-purple-700">
                            <span className="font-medium">Fecha:</span> {formatDate(endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-700">
                            <span className="font-medium">Tiempo:</span> {getRelativeDateString(endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                    <div>
                      <span className="text-gray-600">Promedio/día:</span>
                      <span className="ml-1 font-medium">{order.promedioProduccion.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Días totales:</span>
                      <span className="ml-1 font-medium">{workDays}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Restante:</span>
                      <span className="ml-1 font-medium">{remaining.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => openProductionModal(order)}
                      disabled={progress >= 100}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                        progress >= 100
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Producción</span>
                    </button>
                    
                    <button
                      onClick={() => openHistoryModal(order)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <History className="w-4 h-4" />
                      <span>Ver Historial</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedOrder && (
        <>
          <ProductionModal
            isOpen={productionModalOpen}
            onClose={() => setProductionModalOpen(false)}
            onSubmit={handleAddProduction}
            ordenProduccion={selectedOrder.ordenProduccion}
          />
          <HistoryModal
            isOpen={historyModalOpen}
            onClose={() => setHistoryModalOpen(false)}
            order={selectedOrder}
          />
        </>
      )}
    </div>
  );
};