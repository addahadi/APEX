import api from './api';

export const planApi = {
  // Plans
  getAll: () => api.get('/plans'),
  getFeatures: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),

  // Plan Types
  getTypes: () => api.get('/plan-types'),
  createType: (data) => api.post('/plan-types', data),
  updateType: (id, data) => api.put(`/plan-types/${id}`, data),
  deleteType: (id) => api.delete(`/plan-types/${id}`),
};
