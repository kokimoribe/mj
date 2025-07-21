"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityIndicator } from "./ActivityIndicator";
import { useRouter } from "next/navigation";
import type { Player } from "@/lib/queries";

interface RatingCardProps {
  player: Player;
  rank: number;
  onTap?: () => void;
}

export function RatingCard({ player, rank, onTap }: RatingCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/player/${player.id}`);
    onTap?.();
  };

  return (
    <Card
      className="hover:bg-muted/50 active:bg-muted cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Rank indicator */}
            <div className="flex h-10 w-10 items-center justify-center">
              {rank === 1 && (
                <Badge className="h-10 w-10 rounded-full border-0 bg-yellow-500 text-lg font-bold text-white">
                  1
                </Badge>
              )}
              {rank === 2 && (
                <Badge className="h-10 w-10 rounded-full border-0 bg-gray-400 text-lg font-bold text-white">
                  2
                </Badge>
              )}
              {rank === 3 && (
                <Badge className="h-10 w-10 rounded-full border-0 bg-orange-600 text-lg font-bold text-white">
                  3
                </Badge>
              )}
              {rank > 3 && (
                <Badge
                  variant="outline"
                  className="h-10 w-10 rounded-full text-base"
                >
                  {rank}
                </Badge>
              )}
            </div>

            {/* Player info */}
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="font-semibold">{player.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {player.gamesPlayed} games
                </p>
              </div>

              {/* Activity indicator */}
              <ActivityIndicator
                lastGameDate={player.lastPlayed}
                className="ml-2"
              />
            </div>
          </div>

          {/* Rating display */}
          <div className="text-right">
            <div className="flex flex-col items-end">
              <span className="font-mono text-xl font-bold tabular-nums">
                {player.rating.toFixed(1)}
              </span>
              {/* Plus/Minus display */}
              <Badge
                variant={
                  player.averagePlusMinus >= 0 ? "default" : "destructive"
                }
                className="mt-1 text-xs"
              >
                {player.averagePlusMinus >= 0 ? "+" : ""}
                {player.averagePlusMinus.toFixed(1)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
