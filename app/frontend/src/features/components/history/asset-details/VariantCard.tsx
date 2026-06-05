import { Badge } from "@/components/ui/badge";
import type { UploadVariant } from "@/lib/types/api";
import { formatFileSize } from "@/lib/utils/fileSizeFormatter";

interface VariantCardProps {
  variant: UploadVariant;
  isRecommended?: boolean;
}

export function VariantCard({ variant, isRecommended }: VariantCardProps) {
  return (
    <div className="bg-[#131316] border border-white/5 px-4 py-3 rounded-lg hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="outline">{variant.format.toUpperCase()}</Badge>
        {isRecommended && (
          <Badge variant="default" className="bg-[#699cff]">
            Recommended
          </Badge>
        )}
      </div>
      <p className="text-sm text-gray-400">
        {formatFileSize(variant.size_bytes)}
      </p>
    </div>
  );
}
