import type { UploadVariant } from "@/lib/types/api";
import { VariantCard } from "./VariantCard";

interface VariantsSectionProps {
  variants: UploadVariant[];
}

export function VariantsSection({ variants }: VariantsSectionProps) {
  const validVariants = variants.filter((v) => v.size_bytes > 0);

  return (
    <div className="space-y-3">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">
        Variants
      </h3>
      {validVariants.length > 0 ? (
        <div className="space-y-2">
          {validVariants.map((variant) => (
            <VariantCard
              key={variant.s3_key}
              variant={variant}
              isRecommended={variant.format === "webp"}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No optimized variants available</p>
      )}
    </div>
  );
}
