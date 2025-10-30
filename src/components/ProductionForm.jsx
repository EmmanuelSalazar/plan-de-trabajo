import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProduction } from '../context/ProductionContext';
import { Save, AlertCircle, Loader2, Plus, X } from 'lucide-react';

export const ProductionForm = () => {
  const navigate = useNavigate();
  const { addOrder, loading, error } = useProduction();
  
  const [formData, setFormData] = useState({
    fechaEntrada: '',
    ordenProduccion: '',
    referencia: '',
    promedioProduccion: '',
    cantidadEntrada: '',
    modulo: '',
    materialesEnBodega: false,
    enProduccion: false,
  });
  
  const [errors, setErrors] = useState({});
  const [colorBreakdowns, setColorBreakdowns] = useState([
    {
      color: '',
      size32: 0,
      size34: 0,
      size36: 0,
      size38: 0,
      size40: 0,
      size42: 0,
      totalUnits: 0
    }
  ]);

  // Calcular total de unidades del desglose
  const totalBreakdownUnits = colorBreakdowns.reduce((total, breakdown) => total + breakdown.totalUnits, 0);

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

  // Funciones para manejar el desglose de colores
  const addColorBreakdown = () => {
    setColorBreakdowns(prev => [...prev, {
      color: '',
      size32: 0,
      size34: 0,
      size36: 0,
      size38: 0,
      size40: 0,
      size42: 0,
      totalUnits: 0
    }]);
  };

  const removeColorBreakdown = (index) => {
    if (colorBreakdowns.length > 1) {
      setColorBreakdowns(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateColorBreakdown = (index, field, value) => {
    setColorBreakdowns(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Recalcular total para este color
      if (field !== 'color') {
        updated[index].totalUnits = 
          updated[index].size32 + 
          updated[index].size34 + 
          updated[index].size36 + 
          updated[index].size38 + 
          updated[index].size40 + 
          updated[index].size42;
      }
      
      return updated;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fechaEntrada) newErrors.fechaEntrada = 'La fecha de entrada es obligatoria';
    if (!formData.ordenProduccion) newErrors.ordenProduccion = 'La orden de producción es obligatoria';
    if (!formData.referencia) newErrors.referencia = 'La referencia es obligatoria';
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
        color: colorBreakdowns.length > 0 ? colorBreakdowns[0].color : 'Sin especificar',
        promedioProduccion: Number(formData.promedioProduccion),
        cantidadEntrada: Number(formData.cantidadEntrada),
        modulo: Number(formData.modulo),
        materialesEnBodega: formData.materialesEnBodega,
        enProduccion: formData.enProduccion,
        colorBreakdowns: colorBreakdowns.filter(breakdown => breakdown.color.trim() !== '')
      });

      // Reset form
      setFormData({
        fechaEntrada: '',
        ordenProduccion: '',
        referencia: '',
        promedioProduccion: '',
        cantidadEntrada: '',
        modulo: '',
        materialesEnBodega: false,
      });
      
      // Reset color breakdowns
      setColorBreakdowns([{
        color: '',
        size32: 0,
        size34: 0,
        size36: 0,
        size38: 0,
        size40: 0,
        size42: 0,
        totalUnits: 0
      }]);

      // Navigate to orders list
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div   className="bg-white shadow-lg rounded-lg p-8">
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
          {/* Submit Button */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Columna izquierda - Información básica de la orden */}
            <div className="lg:col-span-2 space-y-6">
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

              {/* Materiales en Bodega */}
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
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3 mb-2">
                <input
                  type="checkbox"
                  id="enProduccion"
                  name="enProduccion"
                  checked={formData.enProduccion}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    enProduccion: e.target.checked
                  }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="enProduccion" className="text-sm font-medium text-blue-800">
                  En producción
                </label>
                </div>
                <p className="text-xs text-blue-600">
                  Marca esta casilla si la orden ya está siendo producida
                </p>
              </div>
            </div>

            {/* Columna derecha - Desglose por Colores y Tallas */}
            <div className="lg:col-span-2">
              <div className="sticky top-4">
                <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Desglose por Colores y Tallas</h3>
                    <button
                      type="button"
                      onClick={addColorBreakdown}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Color</span>
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[270px] overflow-y-auto">
                    {colorBreakdowns.map((breakdown, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Color
                            </label>
                            <input
                              type="text"
                              value={breakdown.color}
                              onChange={(e) => updateColorBreakdown(index, 'color', e.target.value)}
                              placeholder="ej: Blanco, Negro, Azul"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          {colorBreakdowns.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeColorBreakdown(index)}
                              className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {[
                            { key: 'size32', label: '32-S' },
                            { key: 'size34', label: '34-M' },
                            { key: 'size36', label: '36-L' },
                            { key: 'size38', label: '38-XL' },
                            { key: 'size40', label: '40-XXL' },
                            { key: 'size42', label: '42-XXXL' }
                          ].map(({ key, label }) => (
                            <div key={key}>
                              <label className="block text-xs font-medium text-gray-600 mb-1 text-center">
                                {label}
                              </label>
                              <input
                                type="number"
                                value={breakdown[key]}
                                onChange={(e) => updateColorBreakdown(index, key, parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="text-right">
                          <span className="text-sm text-gray-600">
                            Total: <span className="font-medium text-gray-900">{breakdown.totalUnits}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resumen Total */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-900">Total general:</span>
                      <span className="text-lg font-bold text-blue-900">{totalBreakdownUnits}</span>
                    </div>
                    {formData.cantidadEntrada && totalBreakdownUnits !== parseInt(formData.cantidadEntrada) && (
                      <div className="mt-2 flex items-center space-x-2 text-amber-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">
                          No coincide con cantidad de entrada ({formData.cantidadEntrada})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
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