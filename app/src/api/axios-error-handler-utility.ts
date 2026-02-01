/**
 * Axios Error Handler Utility
 * Extracts and normalizes errors from Axios responses
 */

import { AxiosError } from 'axios';

export interface ApiError {
  status?: number;
  message: string;
  code?: string;
  data?: any;
}

/**
 * Handle API errors and extract user-friendly messages
 */
export const handleApiError = (error: unknown): ApiError => {
  // Network error (no response)
  if (error instanceof AxiosError && !error.response) {
    return {
      message: 'Network error. Please check your internet connection.',
      code: 'NETWORK_ERROR',
    };
  }

  // Axios error with response
  if (error instanceof AxiosError && error.response) {
    const { status, data } = error.response;

    // Extract message from response
    const message =
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.message ||
      'An error occurred';

    return {
      status,
      message,
      code: data?.code || `HTTP_${status}`,
      data: data?.data,
    };
  }

  // Generic error
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  // Unknown error type
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  return error instanceof AxiosError && !error.response;
};

/**
 * Check if error is authentication error (401)
 */
export const isAuthError = (error: unknown): boolean => {
  return error instanceof AxiosError && error.response?.status === 401;
};

/**
 * Check if error is forbidden (403)
 */
export const isForbiddenError = (error: unknown): boolean => {
  return error instanceof AxiosError && error.response?.status === 403;
};

/**
 * Check if error is not found (404)
 */
export const isNotFoundError = (error: unknown): boolean => {
  return error instanceof AxiosError && error.response?.status === 404;
};

/**
 * Check if error is validation error (400)
 */
export const isValidationError = (error: unknown): boolean => {
  return error instanceof AxiosError && error.response?.status === 400;
};

/**
 * Check if error is server error (5xx)
 */
export const isServerError = (error: unknown): boolean => {
  return (
    error instanceof AxiosError &&
    error.response?.status !== undefined &&
    error.response.status >= 500
  );
};
