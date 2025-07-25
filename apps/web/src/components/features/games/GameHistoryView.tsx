"use client";

import { useState, useMemo, memo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { safeFormatNumber } from "@/lib/utils/data-validation";

interface Player {
  id: string;
  display_name: string;
}

export const GameHistoryView = memo(function GameHistoryView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>(
    searchParams.get("player") || undefined
  );
  const [showingAll, setShowingAll] = useState(
    searchParams.get("showAll") === "true"
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedPlayerId) {
      params.set("player", selectedPlayerId);
    }

    if (showingAll) {
      params.set("showAll", "true");
    }

    const paramString = params.toString();
    const newPath = paramString ? `/games?${paramString}` : "/games";

    // Only update if URL would actually change
    if (window.location.pathname + window.location.search !== newPath) {
      router.replace(newPath, { scroll: false });
    }
  }, [selectedPlayerId, showingAll, router]);

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

  // Calculate total games
  const totalGames = useMemo(() => {
    if (selectedPlayerId && gameCounts) {
      // When filtered by player, show that player's game count
      return gameCounts[selectedPlayerId] || 0;
    }
    // For all games, use the total from the API which gives the actual unique game count
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
    <div className="space-y-4" data-testid="game-history-view">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">🎮 Game History</h1>
        <p className="text-muted-foreground text-sm">
          Season 3 • {totalGames} games
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
            className="h-11 w-[200px]"
            data-testid="player-filter"
            aria-label="Filter games by player"
          >
            <SelectValue placeholder="Filter by player" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" data-testid="filter-option">
              All Games
            </SelectItem>
            {players?.map((player: Player) => {
              const count = gameCounts?.[player.id] || 0;
              return (
                <SelectItem
                  key={player.id}
                  value={player.id}
                  data-testid="filter-option"
                >
                  {player.display_name} ({count}{" "}
                  {count === 1 ? "game" : "games"})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Games List */}
      {games.length === 0 ? (
        <Card data-testid="empty-state">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {selectedPlayerId ? "No games found" : "No games played yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
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
                  data-testid="load-more-button"
                >
                  Load More Games
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowingAll(false)}
                  data-testid="show-less-button"
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
    const validated = safeFormatNumber(change, 1);
    if (validated === "--") return "—";

    // Always show rating changes with arrows, even if 0
    const arrow = change >= 0 ? "↑" : "↓";
    const absChange = Math.abs(change);
    // Always show one decimal place for consistency
    const formatted = absChange.toFixed(1);
    return `${arrow}${formatted}`;
  };

  const formatScore = (score: number) => {
    const formatted = safeFormatNumber(score, 0);
    if (formatted === "--") return "0";
    return parseInt(formatted).toLocaleString();
  };

  return (
    <Card
      data-testid="game-card"
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
                <span className="text-lg" data-testid="placement">
                  {getPlacementMedal(result.placement)}
                </span>
                <Link
                  href={`/player/${result.playerId}`}
                  className="font-medium hover:underline"
                  data-testid="player-name"
                >
                  {result.playerName}
                </Link>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span data-testid="final-score">
                  {formatScore(result.rawScore)}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs"
                  data-testid="rating-change"
                >
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
    <div className="space-y-4">
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
