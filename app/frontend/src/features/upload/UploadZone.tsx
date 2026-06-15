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

const ACCEPTED_LABELS = ["JPEG", "PNG", "WebP"];

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
        "group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200",
        disabled && "cursor-not-allowed border-border/50 bg-muted/10 opacity-60",
        !disabled && "cursor-pointer",
        !disabled &&
          isDragActive &&
          "glow-primary scale-[1.01] border-primary bg-primary/5",
        !disabled &&
          !isDragActive &&
          "border-border hover:border-primary/50 hover:bg-muted/30",
      )}
    >
      <Input {...getInputProps()} />

      {/* Contact-sheet grid texture */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative flex flex-col items-center">
        <div
          className={cn(
            "mb-5 flex size-16 items-center justify-center rounded-2xl ring-1 transition-all duration-200",
            isDragActive
              ? "glow-primary scale-110 bg-primary/15 ring-primary/30"
              : "bg-primary/10 ring-primary/20 group-hover:bg-primary/15",
          )}
        >
          <CloudUpload className="size-7 text-primary" />
        </div>

        {isDragActive ? (
          <p className="font-heading text-lg font-semibold tracking-tight">
            Drop to develop
          </p>
        ) : (
          <>
            <p className="font-heading text-lg font-semibold tracking-tight">
              Drag a capture here
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or <span className="text-primary">browse</span> to select a file
            </p>
            <div className="mt-5 flex items-center gap-1.5">
              {ACCEPTED_LABELS.map((label) => (
                <span
                  key={label}
                  className="rounded-md border border-border/70 bg-card/60 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground"
                >
                  {label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
