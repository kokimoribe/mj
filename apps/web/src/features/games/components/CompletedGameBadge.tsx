import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CompletedGameBadgeProps = {
  className?: string;
};

/**
 * Baseline "completed" badge used across game pages.
 *
 * Source of truth: `/games/[id]` Game Details header badge.
 */
export function CompletedGameBadge({ className }: CompletedGameBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("border-green-500 text-green-500", className)}
    >
      Completed ✅
    </Badge>
  );
}
