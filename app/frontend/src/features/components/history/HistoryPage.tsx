import { Button } from "@/components/ui/button";
import { Images, LoaderCircle } from "lucide-react";
import { useHistoryQuery } from "@/hooks/queries/useHistoryQuery";
import { CardImage } from "@/features/components/history/asset-card/Card";
import { getApiError } from "@/lib/api/getApiError";
import { shortenText } from "@/lib/utils/textShortener";
import ErrorBox from "../ErrorBox";
import { queryKeys } from "@/lib/api/capturapi";

export function HistoryPage() {
  const { isPending, isError, error, data } = useHistoryQuery();
  const apiError = getApiError(error);
  const errorMessage = apiError?.detail || "An error has occurred";
  // if (error) {
  //   return `Error: ${errorMessage}`;
  // }

  return (
    <div>
      <div className="px-7 py-4 space-y-2">
        <h1 className="text-lg font-semibold">ASSET MANAGEMENT</h1>
        <div className="text-blue-500 font-light text-4xl">History</div>
      </div>
      <div className=" w-full">
        {isPending && (
          <div className="flex items-center justify-center animate-spin min-h-100">
            <LoaderCircle size={20} />
          </div>
        )}
        {isError && (
          <ErrorBox
            message={errorMessage ?? "Something went wrong"}
            queryKey={queryKeys.history(1, 20)}
          />
        )}
        {!isPending && !error && data?.images ? (
          <div className="grid grid-cols-3 gap-2 justify-center items-center">
            {data?.images.map(({ id, ocr_snippet, thumbnail_url }) => (
              <CardImage
                key={id}
                id={id}
                ocr_snippet={shortenText(ocr_snippet ?? "", 40)}
                thumbnail_url={thumbnail_url}
              />
            ))}
          </div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center min-h-100">
            <p className="text-lg text-gray-600">
              Your uploaded captures will appear here
            </p>
            <Button variant="outline" className="mt-6">
              <Images></Images>
              Upload Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
