import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';

export const ProductionModal = ({
  isOpen,
  onClose,
  onSubmit,
  ordenProduccion,
}) => {
  const [cantidad, setCantidad] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const cantidadNum = Number(cantidad);
    if (!cantidad || cantidadNum <= 0) {
      setError('Debe ingresar una cantidad válida mayor a 0');
      return;
    }

    onSubmit(cantidadNum);
    setCantidad('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setCantidad('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Agregar Unidades Producidas
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Orden: <span className="font-medium">{ordenProduccion}</span>
            </p>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad de Unidades Producidas
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => {
                setCantidad(e.target.value);
                if (error) setError('');
              }}
              placeholder="ej: 150"
              min="1"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              autoFocus
            />
            {error && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500">{error}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};