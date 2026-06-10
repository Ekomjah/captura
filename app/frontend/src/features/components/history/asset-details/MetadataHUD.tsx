import { Separator } from "@/components/ui/separator";

interface MetadataHUDProps {
  resolution: string;
  fileSize: string;
  fileType: string;
}

export function MetadataHUD({ resolution, fileSize, fileType }: MetadataHUDProps) {
  return (
    <div className="absolute bottom-4 left-4 flex items-center gap-3 px-4 py-3 bg-background/70 backdrop-blur-md border border-border-visible rounded-lg">
      <span className="font-mono text-xs text-text-secondary">{resolution}</span>
      <Separator orientation="vertical" className="h-4" />
      <span className="font-mono text-xs text-text-secondary">{fileSize}</span>
      <Separator orientation="vertical" className="h-4" />
      <span className="font-mono text-xs text-text-secondary">{fileType}</span>
    </div>
  );
}
