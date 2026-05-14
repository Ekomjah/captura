import { Button } from "@/components/ui/button";
import { Images } from "lucide-react";
export function HistoryPage() {
  return (
    <div>
      <div className="p-4 space-y-2">
        <h1 className="text-lg font-semibold">ASSET MANAGEMENT</h1>
        <div className="text-blue-500 font-light text-4xl">History</div>
      </div>
      <div className="flex items-center justify-center min-h-100 w-full">
        <div className="text-center">
          <p className="text-lg text-gray-600">
            Your uploaded captures will appear here
          </p>
          <Button variant="outline" className="mt-6">
            <Images></Images>
            Upload Image
          </Button>
        </div>
      </div>
    </div>
  );
}
