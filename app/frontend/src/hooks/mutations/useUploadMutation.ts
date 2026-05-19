import { queryKeys, uploadAsset } from "@/lib/api/capturapi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiError } from "@/lib/api/getApiError";

export const useUploadMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAsset(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.history(1, 20) });
      onSuccess?.();
      console.log("Asset uploaded successfully.");
    },
    onError: (error) => {
      const apiError = getApiError(error);
      console.error(apiError?.detail ?? "An unknown error occurred.");
    },
  });
};
