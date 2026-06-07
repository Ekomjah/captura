import { queryKeys, deleteAsset } from "@/lib/api/capturapi";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

export function useDeleteMutation(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => deleteAsset(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.all(), "history"],
      });
    },
    onError: (error) => {
      console.error("Delete failed:", error);
    },
  });
}
