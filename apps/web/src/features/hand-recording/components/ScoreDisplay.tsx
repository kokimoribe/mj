"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

interface Player {
  id: string;
  name: string;
  seat: "east" | "south" | "west" | "north";
  score: number;
  isDealer: boolean;
  hasRiichi: boolean;
}

interface ScoreDisplayProps {
  players: Player[];
  onRiichiDeclare?: (playerId: string) => void;
}

export function ScoreDisplay({ players, onRiichiDeclare }: ScoreDisplayProps) {
  const seatOrder = ["east", "south", "west", "north"];
  const sortedPlayers = [...players].sort(
    (a, b) => seatOrder.indexOf(a.seat) - seatOrder.indexOf(b.seat)
  );

  return (
    <div className="grid grid-cols-2 gap-2">
      {sortedPlayers.map(player => (
        <Card key={player.id} data-testid="player-score">
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{player.name}</span>
                  {player.isDealer && (
                    <Crown
                      className="h-4 w-4 text-yellow-500"
                      data-testid="dealer-indicator"
                      data-player={player.seat}
                    />
                  )}
                </div>
                <div className="text-muted-foreground text-xs uppercase">
                  {player.seat}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-lg font-bold"
                  data-testid={`player-score-${player.name.toLowerCase()}`}
                >
                  {player.score.toLocaleString()}
                </div>
                {player.hasRiichi && (
                  <Badge
                    variant="destructive"
                    className="text-xs"
                    data-testid={`riichi-indicator-${player.name.toLowerCase()}`}
                  >
                    RIICHI
                  </Badge>
                )}
              </div>
            </div>
            {onRiichiDeclare && !player.hasRiichi && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => onRiichiDeclare(player.id)}
                data-testid={`riichi-button-${player.name.toLowerCase()}`}
              >
                Declare Riichi
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
