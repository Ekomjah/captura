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
        "w-full p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors",
        disabled
          ? "cursor-not-allowed opacity-60 border-border bg-surface-raised/10"
          : "cursor-pointer",
        !disabled && isDragActive && "border-signal bg-signal/5",
        !disabled && !isDragActive && "border-input bg-surface-raised/30",
      )}
    >
      <Input {...getInputProps()} />
      <div className="bg-surface-raised p-8 rounded-full mb-4">
        <CloudUpload size={64} className="text-text-secondary" />
      </div>
      {isDragActive ? (
        <p className="font-medium text-muted-foreground">Drop the image here</p>
      ) : (
        <div className="font-medium text-muted-foreground flex flex-col items-center justify-center gap-2 text-center">
          <p>Drag an image here, or click to select a file</p>
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-disabled">
            One image per upload
          </span>
        </div>
      )}
    </div>
  );
}
