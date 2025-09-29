// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options, 
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Production Orders API
export const productionOrdersAPI = {
  // Get all orders
  getAll: () => apiRequest('/orders'),
  
  // Get order by ID
  getById: (id) => apiRequest(`/orders/${id}`),
  
  // Create new order
  create: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  
  // Update order
  update: (id, orderData) => apiRequest(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(orderData),
  }),
  
  // Delete order
  delete: (id) => apiRequest(`/orders/${id}`, {
    method: 'DELETE',
  }),
  
  // Add production to order
  addProduction: (orderId, productionData) => apiRequest(`/orders/${orderId}/production`, {
    method: 'POST',
    body: JSON.stringify(productionData),
  }),
  // Delete production entry
  deleteProductionEntry: (entryId) => apiRequest(`/orders/production-entry/${entryId}`, {
    method: 'DELETE',
  }),
  
  // Update order sequence
  updateSequence: (orders) => apiRequest('/orders/sequence', {
    method: 'PUT',
    body: JSON.stringify({ orders }),
  }),
};

// Utility function to handle API errors
export const handleApiError = (error) => {
  if (error.message.includes('Failed to fetch')) {
    return 'Error de conexión. Verifique su conexión a internet.';
  }
  if (error.message.includes('404')) {
    return 'Recurso no encontrado.';
  }
  if (error.message.includes('500')) {
    return 'Error interno del servidor.';
  }
  return 'Ha ocurrido un error inesperado.';
};