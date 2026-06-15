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
  const [isUploading, setIsUploading] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    // Don't let the dialog close while an upload is in flight.
    if (!nextOpen && isUploading) {
      return;
    }
    if (isControlled) {
      onOpenChange?.(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-lg sm:max-w-lg"
        closeDisabled={isUploading}
        onEscapeKeyDown={(e) => {
          if (isUploading) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (isUploading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-xl tracking-tight">
            Upload Image
          </DialogTitle>
          <DialogDescription>
            Upload a single image. Supported formats: JPEG, PNG, WebP.
          </DialogDescription>
        </DialogHeader>
        <UploadForm
          className="w-full"
          key={String(isOpen)}
          onPendingChange={setIsUploading}
        />
      </DialogContent>
    </Dialog>
  );
}
