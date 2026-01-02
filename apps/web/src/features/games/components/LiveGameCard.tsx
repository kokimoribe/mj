"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";
import { fetchOngoingGame, type OngoingGameData } from "@/lib/supabase/queries";
import { type Seat, STARTING_POINTS, SEATS, type Round } from "@/lib/mahjong";
import { formatPoints } from "@/lib/mahjong";
import { Circle, Info, Check } from "lucide-react";
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
}

interface GameWithHands extends OngoingGameData {
  handEvents: HandEvent[];
}

const ROUND_INFO: Record<string, { name: string; kanji: string }> = {
  E: { name: "East", kanji: "東" },
  S: { name: "South", kanji: "南" },
  W: { name: "West", kanji: "西" },
  N: { name: "North", kanji: "北" },
};

export function LiveGameCard() {
  const router = useRouter();
  const [game, setGame] = useState<GameWithHands | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameIdCopied, setGameIdCopied] = useState(false);

  useEffect(() => {
    async function loadOngoingGame() {
      setLoading(true);
      try {
        const ongoingGame = await fetchOngoingGame();
        if (!ongoingGame) {
          setGame(null);
          setLoading(false);
          return;
        }

        // Fetch hand events for this game
        const supabase = createClient();
        const { data: handEvents, error } = await supabase
          .from("hand_events")
          .select("*")
          .eq("game_id", ongoingGame.id)
          .order("hand_seq", { ascending: true })
          .order("seat", { ascending: true });

        if (error) {
          console.error("Error fetching hand events:", error);
        }

        setGame({
          ...ongoingGame,
          handEvents: (handEvents as HandEvent[]) || [],
        });
      } catch (error) {
        console.error("Error loading ongoing game:", error);
        setGame(null);
      } finally {
        setLoading(false);
      }
    }

    loadOngoingGame();
  }, []);

  // Calculate current scores
  const currentScores = useMemo((): Record<Seat, number> => {
    const scores: Record<Seat, number> = {
      east: STARTING_POINTS,
      south: STARTING_POINTS,
      west: STARTING_POINTS,
      north: STARTING_POINTS,
    };

    if (!game?.handEvents) return scores;

    for (const event of game.handEvents) {
      scores[event.seat] += event.points_delta;
    }

    return scores;
  }, [game?.handEvents]);

  // Calculate round/kyoku/honba from last hand event
  const { round, kyoku, honba } = useMemo(() => {
    if (!game?.handEvents || game.handEvents.length === 0) {
      return {
        round: "E" as Round,
        kyoku: 1,
        honba: 0,
      };
    }

    // Get the last hand sequence
    const lastHandSeq = Math.max(...game.handEvents.map(e => e.hand_seq));
    const lastHandEvents = game.handEvents.filter(
      e => e.hand_seq === lastHandSeq
    );
    const lastEvent = lastHandEvents[0];

    if (!lastEvent) {
      return {
        round: "E" as Round,
        kyoku: 1,
        honba: 0,
      };
    }

    // Determine next round based on last event
    let nextRound = lastEvent.round_kanji as Round;
    let nextKyoku = lastEvent.kyoku;
    let nextHonba = lastEvent.honba;

    const isWinningHand =
      lastEvent.event_type === "tsumo" || lastEvent.event_type === "ron";
    const dealerEvent = lastHandEvents.find(
      e => e.seat === SEATS[lastEvent.kyoku - 1]
    );
    const dealerWon: boolean = !!(
      isWinningHand &&
      dealerEvent &&
      dealerEvent.points_delta > 0
    );

    if (lastEvent.event_type === "chombo") {
      // Chombo: no change
    } else if (dealerWon) {
      // Dealer won - honba increases
      nextHonba = lastEvent.honba + 1;
    } else if (lastEvent.event_type === "abortive_draw") {
      // Abortive draw - dealer stays, honba increases
      nextHonba = lastEvent.honba + 1;
    } else if (lastEvent.event_type === "draw") {
      // Exhaustive draw - check if dealer was tenpai
      const dealerWasTenpai = dealerEvent && dealerEvent.points_delta > 0;
      nextHonba = lastEvent.honba + 1;

      if (!dealerWasTenpai) {
        // Dealer was noten - rotate dealer
        if (nextKyoku >= 4) {
          const rounds: Round[] = ["E", "S", "W", "N"];
          const currentRoundIndex = rounds.indexOf(nextRound);
          if (currentRoundIndex < rounds.length - 1) {
            nextRound = rounds[currentRoundIndex + 1];
            nextKyoku = 1;
          }
        } else {
          nextKyoku = nextKyoku + 1;
        }
      }
    } else {
      // Dealer rotation
      nextHonba = 0;
      if (nextKyoku >= 4) {
        const rounds: Round[] = ["E", "S", "W", "N"];
        const currentRoundIndex = rounds.indexOf(nextRound);
        if (currentRoundIndex < rounds.length - 1) {
          nextRound = rounds[currentRoundIndex + 1];
          nextKyoku = 1;
        }
      } else {
        nextKyoku = nextKyoku + 1;
      }
    }

    return {
      round: nextRound,
      kyoku: nextKyoku,
      honba: nextHonba,
    };
  }, [game?.handEvents]);

  // Calculate riichi sticks
  const riichiSticks = useMemo(() => {
    if (!game?.handEvents) return 0;

    const handGroups: Record<number, HandEvent[]> = {};
    for (const event of game.handEvents) {
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
  }, [game?.handEvents]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!game) {
    return null; // No ongoing game
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

  return (
    <Link href={`/game/${game.id}/live`} className="block">
      <Card
        className="border-primary/50 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors"
        data-testid="live-game-card"
      >
        <CardHeader className="pb-2">
          {/* Round Info with tooltip */}
          <div className="flex items-center justify-start gap-2">
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
        </CardHeader>
        <CardContent className="space-y-2">
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
