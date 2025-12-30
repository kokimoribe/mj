"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GameIdTooltip } from "@/components/ui/game-id-tooltip";
import { format } from "date-fns";
import { type Seat, STARTING_POINTS } from "@/lib/mahjong";
import { PointsProgressionChart } from "./PointsProgressionChart";
import {
  HandHistoryItem,
  type HandEvent as HandHistoryEvent,
} from "@/components/features/game-recording";

interface GameSeat {
  seat: Seat;
  player_id: string;
  final_score: number | null;
  players: {
    id: string;
    display_name: string;
  };
}

interface HandEvent {
  id: string;
  hand_seq: number;
  seat: Seat;
  event_type: string;
  riichi_declared: boolean;
  points_delta: number;
  pot_delta: number;
  round_kanji: string;
  kyoku: number;
  honba: number;
  details: Record<string, unknown>;
}

interface GameData {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  game_format: string | null;
  game_seats: GameSeat[];
  handEvents: HandEvent[];
}

interface GameDetailViewProps {
  gameId: string;
}

// Seat colors matching the live game page
const SEAT_COLORS: Record<Seat, string> = {
  east: "#ef4444", // red
  south: "#22c55e", // green
  west: "#3b82f6", // blue
  north: "#a855f7", // purple
};

const SEAT_LABELS: Record<Seat, string> = {
  east: "East",
  south: "South",
  west: "West",
  north: "North",
};

export function GameDetailView({ gameId }: GameDetailViewProps) {
  const router = useRouter();
  const [game, setGame] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track the currently highlighted hand animation
  const highlightState = useRef<{
    element: HTMLElement | null;
    timeoutId: NodeJS.Timeout | null;
    cleanupTimeoutId: NodeJS.Timeout | null;
  }>({
    element: null,
    timeoutId: null,
    cleanupTimeoutId: null,
  });

  useEffect(() => {
    async function fetchGame() {
      try {
        const response = await fetch(`/api/games/${gameId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Game not found");
          }
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
    }

    fetchGame();
  }, [gameId]);

  // Calculate final scores sorted by placement
  const sortedResults = useMemo(() => {
    if (!game?.game_seats) return [];

    return game.game_seats
      .map(seat => ({
        seat: seat.seat,
        playerId: seat.player_id,
        playerName: seat.players.display_name,
        finalScore: seat.final_score ?? 0,
        color: SEAT_COLORS[seat.seat],
      }))
      .sort((a, b) => b.finalScore - a.finalScore);
  }, [game?.game_seats]);

  // Build chart data from hand events
  const chartData = useMemo(() => {
    if (!game?.handEvents || game.handEvents.length === 0) return [];

    // Group events by hand_seq
    const eventsByHand: Record<number, HandEvent[]> = {};
    for (const event of game.handEvents) {
      if (!eventsByHand[event.hand_seq]) {
        eventsByHand[event.hand_seq] = [];
      }
      eventsByHand[event.hand_seq].push(event);
    }

    // Start with initial scores
    const scores: Record<Seat, number> = {
      east: STARTING_POINTS,
      south: STARTING_POINTS,
      west: STARTING_POINTS,
      north: STARTING_POINTS,
    };

    // Build chart data starting with hand 0 (initial state)
    const data: Array<{
      hand: number;
      east: number;
      south: number;
      west: number;
      north: number;
    }> = [
      {
        hand: 0,
        ...scores,
      },
    ];

    // Process each hand in order
    const handSeqs = Object.keys(eventsByHand)
      .map(Number)
      .sort((a, b) => a - b);

    for (const handSeq of handSeqs) {
      const events = eventsByHand[handSeq];
      for (const event of events) {
        scores[event.seat] += event.points_delta;
      }
      data.push({
        hand: handSeq,
        ...scores,
      });
    }

    return data;
  }, [game?.handEvents]);

  // Player names map for HandHistory component
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

  // Build hand history for display (same format as live game page)
  const handHistory = useMemo((): HandHistoryEvent[] => {
    if (!game?.handEvents || game.handEvents.length === 0) return [];

    const grouped: Record<number, HandHistoryEvent> = {};

    for (const event of game.handEvents) {
      if (!grouped[event.hand_seq]) {
        // Extract round letter from round_kanji (東→E, 南→S, 西→W, 北→N)
        const roundKanjiToLetter: Record<string, string> = {
          東: "E",
          南: "S",
          西: "W",
          北: "N",
        };
        const roundLetter =
          roundKanjiToLetter[event.round_kanji] || event.round_kanji;

        grouped[event.hand_seq] = {
          handSeq: event.hand_seq,
          round: roundLetter,
          kyoku: event.kyoku,
          honba: event.honba,
          eventType: event.event_type,
          events: [],
          details: event.details as HandHistoryEvent["details"],
        };
      }

      grouped[event.hand_seq].events.push({
        seat: event.seat,
        playerName: playerNames[event.seat],
        pointsDelta: event.points_delta,
        riichiDeclared: event.riichi_declared,
      });
    }

    // Sort by handSeq descending (most recent first) to match live game
    return Object.values(grouped).sort((a, b) => b.handSeq - a.handSeq);
  }, [game?.handEvents, playerNames]);

  const hasHandData = game?.handEvents && game.handEvents.length > 0;

  // Handler for clicking on chart points - scrolls within hand history container
  const handleHandClick = (handNumber: number) => {
    // Don't scroll for hand 0 (Start)
    if (handNumber === 0) return;

    const handElement = document.getElementById(`hand-${handNumber}`);
    const scrollContainer = document.getElementById(
      "hand-history-scroll-container"
    );
    if (!handElement || !scrollContainer) return;

    // Clean up any previous animation
    if (highlightState.current.element) {
      const prevElement = highlightState.current.element;

      // Clear pending timeouts
      if (highlightState.current.timeoutId) {
        clearTimeout(highlightState.current.timeoutId);
      }
      if (highlightState.current.cleanupTimeoutId) {
        clearTimeout(highlightState.current.cleanupTimeoutId);
      }

      // Immediately remove all classes from previous element
      prevElement.classList.remove(
        "border-l-primary",
        "bg-primary/5",
        "transition-all",
        "duration-[200ms]",
        "duration-[300ms]"
      );
      prevElement.classList.add("border-l-transparent");
    }

    // Scroll within the hand history container
    // Calculate the position of the hand element relative to the container
    const containerRect = scrollContainer.getBoundingClientRect();
    const handRect = handElement.getBoundingClientRect();
    const scrollOffset =
      handRect.top - containerRect.top + scrollContainer.scrollTop;

    scrollContainer.scrollTo({
      top: scrollOffset,
      behavior: "smooth",
    });

    // Start new animation
    handElement.classList.remove("border-l-transparent");
    handElement.classList.add(
      "border-l-primary",
      "bg-primary/5",
      "transition-all",
      "duration-[200ms]"
    );

    // Store reference to current animation
    highlightState.current.element = handElement;

    // Set timeout for fade-out
    highlightState.current.timeoutId = setTimeout(() => {
      // Change to 300ms duration for fade-out
      handElement.classList.remove("duration-[200ms]");
      handElement.classList.add("duration-[300ms]");

      // Wait for next frame to ensure duration change is applied
      requestAnimationFrame(() => {
        // Remove border color and background, restore transparent border
        handElement.classList.remove("border-l-primary", "bg-primary/5");
        handElement.classList.add("border-l-transparent");

        // Clean up transition classes after fade-out completes
        highlightState.current.cleanupTimeoutId = setTimeout(() => {
          handElement.classList.remove("transition-all", "duration-[300ms]");
          // Clear state if this is still the active element
          if (highlightState.current.element === handElement) {
            highlightState.current.element = null;
            highlightState.current.timeoutId = null;
            highlightState.current.cleanupTimeoutId = null;
          }
        }, 300);
      });
    }, 1200); // 200ms fade-in + 1000ms visible
  };

  if (isLoading) {
    return <GameDetailSkeleton />;
  }

  if (error || !game) {
    return (
      <div className="space-y-4">
        <Button size="sm" onClick={() => router.push("/games")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Games
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || "Game not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getPlacementMedal = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      case 3:
        return "4️⃣";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-2" data-testid="game-detail-view">
      {/* Back Button */}
      <Button
        size="sm"
        onClick={() => router.push("/games")}
        data-testid="back-button"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Games
      </Button>

      {/* Game Header */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Game Details</CardTitle>
            {game.status === "finished" ? (
              <Badge
                variant="outline"
                className="border-green-500 text-green-500"
              >
                Completed ✅
              </Badge>
            ) : (
              <Badge variant="secondary">{game.status}</Badge>
            )}
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span data-testid="game-date">
              {game.finished_at
                ? format(new Date(game.finished_at), "MMMM d, yyyy • h:mm a")
                : game.started_at
                  ? format(new Date(game.started_at), "MMMM d, yyyy • h:mm a")
                  : "Date unknown"}
            </span>
            <GameIdTooltip gameId={game.id} />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {/* Player Summary */}
          <div className="space-y-1">
            {sortedResults.map((result, index) => (
              <div
                key={result.playerId}
                className="flex items-center justify-between"
                data-testid="player-result"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPlacementMedal(index)}</span>
                  <Link
                    href={`/player/${result.playerId}`}
                    className="font-medium hover:underline"
                    data-testid="player-name"
                  >
                    {result.playerName}
                  </Link>
                  <span
                    className="text-xs font-medium"
                    style={{ color: result.color }}
                  >
                    ({SEAT_LABELS[result.seat]})
                  </span>
                </div>
                <span data-testid="final-score">
                  {result.finalScore.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Points Progression Chart & Hand History - Combined */}
      {hasHandData ? (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">
              Points Progression & Hand History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {/* Chart Section */}
            <div>
              <PointsProgressionChart
                data={chartData}
                playerNames={{
                  east:
                    game.game_seats.find(s => s.seat === "east")?.players
                      .display_name || "East",
                  south:
                    game.game_seats.find(s => s.seat === "south")?.players
                      .display_name || "South",
                  west:
                    game.game_seats.find(s => s.seat === "west")?.players
                      .display_name || "West",
                  north:
                    game.game_seats.find(s => s.seat === "north")?.players
                      .display_name || "North",
                }}
                onHandClick={handleHandClick}
              />
            </div>

            {/* Hand History Section - Scrollable */}
            <div className="-mx-6">
              <div
                id="hand-history-scroll-container"
                className="max-h-[400px] overflow-y-auto rounded-none border-x-0 border-t border-b-0"
              >
                <div className="divide-y">
                  {handHistory.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">
                        No hands recorded yet
                      </p>
                    </div>
                  ) : (
                    handHistory.map(hand => (
                      <HandHistoryItem
                        key={hand.handSeq}
                        hand={hand}
                        playerNames={playerNames}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* No Hand Data Notice */}
      {!hasHandData && (
        <Alert data-testid="no-hand-data-notice">
          <Info className="h-4 w-4" />
          <AlertTitle>Hand History Unavailable</AlertTitle>
          <AlertDescription>
            This game was recorded before hand-by-hand tracking was implemented.
            Only the final scores are available.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function GameDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
