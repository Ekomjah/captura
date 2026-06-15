import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { RotateCcw, TriangleAlert } from "lucide-react";

type ErrorBoxProps = {
  message: string;
  queryKey: QueryKey;
};

export default function ErrorBox({ message, queryKey }: ErrorBoxProps) {
  const queryClient = useQueryClient();

  return (
    <div
      className="relative mx-auto flex min-h-100 w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-destructive/30 bg-card/40 px-6 text-center"
      role="alert"
    >
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative flex flex-col items-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
          <TriangleAlert className="size-9 text-destructive" />
        </div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Something went wrong
        </h2>
        <p className="mt-2 max-w-sm text-muted-foreground" aria-live="polite">
          {message}
        </p>
        <Button
          size="lg"
          className="mt-7"
          onClick={() => queryClient.invalidateQueries({ queryKey })}
        >
          <RotateCcw className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
