import type { AssetSummary } from "@/lib/types/api";
import { getDisplayName } from "@/lib/utils/assetHelpers";

interface AssetSidebarHeaderProps {
  asset: AssetSummary;
}

export function AssetSidebarHeader({ asset }: AssetSidebarHeaderProps) {
  const displayName = getDisplayName(asset);

  return (
    <div className="bg-card px-6 py-4 border-b border-border">
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
        Asset Metadata
      </p>
      <h2 className="text-sm font-medium truncate">{displayName}</h2>
    </div>
  );
}
