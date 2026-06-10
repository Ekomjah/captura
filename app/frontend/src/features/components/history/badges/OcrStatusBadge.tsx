import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import type { OcrStatus } from "@/lib/types/api";

interface OcrStatusBadgeProps {
  status: OcrStatus;
}

export function OcrStatusBadge({ status }: OcrStatusBadgeProps) {
  const config = {
    pending: {
      icon: Clock,
      label: "Processing",
      className: "text-warning border-warning/40",
    },
    done: {
      icon: CheckCircle,
      label: "Complete",
      className: "text-success border-success/40",
    },
    failed: {
      icon: XCircle,
      label: "Failed",
      className: "text-destructive border-destructive/50",
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${className}`}>
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}
