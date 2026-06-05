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
      <DialogContent className="!w-[80vw] !max-w-[1600px] h-auto max-h-[90vh]">
        <AssetDetailsModal asset={asset} />
      </DialogContent>
    </Dialog>
  );
};
