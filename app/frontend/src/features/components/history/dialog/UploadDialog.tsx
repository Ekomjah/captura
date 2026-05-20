import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, CloudUpload, LoaderCircle, RotateCcw } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useUploadMutation } from "@/hooks/mutations/useUploadMutation";
import { useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AssetUploadPreview } from "./UploadPreview";
import { toast } from "sonner";

interface OnDropCallback {
  (acceptedFiles: File[]): void;
}

export const UploadDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { mutate, isPending, isError, isSuccess } = useUploadMutation(() =>
    setOpen(false),
  );

  useEffect(() => {
    if (isSuccess) {
      toast.success("Asset uploaded successfully!");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to upload asset. Please try again.");
    }
  }, [isError]);

  const onDrop = useCallback<OnDropCallback>((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(url);
    }
  }, []);

  const onCancel = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setOpen(false);
  }, [previewUrl]);

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFile) {
      mutate(selectedFile);
    }
  };

  const handleDialogOpenChange = (val: boolean) => {
    if (!val && !isPending) {
      onCancel();
    } else if (val) {
      setOpen(val);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="bg-linear-to-b from-white via-gray-100 to-gray-300 text-gray-900 border border-gray-400 shadow-sm hover:from-gray-100 hover:to-gray-400 dark:from-gray-700 dark:via-gray-800 dark:to-gray-950 dark:text-white dark:border-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-900 rounded-md p-6"
        >
          <Plus />
          New Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm lg:max-w-2xl w-full">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">
              Upload Asset
            </DialogTitle>
          </DialogHeader>

          {/* Dropzone or Preview */}
          {!selectedFile ? (
            // Dropzone View
            <div
              {...getRootProps()}
              className={cn(
                "w-full p-8 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors",
                {
                  "border-primary bg-primary/5": isDragActive,
                  "border-muted-foreground/30 bg-muted/20": !isDragActive,
                },
              )}
            >
              <Input {...getInputProps()} />
              <div className="bg-linear-to-b from-muted-foreground/40 to-muted-foreground/20 dark:from-muted-foreground/50 dark:to-muted-foreground/30 p-8 rounded-full mb-4">
                <CloudUpload size={100} color="currentColor" />
              </div>
              {isDragActive ? (
                <p className="font-medium text-gray-500">
                  Drop the files here ...
                </p>
              ) : (
                <div className="font-medium text-gray-500 flex flex-col items-center justify-center gap-2">
                  <p>Drag an asset here;</p>
                  <Button variant="secondary" className="rounded">
                    Or click to select a file
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <AssetUploadPreview
              previewUrl={previewUrl!}
              selectedFile={selectedFile}
            />
          )}

          <DialogFooter className="flex gap-2 mt-4 justify-end">
            {selectedFile && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={!selectedFile || isPending}>
              {isPending ? (
                <div className="gap-2 flex items-center">
                  <LoaderCircle className="animate-spin" />{" "}
                  <div>Uploading...</div>
                </div>
              ) : (
                "Upload Asset"
              )}
            </Button>
            {isError && (
              <Button
                variant="destructive"
                onClick={() => mutate(selectedFile!)}
              >
                <RotateCcw />
                Retry
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
