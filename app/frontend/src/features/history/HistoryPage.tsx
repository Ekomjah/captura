import { Button } from "@/components/ui/button";
import { Images, LoaderIcon } from "lucide-react";
import { useHistoryQuery } from "@/hooks/queries/useHistoryQuery";
import { CardImage } from "@/features/history/asset-card/Card";

export function HistoryPage() {
  const { isPending, error, data } = useHistoryQuery();
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
      <div className=" w-full">
        {data?.images ? (
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
