import axios from 'axios';
import { getCookie, deleteCookie } from './cookies';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject Bearer token if it exists in cookies
api.interceptors.request.use(
  (config) => {
    const token = getCookie('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle common global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear authentication cookies
      deleteCookie('accessToken');
      deleteCookie('refreshToken');
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        // Redirect to login if we are not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
