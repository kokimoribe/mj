"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { RoundIndicator } from "./RoundIndicator";
import { ScoreDisplay } from "./ScoreDisplay";
import { QuickEntry } from "./QuickEntry";
import { HandHistory } from "./HandHistory";
import { ManualEntry } from "./ManualEntry";
import { useToast } from "@/hooks/use-toast";

interface GameState {
  gameId: string;
  players: Array<{
    id: string;
    name: string;
    seat: "east" | "south" | "west" | "north";
    score: number;
    isDealer: boolean;
    hasRiichi: boolean;
  }>;
  windRound: "east" | "south" | "west" | "north";
  roundNumber: number;
  honbaCount: number;
  riichiPot: number;
  dealerSeat: "east" | "south" | "west" | "north";
  isGameEnded: boolean;
}

export function HandRecordingView() {
  const router = useRouter();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [hands, setHands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastAction, setLastAction] = useState<any>(null);
  const [dataQuality, setDataQuality] = useState<
    "final_only" | "partial" | "complete"
  >("final_only");

  // Load active game
  useEffect(() => {
    loadActiveGame();

    // Set up real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel("game-hands")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "hands",
          filter: `game_id=eq.${gameState?.gameId}`,
        },
        (payload: any) => {
          // Update hands list with new hand
          if (payload.new) {
            setHands(prev => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [gameState?.gameId]);

  const loadActiveGame = async () => {
    try {
      const supabase = createClient();

      // Get the most recent ongoing game
      const { data: games, error } = await supabase
        .from("games")
        .select(
          `
          *,
          game_seats (
            *,
            player:players (
              id,
              display_name
            )
          )
        `
        )
        .eq("status", "ongoing")
        .order("started_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!games || games.length === 0) {
        // No active game, redirect to create new game
        router.push("/games/new");
        return;
      }

      const game = games[0];

      // Load hands for this game
      const response = await fetch(`/api/games/${game.id}/hands`);
      const handsData = await response.json();

      // Initialize game state
      const lastHand = handsData.hands?.[handsData.hands.length - 1];
      const currentScores = lastHand?.scores_after || {};

      setGameState({
        gameId: game.id,
        players: game.game_seats.map((seat: any) => ({
          id: seat.player.id,
          name: seat.player.display_name,
          seat: seat.seat,
          score: currentScores[seat.player.id] || 25000,
          isDealer: seat.seat === (lastHand?.dealer_seat || "east"),
          hasRiichi: false,
        })),
        windRound: lastHand?.wind_round || "east",
        roundNumber: lastHand?.round_number || 1,
        honbaCount: lastHand?.honba || 0,
        riichiPot: lastHand?.riichi_pot || 0,
        dealerSeat: lastHand?.dealer_seat || "east",
        isGameEnded: game.status === "finished",
      });

      setHands(handsData.hands || []);
      setDataQuality(handsData.dataQuality || "final_only");
      setLoading(false);
    } catch (error) {
      console.error("Error loading game:", error);
      toast({
        title: "Error",
        description: "Failed to load active game",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleQuickEntry = async (handData: any) => {
    if (!gameState || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/games/${gameState.gameId}/hands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wind_round: gameState.windRound,
          round_number: gameState.roundNumber,
          honba_count: gameState.honbaCount,
          dealer_seat: gameState.dealerSeat,
          ...handData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to record hand");
      }

      const result = await response.json();

      // Update game state
      setGameState(prev => ({
        ...prev!,
        players: prev!.players.map(p => ({
          ...p,
          score: result.scores_after[p.id] || p.score,
          isDealer: p.seat === result.next_dealer,
          hasRiichi: false,
        })),
        dealerSeat: result.next_dealer,
        honbaCount: result.honba_count,
        riichiPot: result.riichi_pot,
        windRound: result.wind_round,
        roundNumber: result.round_number,
        isGameEnded: result.game_ended || false,
      }));

      // Add hand to history
      setHands(prev => [
        ...prev,
        {
          hand_id: result.hand_id,
          hand_number: result.hand_number,
          round: `${gameState.windRound.toUpperCase()} ${gameState.roundNumber}`,
          outcome: handData.outcome_type,
          winner: handData.winner_name,
          points: handData.points,
          scores_after: result.scores_after,
        },
      ]);

      setLastAction({
        type: "hand_recorded",
        handId: result.hand_id,
        description: `${gameState.windRound.toUpperCase()} ${gameState.roundNumber}: ${handData.description}`,
      });

      toast({
        title: "Hand Recorded",
        description: handData.description,
      });

      if (result.game_ended) {
        toast({
          title: "Game Ended",
          description:
            result.end_reason === "tobi"
              ? "Player went bankrupt"
              : "Game finished",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error recording hand:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to record hand",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUndo = async () => {
    if (!lastAction || lastAction.type !== "hand_recorded") return;

    try {
      const response = await fetch(
        `/api/games/${gameState?.gameId}/hands/${lastAction.handId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to undo");
      }

      // Reload game state
      await loadActiveGame();
      setLastAction(null);

      toast({
        title: "Hand Removed",
        description: "Last hand has been undone",
      });
    } catch (error) {
      console.error("Error undoing hand:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to undo",
        variant: "destructive",
      });
    }
  };

  const handleRiichiDeclare = (playerId: string) => {
    setGameState(prev => ({
      ...prev!,
      players: prev!.players.map(p => ({
        ...p,
        hasRiichi: p.id === playerId ? true : p.hasRiichi,
        score: p.id === playerId ? p.score - 1000 : p.score,
      })),
      riichiPot: prev!.riichiPot + 1,
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4" data-testid="loading-spinner">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameState) {
    return (
      <Alert>
        <AlertDescription>No active game found</AlertDescription>
      </Alert>
    );
  }

  if (gameState.isGameEnded) {
    return (
      <div className="space-y-4 p-4" data-testid="game-ended-tobi">
        <Alert>
          <AlertDescription>
            Game has ended. Final scores have been recorded.
          </AlertDescription>
        </Alert>
        <ScoreDisplay players={gameState.players} />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4" data-testid="hand-recording-view">
      {/* Round and pot indicators */}
      <div className="grid grid-cols-3 gap-2">
        <RoundIndicator
          windRound={gameState.windRound}
          roundNumber={gameState.roundNumber}
        />
        <div data-testid="honba-counter" className="text-center">
          <Badge variant="secondary">Honba: {gameState.honbaCount}</Badge>
        </div>
        <div className="text-center">
          <Badge variant="outline" data-testid="riichi-pot">
            Riichi: {gameState.riichiPot}
          </Badge>
          <Badge variant="outline" data-testid="pot-display" className="ml-2">
            Pot: {gameState.riichiPot * 1000}
          </Badge>
        </div>
      </div>

      {/* Player scores */}
      <ScoreDisplay
        players={gameState.players}
        onRiichiDeclare={handleRiichiDeclare}
      />

      {/* Entry methods */}
      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick">Quick Entry</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="quick">
          <QuickEntry
            players={gameState.players}
            onSubmit={handleQuickEntry}
            disabled={submitting}
          />
        </TabsContent>

        <TabsContent value="manual">
          <ManualEntry
            players={gameState.players}
            onSubmit={handleQuickEntry}
            disabled={submitting}
          />
        </TabsContent>
      </Tabs>

      {/* Last action undo */}
      {lastAction && (
        <Card data-testid="last-action-undo">
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-sm">{lastAction.description}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              data-testid="undo-button"
            >
              Undo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Hand history */}
      <HandHistory hands={hands} dataQuality={dataQuality} />
    </div>
  );
}
