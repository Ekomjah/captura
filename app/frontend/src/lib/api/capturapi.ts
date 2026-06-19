import { api } from "./client";
import type {
  UploadResponse,
  PaginatedAssetsResponse,
  PaginatedSearchResponse,
} from "@/lib/types/api";
import type { AxiosRequestConfig } from "axios";

export type GetToken = () => Promise<string | null>;

const getAuthConfig = async (
  getToken: GetToken,
): Promise<AxiosRequestConfig> => {
  const token = await getToken();
  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

export const queryKeys = {
  all: (userId?: string | null) => ["assets", userId ?? "anonymous"] as const,
  history: (
    userId: string | null | undefined,
    page: number,
    page_size: number,
  ) => [...queryKeys.all(userId), "history", { page, page_size }] as const,
  search: (
    userId: string | null | undefined,
    q: string,
    page: number,
    page_size: number,
  ) => [...queryKeys.all(userId), "search", q, { page, page_size }] as const,
};

export const fetchAssets = async (
  getToken: GetToken,
  starting_page: number = 1,
  page_size: number = 20,
): Promise<PaginatedAssetsResponse> => {
  const res = await api.get(
    `/history?page=${starting_page}&page_size=${page_size}`,
    await getAuthConfig(getToken),
  );
  return res.data;
};

export const uploadAsset = async (
  getToken: GetToken,
  file: File,
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/upload", formData, {
    ...(await getAuthConfig(getToken)),
    // OCR + S3 round trips can exceed the default 30s on large images.
    timeout: 60000,
  });
  return res.data;
};

export const searchAssets = async (
  getToken: GetToken,
  query: string,
  starting_page: number = 1,
  page_size: number = 20,
): Promise<PaginatedSearchResponse> => {
  const res = await api.get(
    `/search?q=${encodeURIComponent(query)}&page=${starting_page}&page_size=${page_size}`,
    await getAuthConfig(getToken),
  );
  return res.data;
};

export const deleteAsset = async (
  getToken: GetToken,
  assetId: string,
): Promise<void> => {
  await api.delete(`/delete/${assetId}`, await getAuthConfig(getToken));
};

export const capturapi = {
  fetchAssets,
  uploadAsset,
  searchAssets,
  deleteAsset,
};
