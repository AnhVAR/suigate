/** Generic API error response */
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

/** Generic paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}
