import { Badge } from "@/components/ui/badge";

import { ImageWithFallback } from "@/hooks/ImageError";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tag } from "lucide-react";
import { shortenText } from "@/lib/utils/textShortener";
import { AssetDialog } from "../dialog/AssetDialog";

interface CardProps {
  id: string;
  ocr_snippet: string | null;
  thumbnail_url: string;
}

export function CardImage({ id, ocr_snippet, thumbnail_url }: CardProps) {
  const refinedUrl = `https://captura-mvp-76d74875.s3.us-east-1.amazonaws.com/${thumbnail_url.replace("raw", "processed").replace(/\.[^.]+$/, ".webp")}`;
  const fileName = shortenText(
    thumbnail_url
      .split("/")
      .slice(-1)[0]
      .replace(/\.[^.]+$/, ""),
    15,
  );
  return (
    <Card className="relative mx-auto w-full max-w-70 pt-0 flex flex-col">
      <div key={id} className="absolute inset-0 aspect-video bg-black/35" />
      <ImageWithFallback
        src={refinedUrl}
        alt="Asset cover"
        className="relative aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader className="flex-1">
        <CardAction>
          <Badge variant="secondary">
            <Tag /> Tag
          </Badge>
        </CardAction>
        <CardTitle>{fileName}</CardTitle>
        <CardDescription>
          <p className="block bg-secondary/30 text-muted-foreground px-3 py-2.5 text-sm font-medium italic leading-relaxed border-l-3 border-primary/30 rounded">
            {ocr_snippet}
          </p>
        </CardDescription>
      </CardHeader>
      <CardFooter className="w-full mt-auto">
        <AssetDialog
          id={id}
          ocr_snippet={ocr_snippet}
          thumbnail_url={refinedUrl}
          fileName={fileName}
        />
      </CardFooter>
    </Card>
  );
}
