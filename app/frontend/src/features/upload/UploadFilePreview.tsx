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
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="shrink-0">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-md border border-border"
          />
        </div>
        <div className="grow flex flex-col justify-center gap-1">
          <p className="font-semibold text-sm truncate">
            {shortenText(selectedFile.name, 30)}
          </p>
          <p className="font-mono text-xs text-text-secondary">
            {formatFileSize(selectedFile.size)}
          </p>
          <p className="font-mono text-xs text-text-secondary">
            {selectedFile.type || "Unknown type"}
          </p>
        </div>
      </div>
    </div>
  );
}
