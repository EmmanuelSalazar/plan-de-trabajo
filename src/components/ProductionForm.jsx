import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProduction } from '../context/ProductionContext';
import { Save, AlertCircle, Loader2 } from 'lucide-react';

export const ProductionForm = () => {
  const navigate = useNavigate();
  const { addOrder, loading, error } = useProduction();
  
  const [formData, setFormData] = useState({
    fechaEntrada: '',
    ordenProduccion: '',
    referencia: '',
    color: '',
    promedioProduccion: '',
    cantidadEntrada: '',
    modulo: '',
  });
  
  const [errors, setErrors] = useState({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await addOrder({
        fechaEntrada: formData.fechaEntrada,
        ordenProduccion: formData.ordenProduccion,
        referencia: formData.referencia,
        color: formData.color,
        promedioProduccion: Number(formData.promedioProduccion),
        cantidadEntrada: Number(formData.cantidadEntrada),
        modulo: Number(formData.modulo),
      });

      // Reset form
      setFormData({
        fechaEntrada: '',
        ordenProduccion: '',
        referencia: '',
        color: '',
        promedioProduccion: '',
        cantidadEntrada: '',
        modulo: '',
      });

      // Navigate to orders list
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nueva Orden de Producción</h2>
          <p className="text-gray-600 mt-2">Registre los datos de la nueva orden de producción</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                min="1"
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
            </select>
            {errors.modulo && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500">{errors.modulo}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'Guardando...' : 'Guardar Orden'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};