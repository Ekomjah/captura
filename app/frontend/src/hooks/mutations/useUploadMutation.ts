import { capturaKey, uploadAsset } from "@/lib/api/capturapi";
import { useQuery } from "@tanstack/react-query";

export const useUploadMutation = (file: File) => {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: [...capturaKey(), "upload", file.name],
    queryFn: () => uploadAsset(file),
    enabled: false, // Disable automatic execution
  });
  return { isPending, error, data, isFetching };
};
