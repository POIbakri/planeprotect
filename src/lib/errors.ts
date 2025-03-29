import type { ErrorCode } from './types';

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export class ApiError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access denied') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }

  if (error instanceof Error) {
    // Handle network errors
    if (error.name === 'AbortError') {
      throw new ApiError(
        'Request timeout',
        'NETWORK_ERROR',
        408
      );
    }

    // Handle database errors
    if (error.message.includes('database')) {
      throw new ApiError(
        'Database operation failed',
        'DATABASE_ERROR',
        500
      );
    }

    // Handle other known errors
    throw new ApiError(
      error.message,
      'API_ERROR',
      500
    );
  }

  // Handle unknown errors
  throw new ApiError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500
  );
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}