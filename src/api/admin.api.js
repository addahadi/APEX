import api from "./api";

function toQueryString(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;
    if (typeof value === "string" && (value.trim() === "" || value === "ALL")) return;
    query.set(key, String(value));
  });

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export const getDashboardStats = () => api.get("/admin/stats");

export const getSubscribers = (params = {}) => {
  return api.get(`/admin/subscribers${toQueryString(params)}`);
};

export const getUsers = (params = {}) => {
  return api.get(`/admin/users${toQueryString(params)}`);
};

export const getUserDetails = (userId) => api.get(`/admin/users/${userId}`);

export const updateUserStatus = (userId, data) =>
  api.patch(`/admin/users/${userId}/status`, data);
