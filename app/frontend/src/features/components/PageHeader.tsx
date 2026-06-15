import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, meta, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/60 px-6 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-10">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {meta && <div className="font-data text-sm text-muted-foreground">{meta}</div>}
      </div>
      {action}
    </div>
  );
}
