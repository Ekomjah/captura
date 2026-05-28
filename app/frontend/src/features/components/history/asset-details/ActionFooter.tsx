import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import type { AssetSummary } from "@/lib/types/api";
import { useState } from "react";

interface ActionFooterProps {
  asset: AssetSummary;
}

export function ActionFooter({ asset }: ActionFooterProps) {
  const [isCopying, setIsCopying] = useState(false);

  const handleDownloadWebP = () => {
    const webpVariant = asset.variants.find((v) => v.format === "webp");
    if (webpVariant) {
      const url = `https://captura-mvp-76d74875.s3.us-east-1.amazonaws.com/${webpVariant.s3_key}`;
      const link = document.createElement("a");
      link.href = url;
      link.download = webpVariant.s3_key.split("/").pop() || "download.webp";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyText = async () => {
    if (asset.ocr_snippet) {
      setIsCopying(true);
      try {
        await navigator.clipboard.writeText(asset.ocr_snippet);
      } catch (error) {
        console.error("Failed to copy text:", error);
      } finally {
        setIsCopying(false);
      }
    }
  };

  const hasWebP = asset.variants.some((v) => v.format === "webp");
  const canCopy = asset.ocr_status === "done" && asset.ocr_snippet;

  return (
    <div className="border-t border-white/5 px-6 py-4 flex gap-3">
      <Button
        onClick={handleDownloadWebP}
        disabled={!hasWebP}
        className="flex-1 bg-gradient-to-r from-[#699cff] to-[#5a8ae6] hover:from-[#5a8ae6] hover:to-[#4b7ad7]"
      >
        <Download className="size-4 mr-2" />
        Download WebP
      </Button>
      <Button
        onClick={handleCopyText}
        disabled={!canCopy || isCopying}
        variant="outline"
        className="flex-1 border-white/10 hover:bg-white/5"
      >
        <Copy className="size-4 mr-2" />
        {isCopying ? "Copied!" : "Copy Text"}
      </Button>
    </div>
  );
}
