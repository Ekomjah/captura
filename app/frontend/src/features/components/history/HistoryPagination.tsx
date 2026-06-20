import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type HistoryPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function buildPages(currentPage: number, totalPages: number) {
  const pages = new Set<number>();

  pages.add(1);
  pages.add(totalPages);
  pages.add(currentPage);
  pages.add(currentPage - 1);
  pages.add(currentPage + 1);
  pages.add(2);
  pages.add(totalPages - 1);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

export function HistoryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: HistoryPaginationProps) {
  const pages = buildPages(currentPage, totalPages);

  return (
    <Pagination className="my-8">
      <PaginationContent className="rounded-2xl border border-border/70 bg-card/50 p-1.5 backdrop-blur-sm">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            aria-disabled={currentPage === 1}
          />
        </PaginationItem>

        {pages.map((page, index) => {
          const prevPage = pages[index - 1];
          const showEllipsis = prevPage != null && page - prevPage > 1;

          return (
            <span key={`page-${page}-${index}`}>
              {showEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page !== currentPage) onPageChange(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            </span>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            aria-disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
