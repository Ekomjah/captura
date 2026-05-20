import { formatFileSize } from "@/lib/utils/fileSizeFormatter";
import { shortenText } from "@/lib/utils/textShortener";
export const AssetUploadPreview = ({
  previewUrl,
  selectedFile,
}: {
  previewUrl: string;
  selectedFile?: File | null;
}) => {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="shrink-0">
          <img
            src={previewUrl!}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-md"
          />
        </div>
        <div className="grow flex flex-col justify-center gap-1">
          <p className="font-semibold text-sm truncate">
            {shortenText(selectedFile?.name || "", 30)}
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedFile && formatFileSize(selectedFile.size)}
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedFile?.type || "Unknown type"}
          </p>
        </div>
      </div>
    </div>
  );
};
