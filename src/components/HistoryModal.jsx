import React from 'react';
import { X, Calendar, Clock, Package, Trash } from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
export const HistoryModal = ({ isOpen, onClose, order }) => {
  if (!isOpen) return null;
const totalProduced = order.historialProduccion.reduce((sum, entry) => sum + entry.cantidad, 0);
const { deleteProductionEntry } = useProduction();
const deleteEntry = async (entryId) => {
  try {
    await deleteProductionEntry(entryId);
    onClose();
    alert('Entrada de producción eliminada correctamente.');
  } catch (error) {
    console.error('Error deleting production entry:', error);
    alert('Error al eliminar la entrada de producción. Por favor, inténtelo de nuevo.');
  }
}
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Historial de Producción
            </h3>
            <p className="text-sm text-gray-600">
              Orden: {order.ordenProduccion} - {order.referencia}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {order.historialProduccion.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No hay registros de producción aún</p>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Producido</p>
                    <p className="text-2xl font-bold text-blue-600">{totalProduced.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Registros</p>
                    <p className="text-2xl font-bold text-gray-900">{order.historialProduccion.length}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {order.historialProduccion
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {entry.cantidad.toLocaleString()} unidades
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(entry.fecha).toLocaleDateString('es-ES')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{entry.hora}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <button onClick={() => deleteEntry(entry.id)} className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
                          <Trash className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">Eliminar Entrada</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};