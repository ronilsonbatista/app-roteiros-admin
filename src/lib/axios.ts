import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from './cookies';

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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle 401 Unauthorized with automatic refresh token rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on login or refresh requests themselves
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      const refreshToken = getCookie('refreshToken');

      if (refreshToken) {
        if (isRefreshing) {
          // If already refreshing, queue this request until refresh completes
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
          const refreshRes = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken,
          });

          const refreshData = refreshRes.data?.data || refreshRes.data;
          const newAccessToken = refreshData?.accessToken;
          const newRefreshToken = refreshData?.refreshToken;

          if (newAccessToken) {
            // Check rememberMe cookie to decide cookie duration
            const isRememberMe = getCookie('rememberMe') === 'true';
            const days = isRememberMe ? 30 : 1;

            setCookie('accessToken', newAccessToken, days);
            if (newRefreshToken) {
              setCookie('refreshToken', newRefreshToken, isRememberMe ? 30 : 7);
            }

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            processQueue(null, newAccessToken);
            return api(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
        } finally {
          isRefreshing = false;
        }
      }

      // If refresh failed or no refresh token is present, clear session and redirect
      deleteCookie('accessToken');
      deleteCookie('refreshToken');

      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
