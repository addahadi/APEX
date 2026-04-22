import api from "../api/api";

// ── Categories API Service ─────────────────────────────────────────

/**
 * GET /categories/tree
 * Fetches all categories as a nested tree
 */
export const getCategoryTree = () => api.get("/categories/tree");

/**
 * GET /categories
 * Fetches all root categories for the explorer.
 * @returns {Array} List of root categories
 */
export const getRootCategories = () => api.get("/categories");

/**
 * GET /categories/:id/children
 * Fetches immediate children of a specific category level.
 * @param {string} id Category ID
 * @returns {Array} List of child categories
 */
export const getChildCategories = (id) => api.get(`/categories/${id}/children`);

/**
 * GET /categories/:id/leaf
 * Fetches leaf category details including formulas and fields.
 * Used not only for LEAF but also to get node metadata.
 * @param {string} id Category ID
 * @returns {Object} Category details with formulas array
 */
export const getCategoryDetails = (id) => api.get(`/categories/${id}/leaf`);

// ── Calculation engine and Estimation save ─────────────────────────────────────────

/**
 * POST /calculate
 * Runs a stateless calculation preview
 * @param {Object} data { category_id, selected_formula_id, selected_config_id, field_values, ... }
 * @returns {Object} { total_cost, intermediate_results, material_lines }
 */
export const calculateEngine = (data) => api.post("/calculate", data);

/**
 * POST /estimation/save-leaf
 * Saves calculation results onto an estimation
 * @param {Object} data Save configuration parameters
 * @returns {Object} saved details
 */
export const saveLeafResult = (data) => api.post("/estimation/save-leaf", data);

/**
 * DELETE /estimation/leaf
 * Removes a leaf calculation
 * @param {string} project_details_id
 * @returns {Object} new totals
 */
export const removeLeaf = (project_details_id) => api.delete("/estimation/leaf", { 
  data: { project_details_id } 
});
