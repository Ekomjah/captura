import { Button } from "@/components/ui/button";
import { UploadModal } from "@/features/upload";
import { Images } from "lucide-react";
import { useHistoryQuery } from "@/hooks/queries/useHistoryQuery";
import { AssetCard } from "@/features/components/history/asset-card/AssetCard";
import { AssetCardSkeleton } from "@/features/components/history/asset-card/AssetCardSkeleton";
import { EmptyHistoryState } from "@/features/components/history/EmptyHistoryState";
import { AssetDialog } from "@/features/components/history/dialog/AssetDialog";
import { DeleteAssetDialog } from "@/features/components/history/dialog/DeleteAssetDialog";
import ErrorBox from "../ErrorBox";
import { queryKeys } from "@/lib/api/capturapi";
import { useState } from "react";
import { HistoryPagination } from "./HistoryPagination";
import { useDeleteMutation } from "@/hooks/mutations/useDeleteMutation";
import { getDisplayName } from "@/lib/utils/assetHelpers";
import { toast } from "sonner";
import type { AssetSummary } from "@/lib/types/api";

const PAGE_SIZE = 20;

export function HistoryPage() {
  const [page, setPage] = useState(1);
  const { isPending, isError, error, data } = useHistoryQuery(page, PAGE_SIZE);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AssetSummary | null>(null);
  const deleteMutation = useDeleteMutation();
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(
          `Asset "${getDisplayName(deleteTarget)}" deleted successfully`,
        );
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error("Error deleting asset");
      },
    });
  };

  return (
    <div className="mb-10">
      {!isError && (
        <div className="flex justify-between items-center w-full px-7 py-4">
          <div className="px-7 py-4">
            <h1 className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">
              Asset Management
            </h1>
            <p className="mt-1 font-display text-4xl leading-none text-text-display">
              History
            </p>
          </div>

          <Button
            className="w-full"
            onClick={() => setUploadModalOpen(true)}
          >
            <Images className="mr-2" />
            Upload Image
          </Button>
        </div>
      )}

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
                <AssetCard asset={asset} onDelete={setDeleteTarget} />
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

      <DeleteAssetDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        fileName={deleteTarget ? getDisplayName(deleteTarget) : ""}
        isDeleting={deleteMutation.isPending}
        onDelete={handleDelete}
      />
    </div>
  );
}
