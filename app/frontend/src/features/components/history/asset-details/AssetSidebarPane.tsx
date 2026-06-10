import type { AssetSummary } from "@/lib/types/api";
import { AssetSidebarHeader } from "./AssetSidebarHeader";
import type { ReactNode } from "react";

interface AssetSidebarPaneProps {
  asset: AssetSummary;
  children: ReactNode;
}

export function AssetSidebarPane({ asset, children }: AssetSidebarPaneProps) {
  return (
    <>
      <AssetSidebarHeader asset={asset} />
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {children}
      </div>
    </>
  );
}
