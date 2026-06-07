import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import type { OcrStatus } from "@/lib/types/api";

interface OCRTextSectionProps {
  ocr_snippet: string | null;
  ocr_status: OcrStatus;
}

export function OCRTextSection({
  ocr_snippet,
  ocr_status,
}: OCRTextSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
          Extracted OCR Text
        </h3>
        {ocr_status === "done" && ocr_snippet && (
          <Badge
            variant="default"
            className="flex items-center gap-1"
          >
            <CheckCircle className="size-3" />
            High Confidence
          </Badge>
        )}
      </div>

      {ocr_status === "done" && ocr_snippet && (
        <pre className="text-xs font-mono bg-muted border border-border rounded-lg p-4 overflow-x-auto whitespace-pre-wrap wrap-break-word">
          {ocr_snippet}
        </pre>
      )}

      {ocr_status === "done" && !ocr_snippet && (
        <p className="text-sm text-muted-foreground">No text detected in this image</p>
      )}

      {ocr_status === "pending" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4 animate-spin" />
          Processing...
        </div>
      )}

      {ocr_status === "failed" && (
        <p className="text-sm text-destructive">
          Text extraction failed for this image.
        </p>
      )}
    </div>
  );
}
