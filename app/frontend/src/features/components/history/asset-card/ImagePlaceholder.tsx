import { Badge } from "@/components/ui/badge";
import { FileImage } from "lucide-react";

interface ImagePlaceholderProps {
  format?: string;
}

export function ImagePlaceholder({ format }: ImagePlaceholderProps) {
  return (
    <div className="aspect-video w-full bg-surface-raised dot-grid flex items-center justify-center relative">
      <FileImage className="size-16 text-text-disabled" />
      {format && (
        <Badge variant="secondary" className="absolute bottom-2 right-2">
          {format.toUpperCase()}
        </Badge>
      )}
    </div>
  );
}
