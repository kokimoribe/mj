"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Player } from "@/lib/queries";

interface ExpandablePlayerCardProps {
  player: Player;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  "data-testid"?: string;
}

function ExpandablePlayerCardComponent({
  player,
  isExpanded,
  onToggle,
  "data-testid": dataTestId,
}: ExpandablePlayerCardProps) {
  const router = useRouter();

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/player/${player.id}`);
  };

  // Calculate rating change
  const ratingChange = player.ratingChange || 0;
  const isPositiveChange = ratingChange >= 0;

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`${player.name || "Unknown"} - Rank ${(player.rating || 0).toFixed(1)} - Click to ${isExpanded ? "collapse" : "expand"} details`}
      data-testid={dataTestId}
      className={cn(
        "cursor-pointer transition-all duration-200",
        "hover:shadow-md active:scale-[0.99]",
        "focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isExpanded && "ring-primary/20 ring-2",
        "min-h-[80px]" // Prevent layout shift
      )}
      onClick={onToggle}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <CardContent className="p-0">
        {/* Main Row */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Player Name & Games */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium">
                {player.name || "Unknown Player"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {player.gamesPlayed || 0} game
                {player.gamesPlayed !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Rating & Change */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-mono text-2xl font-bold tabular-nums">
                  {(player.rating || 0).toFixed(1)}
                </div>
                <div
                  className={cn(
                    "flex items-center justify-end text-sm",
                    isPositiveChange ? "text-green-600" : "text-red-600"
                  )}
                >
                  {isPositiveChange ? (
                    <>
                      <TrendingUp
                        className="mr-1 h-3 w-3"
                        aria-label="Rating increased"
                      />
                      <span
                        aria-label={`Rating increased by ${ratingChange.toFixed(1)} points`}
                      >
                        ↑ {ratingChange.toFixed(1)}
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown
                        className="mr-1 h-3 w-3"
                        aria-label="Rating decreased"
                      />
                      <span
                        aria-label={`Rating decreased by ${Math.abs(ratingChange).toFixed(1)} points`}
                      >
                        ↓ {Math.abs(ratingChange).toFixed(1)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Expand Indicator */}
              <div className="ml-2" aria-hidden="true">
                {isExpanded ? (
                  <ChevronUp className="text-muted-foreground h-4 w-4 transition-transform" />
                ) : (
                  <ChevronDown className="text-muted-foreground h-4 w-4 transition-transform hover:translate-y-0.5" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="bg-muted/30 space-y-3 border-t px-4 py-4">
            {/* Quick Stats */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Last Played:
                </span>
                <span className="font-semibold">
                  {player.lastPlayed
                    ? formatDistanceToNow(new Date(player.lastPlayed), {
                        addSuffix: true,
                      })
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Rating Trend Sparkline */}
            {player.ratingHistory && player.ratingHistory.length > 0 && (
              <div>
                <div className="text-muted-foreground mb-2 text-sm">
                  Rating Trend (Last 10 Games)
                </div>
                <div className="flex h-12 items-end gap-1">
                  {player.ratingHistory!.slice(-10).map((rating, i) => {
                    const minRating = Math.min(
                      ...player.ratingHistory!.slice(-10)
                    );
                    const maxRating = Math.max(
                      ...player.ratingHistory!.slice(-10)
                    );
                    const height =
                      maxRating === minRating
                        ? 50
                        : ((rating - minRating) / (maxRating - minRating)) *
                          100;
                    return (
                      <div
                        key={i}
                        className="bg-primary/20 flex-1 rounded-t"
                        style={{ height: `${Math.max(height, 10)}%` }}
                        title={`Rating: ${rating.toFixed(1)}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleProfileClick}
            >
              View Full Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const ExpandablePlayerCard = React.memo(
  ExpandablePlayerCardComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.player.id === nextProps.player.id &&
      prevProps.player.rating === nextProps.player.rating &&
      prevProps.player.gamesPlayed === nextProps.player.gamesPlayed &&
      prevProps.isExpanded === nextProps.isExpanded &&
      prevProps.rank === nextProps.rank
    );
  }
);
