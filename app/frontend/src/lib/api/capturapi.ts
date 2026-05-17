import { api } from "./client";
import type {
  UploadResponse,
  PaginatedAssetsResponse,
  PaginatedSearchResponse,
} from "@/lib/types/api";
import { getApiError } from "./getApiError";

export const queryKeys = {
  all: () => ["assets"] as const,
  history: (page: number, page_size: number) =>
    [...queryKeys.all(), "history", { page, page_size }] as const,
  search: (q: string, page: number, page_size: number) =>
    [...queryKeys.all(), "search", q, { page, page_size }] as const,
  upload: (file_name: string) =>
    [...queryKeys.all(), "upload", file_name] as const,
};

export const fetchAssets = async (
  starting_page: number = 1,
  page_size: number = 20,
): Promise<PaginatedAssetsResponse> => {
  try {
    const res = await api.get(
      `/history?page=${starting_page}&page_size=${page_size}`,
    );
    return res.data;
  } catch (error) {
    const customError = getApiError(error);
    console.error("Error fetching assets:", error);
    throw customError || error;
  }
};

export const uploadAsset = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    const customError = getApiError(error);
    console.error("Error uploading asset:", error);
    throw customError || error;
  }
};

export const searchAssets = async (
  query: string,
  starting_page: number = 1,
  page_size: number = 20,
): Promise<PaginatedSearchResponse> => {
  try {
    const res = await api.get(
      `/search?q=${encodeURIComponent(query)}&page=${starting_page}&page_size=${page_size}`,
    );
    return res.data;
  } catch (error) {
    const customError = getApiError(error);
    console.error("Error searching assets:", error);
    throw customError || error;
  }
};

export const capturapi = {
  fetchAssets,
  uploadAsset,
  searchAssets,
};
