import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ContactSheetEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function ContactSheetEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: ContactSheetEmptyStateProps) {
  return (
    <div
      className={`relative flex min-h-100 flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-border bg-card/40 px-6 text-center ${className}`}
    >
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative flex flex-col items-center">
        <div className="glow-primary mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Icon className="size-9 text-primary" />
        </div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-2 max-w-sm text-muted-foreground">{description}</p>
        {action}
      </div>
    </div>
  );
}
