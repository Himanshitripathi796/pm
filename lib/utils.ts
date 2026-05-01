import type { ApiErrorResponse, ApiSuccessResponse } from "@/types";

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;

  if (!response.ok || !json.success) {
    const error = !json.success ? json.error.message : "Request failed.";
    throw new Error(error);
  }

  return json.data;
}

export function formatDate(value?: string | Date) {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function isOverdue(value?: string | Date) {
  if (!value) {
    return false;
  }

  return new Date(value).getTime() < Date.now();
}
