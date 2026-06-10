type UploadErrorAlertProps = {
  message: string;
  errorCode?: string;
};

export function UploadErrorAlert({ message, errorCode }: UploadErrorAlertProps) {
  return (
    <div
      className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm"
      role="alert"
      aria-live="polite"
    >
      <p className="font-roboto-mono text-xs uppercase tracking-[0.08em] text-destructive">
        [ Upload Failed ]
      </p>
      {errorCode && (
        <p className="font-mono text-xs text-muted-foreground mt-0.5">{errorCode}</p>
      )}
      <p className="text-muted-foreground mt-1">{message}</p>
    </div>
  );
}
