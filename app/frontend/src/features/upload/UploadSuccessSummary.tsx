import { Badge } from "@/components/ui/badge";
import type { OcrStatus, UploadResponse } from "@/lib/types/api";
import { cn } from "@/lib/utils";

type UploadSuccessSummaryProps = {
  response: UploadResponse;
};

const ocrStatusLabel: Record<OcrStatus, string> = {
  pending: "OCR pending",
  done: "OCR done",
  failed: "OCR failed",
};

const ocrStatusBadgeVariant: Record<
  OcrStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  done: "default",
  failed: "destructive",
};

export function UploadSuccessSummary({ response }: UploadSuccessSummaryProps) {
  const { asset_id, variants, ocr_status, ocr_snippet } = response;
  const showSnippet =
    ocr_snippet != null && ocr_snippet.trim().length > 0;

  return (
    <div
      className="rounded-lg border border-signal/30 bg-signal/5 px-4 py-4 space-y-3"
      role="status"
      aria-live="polite"
    >
      <p className="font-semibold text-foreground">Upload successful</p>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Asset ID
        </p>
        <p className="font-mono text-sm break-all">{asset_id}</p>
      </div>

      {variants.length > 0 && (
        <div className="space-y-1">
          <p className="font-mono text-[11px] text-text-secondary uppercase tracking-[0.08em]">
            Variants
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <Badge key={variant.s3_key} variant="secondary">
                {variant.format.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          OCR status
        </p>
        <Badge variant={ocrStatusBadgeVariant[ocr_status]}>
          {ocrStatusLabel[ocr_status]}
        </Badge>
        {ocr_status === "failed" && (
          <p className="text-sm text-muted-foreground">
            Upload succeeded; text extraction failed.
          </p>
        )}
      </div>

      {showSnippet && (
        <div className="space-y-1">
          <p className="font-mono text-[11px] text-text-secondary uppercase tracking-[0.08em]">
            OCR snippet
          </p>
          <p
            className={cn(
              "font-mono text-xs rounded-md bg-surface-raised/50 px-3 py-2",
              "whitespace-pre-wrap break-words",
            )}
          >
            {ocr_snippet}
          </p>
        </div>
      )}
    </div>
  );
}
