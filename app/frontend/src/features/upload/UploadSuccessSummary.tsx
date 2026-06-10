import { Badge } from "@/components/ui/badge";
import type { OcrStatus, UploadResponse } from "@/lib/types/api";
import { Check } from "lucide-react";

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

/** Small uppercase mono label used for each receipt field. */
function FieldLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </p>
  );
}

export function UploadSuccessSummary({ response }: UploadSuccessSummaryProps) {
  const { asset_id, variants, ocr_status, ocr_snippet } = response;
  const showSnippet = ocr_snippet != null && ocr_snippet.trim().length > 0;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-primary/30 bg-primary/5"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 border-b border-primary/20 bg-primary/10 px-4 py-3">
        <div className="glow-primary flex size-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25">
          <Check className="size-5 text-primary" />
        </div>
        <div>
          <p className="font-heading font-semibold tracking-tight">
            Capture developed
          </p>
          <p className="text-xs text-muted-foreground">
            Stored, converted &amp; indexed.
          </p>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="space-y-1">
          <FieldLabel>Asset ID</FieldLabel>
          <p className="font-data text-sm break-all text-foreground">
            {asset_id}
          </p>
        </div>

        {variants.length > 0 && (
          <div className="space-y-1.5">
            <FieldLabel>Variants</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => (
                <Badge key={variant.s3_key} variant="outline">
                  {variant.format.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <FieldLabel>OCR status</FieldLabel>
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
          <div className="space-y-1.5">
            <FieldLabel>OCR snippet</FieldLabel>
            <p className="rounded-md border-l-[3px] border-primary/40 bg-muted/50 px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-muted-foreground">
              {ocr_snippet}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
