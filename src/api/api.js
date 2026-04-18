import { getAccessToken, setTokens, clearTokens } from "@/utils/token";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const MAX_RETRIES = 3;
const BASE_DELAY = 500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!config.metadata) {
    config.metadata = { retryCount: 0 };
  }
  return config;
});

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data.data,  // ← unwrap success payload

  async (error) => {
    const originalRequest = error.config;

    // 1. Token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/refresh`,
          { refreshToken }
        );
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        setTokens(accessToken, newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        clearTokens();
        window.location.href = "/auth/login";
        return Promise.reject(normaliseError(err));  // ← normalise before reject
      }
    }

    // 2. Retry on network error or 5xx
    const shouldRetry =
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600);

    if (shouldRetry && originalRequest?.metadata?.retryCount < MAX_RETRIES) {
      originalRequest.metadata.retryCount += 1;
      const delay = BASE_DELAY * Math.pow(2, originalRequest.metadata.retryCount);
      console.warn(`Retrying request... Attempt ${originalRequest.metadata.retryCount}`);
      await sleep(delay);
      return api(originalRequest);
    }

    // 3. Normalise and reject
    return Promise.reject(normaliseError(error));  // ← only change here
  }
);

// ── Error normaliser ──────────────────────────────────────────────────────────
function normaliseError(error) {
  if (!error.response) {
    return {
      code:    "NETWORK_ERROR",
      message: "Network error, please check your connection",
      status:  0,
      details: [],
    };
  }

  const { code, message, details = [] } = error.response.data?.error ?? {};

  return {
    code:    code    ?? "INTERNAL_ERROR",
    message: message ?? "An unexpected error occurred",
    status:  error.response.status,
    details,
  };
}

export default api;