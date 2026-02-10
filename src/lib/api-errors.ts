/**
 * Standardized error handling for API routes
 * Provides consistent error response formats and HTTP status codes
 */

import { NextResponse } from 'next/server'
import type { ApiErrorResponse } from '@/types/api'

/**
 * Base class for all API errors
 * Provides a standard interface for error handling
 */
export class ApiError extends Error {
  /**
   * HTTP status code for this error
   */
  public readonly statusCode: number

  /**
   * Error code for client identification
   */
  public readonly code: string

  /**
   * Additional error details
   */
  public readonly details?: Record<string, unknown>

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  /**
   * Convert error to a Next.js NextResponse
   */
  toResponse(): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: this.code,
          message: this.message,
          ...(this.details && { details: this.details }),
        },
      } as ApiErrorResponse,
      { status: this.statusCode }
    )
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request', details?: Record<string, unknown>) {
    super(message, 400, 'BAD_REQUEST', details)
    Object.setPrototypeOf(this, BadRequestError.prototype)
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED')
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN')
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', resource?: string) {
    super(message, 404, 'NOT_FOUND')
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT')
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

/**
 * 422 Unprocessable Entity (Validation)
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', details?: Record<string, unknown>) {
    super(message, 422, 'VALIDATION_ERROR', details)
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR')
    Object.setPrototypeOf(this, InternalServerError.prototype)
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = 'Service unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE')
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype)
  }
}

/**
 * Database operation error
 */
export class DatabaseError extends ApiError {
  constructor(message: string = 'Database operation failed', originalError?: Error) {
    super(message, 500, 'DATABASE_ERROR', {
      originalError: originalError?.message,
    })
    Object.setPrototypeOf(this, DatabaseError.prototype)
  }
}

/**
 * Generic error handler for API routes
 * Converts various error types to appropriate API responses
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // Handle our custom API errors
  if (error instanceof ApiError) {
    return error.toResponse()
  }

  // Handle validation errors (from libraries like Zod)
  if (error instanceof Error && error.name === 'ZodError') {
    return new ValidationError(
      'Validation failed',
      { zodError: error.message }
    ).toResponse()
  }

  // Handle standard JS errors
  if (error instanceof Error) {
    // Log unexpected errors
    console.error('Unexpected error:', error)

    // For development, include error message; for production, generic message
    const message = process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'

    return new InternalServerError(message).toResponse()
  }

  // Handle unknown error types
  console.error('Unknown error type:', error)
  return new InternalServerError().toResponse()
}
