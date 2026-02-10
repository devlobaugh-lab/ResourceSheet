/**
 * Standard API response types
 * Ensures consistent response format across all API endpoints
 */

/**
 * Standard success API response
 */
export interface ApiResponse<TData = unknown> {
  /**
   * Indicates the request was successful
   */
  success: true

  /**
   * The response data
   */
  data: TData

  /**
   * Optional pagination metadata
   */
  pagination?: PaginationMeta
}

/**
 * Standard error API response
 */
export interface ApiErrorResponse {
  /**
   * Indicates the request failed
   */
  success: false

  /**
   * Error information
   */
  error: {
    /**
     * Error code for client handling
     */
    code: string

    /**
     * User-friendly error message
     */
    message: string

    /**
     * Additional error details
     */
    details?: Record<string, unknown>
  }
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  /**
   * Current page number (1-indexed)
   */
  page: number

  /**
   * Items per page
   */
  limit: number

  /**
   * Total number of items
   */
  total: number

  /**
   * Total number of pages
   */
  totalPages: number
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(
  data: T,
  pagination?: PaginationMeta
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(pagination && { pagination }),
  }
}

/**
 * Create an error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  }
}
