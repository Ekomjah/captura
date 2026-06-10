import { Button } from "@/components/ui/button";
import { Images } from "lucide-react";

interface EmptyHistoryStateProps {
  onUploadClick: () => void;
}

export function EmptyHistoryState({ onUploadClick }: EmptyHistoryStateProps) {
  return (
    <div className="text-center flex flex-col items-center justify-center min-h-100 rounded-xl border border-border dot-grid">
      <Images className="size-12 text-text-disabled mb-4" />
      <h2 className="text-xl font-medium text-text-secondary mb-2">
        No assets yet
      </h2>
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-text-disabled mb-6">
        Upload your first image to get started
      </p>
      <Button onClick={onUploadClick}>
        <Images className="mr-2" />
        Upload Image
      </Button>
    </div>
  );
}
