import api from './api.js';

export const extinguisherService = {
  getAll: (params) => api.get('/extinguishers', { params }),
  getById: (id) => api.get(`/extinguishers/${id}`),
  create: (data) => api.post('/extinguishers', data),
  update: (id, data) => api.put(`/extinguishers/${id}`, data),
  remove: (id) => api.delete(`/extinguishers/${id}`),
};

export const inspectionService = {
  getAll: (params) => api.get('/inspections', { params }),
  schedule: (data) => api.post('/inspections', data),
  update: (id, data) => api.patch(`/inspections/${id}`, data),
};

export const maintenanceService = {
  getAll: (params) => api.get('/maintenance', { params }),
  create: (data) => api.post('/maintenance', data),
};
