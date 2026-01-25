import * as React from "react";

import { cn } from "@/lib/utils";

type GamePageHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Shared header wrapper for game pages.
 *
 * Ensures a consistent header block height so content below (e.g. `ScoreBoard`)
 * starts at the same Y position across pages, even if one header has a
 * two-line title/meta block and another is effectively single-line.
 */
export function GamePageHeader({ children, className }: GamePageHeaderProps) {
  return (
    <div
      className={cn("flex min-h-12 items-center justify-between", className)}
    >
      {children}
    </div>
  );
}
