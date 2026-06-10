import type { AssetSummary } from "@/lib/types/api";
import { getDisplayName } from "@/lib/utils/assetHelpers";

interface AssetSidebarHeaderProps {
  asset: AssetSummary;
}

export function AssetSidebarHeader({ asset }: AssetSidebarHeaderProps) {
  const displayName = getDisplayName(asset);

  return (
    <div className="border-b border-border bg-card px-6 py-5">
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Asset Metadata
      </p>
      <h2 className="truncate font-heading text-lg font-semibold tracking-tight">
        {displayName}
      </h2>
    </div>
  );
}
