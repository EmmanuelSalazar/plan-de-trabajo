// Production Order structure
export const createProductionOrder = (data) => ({
  id: '',
  fechaEntrada: '',
  ordenProduccion: '',
  referencia: '',
  color: '',
  promedioProduccion: 0,
  cantidadEntrada: 0,
  modulo: 0,
  unidadesProducidas: 0,
  historialProduccion: [],
  fechaCreacion: '',
  fechaFinalizacion: '', // Nueva propiedad para fecha estimada
  ...data
});

// Production Entry structure
export const createProductionEntry = (data) => ({
  id: '',
  cantidad: 0,
  fecha: '',
  hora: '',
  ...data
});