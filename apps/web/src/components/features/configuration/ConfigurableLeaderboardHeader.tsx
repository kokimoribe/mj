"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ConfigurationPanel } from "./ConfigurationPanel";
import { cn } from "@/lib/utils";

interface ConfigurableLeaderboardHeaderProps {
  seasonName: string;
  totalGames: number;
  totalPlayers: number;
  className?: string;
}

export function ConfigurableLeaderboardHeader({
  seasonName,
  totalGames,
  totalPlayers,
  className,
}: ConfigurableLeaderboardHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn("w-full", className)}>
      {/* Header Summary */}
      <div
        className="bg-card rounded-lg border p-4"
        data-testid="leaderboard-header"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">{seasonName}</h2>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>{totalGames} games</span>
              <span>•</span>
              <span>{totalPlayers} players</span>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-accent rounded-md p-2 transition-colors"
            aria-label={
              isExpanded ? "Collapse configuration" : "Expand configuration"
            }
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      <ConfigurationPanel isExpanded={isExpanded} />
    </div>
  );
}
