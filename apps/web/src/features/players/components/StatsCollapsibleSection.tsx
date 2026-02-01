"use client";

import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";

interface StatsCollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  "data-testid"?: string;
}

export function StatsCollapsibleSection({
  title,
  defaultOpen = true,
  children,
  "data-testid": testId,
}: StatsCollapsibleSectionProps) {
  return (
    <details
      className="group border-border bg-muted/30 rounded-md border"
      open={defaultOpen}
      data-testid={testId}
    >
      <summary className="hover:bg-muted/50 flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 font-medium transition-colors [&::-webkit-details-marker]:hidden">
        <ChevronDown
          className="text-muted-foreground h-4 w-4 shrink-0 -rotate-90 transition-transform group-open:rotate-0"
          aria-hidden
        />
        <span>{title}</span>
      </summary>
      <div className="border-border border-t px-3 py-3">{children}</div>
    </details>
  );
}
