import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm",
        className,
      )}
    >
      <header className="mb-4 space-y-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}
