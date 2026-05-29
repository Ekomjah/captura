type UploadErrorAlertProps = {
  message: string;
  errorCode?: string;
};

export function UploadErrorAlert({ message, errorCode }: UploadErrorAlertProps) {
  return (
    <div
      className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm"
      role="alert"
      aria-live="polite"
    >
      <p className="font-medium text-destructive">Upload failed</p>
      {errorCode && (
        <p className="text-xs text-muted-foreground mt-0.5">{errorCode}</p>
      )}
      <p className="text-muted-foreground mt-1">{message}</p>
    </div>
  );
}
