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
      className="w-full flex flex-col min-h-100 text-center text-destructive justify-center items-center mx-auto"
      role="alert"
    >
      <p className="font-roboto-mono font-bold">Error loading assets</p>
      <p className="ttext-muted-foreground mb-2" aria-live="polite">
        {message}
      </p>
      <Button
        className="px-3 py-1 h-9 flex place-items-center mx-auto rounded text-sm"
        onClick={() => queryClient.invalidateQueries({ queryKey })}
      >
        Retry
      </Button>
    </div>
  );
}
