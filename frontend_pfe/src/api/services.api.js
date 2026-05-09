// ─────────────────────────────────────────────────────────────────────────────
// services.api.js
// ─────────────────────────────────────────────────────────────────────────────
import api from "./api";

export const getServices = (params = {}) => {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.page)   q.set("page",   params.page);
  if (params.limit)  q.set("limit",  params.limit);
  return api.get(`/services${q.toString() ? `?${q}` : ""}`);
};

export const getServiceFormulas = () => api.get("/services/service-formulas");
export const createService      = (data) => api.post("/services", data);
export const updateService      = (id, data) => api.put(`/services/${id}`, data);
export const deleteService      = (id) => api.delete(`/services/${id}`);
