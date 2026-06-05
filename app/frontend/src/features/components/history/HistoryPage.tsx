import { Button } from "@/components/ui/button";
import { UploadModal } from "@/features/upload";
import { Images } from "lucide-react";
import { useHistoryQuery } from "@/hooks/queries/useHistoryQuery";
import { AssetCard } from "@/features/components/history/asset-card/AssetCard";
import { AssetCardSkeleton } from "@/features/components/history/asset-card/AssetCardSkeleton";
import { EmptyHistoryState } from "@/features/components/history/EmptyHistoryState";
import { AssetDialog } from "@/features/components/history/dialog/AssetDialog";
import ErrorBox from "../ErrorBox";
import { queryKeys } from "@/lib/api/capturapi";
import { useState } from "react";
import { HistoryPagination } from "./HistoryPagination";

const PAGE_SIZE = 20;

export function HistoryPage() {
  const [page, setPage] = useState(1);
  const { isPending, isError, error, data } = useHistoryQuery(page, PAGE_SIZE);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center w-full px-7 py-4">
        <div className="px-7 py-4">
          <h1 className="text-lg font-semibold">ASSET MANAGEMENT</h1>
          <p className="text-blue-500 font-light text-4xl">History</p>
        </div>

        <Button onClick={() => setUploadModalOpen(true)}>
          <Images className="mr-2" />
          Upload Image
        </Button>
      </div>

      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />

      <div className="mb-10 p-8 w-full">
        {isError && (
          <div className="mb-4">
            <ErrorBox
              message={error?.detail ?? "An error has occurred"}
              queryKey={queryKeys.history(page, PAGE_SIZE)}
            />
          </div>
        )}

        {isPending && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <AssetCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isPending && data?.images && data.images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.images.map((asset) => (
              <AssetDialog key={asset.id} asset={asset}>
                <AssetCard asset={asset} />
              </AssetDialog>
            ))}
          </div>
        )}

        {!isPending && !isError && data?.images.length === 0 && (
          <EmptyHistoryState onUploadClick={() => setUploadModalOpen(true)} />
        )}
      </div>

      {totalPages > 1 && (
        <HistoryPagination
          currentPage={page}
          onPageChange={setPage}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}
