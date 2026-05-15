import { Button } from "@/components/ui/button";
import { Images, LoaderIcon } from "lucide-react";
import { useHistoryQuery } from "@/hooks/queries/useHistoryQuery";
export function HistoryPage() {
  const { isPending, error, data, isFetching } = useHistoryQuery();
  if (isPending) {
    return <LoaderIcon />;
  }
  if (error) return "An error has occured" + error.message;

  return (
    <div>
      <div className="px-7 py-4 space-y-2">
        <h1 className="text-lg font-semibold">ASSET MANAGEMENT</h1>
        <div className="text-blue-500 font-light text-4xl">History</div>
      </div>
      <div className="flex items-center justify-center min-h-100 w-full">
        {data?.images ? (
          <div className="text-center">
            <p className="text-lg text-gray-600">
              Your uploaded captures will appear here
            </p>
            <Button variant="outline" className="mt-6">
              <Images></Images>
              Upload Image
            </Button>
          </div>
        ) : (
          data?.images.map(({ id, ocr_snippet, thumbnail_url }) => (
            <div key={id}>
              <img src={thumbnail_url} alt="thumbnail" />
              <div>{ocr_snippet}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
