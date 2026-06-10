import { formatFileSize } from "@/lib/utils/fileSizeFormatter";
import { shortenText } from "@/lib/utils/textShortener";

type UploadFilePreviewProps = {
  previewUrl: string;
  selectedFile: File;
};

export function UploadFilePreview({
  previewUrl,
  selectedFile,
}: UploadFilePreviewProps) {
  const fileType = selectedFile.type
    ? selectedFile.type.replace("image/", "")
    : "unknown";

  return (
    <div className="flex w-full items-center gap-4 rounded-2xl border border-border bg-muted/40 p-3">
      <div className="size-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/60">
        <img
          src={previewUrl}
          alt="Preview"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            Ready to develop
          </span>
        </div>
        <p className="truncate text-sm font-semibold" title={selectedFile.name}>
          {shortenText(selectedFile.name, 32)}
        </p>
        <div className="flex flex-wrap items-center gap-2 font-data text-xs text-muted-foreground">
          <span>{formatFileSize(selectedFile.size)}</span>
          <span aria-hidden>•</span>
          <span className="uppercase">{fileType}</span>
        </div>
      </div>
    </div>
  );
}
