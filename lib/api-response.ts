import { NextResponse } from 'next/server';

// Standard API response types
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Response helpers
export function successResponse<T>(data: T, message?: string, status = 200) {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };
  if (message) response.message = message;
  return NextResponse.json(response, { status });
}

export function errorResponse(
  error: string,
  status = 400,
  code?: string,
  details?: Record<string, string[]>
) {
  const response: ApiErrorResponse = {
    success: false,
    error,
  };
  if (code) response.code = code;
  if (details) response.details = details;
  return NextResponse.json(response, { status });
}

// Common error responses
export const errors = {
  unauthorized: () => errorResponse('Yetkisiz erişim', 401, 'UNAUTHORIZED'),
  forbidden: () => errorResponse('Bu işlem için yetkiniz yok', 403, 'FORBIDDEN'),
  notFound: (resource = 'Kaynak') => errorResponse(`${resource} bulunamadı`, 404, 'NOT_FOUND'),
  badRequest: (message = 'Geçersiz istek') => errorResponse(message, 400, 'BAD_REQUEST'),
  validation: (details: Record<string, string[]>) => 
    errorResponse('Doğrulama hatası', 422, 'VALIDATION_ERROR', details),
  rateLimited: (resetIn: number) => 
    errorResponse(`Çok fazla istek. ${resetIn} saniye sonra tekrar deneyin.`, 429, 'RATE_LIMITED'),
  serverError: (message = 'Sunucu hatası') => errorResponse(message, 500, 'SERVER_ERROR'),
};

// Pagination helper
export interface PaginationParams {
  page?: number;
  limit?: number;
  total: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function paginatedResponse<T>(
  items: T[],
  { page = 1, limit = 10, total }: PaginationParams
) {
  const totalPages = Math.ceil(total / limit);
  return successResponse<PaginatedResponse<T>>({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}
