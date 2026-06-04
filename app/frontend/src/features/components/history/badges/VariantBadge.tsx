import { Badge } from "@/components/ui/badge";
import type { UploadVariant } from "@/lib/types/api";

interface VariantBadgeProps {
  variants: UploadVariant[];
}

export function VariantBadge({ variants }: VariantBadgeProps) {
  const validVariants = variants.filter((v) => v.size_bytes > 0);

  if (validVariants.length === 0) return null;

  const label =
    validVariants.length === 1
      ? validVariants[0].format.toUpperCase()
      : `${validVariants.length} variants`;

  return <Badge variant="outline">{label}</Badge>;
}
