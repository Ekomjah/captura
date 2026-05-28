import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AssetSummary } from "@/lib/types/api";
import { AssetCardThumbnail } from "./AssetCardThumbnail";
import { AssetCardBadges } from "./AssetCardBadges";
import { getDisplayName } from "@/lib/utils/assetHelpers";
import { formatAssetDate } from "@/lib/utils/dateFormatter";
import { shortenText } from "@/lib/utils/textShortener";
import { forwardRef } from "react";

interface AssetCardProps extends React.HTMLAttributes<HTMLDivElement> {
  asset: AssetSummary;
}

export const AssetCard = forwardRef<HTMLDivElement, AssetCardProps>(
  ({ asset, ...props }, ref) => {
    const displayName = getDisplayName(asset);
    const formattedDate = asset.created_at
      ? formatAssetDate(asset.created_at)
      : asset.id;

    return (
      <Card
        ref={ref}
        role="button"
        tabIndex={0}
        {...props}
        className="relative mx-auto w-full max-w-70 cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 focus:ring-2 focus:ring-primary/50 outline-none"
      >
        <AssetCardThumbnail asset={asset} />
        <CardHeader>
          <CardAction>
            <AssetCardBadges asset={asset} />
          </CardAction>
          <CardTitle>{shortenText(displayName, 30)}</CardTitle>
          <CardDescription>
            <time className="text-xs text-muted-foreground block mb-2">
              {formattedDate}
            </time>
            {asset.ocr_snippet && (
              <p className="block bg-secondary/30 text-muted-foreground px-3 py-2.5 text-sm font-medium italic leading-relaxed border-l-3 border-primary/30 rounded">
                {shortenText(asset.ocr_snippet, 60)}
              </p>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
);

AssetCard.displayName = "AssetCard";
