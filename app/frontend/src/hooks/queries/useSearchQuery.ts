import { capturaKey, searchAssets } from "@/lib/api/capturapi";
import { useQuery } from "@tanstack/react-query";

export const useSearchQuery = (
  query: string,
  starting_page: number = 1,
  page_size: number = 20,
) => {
  return useQuery({
    queryKey: [...capturaKey(), starting_page, page_size],
    queryFn: () => searchAssets(query, starting_page, page_size),
  });
};
