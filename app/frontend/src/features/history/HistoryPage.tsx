import { Button } from "@/components/ui/button";
import { Images, LoaderIcon } from "lucide-react";
import { useHistoryQuery } from "@/hooks/queries/useHistoryQuery";

export function HistoryPage() {
  const getS3Url = (s3_key: string) =>
    `https://captura-mvp-76d74875.s3.us-east-1.amazonaws.com/${s3_key.replace("raw", "processed").replace(/\.[^.]+$/, ".webp")}`;
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
      <div className="grid grid-cols-3 gap-5 margin-auto max-w-400 items-center justify-center min-h-100 w-full">
        {data?.images ? (
          data?.images.map(({ id, ocr_snippet, thumbnail_url }) => (
            <div key={id}>
              <img src={getS3Url(thumbnail_url)} alt="thumbnail" />
              <div>{ocr_snippet}</div>
            </div>
          ))
        ) : (
          <div className="text-center">
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
