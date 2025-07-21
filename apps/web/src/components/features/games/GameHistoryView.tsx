"use client";

import { useState, useMemo, memo } from "react";
import {
  useGameHistory,
  useAllPlayers,
  usePlayerGameCounts,
} from "@/lib/queries";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { testIds } from "@/lib/test-ids";

interface Player {
  id: string;
  name: string;
}

export const GameHistoryView = memo(function GameHistoryView() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>(
    undefined
  );
  const [showingAll, setShowingAll] = useState(false);

  // Fetch data
  const {
    data: gameData,
    isLoading: gamesLoading,
    error: gamesError,
  } = useGameHistory(selectedPlayerId);
  const { data: players, isLoading: playersLoading } = useAllPlayers();
  const { data: gameCounts } = usePlayerGameCounts();

  // Calculate visible games based on showingAll state
  const visibleGames = useMemo(() => {
    if (!gameData?.games) return [];
    return showingAll ? gameData.games : gameData.games.slice(0, 10);
  }, [gameData?.games, showingAll]);

  // Calculate total games (max of all player game counts)
  const totalGames = useMemo(() => {
    if (selectedPlayerId && gameCounts) {
      return gameCounts[selectedPlayerId] || 0;
    }
    return gameData?.totalGames || 0;
  }, [gameData?.totalGames, selectedPlayerId, gameCounts]);

  if (gamesLoading || playersLoading) {
    return <GameHistorySkeleton />;
  }

  if (gamesError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load game history</AlertDescription>
      </Alert>
    );
  }

  const games = gameData?.games || [];

  return (
    <div className="space-y-4" data-testid={testIds.gameHistory.container}>
      {/* Header */}
      <div data-testid={testIds.gameHistory.header}>
        <h1 className="text-2xl font-bold">🎮 Game History</h1>
        <p className="text-muted-foreground text-sm">
          Season 3 •{" "}
          <span data-testid={testIds.gameHistory.gameCount}>
            {totalGames} games
          </span>
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2">
        <Select
          value={selectedPlayerId || "all"}
          onValueChange={value => {
            setSelectedPlayerId(value === "all" ? undefined : value);
            setShowingAll(false); // Reset pagination when filter changes
          }}
        >
          <SelectTrigger
            className="w-[200px]"
            data-testid={testIds.gameHistory.filterDropdown}
            aria-label="Filter games by player"
          >
            <SelectValue placeholder="Filter by player" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games</SelectItem>
            {players?.map((player: Player) => {
              const count = gameCounts?.[player.id] || 0;
              return (
                <SelectItem key={player.id} value={player.id}>
                  {player.name} ({count} games)
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Games List */}
      {games.length === 0 ? (
        <Card data-testid={testIds.gameHistory.emptyState}>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {selectedPlayerId ? "No games found" : "No games played yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            className="space-y-3"
            data-testid={testIds.gameHistory.gamesList}
          >
            {visibleGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          {/* Load More / Show Less Button */}
          {games.length > 10 && (
            <div className="flex justify-center">
              {!showingAll ? (
                <Button
                  variant="outline"
                  onClick={() => setShowingAll(true)}
                  data-testid={testIds.gameHistory.loadMoreButton}
                >
                  Load More Games
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowingAll(false)}
                  data-testid={testIds.gameHistory.showLessButton}
                >
                  Show Less Games
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
});

interface GameCardProps {
  game: {
    id: string;
    date: string;
    results: Array<{
      playerId: string;
      playerName: string;
      placement: number;
      rawScore: number;
      scoreAdjustment: number;
      ratingChange: number;
    }>;
  };
}

const GameCard = memo(function GameCard({ game }: GameCardProps) {
  const getPlacementMedal = (placement: number) => {
    switch (placement) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      case 4:
        return "4️⃣";
      default:
        return placement.toString();
    }
  };

  const formatRatingChange = (change: number) => {
    if (change === 0) return "—";
    const arrow = change > 0 ? "↑" : "↓";
    return `${arrow}${Math.abs(change)}`;
  };

  const formatScore = (score: number) => {
    return score.toLocaleString();
  };

  const formatScoreAdjustment = (adjustment: number) => {
    const sign = adjustment >= 0 ? "+" : "";
    return `${sign}${adjustment.toLocaleString()}`;
  };

  return (
    <Card
      data-testid={testIds.gameHistory.gameCard}
      aria-label={`Game played on ${format(new Date(game.date), "MMM d, yyyy")}`}
    >
      <CardHeader className="pb-3">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span data-testid="game-date">
            {format(new Date(game.date), "MMM d, yyyy")} •{" "}
            {format(new Date(game.date), "h:mm a")}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {game.results.map(result => (
            <div
              key={`${game.id}-${result.playerId}`}
              className="flex items-center justify-between text-sm"
              data-testid="player-result"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {getPlacementMedal(result.placement)}
                </span>
                <span className="font-medium">{result.playerName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span>{formatScore(result.rawScore)}</span>
                <span>→</span>
                <span
                  className={
                    result.scoreAdjustment >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {formatScoreAdjustment(result.scoreAdjustment)}
                </span>
                <Badge variant="outline" className="text-xs">
                  {formatRatingChange(result.ratingChange)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

function GameHistorySkeleton() {
  return (
    <div className="space-y-4" data-testid={testIds.gameHistory.loadingState}>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-[200px]" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}
