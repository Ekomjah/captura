import { queryKeys, deleteAsset } from "@/lib/api/capturapi";
import { useAuth } from "@clerk/react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

export function useDeleteMutation(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: (assetId: string) => deleteAsset(getToken, assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.all(userId), "history"],
      });
    },
    onError: (error) => {
      console.error("Delete failed:", error);
    },
  });
}
