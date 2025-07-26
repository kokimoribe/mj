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
import {
  safeFormatNumber,
  validatePlayerData,
} from "@/lib/utils/data-validation";

interface ExpandablePlayerCardProps {
  player: Player;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  "data-testid"?: string;
}

function ExpandablePlayerCardComponent({
  player: rawPlayer,
  rank,
  isExpanded,
  onToggle,
  "data-testid": dataTestId,
}: ExpandablePlayerCardProps) {
  const router = useRouter();

  // Validate player data to handle edge cases
  const player = validatePlayerData(rawPlayer);

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/player/${player.id}`);
  };

  // Format 7-day delta with validation
  const rating7DayDelta = player.rating7DayDelta;
  const hasChange =
    rating7DayDelta !== null &&
    rating7DayDelta !== undefined &&
    isFinite(rating7DayDelta);
  const isPositiveChange = hasChange && rating7DayDelta >= 0;

  return (
    <Card
      data-testid={dataTestId}
      className={cn(
        "transition-all duration-200",
        "hover:shadow-md",
        isExpanded && "ring-primary/20 ring-2",
        "min-h-[80px]" // Prevent layout shift
      )}
    >
      <CardContent className="p-0">
        {/* Main Row - Clickable Header */}
        <div
          className="focus-visible:ring-primary cursor-pointer rounded-t-lg px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.99]"
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={`${player.name || "Unknown"} - Rank ${(player.rating || 0).toFixed(1)} - Click to ${isExpanded ? "collapse" : "expand"} details`}
          onClick={onToggle}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle();
            }
          }}
        >
          <div className="flex items-center justify-between">
            {/* Rank Badge */}
            <div className="mr-3 flex items-center">
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full font-mono font-semibold">
                #{rank}
              </div>
            </div>

            {/* Player Name & Games */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium" data-testid="player-name">
                {player.name || "Unknown Player"}
              </h3>
              <p
                className="text-muted-foreground text-sm"
                data-testid="games-played"
              >
                {player.gamesPlayed || 0} game
                {player.gamesPlayed !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Rating & Change */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div
                  className="font-mono text-2xl font-bold tabular-nums"
                  data-testid="player-rating"
                >
                  {safeFormatNumber(player.rating, 1)}
                </div>
                <div
                  className={cn(
                    "flex items-center justify-end text-sm",
                    hasChange &&
                      (isPositiveChange ? "text-green-600" : "text-red-600")
                  )}
                  data-testid="rating-change"
                >
                  {!hasChange ? (
                    <span className="text-muted-foreground">—</span>
                  ) : isPositiveChange ? (
                    <>
                      <span
                        aria-label={`Rating increased by ${rating7DayDelta.toFixed(1)} points in the last 7 days`}
                      >
                        ↑{safeFormatNumber(rating7DayDelta, 1)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        aria-label={`Rating decreased by ${Math.abs(rating7DayDelta).toFixed(1)} points in the last 7 days`}
                      >
                        ↓{safeFormatNumber(Math.abs(rating7DayDelta), 1)}
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
          <div
            className="bg-muted/30 space-y-3 border-t px-4 py-4"
            data-testid="expanded-content"
            onClick={e => e.stopPropagation()}
          >
            {/* 7-Day Change Detail */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  7-day change:
                </span>
                <span className="font-semibold">
                  {!hasChange ? (
                    "--"
                  ) : (
                    <>
                      {isPositiveChange ? "▲" : "▼"}
                      {safeFormatNumber(
                        Math.abs(rating7DayDelta),
                        1
                      )} (from{" "}
                      {safeFormatNumber(
                        (player.rating || 0) - rating7DayDelta,
                        1
                      )}
                      )
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Avg Placement:
                </span>
                <span
                  className="font-semibold"
                  data-testid="avg-placement-value"
                >
                  {player.averagePlacement !== undefined &&
                  player.averagePlacement !== null &&
                  isFinite(player.averagePlacement)
                    ? safeFormatNumber(player.averagePlacement, 1)
                    : "--"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Last Played:
                </span>
                <span className="font-semibold">
                  {player.lastPlayed && typeof player.lastPlayed === "string"
                    ? formatDistanceToNow(new Date(player.lastPlayed), {
                        addSuffix: true,
                      })
                    : "--"}
                </span>
              </div>
            </div>

            {/* Mini Rating Chart */}
            {player.recentGames &&
            Array.isArray(player.recentGames) &&
            player.recentGames.length >= 2 ? (
              <div>
                <div className="text-muted-foreground mb-2 text-sm">
                  Recent Performance (Last{" "}
                  {Math.min(10, player.recentGames.length)} games):
                </div>
                <MiniRatingChart games={player.recentGames} />
              </div>
            ) : (
              <div className="text-muted-foreground py-4 text-center text-sm">
                {player.recentGames &&
                Array.isArray(player.recentGames) &&
                player.recentGames.length === 1
                  ? "Need at least 2 games for chart"
                  : "No recent games to display"}
              </div>
            )}

            {/* Action Button */}
            <Button
              variant="outline"
              className="min-h-[44px] w-full"
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
  // Filter out invalid ratings
  const validGames = games.filter(g => isFinite(g.rating) && !isNaN(g.rating));

  if (validGames.length < 2) {
    return (
      <div className="text-muted-foreground flex h-24 w-full items-center justify-center text-sm">
        Insufficient data for chart
      </div>
    );
  }

  const chartData = validGames.map((game, index) => ({
    index,
    rating: game.rating,
    date: game.date,
  }));

  const ratings = validGames.map(g => g.rating);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);
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
              if (
                active &&
                payload &&
                payload[0] &&
                payload[0].value !== undefined
              ) {
                const value = payload[0].value;
                if (isFinite(value)) {
                  return (
                    <div className="bg-background/95 rounded border p-2 text-xs shadow-md">
                      {safeFormatNumber(value, 1)}
                    </div>
                  );
                }
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 3 }}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
