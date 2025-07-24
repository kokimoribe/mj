"use client";

import { useMemo, memo, useState } from "react";
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
import {
  safeFormatNumber,
  validatePlayerData,
} from "@/lib/utils/data-validation";

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
  const [selectedPeriod, setSelectedPeriod] = useState<
    "7d" | "14d" | "30d" | "all"
  >("all");

  const { data: rawPlayer, isLoading, error } = usePlayerProfile(playerId);
  const player = rawPlayer ? validatePlayerData(rawPlayer) : null;
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

  // Use materialized rating history from database or build efficiently from games
  const { ratingHistory, periodDelta } = useMemo(() => {
    if (!gamesData || gamesData.length === 0 || !player) {
      return { ratingHistory: [], periodDelta: null };
    }

    // Check if we have materialized rating history from database
    if (
      player.ratingHistory &&
      Array.isArray(player.ratingHistory) &&
      player.ratingHistory.length > 0
    ) {
      // Use materialized history - convert to chart format
      const points = player.ratingHistory.map(
        (rating: number, index: number) => ({
          date: gamesData[index]?.date || new Date().toISOString(),
          rating,
          gameId: gamesData[index]?.id || `game-${index}`,
          change:
            index > 0 && player.ratingHistory
              ? rating - player.ratingHistory[index - 1]
              : 0,
        })
      );

      // Add current rating point
      points.push({
        date: new Date().toISOString(),
        rating: player.rating,
        gameId: "current",
        change: 0,
      });

      return { ratingHistory: points, periodDelta: null }; // TODO: Calculate period delta from materialized data
    }

    // Fallback: build from games efficiently
    const chartPoints = gamesData.map((game: PlayerGame) => ({
      date: game.date,
      rating: game.ratingAfter,
      gameId: game.id,
      change: game.ratingChange || 0,
    }));

    // Add current rating as the latest point
    chartPoints.push({
      date: new Date().toISOString(),
      rating: player.rating,
      gameId: "current",
      change: 0,
    });

    // Filter based on selected period and calculate delta
    let filteredHistory = chartPoints;
    let delta = null;

    if (selectedPeriod !== "all") {
      const cutoffDate = new Date();
      const days =
        selectedPeriod === "7d" ? 7 : selectedPeriod === "14d" ? 14 : 30;
      cutoffDate.setDate(cutoffDate.getDate() - days);

      filteredHistory = chartPoints.filter(
        point => new Date(point.date) >= cutoffDate
      );

      // Calculate delta for the period
      // Find the oldest game in the period to get the baseline rating
      const oldestGameInPeriod = gamesData.find(
        (game: PlayerGame) => new Date(game.date) >= cutoffDate
      );
      if (oldestGameInPeriod) {
        // Use rating_before of the oldest game as baseline
        delta = player.rating - oldestGameInPeriod.ratingBefore;
      }
    } else {
      // For "all", calculate delta from first game
      const firstGame = gamesData[0];
      if (firstGame) {
        // Use rating_before of the first game as baseline
        delta = player.rating - firstGame.ratingBefore;
      }
    }

    return { ratingHistory: filteredHistory, periodDelta: delta };
  }, [gamesData, player, selectedPeriod]);

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
          Rank #{playerRank || "—"} • Rating:{" "}
          {safeFormatNumber(player.rating, 1)} • {player.gamesPlayed} games
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
            {/* Time range selector */}
            <div className="flex gap-1">
              <Button
                variant={selectedPeriod === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("7d")}
                aria-pressed={selectedPeriod === "7d"}
                className="flex-1"
              >
                7d
              </Button>
              <Button
                variant={selectedPeriod === "14d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("14d")}
                aria-pressed={selectedPeriod === "14d"}
                className="flex-1"
              >
                14d
              </Button>
              <Button
                variant={selectedPeriod === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("30d")}
                aria-pressed={selectedPeriod === "30d"}
                className="flex-1"
              >
                30d
              </Button>
              <Button
                variant={selectedPeriod === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("all")}
                aria-pressed={selectedPeriod === "all"}
                className="flex-1"
              >
                All
              </Button>
            </div>

            {/* Rating chart */}
            {gamesLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <RatingChart data={ratingHistory} />
            )}

            {/* Trend stats */}
            <div className="flex justify-between text-sm">
              <div>Current: {safeFormatNumber(player.rating, 1)}</div>
              <div>
                Period Δ:{" "}
                {periodDelta !== null && isFinite(periodDelta) ? (
                  <>
                    {periodDelta >= 0 ? "↑" : "↓"}
                    {safeFormatNumber(Math.abs(periodDelta), 1)}
                  </>
                ) : (
                  "—"
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
                {avgPlacement !== null && isFinite(avgPlacement)
                  ? safeFormatNumber(avgPlacement, 1)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm">
                Last Played:{" "}
                {player.lastPlayed
                  ? formatDistanceToNow(new Date(player.lastPlayed), {
                      addSuffix: true,
                    })
                  : "N/A"}
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
