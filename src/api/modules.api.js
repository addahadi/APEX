import api from "./api";

// ── Lookups ───────────────────────────────────────────────────────────────────

/** GET /admin/modules/units */
export const getUnits = () => api.get("/admin/modules/units");

// ── Tree ──────────────────────────────────────────────────────────────────────

/** GET /admin/modules/tree — full category tree (includes inactive) */
export const getAdminTree = () => api.get("/admin/modules/tree");

// ── Leaf details ──────────────────────────────────────────────────────────────

/**
 * GET /admin/modules/categories/:id/leaf
 * Returns category + NON_MATERIAL formulas (each with fields[]) + configs + coefficients
 */
export const getLeafDetails = (categoryId) =>
  api.get(`/admin/modules/categories/${categoryId}/leaf`);

// ── Category ──────────────────────────────────────────────────────────────────

/** POST /admin/modules/categories */
export const createCategory = (data) => api.post("/admin/modules/categories", data);

/** PATCH /admin/modules/categories/:id */
export const updateCategory = (categoryId, data) =>
  api.patch(`/admin/modules/categories/${categoryId}`, data);

/** DELETE /admin/modules/categories/:id */
export const deleteCategory = (categoryId) =>
  api.delete(`/admin/modules/categories/${categoryId}`);

// ── Formula ───────────────────────────────────────────────────────────────────

/** POST /admin/modules/categories/:categoryId/formulas */
export const createFormula = (categoryId, data) =>
  api.post(`/admin/modules/categories/${categoryId}/formulas`, data);

/** PATCH /admin/modules/formulas/:formulaId */
export const updateFormula = (formulaId, data) =>
  api.patch(`/admin/modules/formulas/${formulaId}`, data);

/** DELETE /admin/modules/formulas/:formulaId */
export const deleteFormula = (formulaId) =>
  api.delete(`/admin/modules/formulas/${formulaId}`);

// ── Field ─────────────────────────────────────────────────────────────────────

/** POST /admin/modules/formulas/:formulaId/fields */
export const createField = (formulaId, data) =>
  api.post(`/admin/modules/formulas/${formulaId}/fields`, data);

/** PATCH /admin/modules/fields/:fieldId */
export const updateField = (fieldId, data) =>
  api.patch(`/admin/modules/fields/${fieldId}`, data);

/** DELETE /admin/modules/fields/:fieldId */
export const deleteField = (fieldId) =>
  api.delete(`/admin/modules/fields/${fieldId}`);

// ── Config ────────────────────────────────────────────────────────────────────

/** POST /admin/modules/categories/:categoryId/configs */
export const createConfig = (categoryId, data) =>
  api.post(`/admin/modules/categories/${categoryId}/configs`, data);

/** PATCH /admin/modules/configs/:configId */
export const updateConfig = (configId, data) =>
  api.patch(`/admin/modules/configs/${configId}`, data);

/** DELETE /admin/modules/configs/:configId */
export const deleteConfig = (configId) =>
  api.delete(`/admin/modules/configs/${configId}`);

// ── Coefficient ───────────────────────────────────────────────────────────────

/** POST /admin/modules/categories/:categoryId/coefficients */
export const createCoefficient = (categoryId, data) =>
  api.post(`/admin/modules/categories/${categoryId}/coefficients`, data);

/** PATCH /admin/modules/coefficients/:coefficientId */
export const updateCoefficient = (coefficientId, data) =>
  api.patch(`/admin/modules/coefficients/${coefficientId}`, data);

/** DELETE /admin/modules/coefficients/:coefficientId */
export const deleteCoefficient = (coefficientId) =>
  api.delete(`/admin/modules/coefficients/${coefficientId}`);

// ── Formula Outputs ───────────────────────────────────────────────────────────

/** POST /admin/formula-outputs */
export const createFormulaOutput = (data) =>
  api.post(`/admin/formula-outputs`, data);

/** PATCH /admin/formula-outputs/:outputId */
export const updateFormulaOutput = (outputId, data) =>
  api.patch(`/admin/formula-outputs/${outputId}`, data);

/** DELETE /admin/formula-outputs/:outputId */
export const deleteFormulaOutput = (outputId) =>
  api.delete(`/admin/formula-outputs/${outputId}`);
