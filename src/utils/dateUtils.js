// Utility functions for date calculations

// Calculate work end date based on start date and work days
export const calculateWorkEndDate = (startDate, workDays) => {
  const start = new Date(startDate);
  
  // Add work days (excluding weekends)
  let daysToAdd = Math.ceil(workDays);
  let currentDate = new Date(start);
  
  while (daysToAdd > 0) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysToAdd--;
    }
  }
  
  return currentDate;
};

// Calculate remaining work end date based on current progress
export const calculateRemainingWorkEndDate = (order) => {
  const remaining = order.cantidadEntrada - order.unidadesProducidas;
  const remainingDays = remaining / order.promedioProduccion;
  
  if (remainingDays <= 0) {
    return new Date(); // Already completed
  }
  
  // Calculate from today, not from start date
  const today = new Date();
  let daysToAdd = Math.ceil(remainingDays);
  let currentDate = new Date(today);
  while (daysToAdd > 0) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysToAdd--;
    }
  }

  return currentDate;
};

// Format date for display
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get relative date string
export const getRelativeDateString = (date) => {
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Hoy';
  } else if (diffDays === 1) {
    return 'Mañana';
  } else if (diffDays === -1) {
    return 'Ayer';
  } else if (diffDays > 1) {
    return `En ${diffDays} días`;
  } else {
    return `Hace ${Math.abs(diffDays)} días`;
  }
};