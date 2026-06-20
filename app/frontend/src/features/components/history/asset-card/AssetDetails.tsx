import { Field, FieldGroup } from "@/components/ui/field";
import { shortenText } from "@/lib/utils/textShortener";
interface AssetDetailsProps {
  thumbnail_url: string;
  ocr_text: string | null;
  id: string;
  fileName: string;
}
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
export function AssetDetails({
  thumbnail_url,
  ocr_text,
  id,
  fileName,
}: AssetDetailsProps) {
  return (
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
      <div className="w-full space-y-4 border-l border-border pl-4">
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
              defaultValue={ocr_text ? shortenText(ocr_text, 100) : "No OCR snippet available"}
            />
          </Field>
        </FieldGroup>
      </div>
    </div>
  );
}
