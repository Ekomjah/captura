import { isAxiosError } from "axios";
import type { ErrorResponse } from "@/lib/types/api";
import { getApiError } from "./getApiError";

/**
 * Maps an upload failure to a user-facing error with a specific cause —
 * timeouts, network drops, oversized payloads, auth issues, and server errors
 * all surface a distinct message instead of the generic "Upload failed".
 */
export function getUploadError(error: unknown): ErrorResponse {
  if (isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || /timeout/i.test(error.message)) {
      return {
        error: "UploadTimeout",
        detail:
          "Upload timed out. The image may be too large or the server is taking too long to process it. Try a smaller image or try again in a moment.",
      };
    }

    if (error.code === "ERR_NETWORK" || !error.response) {
      return {
        error: "NetworkError",
        detail:
          "Could not reach the server. Check your internet connection and try again.",
      };
    }

    const status = error.response.status;
    if (status === 413) {
      return {
        error: "PayloadTooLarge",
        detail: "Image is too large to upload. Try a smaller file.",
      };
    }
    if (status === 415) {
      return {
        error: "UnsupportedMediaType",
        detail: "Unsupported file type. Upload a PNG or JPEG image.",
      };
    }
    if (status === 401 || status === 403) {
      return {
        error: "AuthError",
        detail: "You're not signed in. Sign in and try again.",
      };
    }
    if (status >= 500) {
      const api = getApiError(error);
      return {
        error: api?.error ?? "ServerError",
        detail:
          api?.detail ??
          "Server error while processing your image. Try again in a moment.",
      };
    }
  }

  const api = getApiError(error);
  if (api) return api;

  return {
    error: "UnknownError",
    detail: "Upload failed. Please try again with a valid image file.",
  };
}
