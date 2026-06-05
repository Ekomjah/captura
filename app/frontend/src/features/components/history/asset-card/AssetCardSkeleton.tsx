import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";

export function AssetCardSkeleton() {
  return (
    <Card className="relative mx-auto w-full max-w-70">
      <Skeleton className="aspect-video w-full" />
      <CardHeader>
        <div className="flex gap-2 mb-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-16 w-full" />
      </CardHeader>
    </Card>
  );
}
