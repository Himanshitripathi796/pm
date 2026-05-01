import { NextResponse } from "next/server";

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { message, details } },
    { status }
  );
}

export function handleApiError(error: unknown, fallbackMessage: string) {
  if (error instanceof HttpError) {
    return errorResponse(error.message, error.status, error.details);
  }

  return errorResponse(fallbackMessage, 500);
}
