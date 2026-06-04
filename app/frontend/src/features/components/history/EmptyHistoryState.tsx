import { Button } from "@/components/ui/button";
import { Images } from "lucide-react";

interface EmptyHistoryStateProps {
  onUploadClick: () => void;
}

export function EmptyHistoryState({ onUploadClick }: EmptyHistoryStateProps) {
  return (
    <div className="text-center flex flex-col items-center justify-center min-h-[400px]">
      <Images className="size-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">No assets yet</h2>
      <p className="text-muted-foreground mb-6">
        Upload your first image to get started
      </p>
      <Button onClick={onUploadClick}>
        <Images className="mr-2" />
        Upload Image
      </Button>
    </div>
  );
}
