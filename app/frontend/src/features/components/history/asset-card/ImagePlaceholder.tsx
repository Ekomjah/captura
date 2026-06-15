import { Badge } from "@/components/ui/badge";
import { FileImage } from "lucide-react";

interface ImagePlaceholderProps {
  format?: string;
}

export function ImagePlaceholder({ format }: ImagePlaceholderProps) {
  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-linear-to-br from-muted to-card">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <FileImage className="relative size-14 text-muted-foreground/40" />
      {format && (
        <Badge variant="secondary" className="absolute bottom-2 right-2">
          {format.toUpperCase()}
        </Badge>
      )}
    </div>
  );
}
