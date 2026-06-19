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
        className="group/card relative mx-auto w-full max-w-70 pt-0! cursor-pointer outline-none hover:-translate-y-1 hover:ring-2 hover:ring-primary/60 hover:shadow-[0_24px_48px_-24px_oklch(0_0_0/0.4)] focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        {onDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-2.5 right-2.5 z-10 border border-border/60 bg-background/70 backdrop-blur-md transition-opacity hover:bg-destructive/10 hover:text-destructive [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/card:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
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
          <CardTitle className="truncate">
            {shortenText(displayName, 30)}
          </CardTitle>
          <CardDescription>
            <time className="font-data block text-xs text-muted-foreground">
              {formattedDate}
            </time>
          </CardDescription>
        </CardHeader>
        {asset.ocr_text && (
          <CardContent className="mt-auto">
            <p className="rounded-md border-l-[3px] border-primary/40 bg-muted/50 px-3 py-2.5 text-sm font-medium italic leading-relaxed text-muted-foreground">
              {shortenText(asset.ocr_text, 60)}
            </p>
          </CardContent>
        )}
      </Card>
    );
  },
);

AssetCard.displayName = "AssetCard";
