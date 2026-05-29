import type { AssetSummary, UploadVariant } from "@/lib/types/api";

export function getDisplayName(asset: AssetSummary): string {
  const filename = asset.s3_key.split("/").pop() || asset.id;
  return filename.replace(/\.[^.]+$/, "");
}

export function getPreviewUrl(asset: AssetSummary): string {
  if (asset.thumbnail_url) {
    return `https://captura-mvp-76d74875.s3.us-east-1.amazonaws.com/${asset.thumbnail_url.replace("raw", "processed").replace(/\.[^.]+$/, ".webp")}`;
  }

  const webpVariant = asset.variants.find((v) => v.format === "webp");
  if (webpVariant) {
    return `https://captura-mvp-76d74875.s3.us-east-1.amazonaws.com/${webpVariant.s3_key}`;
  }

  return "";
}

export function getTotalSize(variants: UploadVariant[]): number {
  return variants.reduce((sum, v) => sum + v.size_bytes, 0);
}

export function getFileType(asset: AssetSummary): string {
  const ext = asset.s3_key.split(".").pop()?.toUpperCase();
  return ext || "IMAGE";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getResolution(_asset: AssetSummary): string {
  return "—";
}
