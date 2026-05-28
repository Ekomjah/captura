import type { AssetSummary } from "@/lib/types/api";
import { getPreviewUrl } from "@/lib/utils/assetHelpers";
import { MetadataHUD } from "./MetadataHUD";
import { getFileType, getTotalSize, getResolution } from "@/lib/utils/assetHelpers";
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
    <div className="relative w-full lg:w-3/4 bg-[#131316] min-h-[600px] lg:min-h-[870px]">
      <div className="absolute inset-0 flex items-center justify-center p-8">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Asset ${asset.id}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <div className="text-gray-500 text-lg">No preview available</div>
        )}
      </div>
      <MetadataHUD
        resolution={resolution}
        fileSize={fileSize}
        fileType={fileType}
      />
    </div>
  );
}
