import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadForm } from "./UploadForm";

type UploadModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function UploadModal({
  open: controlledOpen,
  onOpenChange,
}: UploadModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-lg">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
          <DialogDescription>
            Upload a single image. Supported formats: JPEG, PNG, WebP.
          </DialogDescription>
        </DialogHeader>
        <UploadForm
          className="w-full"
          onSuccess={() => {
            // Keep modal open after success so user can see the summary
            // They can click the "Upload another" button or close the modal
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
