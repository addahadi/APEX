import api from "./api";

// ── Plans (admin) ─────────────────────────────────────────────────────────────
export const getPlansAdmin  = ()          => api.get("/admin/plans");       // with nested features[]
export const createPlan     = (data)      => api.post("/plans", data);
export const updatePlan     = (id, data)  => api.put(`/plans/${id}`, data);
export const deletePlan     = (id)        => api.delete(`/plans/${id}`);

// ── Plan Types ────────────────────────────────────────────────────────────────
export const getPlanTypes   = ()          => api.get("/plan-types");
export const createPlanType = (data)      => api.post("/plan-types", data);
export const updatePlanType = (id, data)  => api.patch(`/plan-types/${id}`, data);
export const deletePlanType = (id)        => api.delete(`/plan-types/${id}`);
