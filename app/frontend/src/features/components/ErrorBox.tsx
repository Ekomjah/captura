import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";

type ErrorBoxProps = {
  message: string;
  queryKey: QueryKey;
};

export default function ErrorBox({ message, queryKey }: ErrorBoxProps) {
  const queryClient = useQueryClient();

  return (
    <div
      className="w-full flex flex-col min-h-100 text-center justify-center items-center mx-auto rounded-xl border border-destructive/40 bg-destructive/5"
      role="alert"
    >
      <p className="font-roboto-mono text-sm uppercase tracking-widest text-destructive">
        [ Error ] Loading assets
      </p>
      <p className="text-muted-foreground mb-4 mt-1" aria-live="polite">
        {message}
      </p>
      <Button
        variant="destructive"
        onClick={() => queryClient.invalidateQueries({ queryKey })}
      >
        Retry
      </Button>
    </div>
  );
}
