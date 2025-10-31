import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';

export const EditOrderModal = ({ isOpen, onClose, onSubmit, order, loading }) => {
  const [formData, setFormData] = useState({
    fechaEntrada: '',
    ordenProduccion: '',
    referencia: '',
    color: '',
    promedioProduccion: '',
    cantidadEntrada: '',
    modulo: '',
    materialesEnBodega: false,
    enProduccion: false,
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (order && isOpen) {
      setFormData({
        fechaEntrada: order.fechaEntrada || '',
        ordenProduccion: order.ordenProduccion || '',
        referencia: order.referencia || '',
        color: order.color || '',
        promedioProduccion: order.promedioProduccion?.toString() || '',
        cantidadEntrada: order.cantidadEntrada?.toString() || '',
        modulo: order.modulo?.toString() || '',
        materialesEnBodega: order.materialesEnBodega || false,
        enProduccion: order.enProduccion || false,
      });
      setErrors({});
    }
  }, [order, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fechaEntrada) newErrors.fechaEntrada = 'La fecha de entrada es obligatoria';
    if (!formData.ordenProduccion) newErrors.ordenProduccion = 'La orden de producción es obligatoria';
    if (!formData.referencia) newErrors.referencia = 'La referencia es obligatoria';
    if (!formData.color) newErrors.color = 'El color es obligatorio';
    if (!formData.promedioProduccion) {
      newErrors.promedioProduccion = 'El promedio de producción es obligatorio';
    } else if (Number(formData.promedioProduccion) <= 0) {
      newErrors.promedioProduccion = 'El promedio debe ser mayor a 0';
    }
    if (!formData.cantidadEntrada) {
      newErrors.cantidadEntrada = 'La cantidad de entrada es obligatoria';
    } else if (Number(formData.cantidadEntrada) <= 0) {
      newErrors.cantidadEntrada = 'La cantidad debe ser mayor a 0';
    }
    if (!formData.modulo) {
      newErrors.modulo = 'Debe seleccionar un módulo';
    }

    // Validar que la nueva cantidad no sea menor a las unidades ya producidas
    if (Number(formData.cantidadEntrada) < order.unidadesProducidas) {
      newErrors.cantidadEntrada = `La cantidad no puede ser menor a las unidades ya producidas (${order.unidadesProducidas})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const updatedData = {
      fechaEntrada: formData.fechaEntrada,
      ordenProduccion: formData.ordenProduccion,
      referencia: formData.referencia,
      color: formData.color,
      promedioProduccion: Number(formData.promedioProduccion),
      cantidadEntrada: Number(formData.cantidadEntrada),
      modulo: Number(formData.modulo),
      materialesEnBodega: formData.materialesEnBodega,
      enProduccion: formData.enProduccion,
    };

    try {
      await onSubmit(updatedData);
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Editar Orden de Producción
            </h3>
            <p className="text-sm text-gray-600">
              Orden: {order?.ordenProduccion}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha de Entrada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Entrada
                </label>
                <input
                  type="date"
                  name="fechaEntrada"
                  value={formData.fechaEntrada}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fechaEntrada ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.fechaEntrada && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500">{errors.fechaEntrada}</span>
                  </div>
                )}
              </div>

              {/* Orden de Producción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orden de Producción
                </label>
                <input
                  type="text"
                  name="ordenProduccion"
                  value={formData.ordenProduccion}
                  onChange={handleInputChange}
                  placeholder="ej: OP-2024-001"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.ordenProduccion ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.ordenProduccion && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500">{errors.ordenProduccion}</span>
                  </div>
                )}
              </div>

              {/* Referencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referencia
                </label>
                <input
                  type="text"
                  name="referencia"
                  value={formData.referencia}
                  onChange={handleInputChange}
                  placeholder="ej: REF-001"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.referencia ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.referencia && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500">{errors.referencia}</span>
                  </div>
                )}
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="ej: Azul marino"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.color ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.color && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500">{errors.color}</span>
                  </div>
                )}
              </div>

              {/* Promedio de Producción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promedio de Producción al Día
                </label>
                <input
                  type="number"
                  name="promedioProduccion"
                  value={formData.promedioProduccion}
                  onChange={handleInputChange}
                  placeholder="ej: 550"
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.promedioProduccion ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.promedioProduccion && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500">{errors.promedioProduccion}</span>
                  </div>
                )}
              </div>

              {/* Cantidad de Entrada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad de Entrada
                </label>
                <input
                  type="number"
                  name="cantidadEntrada"
                  value={formData.cantidadEntrada}
                  onChange={handleInputChange}
                  placeholder="ej: 2400"
                  min={order?.unidadesProducidas || 1}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cantidadEntrada ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.cantidadEntrada && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500">{errors.cantidadEntrada}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo: {order?.unidadesProducidas || 0} (unidades ya producidas)
                </p>
              </div>
            </div>

            {/* Módulo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Módulo Asignado
              </label>
              <select
                name="modulo"
                value={formData.modulo}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.modulo ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar módulo</option>
                <option value="1">Módulo 1</option>
                <option value="2">Módulo 2</option>
                <option value="3">Módulo 3</option>
                <option value="4">Módulo 4</option>
              </select>
              {errors.modulo && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">{errors.modulo}</span>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Materiales en Bodega */}
        <div className="px-6 pb-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3 mb-2">
            <input
              type="checkbox"
              id="materialesEnBodega"
              name="materialesEnBodega"
              checked={formData.materialesEnBodega}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                materialesEnBodega: e.target.checked
              }))}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
            <label htmlFor="materialesEnBodega" className="text-sm font-medium text-green-800">
              Materiales disponibles en bodega
            </label>
            </div>
            <p className="text-xs text-green-600">
              Marca esta casilla si todos los materiales están listos para producción
            </p>
          </div>

          {/* En Producción */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
            <div className="flex items-center space-x-3 mb-2">
            <input
              type="checkbox"
              id="enProduccionEdit"
              name="enProduccion"
              checked={formData.enProduccion}
              onChange={(e) => {
                    const confirm = e.target.checked
                    if (confirm) {
                      const confirm = window.confirm('¿Estás seguro de marcar esta orden como en producción? Esto desactivará cualquier otra orden en producción del mismo modulo.')
                      if (confirm) {
                        console.log(e.target.checked)
                         return setFormData(prev => ({
                          ...prev,
                          enProduccion: true  
                        }))
                      }
                    } else {
                        setFormData(prev => ({
                          ...prev,
                          enProduccion: false
                        }))
                      }
                  }}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="enProduccionEdit" className="text-sm font-medium text-blue-800">
              En producción
            </label>
            </div>
            <p className="text-xs text-blue-600">
              Marca esta casilla si la orden ya está siendo producida
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};