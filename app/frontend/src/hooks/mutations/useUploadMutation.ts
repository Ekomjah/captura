import { queryKeys, uploadAsset } from "@/lib/api/capturapi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AssetSummary, PaginatedAssetsResponse } from "@/lib/types/api";
import { getApiError } from "@/lib/api/getApiError";

export const useUploadMutation = (file: File) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.upload(file.name),
    mutationFn: () => uploadAsset(file),
    retry: 3,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.history(1, 20) });

      const previous = queryClient.getQueryData<PaginatedAssetsResponse>(
        queryKeys.history(1, 20),
      );

      const tempId = crypto.randomUUID();
      const optimisticAsset: AssetSummary = {
        id: tempId,
        created_at: new Date().toISOString(),
        s3_key: "",
        thumbnail_url: "",
        ocr_snippet: null,
        ocr_status: "pending",
        variants: [],
      };

      queryClient.setQueryData(
        queryKeys.history(1, 20),
        (old?: PaginatedAssetsResponse) => ({
          ...old,
          images: [optimisticAsset, ...(old?.images ?? [])],
          total: (old?.total ?? 0) + 1,
          page: old?.page ?? 1,
          page_size: old?.page_size ?? 20,
        }),
      );

      return { previous, tempId };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.history(1, 20), context.previous);
      }
      const apiError = getApiError(_error);
      console.error(
        "Upload failed:",
        apiError?.detail ?? "An unknown error occurred.",
      );
    },
    onSuccess: (data, _variables, context) => {
      queryClient.setQueryData(
        queryKeys.history(1, 20),
        (old?: PaginatedAssetsResponse) =>
          old
            ? {
                ...old,
                images: old.images.map((asset) =>
                  asset.id === context?.tempId
                    ? {
                        ...asset,
                        id: data.asset_id,
                        s3_key: data.s3_key,
                        ocr_status: data.ocr_status,
                        ocr_snippet: data.ocr_snippet,
                        variants: data.variants,
                      }
                    : asset,
                ),
              }
            : old,
      );
    },
  });
};
