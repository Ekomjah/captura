import { queryKeys, uploadAsset } from "@/lib/api/capturapi";
import type { UploadResponse } from "@/lib/types/api";
import { useAuth } from "@clerk/react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

export type UseUploadMutationOptions = {
  onSuccess?: (data: UploadResponse) => void;
};

export function useUploadMutation(
  options?: UseUploadMutationOptions,
): UseMutationResult<UploadResponse, Error, File> {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: (file: File) => uploadAsset(getToken, file),
    onSuccess: (data) => {
      // Invalidate only history queries, not search or other queries
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.all(userId), "history"],
      });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
  });
}
