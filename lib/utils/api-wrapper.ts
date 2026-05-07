import { NextResponse } from 'next/server';

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
  code?: string;
  details?: any;
}

/**
 * Standard API success response
 */
export interface ApiSuccess<T = any> {
  data: T;
  message?: string;
}

/**
 * Wrap API route handlers with error handling
 * Usage:
 * export const GET = withErrorHandling(async (req) => {
 *   // Your code here
 *   return NextResponse.json({ data: result });
 * });
 */
export function withErrorHandling(
  handler: (req: Request, context?: any) => Promise<Response>
) {
  return async (req: Request, context?: any): Promise<Response> => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('API Error:', error);

      // Check for specific error types
      if (error instanceof Error) {
        // Permission denied
        if (error.message.includes('Permission denied')) {
          return NextResponse.json<ApiError>(
            { error: error.message, code: 'PERMISSION_DENIED' },
            { status: 403 }
          );
        }

        // Authentication required
        if (error.message.includes('Authentication required')) {
          return NextResponse.json<ApiError>(
            { error: 'Authentication required', code: 'UNAUTHENTICATED' },
            { status: 401 }
          );
        }

        // Validation error
        if (error.message.includes('validation')) {
          return NextResponse.json<ApiError>(
            { error: error.message, code: 'VALIDATION_ERROR' },
            { status: 400 }
          );
        }

        // Generic error
        return NextResponse.json<ApiError>(
          {
            error: error.message || 'Internal server error',
            code: 'INTERNAL_ERROR',
          },
          { status: 500 }
        );
      }

      // Unknown error type
      return NextResponse.json<ApiError>(
        { error: 'Internal server error', code: 'UNKNOWN_ERROR' },
        { status: 500 }
      );
    }
  };
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T, message?: string): Response {
  return NextResponse.json<ApiSuccess<T>>({ data, message });
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  error: string,
  status: number = 500,
  code?: string
): Response {
  return NextResponse.json<ApiError>({ error, code }, { status });
}
