import api from "../api/api";

// ── Projects API Service ─────────────────────────────────────────

/**
 * GET /projects
 * Fetches all user projects globally.
 * @returns {Array<{ project_id, name, description, status, created_at, total_cost, leaf_count }>}
 */
export const getProjects = () => api.get("/projects");

/**
 * GET /projects/:id
 * Fetches specific project metadata.
 * @param {string} id
 * @returns {Object} project
 */
export const getProject = (id) => api.get(`/projects/${id}`);

/**
 * POST /projects
 * Creates a new project.
 * @param {Object} data { name, description, budget_type, image }
 * @returns {Object} created project
 */
export const createProject = (data) => {
  if (data.image instanceof File) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("budget_type", data.budget_type);
    formData.append("image", data.image);
    return api.post("/projects", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return api.post("/projects", data);
};

/**
 * GET /projects/:id/estimation
 * Fetches project leaf histories and sub-totals.
 * @param {string} id
 * @returns {Object} estimation with leaf_calculations
 */
export const getProjectEstimation = (id) => api.get(`/projects/${id}/estimation`);

/**
 * GET /projects/:id/export
 * Triggers PDF report generation and download.
 * @param {string} id
 * @returns {Blob} PDF blob
 */
export const exportProjectReport = (id) =>
  api.get(`/projects/${id}/export`, {
    responseType: 'blob',
    // Prevent the response interceptor from calling .data.data on a Blob
    transformResponse: (data) => data,
  });
