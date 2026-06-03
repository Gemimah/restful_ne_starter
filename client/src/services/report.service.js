import api from './api.js';

export const reportService = {
  dashboard: () => api.get('/reports/dashboard'),
  inventory: () => api.get('/reports/inventory'),
  inspections: () => api.get('/reports/inspections'),
  compliance: () => api.get('/reports/compliance'),
  maintenance: () => api.get('/reports/maintenance'),
  exportCsv: (type) => api.get(`/reports/export/${type}/csv`, { responseType: 'blob' }),
  exportPdf: (type) => api.get(`/reports/export/${type}/pdf`, { responseType: 'blob' }),
};
