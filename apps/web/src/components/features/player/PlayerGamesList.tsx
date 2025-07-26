"use client";

import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PlayerGame {
  id: string;
  date: string;
  placement: number;
  score: number;
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number;
  opponents: Array<{
    id: string;
    name: string;
    placement: number;
    score: number;
  }>;
  // Note: plusMinus (uma/oka) removed - it's an internal calculation detail
}

interface PlayerGamesListProps {
  playerId: string;
  initialGames: PlayerGame[];
}

export const PlayerGamesList = memo(function PlayerGamesList({
  playerId: _playerId,
  initialGames,
}: PlayerGamesListProps) {
  const [displayedGames, setDisplayedGames] = useState(5); // Start by showing 5 games
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const allGames = initialGames; // All games are loaded initially
  const visibleGames = allGames.slice(0, displayedGames);
  const hasMore = displayedGames < allGames.length;

  // Debug logging - remove after fixing
  if (
    typeof window !== "undefined" &&
    window.location.search.includes("debug")
  ) {
    console.log(
      "PlayerGamesList games:",
      initialGames.slice(0, 10).map((g, i) => ({
        index: i + 1,
        placement: g.placement,
        ratingChange: g.ratingChange,
        ratingChangeSign: g.ratingChange >= 0 ? "positive" : "negative",
        date: g.date,
      }))
    );
  }

  const loadMore = () => {
    // Show 5 more games each time
    setIsLoadingMore(true);
    // Simulate async loading with a small delay
    setTimeout(() => {
      setDisplayedGames(prev => Math.min(prev + 5, allGames.length));
      setIsLoadingMore(false);
    }, 300);
  };

  const showLess = () => {
    // Go back to showing only 5 games
    setDisplayedGames(5);
  };

  const getPlacementOrdinal = (placement: number) => {
    switch (placement) {
      case 1:
        return "1st";
      case 2:
        return "2nd";
      case 3:
        return "3rd";
      default:
        return "4th";
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
        <div
          key={game.id}
          data-testid="game-entry"
          className="space-y-1 border-b pb-3 last:border-0"
        >
          {/* Format as per spec: [Date] • [Placement] • [↑↓Rating] */}
          <div className="text-sm">
            <span className="text-muted-foreground">
              {format(new Date(game.date), "MMM d")}
            </span>
            {" • "}
            <span className="font-medium">
              {getPlacementOrdinal(game.placement)}
            </span>
            {" • "}
            <span
              className={cn(
                isFinite(game.ratingChange) && !isNaN(game.ratingChange)
                  ? game.ratingChange >= 0
                    ? "text-green-600"
                    : "text-red-600"
                  : "text-muted-foreground"
              )}
            >
              {isFinite(game.ratingChange) && !isNaN(game.ratingChange) ? (
                <>
                  {game.ratingChange >= 0 ? "↑" : "↓"}
                  {Math.abs(game.ratingChange).toFixed(1)}
                </>
              ) : (
                "—" // Show dash for invalid rating changes
              )}
            </span>
          </div>
          {/* vs. opponents line */}
          <div className="text-muted-foreground text-sm">
            vs.{" "}
            {game.opponents.map((opponent, index) => (
              <span key={opponent.name}>
                <Link
                  href={`/player/${opponent.id}`}
                  className="text-primary hover:underline"
                  data-testid="opponent-link"
                >
                  {opponent.name}
                </Link>
                {index < game.opponents.length - 1 && ", "}
              </span>
            ))}
          </div>
        </div>
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
          <Button
            variant="outline"
            className="flex-1"
            onClick={loadMore}
            disabled={isLoadingMore}
            data-testid="load-more-games"
          >
            {isLoadingMore ? "Loading..." : "Show More Games"}
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
});

export function PlayerGamesListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  );
}
