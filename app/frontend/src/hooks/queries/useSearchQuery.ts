import { queryKeys, searchAssets } from "@/lib/api/capturapi";
import { getApiError } from "@/lib/api/getApiError";
import { useQuery } from "@tanstack/react-query";

export const useSearchQuery = (
  query: string,
  starting_page: number = 1,
  page_size: number = 20,
) => {
  const trimmed = query.trim();
  const { isPending, isError, error, data, isFetching } = useQuery({
    queryKey: queryKeys.search(trimmed, starting_page, page_size),
    queryFn: () => searchAssets(trimmed, starting_page, page_size),
    enabled: trimmed.length > 0,
  });
  return {
    isPending,
    isError,
    error: getApiError(error),
    data,
    isFetching,
  };
};
