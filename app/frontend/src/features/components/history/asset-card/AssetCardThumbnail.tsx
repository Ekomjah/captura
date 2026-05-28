import { useState } from "react";
import { ImagePlaceholder } from "./ImagePlaceholder";
import type { AssetSummary } from "@/lib/types/api";
import { getPreviewUrl, getFileType } from "@/lib/utils/assetHelpers";

interface AssetCardThumbnailProps {
  asset: AssetSummary;
}

export function AssetCardThumbnail({ asset }: AssetCardThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const previewUrl = getPreviewUrl(asset);

  if (!previewUrl || hasError) {
    return <ImagePlaceholder format={getFileType(asset)} />;
  }

  return (
    <div className="aspect-video w-full overflow-hidden">
      <img
        src={previewUrl}
        alt={`Asset ${asset.id}`}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
