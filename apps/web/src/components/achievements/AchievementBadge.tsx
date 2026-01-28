"use client";

import { Trophy, Crown, Award, Medal, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/supabase/queries";

interface AchievementBadgeProps {
  achievement: Achievement;
  seasonName?: string;
  className?: string;
}

// Map icon names to lucide-react components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  crown: Crown,
  award: Award,
  medal: Medal,
  star: Star,
};

export function AchievementBadge({
  achievement,
  seasonName,
  className,
}: AchievementBadgeProps) {
  const IconComponent = iconMap[achievement.iconName] || Trophy;

  // Use seasonName from prop if provided, otherwise from achievement object
  const displaySeasonName = seasonName || achievement.seasonName;

  // Format achievement name with season prefix (e.g., "Season 4 Tournament Champion")
  const displayName = displaySeasonName
    ? `${displaySeasonName} ${achievement.name}`
    : achievement.name;

  return (
    <div
      className={cn(
        "bg-card flex items-start gap-2 rounded-lg border p-3",
        className
      )}
    >
      <div className="flex-shrink-0">
        <IconComponent className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h4 className="text-sm font-semibold">{displayName}</h4>
        </div>
        <p className="text-muted-foreground text-sm">
          {achievement.description}
        </p>
      </div>
    </div>
  );
}
