"use client";

import { useMemo, memo } from "react";
import {
  usePlayerProfile,
  usePlayerGames,
  useLeaderboard,
} from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { RatingChart } from "./RatingChart";
import { PlayerGamesList } from "./PlayerGamesList";

interface PlayerGame {
  id: string;
  date: string;
  placement: number;
  score: number;
  plusMinus: number;
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number;
  opponents: Array<{
    name: string;
    placement: number;
    score: number;
  }>;
}

interface PlayerProfileViewProps {
  playerId: string;
}

export const PlayerProfileView = memo(function PlayerProfileView({
  playerId,
}: PlayerProfileViewProps) {
  const router = useRouter();
  const { data: player, isLoading, error } = usePlayerProfile(playerId);
  const { data: gamesData, isLoading: gamesLoading } = usePlayerGames(
    playerId,
    100
  ); // Get all games for chart
  const { data: leaderboardData } = useLeaderboard();

  // Calculate player rank from leaderboard position
  const playerRank = useMemo(() => {
    if (!leaderboardData || !player) return null;

    // Sort players by rating (desc), then games (desc), then name (alphabetically)
    const sortedPlayers = [...leaderboardData.players].sort((a, b) => {
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }
      if (a.gamesPlayed !== b.gamesPlayed) {
        return b.gamesPlayed - a.gamesPlayed;
      }
      return a.name.localeCompare(b.name);
    });

    const rankIndex = sortedPlayers.findIndex(p => p.id === player.id);
    return rankIndex >= 0 ? rankIndex + 1 : null;
  }, [leaderboardData, player]);

  // Calculate rating history from games
  const ratingHistory = useMemo(() => {
    if (!gamesData || gamesData.length === 0 || !player) return [];

    // Build rating history from games (newest to oldest)
    const history = [];
    let currentRating = player.rating;

    // Add current rating as the latest point
    history.push({
      date: new Date().toISOString(),
      rating: currentRating,
      gameId: "current",
      change: 0,
    });

    // Work backwards through games to build history
    gamesData.forEach((game: PlayerGame) => {
      const previousRating = currentRating - (game.ratingChange || 0);
      history.unshift({
        date: game.date,
        rating: previousRating,
        gameId: game.id,
        change: game.ratingChange || 0,
      });
      currentRating = previousRating;
    });

    return history;
  }, [gamesData, player]);

  // Calculate statistics from game history
  const avgPlacement = useMemo(() => {
    if (!gamesData || gamesData.length === 0) return null;
    const placements = gamesData
      .map((g: PlayerGame) => g.placement)
      .filter((p: number) => p >= 1 && p <= 4);
    if (placements.length === 0) return null;
    const sum = placements.reduce((a: number, b: number) => a + b, 0);
    return sum / placements.length;
  }, [gamesData]);

  const recentTrend = useMemo(() => {
    if (!gamesData || gamesData.length === 0) return null;
    if (!player) return null;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find the first game that is older than 30 days
    const gamesOlderThan30Days = gamesData.filter(
      (g: PlayerGame) => new Date(g.date) <= thirtyDaysAgo
    );

    if (gamesOlderThan30Days.length === 0) {
      // All games are within 30 days, use the oldest game's rating before
      if (gamesData.length > 0) {
        const oldestGame = gamesData[gamesData.length - 1];
        return player.rating - oldestGame.ratingBefore;
      }
      return null;
    }

    // Get the rating after the most recent game that's older than 30 days
    // This represents the player's rating 30 days ago
    const mostRecentOldGame = gamesOlderThan30Days[0];
    const ratingThirtyDaysAgo = mostRecentOldGame.ratingAfter;
    return player.rating - ratingThirtyDaysAgo;
  }, [gamesData, player]);

  if (isLoading) {
    return <PlayerProfileSkeleton />;
  }

  if (error || !player) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>Failed to load player profile</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.push("/")} size="sm">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Player Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{player.name}</h1>
        <h2 className="text-muted-foreground text-base">
          Rank #{playerRank || "—"} • Rating: {player.rating.toFixed(1)} •{" "}
          {player.gamesPlayed} games
        </h2>
      </div>

      {/* Rating Progression */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            Rating Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Rating chart */}
            {gamesLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <RatingChart data={ratingHistory} />
            )}

            {/* Trend stats */}
            <div className="flex justify-between text-sm">
              <div>Current: {player.rating.toFixed(1)}</div>
              <div>
                30-day:{" "}
                {recentTrend !== null ? (
                  <>
                    {recentTrend >= 0 ? "↑" : "↓"}
                    {Math.abs(recentTrend).toFixed(1)}
                  </>
                ) : (
                  "N/A"
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            Performance Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3" data-testid="performance-stats">
            <div>
              <p className="text-sm">
                Average Placement:{" "}
                {avgPlacement !== null ? avgPlacement.toFixed(1) : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm">
                Last Played:{" "}
                {formatDistanceToNow(new Date(player.lastGameDate), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Games */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="text-xl">🎮</span> Recent Games •{" "}
            <span className="text-muted-foreground text-sm font-normal">
              Showing{" "}
              {gamesData && gamesData.length > 0
                ? Math.min(5, gamesData.length)
                : 0}{" "}
              of {gamesData?.length || 0}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div data-testid="games-list">
            {gamesLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : gamesData && gamesData.length > 0 ? (
              <PlayerGamesList playerId={playerId} initialGames={gamesData} />
            ) : (
              <div className="text-muted-foreground py-4 text-center text-sm">
                No games played yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

function PlayerProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
