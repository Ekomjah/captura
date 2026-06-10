import { Button } from "@/components/ui/button";
import { ImagePlus, Images } from "lucide-react";

interface EmptyHistoryStateProps {
  onUploadClick: () => void;
}

export function EmptyHistoryState({ onUploadClick }: EmptyHistoryStateProps) {
  return (
    <div className="relative flex min-h-110 flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border bg-card/40 px-6 text-center">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative flex flex-col items-center">
        <div className="glow-primary mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <ImagePlus className="size-9 text-primary" />
        </div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          No assets yet
        </h2>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Upload your first screenshot to develop it into a searchable,
          multi-format cloud asset.
        </p>
        <Button size="lg" onClick={onUploadClick} className="mt-7">
          <Images className="mr-2" />
          Upload Image
        </Button>
      </div>
    </div>
  );
}
