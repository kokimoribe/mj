"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GamePageHeader } from "@/components/layout/GamePageHeader";
import { CompletedGameBadge } from "@/features/games/components/CompletedGameBadge";
import {
  ScoreBoard,
  HandHistory,
  type PlayerScore,
  type HandEvent,
} from "@/components/features/game-recording";
import { type Seat, SEATS, STARTING_POINTS, type Round } from "@/lib/mahjong";
import {
  useGameEndDetection,
  type GameFormat,
} from "@/hooks/useGameEndDetection";
import { createClient } from "@/lib/supabase/client";

interface GameSeat {
  seat: Seat;
  player_id: string;
  final_score: number | null;
  players: {
    id: string;
    display_name: string;
  };
}

interface GameData {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  game_format: GameFormat | null;
  game_seats: GameSeat[];
  handEvents: Array<{
    id: string;
    hand_seq: number;
    seat: Seat;
    event_type: string;
    riichi_declared: boolean;
    points_delta: number;
    round_kanji: string;
    kyoku: number;
    honba: number;
    details: Record<string, unknown>;
  }>;
}

export default function LiveGameViewPage() {
  const params = useParams();
  const gameId = params.id as string;

  const [game, setGame] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch game data
  const fetchGame = useCallback(async () => {
    try {
      const response = await fetch(`/api/games/${gameId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch game");
      }
      const data = await response.json();
      setGame(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game");
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  // Set up real-time subscription
  useEffect(() => {
    if (!gameId) return;

    const supabase = createClient();
    const channel = supabase
      .channel("live-game-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "hand_events",
          filter: `game_id=eq.${gameId}`,
        },
        _payload => {
          // Debounce bursts of inserts (one hand inserts multiple rows)
          if (refetchTimeoutRef.current) {
            clearTimeout(refetchTimeoutRef.current);
          }
          refetchTimeoutRef.current = setTimeout(() => {
            fetchGame();
          }, 150);
        }
      )
      .subscribe();

    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
        refetchTimeoutRef.current = null;
      }
      channel.unsubscribe();
    };
  }, [gameId, fetchGame]);

  // Calculate current scores from hand events
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

  // Calculate riichi sticks on table
  const riichiSticks = useMemo(() => {
    if (!game?.handEvents) return 0;

    // Group events by hand sequence
    const handGroups: Record<number, typeof game.handEvents> = {};

    for (const event of game.handEvents) {
      if (!handGroups[event.hand_seq]) {
        handGroups[event.hand_seq] = [];
      }
      handGroups[event.hand_seq].push(event);
    }

    // Process hands in order (important for tracking accumulation)
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
        // Winner claims ALL accumulated sticks + any declared this hand
        // After a win, the table is cleared
        sticks = 0;
      } else {
        // Draw - riichi sticks stay on the table
        sticks += riichiCount;
      }
    }

    return sticks;
  }, [game]);

  // Get game format (default to hanchan for backwards compatibility)
  const gameFormat: GameFormat = game?.game_format || "hanchan";

  // Calculate current round based on hand count
  const { round, kyoku, honba, dealerSeat, lastEventWasDealerWin } =
    useMemo((): {
      round: Round;
      kyoku: number;
      honba: number;
      dealerSeat: Seat;
      lastEventWasDealerWin: boolean;
    } => {
      if (!game?.handEvents || game.handEvents.length === 0) {
        return {
          round: "E" as Round,
          kyoku: 1,
          honba: 0,
          dealerSeat: "east" as Seat,
          lastEventWasDealerWin: false,
        };
      }

      // Get the last hand's round info
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
          dealerSeat: "east" as Seat,
          lastEventWasDealerWin: false,
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
        // Chombo: honba does NOT increase, dealer does not rotate
        // Keep same kyoku, same round, same honba
        // nextHonba remains unchanged (stays at lastEvent.honba)
        // nextKyoku and nextRound remain unchanged
      } else if (dealerWon) {
        // Dealer won - honba increases, same kyoku
        nextHonba = lastEvent.honba + 1;
      } else if (lastEvent.event_type === "abortive_draw") {
        // Abortive draw - dealer stays, honba increases
        nextHonba = lastEvent.honba + 1;
      } else if (lastEvent.event_type === "draw") {
        // Exhaustive draw - check if dealer was tenpai
        // Dealer stays if tenpai (positive points_delta), rotates if noten
        const dealerWasTenpai = dealerEvent && dealerEvent.points_delta > 0;
        nextHonba = lastEvent.honba + 1;

        if (!dealerWasTenpai) {
          // Dealer was noten - rotate dealer
          if (nextKyoku >= 4) {
            // Move to next round
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
        // If dealer was tenpai, kyoku stays the same (dealer repeat)
      } else {
        // Dealer rotation
        nextHonba = 0;
        if (nextKyoku >= 4) {
          // Move to next round
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

      // Dealer is based on kyoku (1 = East, 2 = South, etc.)
      const dealerSeat = SEATS[nextKyoku - 1];

      return {
        round: nextRound,
        kyoku: nextKyoku,
        honba: nextHonba,
        dealerSeat,
        lastEventWasDealerWin: dealerWon,
      };
    }, [game?.handEvents]);

  // Player scores for scoreboard
  const playerScores = useMemo((): PlayerScore[] => {
    if (!game?.game_seats) return [];
    return game.game_seats.map(gs => ({
      seat: gs.seat,
      playerId: gs.player_id,
      playerName: gs.players.display_name,
      score: currentScores[gs.seat],
    }));
  }, [game?.game_seats, currentScores]);

  // Player names map
  const playerNames = useMemo((): Record<Seat, string> => {
    const names: Record<Seat, string> = {
      east: "",
      south: "",
      west: "",
      north: "",
    };
    if (!game?.game_seats) return names;
    for (const gs of game.game_seats) {
      names[gs.seat] = gs.players.display_name;
    }
    return names;
  }, [game?.game_seats]);

  // Group hand events into hand history format
  const handHistory = useMemo((): HandEvent[] => {
    if (!game?.handEvents) return [];

    const grouped: Record<number, HandEvent> = {};

    for (const event of game.handEvents) {
      if (!grouped[event.hand_seq]) {
        grouped[event.hand_seq] = {
          handSeq: event.hand_seq,
          round: event.round_kanji,
          kyoku: event.kyoku,
          honba: event.honba,
          eventType: event.event_type,
          events: [],
          details: event.details as HandEvent["details"],
        };
      }

      grouped[event.hand_seq].events.push({
        seat: event.seat,
        playerName: playerNames[event.seat],
        pointsDelta: event.points_delta,
        riichiDeclared: event.riichi_declared,
      });
    }

    return Object.values(grouped).sort((a, b) => b.handSeq - a.handSeq);
  }, [game?.handEvents, playerNames]);

  // Check if game is finished
  const isFinished = useMemo(() => {
    return game?.status === "finished";
  }, [game?.status]);

  // Game end detection
  const gameEndDetection = useGameEndDetection({
    scores: currentScores,
    round,
    kyoku,
    gameFormat,
    lastEventWasDealerWin,
    playerNames,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl space-y-4 p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link href="/games">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>
        </Link>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto max-w-4xl space-y-4 p-4">
        <Alert>
          <AlertDescription>Game not found</AlertDescription>
        </Alert>
        <Link href="/games">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-4 p-4">
      {/* Header with back button */}
      <GamePageHeader>
        <Link href="/games">
          <Button size="sm" className="h-9 text-base">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>
        </Link>
        {isFinished ? (
          <CompletedGameBadge />
        ) : (
          <Badge
            variant="destructive"
            className="h-9 animate-pulse px-3 py-1.5 text-base"
          >
            <Circle className="mr-1.5 h-4 w-4 fill-current" />
            LIVE GAME
          </Badge>
        )}
      </GamePageHeader>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Score Board */}
      <ScoreBoard
        scores={playerScores}
        dealerSeat={dealerSeat}
        round={round}
        kyoku={kyoku}
        honba={honba}
        riichiSticks={riichiSticks}
        inEnchousen={gameEndDetection.inEnchousen}
        isFinalRound={gameEndDetection.isFinalRound}
        gameFormat={gameFormat}
      />

      {/* Hand History */}
      <HandHistory hands={handHistory} playerNames={playerNames} />
    </div>
  );
}
