import {
  Card,
  CardAction,
  CardContent,
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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface AssetCardProps extends React.HTMLAttributes<HTMLDivElement> {
  asset: AssetSummary;
  onDelete?: (asset: AssetSummary) => void;
}

export const AssetCard = forwardRef<HTMLDivElement, AssetCardProps>(
  ({ asset, onDelete, ...props }, ref) => {
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
        className="relative mx-auto w-full max-w-70 pt-0! cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 focus:ring-2 focus:ring-primary/50 outline-none"
      >
        {onDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(asset);
            }}
            aria-label={`Delete ${displayName}`}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
        <AssetCardThumbnail asset={asset} />
        <CardHeader>
          <CardAction>
            <AssetCardBadges asset={asset} />
          </CardAction>
          <CardTitle>{shortenText(displayName, 30)}</CardTitle>
          <CardDescription>
            <time className="text-xs text-muted-foreground block">
              {formattedDate}
            </time>
          </CardDescription>
        </CardHeader>
        {asset.ocr_snippet && (
          <CardContent className="mt-auto">
            <p className="bg-secondary/30 text-muted-foreground px-3 py-2.5 text-sm font-medium italic leading-relaxed border-l-3 border-primary/30 rounded">
              {shortenText(asset.ocr_snippet, 60)}
            </p>
          </CardContent>
        )}
      </Card>
    );
  },
);

AssetCard.displayName = "AssetCard";
