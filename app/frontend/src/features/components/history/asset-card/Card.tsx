import { Badge } from "@/components/ui/badge";

import { ImageWithFallback } from "@/hooks/ImageError";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tag } from "lucide-react";
import { UploadDialog } from "../upload-dialog/Dialog";

interface CardProps {
  id: string;
  ocr_snippet: string | null;
  thumbnail_url: string;
}

export function CardImage({ id, ocr_snippet, thumbnail_url }: CardProps) {
  const getS3Url = (s3_key: string) =>
    `https://captura-mvp-76d74875.s3.us-east-1.amazonaws.com/${s3_key.replace("raw", "processed").replace(/\.[^.]+$/, ".webp")}`;
  const getFileName = (s3_key: string) =>
    s3_key
      .split("/")
      .slice(-1)[0]
      .replace(/\.[^.]+$/, "");
  return (
    <Card className="relative mx-auto w-full max-w-70 pt-0">
      <div key={id} className="absolute inset-0 aspect-video bg-black/35" />
      <ImageWithFallback
        src={getS3Url(thumbnail_url)}
        alt="Asset cover"
        className="relative aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader>
        <CardAction>
          <Badge variant="secondary">
            <Tag /> Tag
          </Badge>
        </CardAction>
        <CardTitle>{getFileName(thumbnail_url)}</CardTitle>
        <CardDescription>{ocr_snippet}</CardDescription>
      </CardHeader>
      <CardFooter>
        <UploadDialog
          content={<Button className="w-full">View Asset</Button>}
        />
      </CardFooter>
    </Card>
  );
}
