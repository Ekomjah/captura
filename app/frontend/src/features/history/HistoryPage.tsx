import { Button } from "@/components/ui/button";
export function HistoryPage() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-center">
        <h1 className="text-4xl font-semibold mb-3">Asset Management</h1>
        <p className="text-lg text-gray-600">
          Your uploaded captures will appear here
        </p>
        <Button variant="outline" className="mt-6">
          Upload Image
        </Button>
      </div>
    </div>
  );
}
