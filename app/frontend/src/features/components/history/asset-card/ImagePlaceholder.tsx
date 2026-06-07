import { Badge } from "@/components/ui/badge";
import { FileImage } from "lucide-react";

interface ImagePlaceholderProps {
  format?: string;
}

export function ImagePlaceholder({ format }: ImagePlaceholderProps) {
  return (
    <div className="aspect-video w-full bg-gradient-to-br from-muted to-card flex items-center justify-center relative">
      <FileImage className="size-16 text-muted-foreground/40" />
      {format && (
        <Badge variant="secondary" className="absolute bottom-2 right-2">
          {format.toUpperCase()}
        </Badge>
      )}
    </div>
  );
}
