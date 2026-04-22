// ── units.api.js ──────────────────────────────────────────────────────────────
import api from "./api";

export const getUnits     = ()              => api.get("/units");
export const createUnit   = (data)          => api.post("/units", data);
export const updateUnit   = (unitId, data)  => api.patch(`/units/${unitId}`, data);
export const deleteUnit   = (unitId)        => api.delete(`/units/${unitId}`);
