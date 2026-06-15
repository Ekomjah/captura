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
    <div className="flex h-full flex-col lg:flex-row">
      <AssetPreviewPane asset={asset} />
      <div className="flex w-full flex-col border-t border-border bg-card lg:w-80 lg:shrink-0 lg:border-t-0 lg:border-l xl:w-96">
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
