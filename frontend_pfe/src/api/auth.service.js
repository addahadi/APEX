import api from "../api/api";

// ── Auth API Service ─────────────────────────────────────────────────────────
// Backend routes are mounted at /api, auth route paths are /register, /login, etc.
// So full paths are: /register, /login, /forgot-password, /me, /logout
// (api.js baseURL already includes /api)

/**
 * POST /login
 * @param {{ email: string, password: string }} data
 * @returns {{ accessToken, refreshToken, user }}
 */
export const loginUser = (data) => api.post("/login", data);

/**
 * POST /register
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ accessToken, refreshToken, user }}
 */
export const registerUser = (data) => api.post("/register", data);

/**
 * POST /forgot-password
 * @param {{ email: string }} data
 * @returns {{ message: string }}
 */
export const forgotPassword = (data) => api.post("/forgot-password", data);

/**
 * GET /me
 * @returns {{ id, name, email, role, status, created_at }}
 */
export const getMe = () => api.get("/me");

/**
 * POST /logout
 * @param {string} refreshToken
 * @returns {{ message: string }}
 */
export const logoutUser = (refreshToken) =>
  api.post("/logout", { refreshToken });
