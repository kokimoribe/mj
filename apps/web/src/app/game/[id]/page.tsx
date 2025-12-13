"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Undo2,
  CheckCircle,
  Loader2,
  AlertCircle,
  Info,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ScoreBoard,
  HandEntryForm,
  HandHistory,
  GameEndDialog,
  type PlayerScore,
  type PlayerInfo,
  type HandEntryData,
  type HandEvent,
  type GameEndPlayerScore,
} from "@/components/features/game-recording";
import { type Seat, SEATS, STARTING_POINTS, type Round } from "@/lib/mahjong";
import {
  useGameEndDetection,
  type GameFormat,
} from "@/hooks/useGameEndDetection";
import { toast } from "sonner";

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

export default function LiveGamePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.id as string;

  const [game, setGame] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHandEntry, setShowHandEntry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [endDialogDismissed, setEndDialogDismissed] = useState(false);
  const [gameIdCopied, setGameIdCopied] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
  }, [game?.handEvents]);

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
        // Chombo: honba does not increase, dealer does not rotate
        // Keep same honba, same kyoku, same round
        nextHonba = lastEvent.honba;
        // nextKyoku and nextRound remain unchanged
      } else if (dealerWon) {
        // Dealer won - honba increases, same kyoku
        nextHonba = lastEvent.honba + 1;
      } else if (
        lastEvent.event_type === "draw" ||
        lastEvent.event_type === "abortive_draw"
      ) {
        // Draw - honba increases
        nextHonba = lastEvent.honba + 1;
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

  // Player info for components
  const playerInfos = useMemo((): PlayerInfo[] => {
    if (!game?.game_seats) return [];
    return game.game_seats.map(gs => ({
      seat: gs.seat,
      playerId: gs.player_id,
      playerName: gs.players.display_name,
    }));
  }, [game?.game_seats]);

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

  // Auto-show end dialog when game should end (and hasn't been dismissed)
  useEffect(() => {
    if (
      gameEndDetection.shouldEnd &&
      !showEndDialog &&
      !endDialogDismissed &&
      game?.status !== "finished"
    ) {
      setShowEndDialog(true);
    }
  }, [
    gameEndDetection.shouldEnd,
    showEndDialog,
    endDialogDismissed,
    game?.status,
  ]);

  // Player scores for end dialog
  const endDialogScores = useMemo((): GameEndPlayerScore[] => {
    if (!game?.game_seats) return [];
    return game.game_seats.map(gs => ({
      seat: gs.seat,
      playerName: gs.players.display_name,
      score: currentScores[gs.seat],
    }));
  }, [game?.game_seats, currentScores]);

  // Handle recording a hand
  const handleRecordHand = async (data: HandEntryData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/games/${gameId}/hands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: data.eventType,
          round,
          kyoku,
          honba,
          winnerSeat: data.winnerSeat,
          loserSeat: data.loserSeat,
          han: data.han,
          fu: data.fu,
          riichiDeclarations: data.riichiDeclarations,
          riichiSticks,
          dealerSeat,
          yakuList: data.yakuList,
          abortiveDrawType: data.abortiveDrawType,
          tenpaiSeats: data.tenpaiSeats,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record hand");
      }

      setShowHandEntry(false);
      await fetchGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record hand");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle undoing last hand
  const handleUndo = async () => {
    if (handHistory.length === 0) return;

    setIsUndoing(true);
    try {
      const response = await fetch(`/api/games/${gameId}/hands`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to undo hand");
      }

      await fetchGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to undo");
    } finally {
      setIsUndoing(false);
    }
  };

  // Handle finishing game
  const handleFinishGame = async () => {
    setIsFinishing(true);
    try {
      const finalScores = SEATS.map(seat => ({
        seat,
        finalScore: currentScores[seat],
      }));

      const response = await fetch(`/api/games/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalScores }),
      });

      if (!response.ok) {
        throw new Error("Failed to finish game");
      }

      setShowEndDialog(false);
      router.push("/games");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to finish game");
    } finally {
      setIsFinishing(false);
    }
  };

  // Handle continuing game anyway (dismisses the end dialog)
  const handleContinueAnyway = () => {
    setShowEndDialog(false);
    setEndDialogDismissed(true);
  };

  // Handle back button click - show confirmation if game is in progress
  const handleBackClick = (e: React.MouseEvent) => {
    if (!isFinished && handHistory.length > 0) {
      e.preventDefault();
      setShowExitConfirmation(true);
    }
  };

  // Handle confirmed exit - delete the game and navigate away
  const handleConfirmExit = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete game");
      }

      setShowExitConfirmation(false);
      toast.success("Game discarded");
      router.push("/games");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete game");
      toast.error("Failed to delete game. Please try again.");
      setIsDeleting(false);
    }
  };

  // Browser beforeunload protection for in-progress games
  useEffect(() => {
    if (isFinished || handHistory.length === 0) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isFinished, handHistory.length]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl space-y-6 p-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error && !game) {
    return (
      <div className="container mx-auto max-w-2xl p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link href="/games" className="mt-4 block">
          <Button variant="outline">Back to Games</Button>
        </Link>
      </div>
    );
  }

  if (!game) return null;

  return (
    <div className="container mx-auto max-w-2xl space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isFinished || handHistory.length === 0 ? (
            <Link href="/games">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackClick}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold">
              {isFinished ? "Game Complete" : "Live Game"}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground text-sm">
                {new Date(game.started_at).toLocaleDateString()}
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Game ID"
                      onClick={async e => {
                        e.preventDefault();
                        try {
                          await navigator.clipboard.writeText(game.id);
                          setGameIdCopied(true);
                          toast.success("Game ID copied to clipboard");
                          // Reset the copied state after 2 seconds
                          setTimeout(() => {
                            setGameIdCopied(false);
                          }, 2000);
                        } catch (err) {
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
        </div>
        {isFinished && (
          <Badge variant="secondary" className="text-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Finished
          </Badge>
        )}
      </div>

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

      {/* Action Buttons */}
      {!isFinished && (
        <div className="flex gap-2">
          <Button
            onClick={() => setShowHandEntry(true)}
            className="flex-1"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Record Hand
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleUndo}
            disabled={handHistory.length === 0 || isUndoing}
            title="Undo the most recent hand entry"
          >
            {isUndoing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Undo2 className="mr-2 h-5 w-5" />
            )}
            Undo
          </Button>
        </div>
      )}

      {/* Hand History */}
      <HandHistory hands={handHistory} playerNames={playerNames} />

      {/* Hand Entry Form */}
      <HandEntryForm
        open={showHandEntry}
        onOpenChange={setShowHandEntry}
        players={playerInfos}
        dealerSeat={dealerSeat}
        round={round}
        kyoku={kyoku}
        honba={honba}
        riichiSticks={riichiSticks}
        onSubmit={handleRecordHand}
        isSubmitting={isSubmitting}
      />

      {/* Game End Dialog */}
      <GameEndDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        reason={gameEndDetection.reason}
        message={gameEndDetection.endMessage}
        scores={endDialogScores}
        bustedSeat={gameEndDetection.bustedSeat}
        onFinish={handleFinishGame}
        onContinue={handleContinueAnyway}
        isFinishing={isFinishing}
      />

      {/* Exit Confirmation Dialog */}
      <AlertDialog
        open={showExitConfirmation}
        onOpenChange={setShowExitConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this game?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to leave this game. If you exit now, no games or
              hands will be recorded. All progress will be lost.
              <br />
              <br />
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmExit}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Discard Game"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
