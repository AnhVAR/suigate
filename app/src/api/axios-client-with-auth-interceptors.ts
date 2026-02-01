/**
 * Axios Client with Auth Interceptors
 * Centralized HTTP client with JWT token management and retry logic
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
} from './secure-token-storage';
import { API_BASE_URL, REQUEST_TIMEOUT } from '../config/api-base-configuration';
import { handleApiError } from './axios-error-handler-utility';

// Import UI store dynamically to avoid circular dependencies
let showToastFn: ((type: 'error' | 'success' | 'info' | 'warning', message: string) => void) | null = null;

export const setToastFunction = (fn: (type: 'error' | 'success' | 'info' | 'warning', message: string) => void) => {
  showToastFn = fn;
};

// Queue for failed requests during token refresh
interface FailedRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  config: AxiosRequestConfig;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      // Retry the request with the original config
      prom.resolve(axiosInstance(prom.config));
    }
  });

  failedQueue = [];
};

/**
 * Main Axios instance with interceptors
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: Add Bearer token
 */
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle 401 and token refresh
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // For MVP: No token refresh, just logout
        // In future: implement refresh token logic here
        await removeAccessToken();
        isRefreshing = false;
        const sessionError = new Error('Session expired. Please login again.');
        processQueue(sessionError);
        return Promise.reject(sessionError);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Typed request helpers
 */
export const apiClient = {
  /**
   * GET request
   */
  get: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await axiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      // Show toast for errors if function is set
      if (showToastFn && !config?.headers?.['X-Skip-Toast']) {
        showToastFn('error', apiError.message);
      }
      throw apiError;
    }
  },

  /**
   * POST request
   */
  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await axiosInstance.post(
        url,
        data,
        config
      );
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      // Show toast for errors if function is set
      if (showToastFn && !config?.headers?.['X-Skip-Toast']) {
        showToastFn('error', apiError.message);
      }
      throw apiError;
    }
  },

  /**
   * PATCH request
   */
  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await axiosInstance.patch(
        url,
        data,
        config
      );
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw apiError;
    }
  },

  /**
   * PUT request
   */
  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await axiosInstance.put(
        url,
        data,
        config
      );
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw apiError;
    }
  },

  /**
   * DELETE request
   */
  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await axiosInstance.delete(
        url,
        config
      );
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw apiError;
    }
  },
};

// Export axios instance for direct use if needed
export { axiosInstance };
