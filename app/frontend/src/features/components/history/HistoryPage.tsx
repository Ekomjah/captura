import { Button } from "@/components/ui/button";
import { UploadModal } from "@/features/upload";
import { Images,Plus } from "lucide-react";
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
        <div className="flex flex-col gap-4 border-b border-border/60 px-6 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-10">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Asset Management
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              History
            </h1>
            {!isPending && data?.total != null && data.total > 0 && (
              <p className="font-data text-sm text-muted-foreground">
                {data.total} capture{data.total !== 1 ? "s" : ""} archived
              </p>
            )}
          </div>

          <Button
            size="lg"
            onClick={() => setUploadModalOpen(true)}
            className="shrink-0"
          >
            <Plus className="mr-2" />
            Upload Image
          </Button>
        </div>
      )}

      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />

      <div className="mb-10 px-6 py-8 sm:px-10">
        {isError && (
          <div className="mb-4">
            <ErrorBox
              message={error?.detail ?? "An error has occurred"}
              queryKey={queryKeys.history(page, PAGE_SIZE)}
            />
          </div>
        )}

        {isPending && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <AssetCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isPending && data?.images && data.images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.images.map((asset, i) => (
              <div
                key={asset.id}
                className="animate-reveal-up"
                style={{ animationDelay: `${Math.min(i, 11) * 45}ms` }}
              >
                <AssetDialog asset={asset}>
                  <AssetCard asset={asset} onDelete={setDeleteTarget} />
                </AssetDialog>
              </div>
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
