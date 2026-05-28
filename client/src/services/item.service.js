import api from './api.js';

// EXAM TIP: Duplicate this file for your domain (car.service.js, booking.service.js, etc.)

export const itemService = {
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  remove: (id) => api.delete(`/items/${id}`),
};
