import type { AssetSummary } from "@/lib/types/api";
import { getDisplayName } from "@/lib/utils/assetHelpers";

interface AssetSidebarHeaderProps {
  asset: AssetSummary;
}

export function AssetSidebarHeader({ asset }: AssetSidebarHeaderProps) {
  const displayName = getDisplayName(asset);

  return (
    <div className="bg-[#131316] px-6 py-4 border-b border-white/5">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
        Asset Metadata
      </p>
      <h2 className="text-sm font-medium truncate">{displayName}</h2>
    </div>
  );
}
