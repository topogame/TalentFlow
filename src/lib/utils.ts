import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ApiResponse<T = unknown> = {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  } | null;
  warnings?: { code: string; message: string }[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function successResponse<T>(
  data: T,
  options?: {
    warnings?: { code: string; message: string }[];
    pagination?: ApiResponse["pagination"];
  }
): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
    ...(options?.warnings && { warnings: options.warnings }),
    ...(options?.pagination && { pagination: options.pagination }),
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown[]
): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error: { code, message, ...(details && { details }) },
  };
}

export function paginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
