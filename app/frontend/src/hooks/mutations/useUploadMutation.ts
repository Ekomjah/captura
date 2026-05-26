import { queryKeys, uploadAsset } from "@/lib/api/capturapi";
import type { UploadResponse } from "@/lib/types/api";
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

  return useMutation({
    mutationFn: (file: File) => uploadAsset(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all() });
      options?.onSuccess?.(data);
    },
  });
}
