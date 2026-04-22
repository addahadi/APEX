// ─────────────────────────────────────────────────────────────────────────────
// materials.api.js
// ─────────────────────────────────────────────────────────────────────────────
import api from "./api";

export const getMaterials         = (params = {}) => {
  const q = new URLSearchParams();
  if (params.search)      q.set("search",      params.search);
  if (params.category_id) q.set("category_id", params.category_id);
  if (params.page)        q.set("page",        params.page);
  if (params.limit)       q.set("limit",       params.limit);
  return api.get(`/materials${q.toString() ? `?${q}` : ""}`);
};
export const getMaterialFormulas  = ()          => api.get("/materials/material-formulas");
export const createMaterial       = (data)      => api.post("/materials", data);
export const updateMaterial       = (id, data)  => api.put(`/materials/${id}`, data);
export const deleteMaterial       = (id)        => api.delete(`/materials/${id}`);
