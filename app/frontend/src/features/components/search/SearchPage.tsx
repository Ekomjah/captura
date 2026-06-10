import { useState } from "react";
import { useSearchParams } from "react-router";
import { useSearchQuery } from "@/hooks/queries/useSearchQuery";
import { HistoryPagination } from "@/features/components/history/HistoryPagination";
import ErrorBox from "@/features/components/ErrorBox";
import { queryKeys } from "@/lib/api/capturapi";
import { SearchResultCard } from "./SearchResultCard";
import { ScanSearch, SearchX } from "lucide-react";

const PAGE_SIZE = 20;

/** Darkroom empty/idle state — mirrors EmptyHistoryState's contact-sheet card. */
function SearchPlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ScanSearch;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex min-h-100 flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border bg-card/40 px-6 text-center">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative flex flex-col items-center">
        <div className="glow-primary mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Icon className="size-9 text-primary" />
        </div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-2 max-w-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

/** Shimmer row matching the SearchResultCard footprint. */
function SearchResultSkeleton() {
  const shimmer =
    "animate-shimmer bg-size-[200%_100%] bg-linear-to-r from-muted via-muted/40 to-muted";
  return (
    <div className="flex w-full gap-4 rounded-2xl border border-border/60 bg-card/50 p-3">
      <div className={`size-24 shrink-0 rounded-xl sm:size-28 ${shimmer}`} />
      <div className="flex flex-1 flex-col justify-center gap-3 py-1">
        <div className={`h-4 w-1/3 rounded ${shimmer}`} />
        <div className={`h-12 w-full rounded ${shimmer}`} />
        <div className={`h-3 w-24 rounded ${shimmer}`} />
      </div>
    </div>
  );
}

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
  const hasResults = Boolean(data?.items && data.items.length > 0);

  return (
    <div className="mb-10">
      <div className="flex flex-col gap-2 border-b border-border/60 px-6 py-8 sm:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Full-text Search
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Search
        </h1>
        {query && !isPending && !isError && hasResults && (
          <p className="font-data text-sm text-muted-foreground">
            {data?.total} result{data?.total !== 1 ? "s" : ""} for
            <span className="text-foreground"> “{query}”</span>
          </p>
        )}
      </div>

      <div className="mb-10 px-6 py-8 sm:px-10">
        {!query ? (
          <SearchPlaceholder
            icon={ScanSearch}
            title="Search your captures"
            description="Enter a query above to scan the extracted text across every screenshot you've archived."
          />
        ) : (
          <>
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
                  <SearchResultSkeleton key={i} />
                ))}
              </div>
            )}

            {!isPending && hasResults && (
              <div className="space-y-3">
                {data?.items.map((hit, i) => (
                  <div
                    key={hit.asset.id}
                    className="animate-reveal-up"
                    style={{ animationDelay: `${Math.min(i, 11) * 45}ms` }}
                  >
                    <SearchResultCard hit={hit} />
                  </div>
                ))}
              </div>
            )}

            {!isPending && !isError && data?.items.length === 0 && (
              <SearchPlaceholder
                icon={SearchX}
                title="No results found"
                description={`Nothing matched “${query}”. Try a different word, or check the spelling.`}
              />
            )}
          </>
        )}
      </div>

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
