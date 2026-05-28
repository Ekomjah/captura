import { OcrStatusBadge } from "../badges/OcrStatusBadge";
import { VariantBadge } from "../badges/VariantBadge";
import type { AssetSummary } from "@/lib/types/api";

interface AssetCardBadgesProps {
  asset: AssetSummary;
}

export function AssetCardBadges({ asset }: AssetCardBadgesProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      <OcrStatusBadge status={asset.ocr_status} />
      <VariantBadge variants={asset.variants} />
    </div>
  );
}
