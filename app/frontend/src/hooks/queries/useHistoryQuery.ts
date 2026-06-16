import { queryKeys, fetchAssets } from "@/lib/api/capturapi";
import { getApiError } from "@/lib/api/getApiError";
import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";

export const useHistoryQuery = (
  starting_page: number = 1,
  page_size: number = 20,
) => {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const { isPending, isError, error, data, isFetching } = useQuery({
    queryKey: queryKeys.history(userId, starting_page, page_size),
    queryFn: () => fetchAssets(getToken, starting_page, page_size),
    enabled: isLoaded && !!isSignedIn,
  });
  return {
    isPending,
    isError,
    error: getApiError(error),
    data,
    isFetching,
  };
};
