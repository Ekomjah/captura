import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, CloudUpload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useUploadMutation } from "@/hooks/mutations/useUploadMutation";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
interface OnDropCallback {
  (acceptedFiles: File[]): void;
}

export const UploadDialog = () => {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useUploadMutation(() => setOpen(false));

  const onDrop = useCallback<OnDropCallback>(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        mutate(file);
      }
    },
    [mutate],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  return (
    <Dialog open={open} onOpenChange={(val) => !isPending && setOpen(val)}>
      <form>
        <DialogTrigger asChild>
          <Button className="bg-linear-to-b from-white via-gray-100 to-gray-300 text-gray-900 border border-gray-400 shadow-sm hover:from-gray-100 hover:to-gray-400 dark:from-gray-700 dark:via-gray-800 dark:to-gray-950 dark:text-white dark:border-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-900 rounded-md p-6">
            <Plus />
            New Asset
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm lg:max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">
              Upload Asset
            </DialogTitle>
          </DialogHeader>
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
                <p>Or click to select a file</p>
                <Button variant="secondary" className="rounded">
                  Add Asset
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
};
