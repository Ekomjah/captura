import { LoaderCircle } from "lucide-react";
import ErrorBox from "../ErrorBox";
import { UploadDialog } from "@/features/components/history/upload-dialog/Dialog";
import { useHistoryQuery } from "@/hooks/queries/useHistoryQuery";
import { CardImage } from "@/features/components/history/asset-card/Card";
export function HistoryPage() {
  const { isPending, isError, error, data } = useHistoryQuery();

  return (
    <div>
      <div className="px-7 py-4 space-y-2 flex justify-between items-center">
        <div className="flex-col items-start justify-start">
          <h1 className="text-lg font-semibold">ASSET MANAGEMENT</h1>
          <div className="text-blue-500 font-light text-4xl">History</div>
        </div>
        <UploadDialog />
      </div>
      <div className=" w-full">
        {isPending && (
          <div className="w-full p-4 flex  flex-col min-h-100 items-center justify-center animate-spin">
            <LoaderCircle className="size-8" />
          </div>
        )}

        {isError && <ErrorBox message={error?.message} />}

        {!isPending && !isError && data?.images.length === 0 && (
          <div className="text-center flex flex-col items-center justify-center min-h-100">
            <p className="text-lg text-gray-600">
              Your uploaded captures will appear here
            </p>
            <UploadDialog />
          </div>
        )}
        {!isPending && !isError && data?.images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 justify-center items-center">
            {data?.images.map(({ id, ocr_snippet, thumbnail_url }) => (
              <CardImage
                key={id}
                id={id}
                ocr_snippet={ocr_snippet}
                thumbnail_url={thumbnail_url}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
