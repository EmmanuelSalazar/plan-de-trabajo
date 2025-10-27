import React from 'react';
import { Calendar, Package, Target, Clock, Users } from 'lucide-react';
import { formatDate, getRelativeDateString, calculateRemainingWorkEndDate, getExplicitTime } from '../utils/dateUtils';

export const PrintableOrder = React.forwardRef(({ order }, ref) => {
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

  const workDays = calculateWorkDays(order.cantidadEntrada, order.promedioProduccion);
  const remainingDays = calculateRemainingDays(order);
  const progress = calculateProgress(order);
  const remaining = order.cantidadEntrada - order.unidadesProducidas;
  const endDate = calculateRemainingWorkEndDate(order);
  const explicitTime = getExplicitTime(remainingDays);

  const getStatusText = (progress) => {
    if (progress >= 100) return 'Completado';
    if (progress >= 75) return 'Avanzado';
    if (progress >= 25) return 'En Progreso';
    return 'Iniciando';
  };

  const getStatusColor = (progress) => {
    if (progress >= 100) return 'bg-green-100 text-green-800';
    if (progress >= 75) return 'bg-blue-100 text-blue-800';
    if (progress >= 25) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-gray-200">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Orden de producción: {order.ordenProduccion}
          </h1>
          <p className="text-lg text-gray-700">
            Referencia: <span className="font-semibold">{order.referencia}</span>
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(progress)}`}>
            {getStatusText(progress)}
          </span>
          {order.materialesEnBodega ? (
            <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium">
              ✅ Materiales OK
            </span>
          ) : (
            <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 font-medium">
              ⚠️ Materiales incompletos
            </span>
          )}
          <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 font-medium flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>Módulo {order.modulo}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Progreso</h3>
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Avance</span>
                <span className="text-sm text-gray-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-blue-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Production Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Fecha Entrada</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(order.fechaEntrada).toLocaleDateString('es-ES')}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700">Unidades</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {order.cantidadEntrada.toLocaleString()}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-700">Unidades producidas</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {order.unidadesProducidas.toLocaleString()}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-gray-700">Unidades restantes por producir</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {remaining.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Estimated End Date */}
          {progress < 100 && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-purple-900">Fecha Estimada de Finalización</h4>
                <span className="text-sm text-purple-700">(Tomando como referencia el día actual)</span>
              </div>
              <div className="space-y-2">
                <p className="text-purple-700">
                  <span className="font-medium">Fecha:</span> {formatDate(endDate)}
                </p>
                <p className="text-purple-700">
                  <span className="font-medium">Tiempo:</span> {getRelativeDateString(endDate)}
                </p>
                <p className="text-purple-700">
                  <span className="font-medium">Hora:</span> {explicitTime}
                </p>
              </div>
            </div>
          )}

          {/* Production Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <span className="block text-gray-600">Producción promedio/día:</span>
              <span className="block font-semibold text-lg">{order.promedioProduccion.toLocaleString()}</span>
            </div>
            <div className="text-center">
              <span className="block text-gray-600">Días de trabajo totales de la OP:</span>
              <span className="block font-semibold text-lg">{workDays}</span>
            </div>
            <div className="text-center">
              <span className="block text-gray-600">Días de trabajo restantes:</span>
              <span className="block font-semibold text-lg">{remainingDays > 0 ? remainingDays : 0}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Color Breakdown */}
        <div className="lg:col-span-1">
          {order.colorBreakdowns && order.colorBreakdowns.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <span>📊</span>
                <span>Desglose por Colores ({order.colorBreakdowns.length} colores)</span>
              </h3>
              <div className="space-y-4">
                {order.colorBreakdowns.map((breakdown, index) => (
                  <div key={breakdown.id || index} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-800 uppercase text-lg">
                        {breakdown.color}
                      </span>
                      <span className="text-sm text-blue-600 font-medium">
                        Total: {breakdown.totalUnits}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { size: '32-S', value: breakdown.size32 },
                        { size: '34-M', value: breakdown.size34 },
                        { size: '36-L', value: breakdown.size36 },
                        { size: '38-XL', value: breakdown.size38 },
                        { size: '40-XXL', value: breakdown.size40 },
                        { size: '42-XXXL', value: breakdown.size42 }
                      ].map(({ size, value }) => (
                        <div key={size} className="text-center bg-gray-100 p-2 rounded">
                          <div className="text-gray-600 font-medium">{size}</div>
                          <div className="font-bold text-gray-900 text-sm">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Impreso el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}</p>
      </div>
    </div>
  );
});

PrintableOrder.displayName = 'PrintableOrder';