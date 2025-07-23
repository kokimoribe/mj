"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Player } from "@/lib/queries";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

  // Format 7-day delta
  const rating7DayDelta = player.rating7DayDelta;
  const hasChange = rating7DayDelta !== null && rating7DayDelta !== undefined;
  const isPositiveChange = hasChange && rating7DayDelta >= 0;

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
                    hasChange &&
                      (isPositiveChange ? "text-green-600" : "text-red-600")
                  )}
                >
                  {!hasChange ? (
                    <span className="text-muted-foreground">—</span>
                  ) : isPositiveChange ? (
                    <>
                      <span
                        aria-label={`Rating increased by ${rating7DayDelta.toFixed(1)} points in the last 7 days`}
                      >
                        ▲{rating7DayDelta.toFixed(1)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        aria-label={`Rating decreased by ${Math.abs(rating7DayDelta).toFixed(1)} points in the last 7 days`}
                      >
                        ▼{Math.abs(rating7DayDelta).toFixed(1)}
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
            {/* 7-Day Change Detail */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  7-day change:
                </span>
                <span className="font-semibold">
                  {!hasChange ? (
                    "—"
                  ) : (
                    <>
                      {isPositiveChange ? "▲" : "▼"}
                      {Math.abs(rating7DayDelta).toFixed(1)} (from{" "}
                      {(player.rating - rating7DayDelta).toFixed(1)})
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Avg Placement:
                </span>
                <span className="font-semibold">
                  {player.averagePlacement?.toFixed(1) || "—"}
                </span>
              </div>
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

            {/* Mini Rating Chart */}
            {player.recentGames && player.recentGames.length > 0 && (
              <div>
                <div className="text-muted-foreground mb-2 text-sm">
                  Recent Performance (Last 10 games):
                </div>
                <MiniRatingChart games={player.recentGames} />
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

interface MiniRatingChartProps {
  games: Array<{
    gameId: string;
    date: string;
    rating: number;
  }>;
}

function MiniRatingChart({ games }: MiniRatingChartProps) {
  const chartData = games.map((game, index) => ({
    index,
    rating: game.rating,
    date: game.date,
  }));

  const minRating = Math.min(...games.map(g => g.rating));
  const maxRating = Math.max(...games.map(g => g.rating));
  const padding = (maxRating - minRating) * 0.1 || 1;

  return (
    <div className="h-24 w-full" data-testid="mini-rating-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
        >
          <YAxis domain={[minRating - padding, maxRating + padding]} hide />
          <XAxis dataKey="index" hide />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                return (
                  <div className="bg-background/95 rounded border p-2 text-xs shadow-md">
                    {payload[0].value?.toFixed(1)}
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="transparent"
            strokeWidth={0}
            dot={{ fill: "#10b981", r: 3 }}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
