import { Button } from "@/components/ui/button";
import { useUploadMutation } from "@/hooks/mutations/useUploadMutation";
import { getApiError } from "@/lib/api/getApiError";
import type { UploadResponse } from "@/lib/types/api";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { UploadErrorAlert } from "./UploadErrorAlert";
import { UploadSuccessSummary } from "./UploadSuccessSummary";
import { UploadZone } from "./UploadZone";

type UploadFormProps = {
  className?: string;
  onSuccess?: (response: UploadResponse) => void;
};

export function UploadForm({ className, onSuccess }: UploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    mutate,
    isPending,
    isError,
    isSuccess,
    error,
    data,
    reset: resetMutation,
  } = useUploadMutation({
    onSuccess,
  });

  const clearSelection = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [previewUrl]);

  const handleReset = useCallback(() => {
    clearSelection();
    resetMutation();
  }, [clearSelection, resetMutation]);

  const handleFileSelected = useCallback(
    (file: File, url: string) => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (isSuccess || isError) {
        resetMutation();
      }
      setSelectedFile(file);
      setPreviewUrl(url);
    },
    [previewUrl, isSuccess, isError, resetMutation],
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFile && !isPending) {
      mutate(selectedFile);
    }
  };

  const handleRetry = () => {
    if (selectedFile && !isPending) {
      mutate(selectedFile);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const apiError = isError ? getApiError(error) : null;
  const errorMessage =
    apiError?.detail ??
    "Upload failed. Please try again with a valid image file.";

  const showForm = !isSuccess || !data;

  return (
    <div className={className}>
      {isSuccess && data && (
        <div className="space-y-4 mb-4">
          <UploadSuccessSummary response={data} />
          <Button type="button" variant="outline" onClick={handleReset}>
            Upload another
          </Button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <UploadZone
            disabled={isPending}
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onFileSelected={handleFileSelected}
          />

          {isError && (
            <UploadErrorAlert
              message={errorMessage}
              errorCode={apiError?.error}
            />
          )}

          <div className="flex flex-wrap gap-2 justify-end">
            {selectedFile && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isPending}
              >
                Clear
              </Button>
            )}
            {isError && selectedFile && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRetry}
                disabled={isPending}
              >
                <RotateCcw className="size-4" />
                Retry
              </Button>
            )}
            {!isError && selectedFile && (
              <Button type="submit" disabled={!selectedFile || isPending}>
                {isPending && !isError ? (
                  <span className="gap-2 flex items-center">
                    <LoaderCircle className="size-4 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  "Upload"
                )}
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
