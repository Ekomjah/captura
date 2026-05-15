import { api } from "./client";
import type {
  UploadResponse,
  PaginatedAssetsResponse,
  PaginatedSearchResponse,
} from "@/types/api";

export const capturaKey = () => ["assets"];

export const fetchAssets = async (
  starting_page: number = 1,
  page_size: number = 20,
): Promise<PaginatedAssetsResponse> => {
  const res = await api.get(
    `/v1/history?page=${starting_page}&page_size=${page_size}`,
  );
  return res.data;
};

export const uploadAsset = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/v1/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const searchAssets = async (
  query: string,
  starting_page: number = 1,
  page_size: number = 20,
): Promise<PaginatedSearchResponse> => {
  const res = await api.get(
    `/v1/search?q=${encodeURIComponent(query)}&page=${starting_page}&page_size=${page_size}`,
  );
  return res.data;
};

export const capturapi = {
  fetchAssets,
  uploadAsset,
  searchAssets,
};
