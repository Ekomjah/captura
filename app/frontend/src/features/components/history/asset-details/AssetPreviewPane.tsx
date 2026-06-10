import type { AssetSummary } from "@/lib/types/api";
import { getPreviewUrl } from "@/lib/utils/assetHelpers";
import { ImageWithFallback } from "@/hooks/ImageError";
import { MetadataHUD } from "./MetadataHUD";
import {
  getFileType,
  getTotalSize,
  getResolution,
} from "@/lib/utils/assetHelpers";
import { formatFileSize } from "@/lib/utils/fileSizeFormatter";

interface AssetPreviewPaneProps {
  asset: AssetSummary;
}

export function AssetPreviewPane({ asset }: AssetPreviewPaneProps) {
  const previewUrl = getPreviewUrl(asset);
  const fileSize = formatFileSize(getTotalSize(asset.variants));
  const fileType = getFileType(asset);
  const resolution = getResolution(asset);

  return (
    <div className="relative w-full lg:w-3/4 bg-background dot-grid h-full flex items-center justify-center rounded-lg">
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <ImageWithFallback
          src={previewUrl}
          alt={`Asset ${asset.id}`}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
      <MetadataHUD
        resolution={resolution}
        fileSize={fileSize}
        fileType={fileType}
      />
    </div>
  );
}
