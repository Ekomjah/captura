import type { AssetSummary } from "@/lib/types/api";
import { getDisplayName } from "@/lib/utils/assetHelpers";

interface AssetSidebarHeaderProps {
  asset: AssetSummary;
}

export function AssetSidebarHeader({ asset }: AssetSidebarHeaderProps) {
  const displayName = getDisplayName(asset);

  return (
    <div className="border-b border-border bg-card px-6 py-5">
      <h2 className="truncate font-heading text-lg font-semibold tracking-tight">
        {displayName}
      </h2>
    </div>
  );
}
