import { queryKeys, searchAssets } from "@/lib/api/capturapi";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/lib/api/getApiError";

export const useSearchQuery = (
  query: string,
  starting_page: number = 1,
  page_size: number = 20,
) => {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: queryKeys.search(query, starting_page, page_size),
    queryFn: () => searchAssets(query, starting_page, page_size),
  });
  return { isPending, error: getApiError(error), data, isFetching };
};
