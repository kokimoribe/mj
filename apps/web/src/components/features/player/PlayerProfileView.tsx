"use client";

import { useMemo } from "react";
import {
  usePlayerProfile,
  usePlayerGames,
  useLeaderboard,
} from "@/lib/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Trophy,
  ChartLine,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { RatingChart } from "./RatingChart";
import { PlayerGamesList } from "./PlayerGamesList";

interface PlayerGame {
  id: string;
  date: string;
  ratingChange?: number;
}

interface PlayerProfileViewProps {
  playerId: string;
}

export function PlayerProfileView({ playerId }: PlayerProfileViewProps) {
  const router = useRouter();
  const { data: player, isLoading, error } = usePlayerProfile(playerId);
  const { data: gamesData, isLoading: gamesLoading } = usePlayerGames(playerId);
  const { data: leaderboardData } = useLeaderboard();

  // Calculate player rank from leaderboard position
  const playerRank = useMemo(() => {
    if (!leaderboardData || !player) return null;

    // Sort players by rating (desc), then games (desc), then name (alphabetically)
    const sortedPlayers = [...leaderboardData.players].sort((a, b) => {
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }
      if (a.games !== b.games) {
        return b.games - a.games;
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

  if (isLoading) {
    return <PlayerProfileSkeleton />;
  }

  if (error || !player) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>Failed to load player profile</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Mock calculations (would come from API)
  const avgPlacement = 2.4; // TODO: Calculate from game history
  const recentTrend = player.ratingChange || 4.2; // TODO: Calculate 30-day change from game history
  const seasonChange = 8.1; // TODO: Calculate season total change

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} size="sm">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Player Header - Simplified */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{player.name}</CardTitle>
              <CardDescription>
                {playerRank
                  ? `Rank #${playerRank}`
                  : `Rating: ${player.rating.toFixed(1)}`}{" "}
                • {player.games} games
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Rating Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine className="h-5 w-5" />
            Rating Trend
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">30-day change</p>
                <p
                  className={cn(
                    "flex items-center gap-1 text-lg font-semibold",
                    recentTrend >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {recentTrend >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(recentTrend).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Season total</p>
                <p
                  className={cn(
                    "flex items-center gap-1 text-lg font-semibold",
                    seasonChange >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {seasonChange >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(seasonChange).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Performance Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Average Placement</p>
              <p className="font-semibold">{avgPlacement.toFixed(1)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Last Played</p>
              <p className="font-medium">
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
          <CardTitle>Recent Games</CardTitle>
        </CardHeader>
        <CardContent>
          {gamesLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : gamesData && gamesData.length > 0 ? (
            <PlayerGamesList playerId={playerId} initialGames={gamesData} />
          ) : (
            <div className="text-muted-foreground py-4 text-center text-sm">
              No games played yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
