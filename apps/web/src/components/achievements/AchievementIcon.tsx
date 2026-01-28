"use client";

import { Trophy, Crown, Award, Medal, Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/supabase/queries";

interface AchievementIconProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
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

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function AchievementIcon({
  achievement,
  size = "md",
  className,
}: AchievementIconProps) {
  const IconComponent = iconMap[achievement.iconName] || Trophy;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center", className)}>
            <IconComponent
              className={cn(
                sizeMap[size],
                "text-yellow-500 dark:text-yellow-400"
              )}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{achievement.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
