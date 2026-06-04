import { useState } from "react";
import { Card } from "@/components/ui/card";
import { AssetDialog } from "@/features/components/history/dialog/AssetDialog";
import { AssetCardBadges } from "@/features/components/history/asset-card/AssetCardBadges";
import { ImagePlaceholder } from "@/features/components/history/asset-card/ImagePlaceholder";
import { HighlightedText } from "./HighlightedText";
import {
  getDisplayName,
  getFileType,
  getPreviewUrl,
  getTotalSize,
} from "@/lib/utils/assetHelpers";
import { formatAssetDate } from "@/lib/utils/dateFormatter";
import type { SearchHit } from "@/lib/types/api";

/**
 * A horizontal, full-width search result: a square thumbnail on the left and a
 * column of metadata + the matched OCR context on the right. Clicking anywhere
 * opens the asset's details modal via {@link AssetDialog}.
 */
export function SearchResultCard({ hit }: { hit: SearchHit }) {
  const { asset, matched_text, match_context } = hit;
  const [imgError, setImgError] = useState(false);

  const displayName = getDisplayName(asset);
  const previewUrl = getPreviewUrl(asset);
  const totalSizeMb = getTotalSize(asset.variants) / 1024 / 1024;
  const context = match_context ?? matched_text;

  return (
    <AssetDialog asset={asset}>
      <Card
        role="button"
        tabIndex={0}
        className="flex w-full cursor-pointer flex-row items-stretch gap-4 rounded-2xl p-3 outline-none transition-all hover:ring-2 hover:ring-primary/50 focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {/* Thumbnail */}
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted sm:size-28">
          {previewUrl && !imgError ? (
            <img
              src={previewUrl}
              alt={displayName}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <ImagePlaceholder format={getFileType(asset)} />
          )}
        </div>

        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h3
              className="truncate font-semibold text-foreground"
              title={displayName}
            >
              {displayName}
            </h3>
            <time className="shrink-0 text-xs text-muted-foreground">
              {formatAssetDate(asset.created_at)}
            </time>
          </div>

          {/* Matched OCR context with the search term highlighted */}
          <p className="line-clamp-2 rounded border-l-3 border-primary/30 bg-secondary/30 px-3 py-2 text-sm italic leading-relaxed text-muted-foreground">
            <HighlightedText text={context} query={matched_text} />
          </p>

          {/* Metadata */}
          <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <AssetCardBadges asset={asset} />
            {totalSizeMb > 0 && (
              <>
                <span aria-hidden>•</span>
                <span>{totalSizeMb.toFixed(2)} MB</span>
              </>
            )}
          </div>
        </div>
      </Card>
    </AssetDialog>
  );
}
