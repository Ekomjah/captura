import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";

export function AssetCardSkeleton() {
  return (
    <Card className="relative mx-auto w-full max-w-70 pt-0!">
      <div className="animate-shimmer aspect-video w-full bg-size-[200%_100%] bg-linear-to-r from-muted via-muted/40 to-muted" />
      <CardHeader>
        <div className="mb-2 flex gap-2">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <Skeleton className="mb-2 h-5 w-3/4" />
        <Skeleton className="h-14 w-full rounded-md" />
      </CardHeader>
    </Card>
  );
}
