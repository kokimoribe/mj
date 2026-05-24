"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  type Seat,
  STARTING_POINTS,
  computeNextHandStateFromEvents,
} from "@/lib/mahjong";
import {
  useGameEndDetection,
  type GameFormat,
} from "@/hooks/useGameEndDetection";

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

const REDIRECT_DELAY_MS = 2500;
const POLL_INTERVAL_MS = 30_000; // 30 seconds

export default function LiveGameViewPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [game, setGame] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionHandledRef = useRef(false);
  const cancelledHandledRef = useRef(false);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [showCancelledOverlay, setShowCancelledOverlay] = useState(false);

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

  // Poll for updates so spectators stay in sync when new hands are recorded.
  // Uses the Page Visibility API: poll only when the tab is visible; when the
  // user returns we refetch immediately. On iOS Safari, visibilitychange can
  // be unreliable when returning from another app, so we also use pageshow
  // and focus to refetch and resume polling.
  useEffect(() => {
    if (!gameId) return;

    const startPolling = () => {
      if (pollIntervalRef.current) return;
      pollIntervalRef.current = setInterval(fetchGame, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };

    const refetchAndStartPollingIfVisible = () => {
      if (document.visibilityState === "visible") {
        fetchGame();
        startPolling();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refetchAndStartPollingIfVisible();
      } else {
        stopPolling();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      // Refetch when page is shown (e.g. restored from bfcache, or when tab becomes active on iOS)
      if (event.persisted || document.visibilityState === "visible") {
        refetchAndStartPollingIfVisible();
      }
    };

    const handleWindowFocus = () => {
      refetchAndStartPollingIfVisible();
    };

    if (document.visibilityState === "visible") {
      startPolling();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleWindowFocus);
      stopPolling();
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

  // Derive next hand's round/kyoku/honba/dealer from the persisted events.
  // The pure helper consults `details.tenpaiSeats` so a dealer who is
  // tenpai (e.g. dealer-riichi) is not falsely rotated when their net
  // points_delta lands at 0 or below — see lib/mahjong/dealer-rotation.ts.
  const { round, kyoku, honba, dealerSeat, lastEventWasDealerWin } = useMemo(
    () => computeNextHandStateFromEvents(game?.handEvents),
    [game?.handEvents]
  );

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

  // Check if game is cancelled
  const isCancelled = useMemo(() => {
    return game?.status === "cancelled";
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

  // When game completes while spectating: blur overlay, then redirect to game history
  useEffect(() => {
    if (!gameId || !isFinished || completionHandledRef.current) return;
    completionHandledRef.current = true;
    setShowCompletionOverlay(true);
    const t = setTimeout(() => {
      router.push(`/games/${gameId}`);
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
  }, [gameId, isFinished, router]);

  // When game is cancelled while spectating: show overlay, then redirect to games list
  useEffect(() => {
    if (!gameId || !isCancelled || cancelledHandledRef.current) return;
    cancelledHandledRef.current = true;
    setShowCancelledOverlay(true);
    const t = setTimeout(() => {
      router.push("/games");
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
  }, [gameId, isCancelled, router]);

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
    <div className="relative">
      {/* Blur overlay when game completed and redirecting */}
      {showCompletionOverlay && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 p-4 backdrop-blur-md"
          role="status"
          aria-live="polite"
          aria-label="Game finished, redirecting"
        >
          <div className="bg-background rounded-lg border px-6 py-4 text-center shadow-lg">
            <p className="text-foreground font-medium">
              This game has finished. Redirecting to the full game history page.
            </p>
          </div>
        </div>
      )}
      {/* Blur overlay when game cancelled and redirecting */}
      {showCancelledOverlay && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 p-4 backdrop-blur-md"
          role="status"
          aria-live="polite"
          aria-label="Game cancelled, redirecting"
        >
          <div className="bg-background rounded-lg border px-6 py-4 text-center shadow-lg">
            <p className="text-foreground font-medium">
              This game was cancelled. Redirecting to the games list.
            </p>
          </div>
        </div>
      )}
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
    </div>
  );
}
