import axios from 'axios';
import { API_BASE_URL } from './api';
import { refreshAccessToken } from './auth';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem('247gbs_token') || localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as { url?: string; headers?: Record<string, string>; _retry?: boolean } | undefined;
    const status = error.response?.status;
    const url: string = originalRequest?.url || '';

    const isAuthEndpoint =
      url.includes('/auth/refresh') ||
      url.includes('/auth/signin') ||
      url.includes('/auth/signup') ||
      url.includes('/auth/mfa') ||
      url.includes('/auth/sso/') ||
      url.includes('/auth/logout');

    // Global silent refresh: single 401 retry via shared single-flight helper.
    // 403 is NOT retried here (real forbidden vs expired). 401 === expired access
    // token with (usually) still-valid 7d HttpOnly refresh cookie.
    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        if (typeof newToken === 'string' && newToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
        // newToken === false -> refresh definitively expired, SESSION_EXPIRED_EVENT
        // already dispatched by refreshAccessToken -> just reject, listeners redirect.
        // newToken === null -> network hiccup, reject without wiping session.
      } catch {
        // ignore refresh errors, fall through to reject
      }
    }
    // A 401/403 from a background or SSO request must NOT globally destroy
    // the session or redirect the user — that would bounce even public pages
    // to sign-in. Callers on the /auth/* pages handle their own auth errors.
    return Promise.reject(error);
  }
);

export default apiClient;
