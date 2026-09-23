import axios from 'axios';
import { handleSessionExpired } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

let isRedirecting = false;

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
      const token = localStorage.getItem('auth_token');
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
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      const url = error.config?.url || '';
      const isRefreshCall = url.includes('/auth/refresh');
      const isSignInPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/');

      if (isRefreshCall || isSignInPage) {
        return Promise.reject(error);
      }

      isRedirecting = true;
      handleSessionExpired();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin?error=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
