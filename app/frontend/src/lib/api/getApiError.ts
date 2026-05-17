import { isAxiosError } from "axios";
import type { ErrorResponse } from "@/lib/types/api";

/**
 * Extracts structured error details from Axios errors
 * @param error - The error object from Axios/React Query
 * @returns ErrorResponse with backend error details, or null if not an API error
 */
export function getApiError(error: unknown): ErrorResponse | null {
  if (isAxiosError(error) && error.response?.data) {
    const data = error.response.data;

    // Validate that we have both error and detail fields
    if (
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      "detail" in data
    ) {
      return data as ErrorResponse;
    }
  }
  return null;
}
