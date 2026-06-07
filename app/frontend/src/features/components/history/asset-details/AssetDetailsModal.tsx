import type { AssetSummary } from "@/lib/types/api";
import { AssetPreviewPane } from "./AssetPreviewPane";
import { AssetSidebarPane } from "./AssetSidebarPane";
import { VariantsSection } from "./VariantsSection";
import { OCRTextSection } from "./OCRTextSection";
import { ActionFooter } from "./ActionFooter";
import { Separator } from "@/components/ui/separator";

interface AssetDetailsModalProps {
  asset: AssetSummary;
}

export function AssetDetailsModal({ asset }: AssetDetailsModalProps) {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center h-full">
      <AssetPreviewPane asset={asset} />
      <div className="w-full lg:w-1/4 bg-card flex flex-col">
        <AssetSidebarPane asset={asset}>
          <VariantsSection variants={asset.variants} />
          <Separator />
          <OCRTextSection
            ocr_snippet={asset.ocr_snippet}
            ocr_status={asset.ocr_status}
          />
        </AssetSidebarPane>
        <ActionFooter asset={asset} />
      </div>
    </div>
  );
}
