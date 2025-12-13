"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPoints, type Seat, STARTING_POINTS } from "@/lib/mahjong";
import { cn } from "@/lib/utils";

export interface PlayerScore {
  seat: Seat;
  playerId: string;
  playerName: string;
  score: number;
}

interface ScoreBoardProps {
  scores: PlayerScore[];
  dealerSeat: Seat;
  round: string;
  kyoku: number;
  honba: number;
  riichiSticks: number;
  /** Whether the game is currently in enchousen (overtime) */
  inEnchousen?: boolean;
  /** Whether this is the final round before game end */
  isFinalRound?: boolean;
  /** Game format for display context */
  gameFormat?: "hanchan" | "tonpuusen";
}

const SEAT_COLORS: Record<Seat, string> = {
  east: "bg-red-500/20 border-red-500/50",
  south: "bg-green-500/20 border-green-500/50",
  west: "bg-blue-500/20 border-blue-500/50",
  north: "bg-purple-500/20 border-purple-500/50",
};

const SEAT_DISPLAY: Record<Seat, { name: string; kanji: string }> = {
  east: { name: "East", kanji: "東" },
  south: { name: "South", kanji: "南" },
  west: { name: "West", kanji: "西" },
  north: { name: "North", kanji: "北" },
};

// Round letter to full name and kanji
const ROUND_INFO: Record<string, { name: string; kanji: string }> = {
  E: { name: "East", kanji: "東" },
  S: { name: "South", kanji: "南" },
  W: { name: "West", kanji: "西" },
  N: { name: "North", kanji: "北" },
};

// Static seat order for display
const SEAT_ORDER: Seat[] = ["east", "south", "west", "north"];

export function ScoreBoard({
  scores,
  dealerSeat,
  round,
  kyoku,
  honba,
  riichiSticks,
  inEnchousen = false,
  isFinalRound = false,
  gameFormat = "hanchan",
}: ScoreBoardProps) {
  // Order by static seat position: East, South, West, North
  const orderedScores = SEAT_ORDER.map(
    seat => scores.find(s => s.seat === seat)!
  ).filter(Boolean);

  // Calculate rank for each player based on score (descending)
  const sortedByScore = [...scores].sort((a, b) => b.score - a.score);
  const rankBySeat: Record<Seat, number> = {} as Record<Seat, number>;
  sortedByScore.forEach((player, index) => {
    rankBySeat[player.seat] = index + 1;
  });

  // Check if any player is busted
  const hasBustedPlayer = scores.some(s => s.score < 0);

  // Calculate total points to verify sum is correct
  // Include riichi sticks on the table (each worth 1000 points)
  const playerPoints = scores.reduce((sum, s) => sum + s.score, 0);
  const totalPoints = playerPoints + riichiSticks * 1000;
  const expectedTotal = STARTING_POINTS * 4;

  return (
    <div className="space-y-4">
      {/* Round Info */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge
          variant="outline"
          className="bg-primary/10 border-primary/50 text-lg font-bold"
        >
          {ROUND_INFO[round]?.name ?? round} ({ROUND_INFO[round]?.kanji ?? ""}){" "}
          {kyoku}
        </Badge>
        {honba > 0 && (
          <Badge variant="secondary" className="text-sm">
            {honba} Honba ({honba}本場)
          </Badge>
        )}
        {riichiSticks > 0 && (
          <Badge variant="secondary" className="text-sm">
            Riichi Sticks: {riichiSticks} (供託 {riichiSticks}本)
          </Badge>
        )}
        {/* Enchousen indicator */}
        {inEnchousen && (
          <Badge className="border-blue-500/50 bg-blue-500/20 text-sm text-blue-500">
            延長戦 Enchousen
          </Badge>
        )}
        {/* Final round indicator */}
        {isFinalRound && !inEnchousen && (
          <Badge className="border-yellow-500/50 bg-yellow-500/20 text-sm text-yellow-600">
            Final Round ({gameFormat === "hanchan" ? "Oorasu" : "Last Hand"})
          </Badge>
        )}
        {/* Bust warning */}
        {hasBustedPlayer && (
          <Badge variant="destructive" className="animate-pulse text-sm">
            Player Busted!
          </Badge>
        )}
      </div>

      {/* Score Cards - Grid Layout */}
      <div className="grid grid-cols-2 gap-3">
        {orderedScores.map(playerScore => {
          const isDealer = playerScore.seat === dealerSeat;
          const isWinning = playerScore.score > STARTING_POINTS;
          const isLosing = playerScore.score < STARTING_POINTS;
          const isBusted = playerScore.score < 0;

          return (
            <Card
              key={playerScore.seat}
              className={cn(
                "border-2 transition-all",
                SEAT_COLORS[playerScore.seat],
                isDealer && "ring-2 ring-yellow-500 ring-offset-2",
                isBusted && "bg-red-500/5 ring-2 ring-red-500 ring-offset-2"
              )}
            >
              <CardContent className="flex flex-col items-center justify-center p-3 text-center">
                <div className="mb-2 flex h-5 gap-1">
                  {isDealer && (
                    <Badge
                      variant="outline"
                      className="border-yellow-500 bg-yellow-500/20 text-xs"
                    >
                      Dealer (親)
                    </Badge>
                  )}
                  {isBusted && (
                    <Badge
                      variant="destructive"
                      className="animate-pulse text-xs"
                    >
                      Busted (飛び)
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">
                    {rankBySeat[playerScore.seat] === 1 && "🥇"}
                    {rankBySeat[playerScore.seat] === 2 && "🥈"}
                    {rankBySeat[playerScore.seat] === 3 && "🥉"}
                    {rankBySeat[playerScore.seat] === 4 && "4️⃣"}
                  </span>
                  <span className="truncate text-lg font-bold">
                    {playerScore.playerName}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {SEAT_DISPLAY[playerScore.seat].name} (
                    {SEAT_DISPLAY[playerScore.seat].kanji})
                  </span>
                </div>
                <div
                  className={cn(
                    "mt-1 text-xl font-bold tabular-nums",
                    isWinning && "text-green-500",
                    isLosing && !isBusted && "text-red-500",
                    isBusted && "font-extrabold text-red-600"
                  )}
                >
                  {formatPoints(playerScore.score)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Point Total Check (Debug) */}
      {totalPoints !== expectedTotal && (
        <div className="text-destructive text-center text-xs">
          ⚠️ Point total mismatch: {formatPoints(totalPoints)} (expected{" "}
          {formatPoints(expectedTotal)})
        </div>
      )}
    </div>
  );
}
