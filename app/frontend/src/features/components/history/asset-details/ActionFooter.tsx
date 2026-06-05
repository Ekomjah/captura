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
    if (asset.ocr_snippet) {
      try {
        await navigator.clipboard.writeText(asset.ocr_snippet);
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
  const canCopy = asset.ocr_status === "done" && asset.ocr_snippet;

  return (
    <div className="border-t border-white/5 px-6 py-4 flex gap-3">
      <Button
        onClick={handleDownloadWebP}
        disabled={!hasWebP}
        className="flex-1 bg-gradient-to-r from-[#699cff] to-[#5a8ae6] hover:from-[#5a8ae6] hover:to-[#4b7ad7]"
      >
        <Download className="size-4 mr-2" />
        Download
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
