import React, { useState } from 'react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useProduction } from '../context/ProductionContext';
import { ProductionModal } from './ProductionModal';
import { HistoryModal } from './HistoryModal';
import { EditOrderModal } from './EditOrderModal';
import { PrintableOrder } from './PrintableOrder';
import { Plus, History, Calendar, Package, Target, PackageX, Users, CalendarDays, Filter, Search, CreditCard as Edit, CheckCircle, AlertTriangle, Printer } from 'lucide-react';
import { formatDate, getRelativeDateString, calculateRemainingWorkEndDate, getExplicitTime } from '../utils/dateUtils';

export const OrdersList = () => {
  const { orders, addProduction, loading, deleteProductionEntry, updateProductionEntry, updateOrder } = useProduction();
  const [productionModalOpen, setProductionModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [editOrderModalOpen, setEditOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedModule, setSelectedModule] = useState('all');
  const printRef = useRef();

  // Filter orders by module
  const filteredOrders = selectedModule === 'all' 
    ? orders 
    : orders.filter(order => order.modulo === parseInt(selectedModule));
  filteredOrders.sort((a, b) => b.id - a.id);
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

  const openEditOrderModal = (order) => {
    setSelectedOrder(order);
    setEditOrderModalOpen(true);
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

  const handleUpdateOrder = async (orderData) => {
    if (selectedOrder) {
      try {
        await updateOrder(selectedOrder.id, orderData);
      } catch (error) {
        console.error('Error updating order:', error);
      }
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Orden_${selectedOrder?.ordenProduccion || 'Produccion'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
      }
    `
  });

  const openPrintModal = (order) => {
    setSelectedOrder(order);
    // Small delay to ensure the component is rendered before printing
    setTimeout(() => {
      handlePrint();
    }, 100);
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
          {/* Filters */}
          <div className="flex items-center space-x-2">
          <div className='flex items-center space-x-2'>
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
            const explicitTime = getExplicitTime(remainingDays);
            
            return (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="d-flex text-xl">
                        Orden de producción: <strong className="text-gray-900">{order.ordenProduccion}</strong>
                      </div>
                      <p className="text-gray-600">Referencia: <strong>{order.referencia}</strong></p>
                    </div>

                    {/* Color Breakdowns Display - Centered */}
                    {order.colorBreakdowns && order.colorBreakdowns.length > 0 && (
                      <div className="flex-1 flex justify-center px-4 relative">
                        <details className="relative">
                          <summary className="cursor-pointer px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 bg-gray-50">
                            📊 Desglose por Colores ({order.colorBreakdowns.length} colores)
                          </summary>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[400px]">
                            <div className="space-y-3">
                              {order.colorBreakdowns.map((breakdown, index) => (
                                <div key={breakdown.id || index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-800 uppercase">{breakdown.color}</span>
                                    <span className="text-sm text-gray-600">Total: {breakdown.totalUnits}</span>
                                  </div>
                                  <div className="grid grid-cols-6 gap-2 text-sm">
                                    {[
                                      { size: '32-S', value: breakdown.size32 },
                                      { size: '34-M', value: breakdown.size34 },
                                      { size: '36-L', value: breakdown.size36 },
                                      { size: '38-XL', value: breakdown.size38 },
                                      { size: '40-XXL', value: breakdown.size40 },
                                      { size: '42-XXXL', value: breakdown.size42 }
                                    ].map(({ size, value }) => (
                                      <div key={size} className="text-center">
                                        <div className="text-xs text-gray-500">{size}</div>
                                        <div className="font-medium text-gray-900">{value}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </details>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      {getStatusBadge(order)}
                      <div className="flex items-center space-x-1 text-sm">
                        {order.materialesEnBodega ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center space-x-1">
                            <span>✅</span>
                            <span>Materiales OK</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                            <span>⚠️</span>
                            <span>Materiales incompletos</span>
                          </span>
                        )}
                      </div>
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
                        <span className="text-xs text-gray-600">Unidades totales de la <strong>OP</strong></span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.cantidadEntrada.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Package className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-600">Unidades producidas</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.unidadesProducidas.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <PackageX className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-gray-600">Unidades restantes por producir</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {remaining.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Work End Date Section */}
                  {progress < 100 && (
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CalendarDays className="w-5 h-5 text-purple-600" />
                        <h4 className="font-medium text-purple-900">Fecha Estimada de Finalización</h4><span>(Tomando como referencia el día actual)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-purple-700">
                            <span className="font-medium">Fecha:</span> {formatDate(endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-700">
                            <span className="font-medium">Tiempo (Si se empezara hoy):</span> {getRelativeDateString(endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-700">
                            <span className="font-medium">Hora:</span> {getExplicitTime(remainingDays)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                    <div>
                      <span className="text-gray-600">Producción promedio/día:</span>
                      <span className="ml-1 font-medium">{order.promedioProduccion.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Días de trabajo totales de la <strong>OP</strong>:</span>
                      <span className="ml-1 font-medium">{workDays}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Días de trabajo restantes:</span>
                      <span className="ml-1 font-medium">{remainingDays > 0 ? remainingDays : 0}</span>
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
                    <button
                      onClick={() => openEditOrderModal(order)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar Orden</span>
                    </button>
                    <button
                      onClick={() => openPrintModal(order)}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hidden Printable Component */}
      {selectedOrder && (
        <div style={{ display: 'none' }}>
          <PrintableOrder ref={printRef} order={selectedOrder} />
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
          <EditOrderModal
            isOpen={editOrderModalOpen}
            onClose={() => setEditOrderModalOpen(false)}
            onSubmit={handleUpdateOrder}
            order={selectedOrder}
            loading={loading}
          />
    </div>
  );
};