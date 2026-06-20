import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AssetDetailsModal } from "../asset-details/AssetDetailsModal";
import type { AssetSummary } from "@/lib/types/api";
import type { ReactNode } from "react";

interface AssetDialogProps {
  asset: AssetSummary;
  children: ReactNode;
}

export const AssetDialog = ({ asset, children }: AssetDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[85vw]! max-w-400! h-[85vh] max-h-[90vh] gap-0 overflow-hidden p-0">
        <AssetDetailsModal asset={asset} />
      </DialogContent>
    </Dialog>
  );
};
