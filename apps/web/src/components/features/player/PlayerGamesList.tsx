"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
    id?: string; // Optional ID, will use name as fallback
    placement: number;
    score: number;
  }>;
}

interface PlayerGamesListProps {
  playerId: string;
  initialGames: PlayerGame[];
}

export function PlayerGamesList({
  playerId,
  initialGames,
}: PlayerGamesListProps) {
  const [displayedGames, setDisplayedGames] = useState(5); // Start by showing 5 games
  const allGames = initialGames; // All games are loaded initially
  const visibleGames = allGames.slice(0, displayedGames);
  const hasMore = displayedGames < allGames.length;

  const loadMore = () => {
    // Show 5 more games each time
    setDisplayedGames(prev => Math.min(prev + 5, allGames.length));
  };

  const showLess = () => {
    // Go back to showing only 5 games
    setDisplayedGames(5);
  };

  const getPlacementEmoji = (placement: number) => {
    switch (placement) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "4️⃣";
    }
  };

  const getPlacementText = (placement: number) => {
    switch (placement) {
      case 1:
        return "1st Place";
      case 2:
        return "2nd Place";
      case 3:
        return "3rd Place";
      default:
        return "4th Place";
    }
  };

  if (allGames.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        No games played yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleGames.map(game => (
        <Card key={game.id} data-testid={`player-game-${game.id}`}>
          <CardContent className="p-4">
            <div className="space-y-2">
              {/* Date and Placement */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(game.date), "MMM d, yyyy • h:mm a")}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {getPlacementEmoji(game.placement)}
                    </span>
                    <span className="font-medium">
                      {getPlacementText(game.placement)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">Rating</p>
                  <p className="font-mono text-sm">
                    {game.ratingBefore.toFixed(1)} →{" "}
                    {game.ratingAfter.toFixed(1)}
                  </p>
                  <p
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      game.ratingChange >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {game.ratingChange >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {game.ratingChange >= 0 ? "↑" : "↓"}
                    {Math.abs(game.ratingChange).toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Score Information */}
              <div className="flex items-center justify-between border-t pt-2">
                <div>
                  <p className="text-muted-foreground text-sm">Final Score</p>
                  <p className="font-mono">{game.score.toLocaleString()} pts</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Plus/Minus</p>
                  <p
                    className={cn(
                      "font-mono font-semibold",
                      game.plusMinus >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {game.plusMinus >= 0 ? "+" : ""}
                    {game.plusMinus.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Opponents */}
              <div className="border-t pt-2">
                <p className="text-muted-foreground mb-1 text-sm">
                  <Users className="mr-1 inline h-3 w-3" />
                  vs.{" "}
                  {game.opponents.map((opponent, index) => (
                    <span key={opponent.name}>
                      <Link
                        href={`/player/${opponent.id || opponent.name.toLowerCase()}`}
                        className="text-primary hover:underline"
                      >
                        {opponent.name}
                      </Link>
                      {index < game.opponents.length - 1 && ", "}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Showing X of Y indicator */}
      {allGames.length > 5 && (
        <div className="text-muted-foreground text-center text-sm">
          Showing {visibleGames.length} of {allGames.length} games
        </div>
      )}

      {/* Load More / Show Less buttons */}
      <div className="flex gap-2">
        {hasMore && (
          <Button variant="outline" className="flex-1" onClick={loadMore}>
            Load More Games
          </Button>
        )}
        {displayedGames > 5 && (
          <Button variant="outline" className="flex-1" onClick={showLess}>
            Show Less
          </Button>
        )}
      </div>
    </div>
  );
}

export function PlayerGamesListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  );
}
