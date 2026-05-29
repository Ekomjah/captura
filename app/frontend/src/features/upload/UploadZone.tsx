import { Input } from "@/components/ui/input";
import { CloudUpload } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { UploadFilePreview } from "./UploadFilePreview";

type UploadZoneProps = {
  disabled?: boolean;
  selectedFile: File | null;
  previewUrl: string | null;
  onFileSelected: (file: File, previewUrl: string) => void;
};

export function UploadZone({
  disabled = false,
  selectedFile,
  previewUrl,
  onFileSelected,
}: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileSelected(file, URL.createObjectURL(file));
      }
    },
    [onFileSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    disabled,
  });

  if (selectedFile && previewUrl) {
    return (
      <div className="w-full">
        <UploadFilePreview previewUrl={previewUrl} selectedFile={selectedFile} />
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "w-full p-8 border-2 border-dashed rounded-md flex flex-col items-center justify-center transition-colors",
        disabled
          ? "cursor-not-allowed opacity-60 border-muted-foreground/20 bg-muted/10"
          : "cursor-pointer",
        !disabled && isDragActive && "border-primary bg-primary/5",
        !disabled &&
          !isDragActive &&
          "border-muted-foreground/30 bg-muted/20",
      )}
    >
      <Input {...getInputProps()} />
      <div className="bg-linear-to-b from-muted-foreground/40 to-muted-foreground/20 dark:from-muted-foreground/50 dark:to-muted-foreground/30 p-8 rounded-full mb-4">
        <CloudUpload size={64} color="currentColor" />
      </div>
      {isDragActive ? (
        <p className="font-medium text-muted-foreground">Drop the image here</p>
      ) : (
        <div className="font-medium text-muted-foreground flex flex-col items-center justify-center gap-2 text-center">
          <p>Drag an image here, or click to select a file</p>
          <span className="text-sm text-muted-foreground/80">
            One image per upload
          </span>
        </div>
      )}
    </div>
  );
}
