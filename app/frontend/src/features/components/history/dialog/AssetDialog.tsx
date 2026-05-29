import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AssetDetails } from "../asset-card/AssetDetails";

interface AssetDialogProps {
  id: string;
  ocr_snippet: string | null;
  thumbnail_url: string;
  fileName: string;
}
export const AssetDialog = ({
  id,
  ocr_snippet,
  thumbnail_url,
  fileName,
}: AssetDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger className="w-full!" asChild>
        <Button>View Asset</Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>View Asset</DialogTitle>
          <DialogDescription>Have a look at this asset</DialogDescription>
        </DialogHeader>

        <AssetDetails
          thumbnail_url={thumbnail_url}
          ocr_snippet={ocr_snippet}
          id={id}
          fileName={fileName}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
