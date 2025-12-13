"use client";

import { Trophy, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { type Seat, formatPoints } from "@/lib/mahjong";
import { type GameEndReason } from "@/hooks/useGameEndDetection";
import { cn } from "@/lib/utils";

export interface GameEndPlayerScore {
  seat: Seat;
  playerName: string;
  score: number;
}

interface GameEndDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Reason the game is ending */
  reason: GameEndReason;
  /** Custom message to display */
  message: string | null;
  /** Player scores for final standings */
  scores: GameEndPlayerScore[];
  /** Which player busted (if applicable) */
  bustedSeat: Seat | null;
  /** Callback when user confirms to finish the game */
  onFinish: () => void;
  /** Callback when user wants to continue anyway (edge case) */
  onContinue?: () => void;
  /** Whether the finish action is loading */
  isFinishing?: boolean;
}

const REASON_CONFIG: Record<
  NonNullable<GameEndReason>,
  {
    icon: typeof Trophy;
    title: string;
    iconColor: string;
    badgeVariant: "default" | "destructive" | "secondary";
  }
> = {
  bust: {
    icon: AlertTriangle,
    title: "Player Busted!",
    iconColor: "text-red-500",
    badgeVariant: "destructive",
  },
  natural_end: {
    icon: Trophy,
    title: "Game Complete!",
    iconColor: "text-yellow-500",
    badgeVariant: "default",
  },
  enchousen_end: {
    icon: Clock,
    title: "Enchousen Complete!",
    iconColor: "text-blue-500",
    badgeVariant: "secondary",
  },
};

const SEAT_DISPLAY: Record<Seat, { name: string; kanji: string }> = {
  east: { name: "East", kanji: "東" },
  south: { name: "South", kanji: "南" },
  west: { name: "West", kanji: "西" },
  north: { name: "North", kanji: "北" },
};

export function GameEndDialog({
  open,
  onOpenChange,
  reason,
  message,
  scores,
  bustedSeat,
  onFinish,
  onContinue,
  isFinishing = false,
}: GameEndDialogProps) {
  if (!reason) return null;

  const config = REASON_CONFIG[reason];
  const Icon = config.icon;

  // Sort scores by descending order for final standings
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  // Get placement emojis
  const getPlacementEmoji = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return "4️⃣";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh]">
        <SheetHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <div
              className={cn(
                "rounded-full p-3",
                reason === "bust" && "bg-red-500/10",
                reason === "natural_end" && "bg-yellow-500/10",
                reason === "enchousen_end" && "bg-blue-500/10"
              )}
            >
              <Icon className={cn("h-8 w-8", config.iconColor)} />
            </div>
          </div>
          <SheetTitle className="text-xl">{config.title}</SheetTitle>
          {message && (
            <SheetDescription className="text-base">{message}</SheetDescription>
          )}
        </SheetHeader>

        {/* Final Standings */}
        <div className="px-4 py-4">
          <h3 className="text-muted-foreground mb-3 text-center text-sm font-medium">
            Final Standings
          </h3>
          <div className="space-y-2">
            {sortedScores.map((player, index) => {
              const isBusted = player.seat === bustedSeat;
              const isWinner = index === 0;

              return (
                <div
                  key={player.seat}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3",
                    isWinner && "border-yellow-500/50 bg-yellow-500/5",
                    isBusted && "border-red-500/50 bg-red-500/5",
                    !isWinner && !isBusted && "border-border bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPlacementEmoji(index)}</span>
                    <div>
                      <div className="font-medium">{player.playerName}</div>
                      <div className="text-muted-foreground text-xs">
                        {SEAT_DISPLAY[player.seat].name} (
                        {SEAT_DISPLAY[player.seat].kanji})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-bold tabular-nums",
                        player.score >= 25000 && "text-green-500",
                        player.score < 25000 &&
                          player.score >= 0 &&
                          "text-yellow-500",
                        player.score < 0 && "text-red-500"
                      )}
                    >
                      {formatPoints(player.score)}
                    </span>
                    {isBusted && (
                      <Badge variant="destructive" className="text-xs">
                        Busted
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={onFinish}
            disabled={isFinishing}
            className="w-full"
            size="lg"
          >
            {isFinishing ? (
              <>Processing...</>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Finish Game
              </>
            )}
          </Button>
          {onContinue && (
            <Button
              variant="ghost"
              onClick={onContinue}
              disabled={isFinishing}
              className="text-muted-foreground w-full"
              size="sm"
            >
              Continue Anyway (Override)
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
