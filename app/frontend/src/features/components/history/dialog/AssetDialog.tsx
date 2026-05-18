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
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

        <div className="flex flex-col lg:flex-row gap-6 py-4 items-start">
          <a
            href={thumbnail_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-70 rounded-lg overflow-hidden"
          >
            <img
              src={thumbnail_url}
              alt="asset view"
              className="w-full max-w-70 rounded-lg object-fit"
            />
          </a>
          <div className="w-full space-y-4 border-l border-gray-700 pl-4">
            <FieldGroup>
              <Field>
                <Label htmlFor={id}>Asset Name</Label>
                <Input
                  id={id}
                  name="name"
                  className="w-full"
                  disabled
                  defaultValue={fileName}
                />
              </Field>
              <Field>
                <Label htmlFor={`${id}-snippet`}>Asset Snippet</Label>
                <Textarea
                  id={`${id}-snippet`}
                  className="w-full"
                  disabled
                  name="snippet"
                  defaultValue={ocr_snippet ?? "No OCR snippet available"}
                />
              </Field>
            </FieldGroup>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
