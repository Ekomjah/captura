import { useQueryClient } from "@tanstack/react-query";
import { capturaKey } from "@/lib/api/capturapi";

export default function ErrorBox({ message }: { message: string }) {
  const queryClient = useQueryClient();

  return (
    <div
      className="w-full flex flex-col min-h-100 text-center justify-center items-center mx-auto"
      role="alert"
    >
      <p className="font-semibold text-red-700">Error loading assets</p>
      <p className="text-sm text-red-600 mb-2" aria-live="polite">
        {message}
      </p>
      <button
        className="px-3 py-1 h-9 flex place-items-center mx-auto rounded bg-red-600 text-sm"
        onClick={() =>
          queryClient.invalidateQueries({ queryKey: capturaKey() })
        }
      >
        Retry
      </button>
    </div>
  );
}
