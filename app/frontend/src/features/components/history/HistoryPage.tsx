import { Button } from "@/components/ui/button";
import { UploadModal } from "@/features/upload";
import { ImagePlus, Plus } from "lucide-react";
import { useHistoryQuery } from "@/hooks/queries/useHistoryQuery";
import { AssetCard } from "@/features/components/history/asset-card/AssetCard";
import { AssetCardSkeleton } from "@/features/components/history/asset-card/AssetCardSkeleton";
import { ContactSheetEmptyState } from "@/features/components/ContactSheetEmptyState";
import { PageHeader } from "@/features/components/PageHeader";
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
import { useAuth } from "@clerk/react";

const PAGE_SIZE = 20;

export function HistoryPage() {
  const { userId } = useAuth();
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
        <PageHeader
          title="History"
          meta={
            !isPending &&
            data?.total != null &&
            data.total > 0 && (
              <>
                {data.total} capture{data.total !== 1 ? "s" : ""} archived
              </>
            )
          }
          action={
            <Button
              size="lg"
              onClick={() => setUploadModalOpen(true)}
              className="shrink-0"
            >
              <Plus className="mr-2" />
              Upload Image
            </Button>
          }
        />
      )}

      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />

      <div className="mb-10 px-6 py-8 sm:px-10">
        {isError && (
          <div className="mb-4">
            <ErrorBox
              message={error?.detail ?? "An error has occurred"}
              queryKey={queryKeys.history(userId, page, PAGE_SIZE)}
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
          <div className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.images.map((asset) => (
              <div key={asset.id}>
                <AssetDialog asset={asset}>
                  <AssetCard asset={asset} onDelete={setDeleteTarget} />
                </AssetDialog>
              </div>
            ))}
          </div>
        )}

        {!isPending && !isError && data?.images.length === 0 && (
          <ContactSheetEmptyState
            icon={ImagePlus}
            title="No assets yet"
            description="Upload your first screenshot to develop it into a searchable, multi-format cloud asset."
            className="min-h-110"
            action={
              <Button
                size="lg"
                onClick={() => setUploadModalOpen(true)}
                className="mt-7"
              >
                <Plus className="mr-2" />
                Upload Image
              </Button>
            }
          />
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
