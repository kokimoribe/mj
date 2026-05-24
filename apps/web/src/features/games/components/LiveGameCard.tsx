"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";
import { type OngoingGameData } from "@/lib/supabase/queries";
import {
  type Seat,
  STARTING_POINTS,
  computeNextHandStateFromEvents,
} from "@/lib/mahjong";
import { formatPoints } from "@/lib/mahjong";
import { Calendar, Info, Check } from "lucide-react";
import { toast } from "sonner";

interface HandEvent {
  id: string;
  hand_seq: number;
  seat: Seat;
  event_type: string;
  points_delta: number;
  riichi_declared: boolean;
  round_kanji: string;
  kyoku: number;
  honba: number;
  // `details` carries `tenpaiSeats` / `winnerSeats` which the dealer
  // rotation helper consults to correctly handle dealer-riichi-at-draw
  // edge cases (e.g. dealer net delta 0 but still tenpai).
  details: Record<string, unknown> | null;
}

const ROUND_INFO: Record<string, { name: string; kanji: string }> = {
  E: { name: "East", kanji: "東" },
  S: { name: "South", kanji: "南" },
  W: { name: "West", kanji: "西" },
  N: { name: "North", kanji: "北" },
};

interface LiveGameCardProps {
  game: OngoingGameData;
}

export function LiveGameCard({ game }: LiveGameCardProps) {
  const [handEvents, setHandEvents] = useState<HandEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameIdCopied, setGameIdCopied] = useState(false);

  useEffect(() => {
    async function loadHandEvents() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: handEvents, error } = await supabase
          .from("hand_events")
          .select("*")
          .eq("game_id", game.id)
          .order("hand_seq", { ascending: true })
          .order("seat", { ascending: true });

        if (error) {
          console.error("Error fetching hand events:", error);
        }

        setHandEvents((handEvents as HandEvent[]) || []);
      } catch (error) {
        console.error("Error loading hand events:", error);
        setHandEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadHandEvents();
  }, [game.id]);

  // Calculate current scores
  const currentScores = useMemo((): Record<Seat, number> => {
    const scores: Record<Seat, number> = {
      east: STARTING_POINTS,
      south: STARTING_POINTS,
      west: STARTING_POINTS,
      north: STARTING_POINTS,
    };

    if (!handEvents) return scores;

    for (const event of handEvents) {
      scores[event.seat] += event.points_delta;
    }

    return scores;
  }, [handEvents]);

  // Derive next hand's round/kyoku/honba via the shared pure helper so
  // this card stays in sync with the live game page. The helper reads
  // `details.tenpaiSeats` to handle dealer-tenpai edge cases correctly.
  const { round, kyoku, honba } = useMemo(
    () => computeNextHandStateFromEvents(handEvents),
    [handEvents]
  );

  // Calculate riichi sticks
  const riichiSticks = useMemo(() => {
    if (!handEvents) return 0;

    const handGroups: Record<number, HandEvent[]> = {};
    for (const event of handEvents) {
      if (!handGroups[event.hand_seq]) {
        handGroups[event.hand_seq] = [];
      }
      handGroups[event.hand_seq].push(event);
    }

    const sortedHandSeqs = Object.keys(handGroups)
      .map(Number)
      .sort((a, b) => a - b);

    let sticks = 0;
    for (const handSeq of sortedHandSeqs) {
      const events = handGroups[handSeq];
      const isWin = events.some(
        e => e.event_type === "ron" || e.event_type === "tsumo"
      );
      const riichiCount = events.filter(e => e.riichi_declared).length;

      if (isWin) {
        // Winner claims all accumulated sticks
        sticks = 0;
      } else {
        // Draw - riichi sticks stay on the table
        sticks += riichiCount;
      }
    }

    return sticks;
  }, [handEvents]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Get player info with scores
  const playersWithScores = game.game_seats.map(seat => {
    const seatKey = seat.seat as Seat;
    return {
      id: seat.player_id,
      name: seat.players.display_name,
      seat: seatKey,
      score: currentScores[seatKey],
    };
  });

  // Sort by score descending
  const sortedPlayers = [...playersWithScores].sort(
    (a, b) => b.score - a.score
  );

  const startedAtDate = new Date(game.started_at);
  const startedAtLabel = Number.isNaN(startedAtDate.getTime())
    ? "Unknown start time"
    : `${format(startedAtDate, "MMM d, yyyy")} • ${format(startedAtDate, "h:mm a")}`;

  return (
    <Link href={`/game/${game.id}/live`} className="block">
      <Card
        className="border-primary/50 bg-primary/5 hover:bg-primary/10 cursor-pointer gap-0 transition-colors"
        data-testid="live-game-card"
      >
        <CardHeader className="pb-2">
          {/* Started date/time + Game ID tooltip */}
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <div className="flex items-center gap-2">
              <span>{startedAtLabel}</span>
              <span aria-hidden="true">•</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Game ID"
                      onClick={async e => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          // Try modern clipboard API first
                          if (
                            navigator.clipboard &&
                            navigator.clipboard.writeText
                          ) {
                            await navigator.clipboard.writeText(game.id);
                          } else {
                            // Fallback for iOS Safari and older browsers
                            const textArea = document.createElement("textarea");
                            textArea.value = game.id;
                            textArea.style.position = "fixed";
                            textArea.style.left = "-999999px";
                            textArea.style.top = "-999999px";
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();

                            const successful = document.execCommand("copy");
                            document.body.removeChild(textArea);

                            if (!successful) {
                              throw new Error("Copy command failed");
                            }
                          }

                          setGameIdCopied(true);
                          toast.success("Game ID copied to clipboard");
                          // Reset the copied state after 2 seconds
                          setTimeout(() => {
                            setGameIdCopied(false);
                          }, 2000);
                        } catch {
                          toast.error("Failed to copy Game ID");
                        }
                      }}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="border-slate-700 bg-slate-900 text-white dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-white">
                        Game ID
                      </span>
                      <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 font-mono text-xs text-white dark:border-slate-800 dark:bg-slate-900">
                        {game.id}
                      </span>
                      {gameIdCopied ? (
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-green-400">
                          <Check className="h-3 w-3" />
                          <span className="font-medium">Copied!</span>
                        </div>
                      ) : (
                        <span className="mt-0.5 text-xs text-slate-300 dark:text-slate-400">
                          Click to copy
                        </span>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Round + table state (centered) */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className="text-sm">
              {ROUND_INFO[round]?.name ?? round} (
              {ROUND_INFO[round]?.kanji ?? ""}) {kyoku}
            </Badge>
            {honba > 0 && (
              <Badge variant="secondary" className="text-xs">
                {honba} Honba
              </Badge>
            )}
            {riichiSticks > 0 && (
              <Badge variant="secondary" className="text-xs">
                Riichi: {riichiSticks}
              </Badge>
            )}
          </div>

          {/* Player Scores */}
          <div className="space-y-1">
            {sortedPlayers.map((player, index) => {
              const rank = index + 1;
              const isWinning = player.score > STARTING_POINTS;
              const isLosing = player.score < STARTING_POINTS;

              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {rank === 1 && "🥇"}
                      {rank === 2 && "🥈"}
                      {rank === 3 && "🥉"}
                      {rank === 4 && "4️⃣"}
                    </span>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <span
                    className={`font-semibold tabular-nums ${
                      isWinning
                        ? "text-green-500"
                        : isLosing
                          ? "text-red-500"
                          : ""
                    }`}
                  >
                    {formatPoints(player.score)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
