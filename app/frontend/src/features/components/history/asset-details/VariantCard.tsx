import { Badge } from "@/components/ui/badge";
import type { UploadVariant } from "@/lib/types/api";
import { formatFileSize } from "@/lib/utils/fileSizeFormatter";

interface VariantCardProps {
  variant: UploadVariant;
  isRecommended?: boolean;
}

export function VariantCard({ variant, isRecommended }: VariantCardProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{variant.format.toUpperCase()}</Badge>
        {isRecommended && <Badge variant="default">Recommended</Badge>}
      </div>
      <p className="font-data text-sm text-muted-foreground">
        {formatFileSize(variant.size_bytes)}
      </p>
    </div>
  );
}
