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
    <div ref={ref} className="bg-white p-4 max-w-full mx-auto text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-300">
        <div>
          <h1 className="text-lg font-bold text-gray-900 mb-1">
            OP: {order.ordenProduccion} | REF: {order.referencia}
          </h1>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(progress)}`}>
            {getStatusText(progress)} ({progress}%)
          </span>
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
            Módulo {order.modulo}
          </span>
          {order.materialesEnBodega ? (
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
              ✅ Materiales OK
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
              ⚠️ Sin materiales
            </span>
          )}
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-6 gap-2 mb-3 text-xs">
        <div className="bg-gray-50 p-2 rounded text-center">
          <div className="font-medium text-gray-700">Fecha Entrada</div>
          <div className="font-bold text-gray-900">
            {new Date(order.fechaEntrada).toLocaleDateString('es-ES')}
          </div>
        </div>
        <div className="bg-blue-50 p-2 rounded text-center">
          <div className="font-medium text-gray-700">Total OP</div>
          <div className="font-bold text-gray-900">
            {order.cantidadEntrada.toLocaleString()}
          </div>
        </div>
        <div className="bg-green-50 p-2 rounded text-center">
          <div className="font-medium text-gray-700">Producidas</div>
          <div className="font-bold text-gray-900">
            {order.unidadesProducidas.toLocaleString()}
          </div>
        </div>
        <div className="bg-yellow-50 p-2 rounded text-center">
          <div className="font-medium text-gray-700">Restantes</div>
          <div className="font-bold text-gray-900">
            {remaining.toLocaleString()}
          </div>
        </div>
        <div className="bg-purple-50 p-2 rounded text-center">
          <div className="font-medium text-gray-700">Promedio/día</div>
          <div className="font-bold text-gray-900">
            {order.promedioProduccion.toLocaleString()}
          </div>
        </div>
        <div className="bg-orange-50 p-2 rounded text-center">
          <div className="font-medium text-gray-700">Días restantes</div>
          <div className="font-bold text-gray-900">
            {remainingDays > 0 ? remainingDays : 0}
          </div>
        </div>
      </div>

      {/* Ultra Compact Color Breakdown */}
      {order.colorBreakdowns && order.colorBreakdowns.length > 0 && (
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 mb-2 text-sm">
            📊 Desglose por Colores y Tallas ({order.colorBreakdowns.length} colores)
          </h3>
          
          {/* Table Header */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-r border-gray-300 p-1 font-bold text-left">COLOR</th>
                  <th className="border-r border-gray-300 p-1 font-bold text-center">32-S</th>
                  <th className="border-r border-gray-300 p-1 font-bold text-center">34-M</th>
                  <th className="border-r border-gray-300 p-1 font-bold text-center">36-L</th>
                  <th className="border-r border-gray-300 p-1 font-bold text-center">38-XL</th>
                  <th className="border-r border-gray-300 p-1 font-bold text-center">40-XXL</th>
                  <th className="border-r border-gray-300 p-1 font-bold text-center">42-XXXL</th>
                  <th className="p-1 font-bold text-center bg-blue-50">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {order.colorBreakdowns.map((breakdown, index) => (
                  <tr key={breakdown.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border-r border-gray-300 p-1 font-bold text-gray-800 uppercase">
                      {breakdown.color}
                    </td>
                    <td className="border-r border-gray-300 p-1 text-center font-medium">
                      {breakdown.size32 || 0}
                    </td>
                    <td className="border-r border-gray-300 p-1 text-center font-medium">
                      {breakdown.size34 || 0}
                    </td>
                    <td className="border-r border-gray-300 p-1 text-center font-medium">
                      {breakdown.size36 || 0}
                    </td>
                    <td className="border-r border-gray-300 p-1 text-center font-medium">
                      {breakdown.size38 || 0}
                    </td>
                    <td className="border-r border-gray-300 p-1 text-center font-medium">
                      {breakdown.size40 || 0}
                    </td>
                    <td className="border-r border-gray-300 p-1 text-center font-medium">
                      {breakdown.size42 || 0}
                    </td>
                    <td className="p-1 text-center font-bold text-blue-600 bg-blue-50">
                      {breakdown.totalUnits}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-gray-200 font-bold">
                  <td className="border-r border-gray-300 p-1 text-gray-800">
                    TOTAL GENERAL
                  </td>
                  <td className="border-r border-gray-300 p-1 text-center">
                    {order.colorBreakdowns.reduce((sum, b) => sum + (b.size32 || 0), 0)}
                  </td>
                  <td className="border-r border-gray-300 p-1 text-center">
                    {order.colorBreakdowns.reduce((sum, b) => sum + (b.size34 || 0), 0)}
                  </td>
                  <td className="border-r border-gray-300 p-1 text-center">
                    {order.colorBreakdowns.reduce((sum, b) => sum + (b.size36 || 0), 0)}
                  </td>
                  <td className="border-r border-gray-300 p-1 text-center">
                    {order.colorBreakdowns.reduce((sum, b) => sum + (b.size38 || 0), 0)}
                  </td>
                  <td className="border-r border-gray-300 p-1 text-center">
                    {order.colorBreakdowns.reduce((sum, b) => sum + (b.size40 || 0), 0)}
                  </td>
                  <td className="border-r border-gray-300 p-1 text-center">
                    {order.colorBreakdowns.reduce((sum, b) => sum + (b.size42 || 0), 0)}
                  </td>
                  <td className="p-1 text-center font-bold text-blue-800 bg-blue-100">
                    {order.colorBreakdowns.reduce((sum, b) => sum + (b.totalUnits || 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compact Footer */}
      <div className="mt-2 pt-2 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>Impreso: {new Date().toLocaleDateString('es-ES')} - {new Date().toLocaleTimeString('es-ES')}</p>
      </div>
    </div>
  );
});

PrintableOrder.displayName = 'PrintableOrder';