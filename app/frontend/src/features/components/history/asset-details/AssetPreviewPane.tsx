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
    <div className="relative flex h-72 w-full flex-1 items-center justify-center overflow-hidden bg-[oklch(0.155_0.005_60)] lg:h-full">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 70% at 50% 45%, transparent 40%, oklch(0 0 0 / 0.55) 100%)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10">
        <ImageWithFallback
          src={previewUrl}
          alt={`Asset ${asset.id}`}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl ring-1 ring-white/10"
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
