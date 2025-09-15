/**
 * Collapsible Section Component
 *
 * Reusable wrapper for collapsible configuration sections.
 * Provides consistent styling and behavior for all sections.
 */

import { ChevronRight, ChevronDown } from "lucide-react";
import { ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  isExpanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="rounded-md border">
      <button
        className="hover:bg-accent/50 flex w-full items-center justify-between p-3 transition-colors"
        onClick={onToggle}
        type="button"
      >
        <span className="flex items-center gap-2 font-medium">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {title}
        </span>
      </button>
      {isExpanded && children}
    </div>
  );
}
