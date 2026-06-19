import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import type { AssetSummary } from "@/lib/types/api";
import { useState } from "react";
import { toast } from "sonner";
import { getPreviewUrl } from "@/lib/utils/assetHelpers";

interface ActionFooterProps {
  asset: AssetSummary;
}

export function ActionFooter({ asset }: ActionFooterProps) {
  const [isCopying, setIsCopying] = useState(false);

  const handleDownloadWebP = async () => {
    const url = getPreviewUrl(asset);
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = url.split("/").pop() || "download.webp";
      document.body.appendChild(link);
      link.click();
      toast.success("Asset successfully downloaded");
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed. Please try again.");
    }
  };
  const handleCopyText = async () => {
    if (asset.ocr_text) {
      try {
        await navigator.clipboard.writeText(asset.ocr_text);
        setIsCopying(true);
        toast.success("Text copied to clipboard!");
        setTimeout(() => setIsCopying(false), 5000);
      } catch (error) {
        console.error("Failed to copy text:", error);
        toast.error("Failed to copy text. Please try again.");
      }
    }
  };

  const hasWebP = asset.variants.some((v) => v.format === "webp");
  const canCopy = asset.ocr_status === "done" && asset.ocr_text;

  return (
    <div className="flex gap-2.5 border-t border-border/70 bg-card/50 px-6 py-4 backdrop-blur-sm">
      <Button
        onClick={handleDownloadWebP}
        disabled={!hasWebP}
        size="lg"
        className="flex-1"
      >
        <Download className="size-4" />
        Download
      </Button>
      <Button
        onClick={handleCopyText}
        disabled={!canCopy || isCopying}
        variant="outline"
        size="lg"
        className="flex-1"
      >
        <Copy className="size-4" />
        {isCopying ? "Copied!" : "Copy Text"}
      </Button>
    </div>
  );
}
