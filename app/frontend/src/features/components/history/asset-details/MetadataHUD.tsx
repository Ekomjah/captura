import { Separator } from "@/components/ui/separator";

interface MetadataHUDProps {
  resolution: string;
  fileSize: string;
  fileType: string;
}

export function MetadataHUD({ resolution, fileSize, fileType }: MetadataHUDProps) {
  return (
    <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-lg border border-white/10 bg-black/45 px-4 py-2.5 backdrop-blur-md">
      <span className="font-data text-xs text-white/85">{resolution}</span>
      <Separator orientation="vertical" className="h-3.5 bg-white/20" />
      <span className="font-data text-xs text-white/85">{fileSize}</span>
      <Separator orientation="vertical" className="h-3.5 bg-white/20" />
      <span className="font-data text-xs uppercase text-white/85">
        {fileType}
      </span>
    </div>
  );
}
