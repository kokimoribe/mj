"use client";

import React, { useState, useCallback } from "react";
import { useLeaderboard } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { ConfigurableLeaderboardHeader } from "@/features/configuration/components";
import { ExpandablePlayerCard } from "./ExpandablePlayerCard";
import { toast } from "sonner";
import { TEST_IDS } from "@/lib/test-ids";
import { safeFormatGameCount } from "@/lib/utils/data-validation";

function LeaderboardViewComponent() {
  const { data, isLoading, error, refetch, isRefetching } = useLeaderboard();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      toast.success("Leaderboard updated!");
    } catch {
      toast.error("Failed to refresh leaderboard");
    }
  }, [refetch]);

  const handleCardToggle = useCallback((playerId: string) => {
    setExpandedCard(current => (current === playerId ? null : playerId));
  }, []);

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load leaderboard: {error.message}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} className="w-full">
          Try Again
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertDescription>No leaderboard data available</AlertDescription>
      </Alert>
    );
  }

  // Sort players by rating (desc), then games (desc), then name (alphabetically)
  // Filter out invalid entries first
  const sortedPlayers = [...data.players]
    .filter(player => {
      // Filter out players with invalid ratings
      return isFinite(player.rating) && !isNaN(player.rating);
    })
    .sort((a, b) => {
      // Primary: Rating (descending)
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }
      // Secondary: Games played (descending)
      if (a.gamesPlayed !== b.gamesPlayed) {
        return b.gamesPlayed - a.gamesPlayed;
      }
      // Tertiary: Name (alphabetical)
      return a.name.localeCompare(b.name);
    });

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      isRefreshing={isRefetching}
      className="min-h-screen"
    >
      <div className="space-y-6" data-testid={TEST_IDS.LEADERBOARD_VIEW}>
        {error && data && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load leaderboard</AlertDescription>
          </Alert>
        )}

        <ConfigurableLeaderboardHeader
          seasonName={data.seasonName}
          totalGames={safeFormatGameCount(data.totalGames)}
          totalPlayers={sortedPlayers.length}
          data-testid={TEST_IDS.LEADERBOARD_HEADER}
        />

        <div className="space-y-2">
          {sortedPlayers.map((player, index) => (
            <ExpandablePlayerCard
              key={player.id}
              player={player}
              rank={index + 1}
              isExpanded={expandedCard === player.id}
              onToggle={() => handleCardToggle(player.id)}
              data-testid={`${TEST_IDS.PLAYER_CARD}-${player.id}`}
            />
          ))}
        </div>
      </div>
    </PullToRefresh>
  );
}

export const LeaderboardView = React.memo(LeaderboardViewComponent);

const LeaderboardSkeleton = React.memo(function LeaderboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>

      {/* Cards skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
});
