import { api } from "./client";
import type {
  UploadResponse,
  PaginatedAssetsResponse,
  PaginatedSearchResponse,
} from "@/lib/types/api";

export const queryKeys = {
  all: () => ["assets"] as const,
  history: (page: number, page_size: number) =>
    [...queryKeys.all(), "history", { page, page_size }] as const,
  search: (q: string, page: number, page_size: number) =>
    [...queryKeys.all(), "search", q, { page, page_size }] as const,
};

export const fetchAssets = async (
  starting_page: number = 1,
  page_size: number = 20,
): Promise<PaginatedAssetsResponse> => {
  const res = await api.get(
    `/history?page=${starting_page}&page_size=${page_size}`,
  );
  return res.data;
};

export const uploadAsset = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 12000,
  });
  return res.data;
};

export const searchAssets = async (
  query: string,
  starting_page: number = 1,
  page_size: number = 20,
): Promise<PaginatedSearchResponse> => {
  const res = await api.get(
    `/search?q=${encodeURIComponent(query)}&page=${starting_page}&page_size=${page_size}`,
  );
  return res.data;
};

export const deleteAsset = async (assetId: string): Promise<void> => {
  await api.delete(`/delete/${assetId}`);
};

export const capturapi = {
  fetchAssets,
  uploadAsset,
  searchAssets,
  deleteAsset,
};
