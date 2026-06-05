import { useState } from "react";
import { useSearchParams } from "react-router";
import { useSearchQuery } from "@/hooks/queries/useSearchQuery";
import { HistoryPagination } from "@/features/components/history/HistoryPagination";
import ErrorBox from "@/features/components/ErrorBox";
import { queryKeys } from "@/lib/api/capturapi";
import { SearchResultCard } from "./SearchResultCard";

const PAGE_SIZE = 20;

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [page, setPage] = useState(1);

  // Reset to the first page whenever the search term changes, so a new query
  // doesn't request a page index that only existed for the previous results.
  // (React's "adjust state during render" pattern — no effect needed.)
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setPage(1);
  }

  const { isPending, isError, error, data } = useSearchQuery(
    query,
    page,
    PAGE_SIZE,
  );
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <div className="mb-10">
      <div className="px-7 py-4 space-y-2">
        <h1 className="text-lg font-semibold">ASSET MANAGEMENT</h1>
        <div className="text-blue-500 font-light text-4xl">Search</div>
      </div>

      {!query ? (
        <div className="flex items-center justify-center min-h-100 w-full">
          <div className="text-center">
            <h2 className="text-4xl font-semibold mb-3">No Search Query</h2>
            <p className="text-lg text-gray-600">
              Please enter a search query to see results
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-10 p-8 w-full">
          {isError && (
            <div className="mb-4">
              <ErrorBox
                message={error?.detail ?? "An error has occurred"}
                queryKey={queryKeys.search(query, page, PAGE_SIZE)}
              />
            </div>
          )}

          {isPending && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-muted rounded-2xl animate-pulse"
                />
              ))}
            </div>
          )}

          {!isPending && data?.items && data.items.length > 0 && (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Found {data.total} result{data.total !== 1 ? "s" : ""} for "
                  {query}"
                </p>
              </div>
              <div className="space-y-3">
                {data.items.map((hit) => (
                  <SearchResultCard key={hit.asset.id} hit={hit} />
                ))}
              </div>
            </>
          )}

          {!isPending && !isError && data?.items.length === 0 && (
            <div className="flex items-center justify-center min-h-100 w-full">
              <div className="text-center">
                <h2 className="text-4xl font-semibold mb-3">
                  No Results Found
                </h2>
                <p className="text-lg text-gray-600">
                  No results found for "{query}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {query && totalPages > 1 && (
        <HistoryPagination
          currentPage={page}
          onPageChange={setPage}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}
