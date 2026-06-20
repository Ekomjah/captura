import { TriangleAlert } from "lucide-react";

type UploadErrorAlertProps = {
  message: string;
  errorCode?: string;
};

export function UploadErrorAlert({ message, errorCode }: UploadErrorAlertProps) {
  return (
    <div
      className="flex gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
      role="alert"
      aria-live="polite"
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="space-y-0.5">
        <p className="font-medium text-destructive">Upload failed</p>
        {errorCode && (
          <p className="font-data text-xs text-muted-foreground">{errorCode}</p>
        )}
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
