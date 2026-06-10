import { Badge } from "@/components/ui/badge";
import type { UploadVariant } from "@/lib/types/api";
import { formatFileSize } from "@/lib/utils/fileSizeFormatter";

interface VariantCardProps {
  variant: UploadVariant;
  isRecommended?: boolean;
}

export function VariantCard({ variant, isRecommended }: VariantCardProps) {
  return (
    <div className="bg-surface-raised border border-border px-4 py-3 rounded-lg hover:border-border-visible transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="outline">{variant.format.toUpperCase()}</Badge>
        {isRecommended && (
          <Badge variant="default">
            Recommended
          </Badge>
        )}
      </div>
      <p className="font-mono text-xs text-text-secondary">
        {formatFileSize(variant.size_bytes)}
      </p>
    </div>
  );
}
