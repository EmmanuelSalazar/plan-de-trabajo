import React, { createContext, useContext, useState, useEffect } from 'react';
import { createProductionOrder, createProductionEntry } from '../types';
import { productionOrdersAPI, handleApiError } from '../services/api';
import { calculateWorkEndDate } from '../utils/dateUtils';

const ProductionContext = createContext(undefined);

export const useProduction = () => {
  const context = useContext(ProductionContext);
  if (!context) {
    throw new Error('useProduction must be used within a ProductionProvider');
  }
  return context;
};

export const ProductionProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data from API or localStorage on mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Save to localStorage whenever orders change (fallback)
  /* useEffect(() => {
    localStorage.setItem('productionOrders', JSON.stringify(orders));
  }, [orders]); */

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to load from API first
      const apiOrders = await productionOrdersAPI.getAll();
      setOrders(apiOrders);
    } catch (error) {
      console.warn('API not available, loading from localStorage:', error);
      
      // Fallback to localStorage
      const savedOrders = localStorage.getItem('productionOrders');
      if (savedOrders) {
        try {
          setOrders(JSON.parse(savedOrders));
        } catch (parseError) {
          console.error('Error loading orders from localStorage:', parseError);
          setError('Error al cargar las órdenes guardadas');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate work end date
      const workDays = orderData.cantidadEntrada / orderData.promedioProduccion;
      const fechaFinalizacion = calculateWorkEndDate(orderData.fechaEntrada, workDays);
      
      const newOrder = createProductionOrder({
        ...orderData,
        id: Date.now().toString(),
        unidadesProducidas: 0,
        historialProduccion: [],
        fechaCreacion: new Date().toISOString(),
        fechaFinalizacion: fechaFinalizacion.toISOString(),
      });

      // Try to save to API first
      try {
        const savedOrder = await productionOrdersAPI.create(newOrder);
        setOrders(prev => [...prev, savedOrder]);
      } catch (apiError) {
        console.warn('API not available, saving locally:', apiError);
        // Fallback to local state
        setOrders(prev => [...prev, newOrder]);
      }
    } catch (error) {
      setError(handleApiError(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (orderId, orderData) => {
    setLoading(true);
    setError(null);
    
    try {
      await productionOrdersAPI.update(orderId, orderData);
      await loadOrders(); // Recargar órdenes para obtener datos actualizados
    } catch (error) {
      setError(handleApiError(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addProduction = async (orderId, cantidad) => {
    setLoading(true);
    setError(null);
    
    try {
      const now = new Date();
      const newEntry = createProductionEntry({
        id: Date.now().toString(),
        cantidad,
        fecha: now.toLocaleDateString('es-ES'),
        hora: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      });

      // Try to save to API first
      try {
        await productionOrdersAPI.addProduction(orderId, newEntry);
        refreshOrders();
      } catch (apiError) {
        console.warn('API not available, saving locally:', apiError);
      }
    } catch (error) {
      setError(handleApiError(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const deleteProductionEntry = async (entryId) => {
    setLoading(true);
    setError(null);
      try {
        await productionOrdersAPI.deleteProductionEntry(entryId);
        refreshOrders();
      } catch (apiError) {
        console.warn('API not available, deleting locally:', apiError);
        throw apiError;
      }
    }

  const getOrderById = (id) => {
/*     return orders.find(order => order.id === id);
 */  };

  const refreshOrders = () => {
    loadOrders();
  };

  const searchBar = (query) => {
    if(query.length === 0) {
      return loadOrders();
    }
    const filtered = orders.filter(order => 
      order.ordenProduccion.toLowerCase().includes(query.toLowerCase())
    );
    setOrders(filtered);
  }


  return (
    <ProductionContext.Provider value={{
      orders,
      loading,
      error,
      addOrder,
      addProduction,
      getOrderById,
      refreshOrders,
      deleteProductionEntry,
      searchBar,
      updateOrder,
    }}>
      {children}
    </ProductionContext.Provider>
  );
};