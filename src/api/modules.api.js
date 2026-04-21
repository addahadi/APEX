import api from "./api";

// ── Lookups ───────────────────────────────────────────────────────────────────

/** GET /api/admin/modules/units */
export const getUnits = () => api.get("/admin/modules/units");

// ── Tree ──────────────────────────────────────────────────────────────────────

/** GET /api/admin/modules/tree */
export const getAdminTree = () => api.get("/admin/modules/tree");

// ── Leaf details ──────────────────────────────────────────────────────────────

/**
 * GET /api/admin/modules/categories/:id/leaf
 * Returns category + NON_MATERIAL formulas (each with fields[] AND outputs[]) + configs + coefficients
 */
export const getLeafDetails = (categoryId) =>
  api.get(`/admin/modules/categories/${categoryId}/leaf`);

// ── Category ──────────────────────────────────────────────────────────────────

export const createCategory = (data) =>
  api.post("/admin/modules/categories", data);

export const updateCategory = (categoryId, data) =>
  api.patch(`/admin/modules/categories/${categoryId}`, data);

export const deleteCategory = (categoryId) =>
  api.delete(`/admin/modules/categories/${categoryId}`);

// ── Formula ───────────────────────────────────────────────────────────────────

export const createFormula = (categoryId, data) =>
  api.post(`/admin/modules/categories/${categoryId}/formulas`, data);

export const updateFormula = (formulaId, data) =>
  api.patch(`/admin/modules/formulas/${formulaId}`, data);

export const deleteFormula = (formulaId) =>
  api.delete(`/admin/modules/formulas/${formulaId}`);

// ── Formula Output ────────────────────────────────────────────────────────────
// These were previously pointing at /admin/formula-outputs (a route that never
// existed). They now match the actual routes in modules.routes.js.

/**
 * POST /api/admin/modules/formulas/:formulaId/outputs
 * Body: { output_key, output_label, output_unit_id }
 */
export const createFormulaOutput = (formulaId, data) =>
  api.post(`/admin/modules/formulas/${formulaId}/outputs`, data);

/**
 * PATCH /api/admin/modules/formula-outputs/:outputId
 */
export const updateFormulaOutput = (outputId, data) =>
  api.patch(`/admin/modules/formula-outputs/${outputId}`, data);

/**
 * DELETE /api/admin/modules/formula-outputs/:outputId
 */
export const deleteFormulaOutput = (outputId) =>
  api.delete(`/admin/modules/formula-outputs/${outputId}`);

// ── Field ─────────────────────────────────────────────────────────────────────

export const createField = (formulaId, data) =>
  api.post(`/admin/modules/formulas/${formulaId}/fields`, data);

export const updateField = (fieldId, data) =>
  api.patch(`/admin/modules/fields/${fieldId}`, data);

export const deleteField = (fieldId) =>
  api.delete(`/admin/modules/fields/${fieldId}`);

// ── Config ────────────────────────────────────────────────────────────────────

export const createConfig = (categoryId, data) =>
  api.post(`/admin/modules/categories/${categoryId}/configs`, data);

export const updateConfig = (configId, data) =>
  api.patch(`/admin/modules/configs/${configId}`, data);

export const deleteConfig = (configId) =>
  api.delete(`/admin/modules/configs/${configId}`);

// ── Coefficient ───────────────────────────────────────────────────────────────

export const createCoefficient = (categoryId, data) =>
  api.post(`/admin/modules/categories/${categoryId}/coefficients`, data);

export const updateCoefficient = (coefficientId, data) =>
  api.patch(`/admin/modules/coefficients/${coefficientId}`, data);

export const deleteCoefficient = (coefficientId) =>
  api.delete(`/admin/modules/coefficients/${coefficientId}`);
