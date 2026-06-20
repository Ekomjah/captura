import { useState } from "react";
import { ImagePlaceholder } from "./ImagePlaceholder";
import type { AssetSummary } from "@/lib/types/api";
import { getPreviewUrl, getFileType } from "@/lib/utils/assetHelpers";

interface AssetCardThumbnailProps {
  asset: AssetSummary;
}

export function AssetCardThumbnail({ asset }: AssetCardThumbnailProps) {
  const [hasError, setHasError] = useState<boolean | null>(null);
  const previewUrl = getPreviewUrl(asset);

  if (!previewUrl || hasError) {
    return <ImagePlaceholder format={getFileType(asset)} />;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-muted">
      <img
        src={previewUrl}
        onLoad={() => setHasError(false)}
        alt={`Asset ${asset.id}`}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
        onError={() => setHasError(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/25 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
    </div>
  );
}
