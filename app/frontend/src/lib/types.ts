type ocrStatus = "pending" | "complete" | "error";
export enum VariantFormat {
  webp = "webp",
  jpeg = "jpeg",
  png = "png",
}

export interface UploadVariant {
  /** Variant object stored in S3 and returned on upload (shared API + service contract) */
  s3_key: string;
  content_type: string;
  size_bytes: number;
  format: VariantFormat;
}
export interface UploadResponse {
  // Response type for POST /v1/upload (raw object + derived variants).

  asset_id: string;
  bucket: string;
  s3_key: string;
  content_type: string;
  size_bytes: number;
  ocr_snippet: string | null;
  ocr_status: ocrStatus;
  variants: UploadVariant[];
}

export interface AssetSummary {
  // Summary for an asset: raw object plus OCR fields and persisted variant rows.
  id: string;
  created_at: Date;
  s3_key: string;
  thumbnail_url: string;
  ocr_snippet: string | null;
  ocr_status: ocrStatus;
  variants: UploadVariant[];
}

export interface PaginatedAssetsResponse {
  // resp model for the history endpoint

  images: AssetSummary[];
  page: number;
  page_size: number;
  total: number;
}

export interface SearchHit {
  asset: AssetSummary;
  matched_text: string;
  match_context: string | null;
}

export interface PaginatedSearchResponse {
  // resp for the ocr search endpoint

  items: SearchHit[];
  page: number;
  page_size: number;
  total: number;
  query: string;
}
