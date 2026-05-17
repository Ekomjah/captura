import { queryKeys, fetchAssets } from "@/lib/api/capturapi";
import { useQuery } from "@tanstack/react-query";

export const useHistoryQuery = (
  starting_page: number = 1,
  page_size: number = 20,
) => {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: queryKeys.history(starting_page, page_size),
    queryFn: () => fetchAssets(starting_page, page_size),
  });
  return { isPending, error, data, isFetching };
};






