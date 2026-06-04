import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import type { OcrStatus } from "@/lib/types/api";

interface OcrStatusBadgeProps {
  status: OcrStatus;
}

export function OcrStatusBadge({ status }: OcrStatusBadgeProps) {
  const config = {
    pending: {
      variant: "secondary" as const,
      icon: Clock,
      label: "Processing",
    },
    done: {
      variant: "default" as const,
      icon: CheckCircle,
      label: "Complete",
    },
    failed: {
      variant: "destructive" as const,
      icon: XCircle,
      label: "Failed",
    },
  };

  const { variant, icon: Icon, label } = config[status];

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}
