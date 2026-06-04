import { Badge } from "@/components/ui/badge";
import { FileImage } from "lucide-react";

interface ImagePlaceholderProps {
  format?: string;
}

export function ImagePlaceholder({ format }: ImagePlaceholderProps) {
  return (
    <div className="aspect-video w-full bg-gradient-to-br from-[#19191d] to-[#131316] flex items-center justify-center relative">
      <FileImage className="size-16 text-gray-600" />
      {format && (
        <Badge variant="secondary" className="absolute bottom-2 right-2">
          {format.toUpperCase()}
        </Badge>
      )}
    </div>
  );
}
