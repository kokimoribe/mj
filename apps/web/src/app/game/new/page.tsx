"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  type GameFormat,
  getGameFormatDisplayName,
  getGameFormatDescription,
} from "@/hooks/useGameEndDetection";
import {
  PlayerSelector,
  SeatAssignmentComponent,
  type Player,
  type SeatAssignment,
} from "@/components/features/game-recording";
import { useAllPlayers } from "@/lib/queries";
import { useConfigStore } from "@/stores/configStore";
import { config } from "@/config";

type Step = "select-players" | "assign-seats";

export default function NewGamePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeConfig = useConfigStore(state => state.activeConfig);
  const configHash = activeConfig?.hash || config.season.hash;
  const { data: allPlayers, isLoading: playersLoading } = useAllPlayers();
  const [step, setStep] = useState<Step>("select-players");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [seatAssignments, setSeatAssignments] = useState<SeatAssignment[]>([]);
  const [gameFormat, setGameFormat] = useState<GameFormat>("hanchan");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle new player creation - refresh the player list
  const handlePlayerCreated = (_newPlayer: Player) => {
    // Invalidate and refetch the players query to include the new player
    queryClient.invalidateQueries({
      queryKey: ["players", "all", configHash],
    });
  };

  // Map player IDs to player objects
  const players: Player[] = useMemo(() => {
    if (!allPlayers) return [];
    return allPlayers.map(p => ({
      id: p.id,
      display_name: p.display_name,
    }));
  }, [allPlayers]);

  // Get selected players as Player objects
  const selectedPlayers = useMemo(() => {
    return selectedPlayerIds
      .map(id => players.find(p => p.id === id))
      .filter((p): p is Player => p !== undefined);
  }, [selectedPlayerIds, players]);

  // Check if we can proceed to next step
  const canProceedToSeats = selectedPlayerIds.length === 4;
  const canStartGame = seatAssignments.length === 4;

  const handleStartGame = async () => {
    if (!canStartGame) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: seatAssignments.map(sa => ({
            playerId: sa.playerId,
            seat: sa.seat,
          })),
          startedAt: new Date().toISOString(),
          gameFormat,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create game");
      }

      const game = await response.json();
      router.push(`/game/${game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game");
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/games">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Game</h1>
          <p className="text-muted-foreground text-sm">
            {step === "select-players" ? "Select 4 players" : "Assign seats"}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step === "select-players"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          1
        </div>
        <div className="bg-border h-0.5 flex-1" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step === "assign-seats"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          2
        </div>
      </div>

      {/* Step Content */}
      {step === "select-players" ? (
        <div className="space-y-6">
          <PlayerSelector
            players={players}
            selectedPlayers={selectedPlayerIds}
            onSelectionChange={setSelectedPlayerIds}
            maxPlayers={4}
            isLoading={playersLoading}
            onPlayerCreated={handlePlayerCreated}
          />

          <div className="flex justify-end">
            <Button
              onClick={() => setStep("assign-seats")}
              disabled={!canProceedToSeats}
            >
              Next: Assign Seats
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <SeatAssignmentComponent
            players={selectedPlayers}
            assignments={seatAssignments}
            onAssignmentsChange={setSeatAssignments}
          />

          {/* Game Format Selector */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Game Format</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={gameFormat}
                onValueChange={value => setGameFormat(value as GameFormat)}
                className="space-y-3"
              >
                {(["hanchan", "tonpuusen"] as const).map(format => (
                  <div key={format} className="flex items-start space-x-3">
                    <RadioGroupItem
                      value={format}
                      id={format}
                      className="mt-1"
                    />
                    <div className="grid gap-0.5">
                      <Label
                        htmlFor={format}
                        className="cursor-pointer font-medium"
                      >
                        {getGameFormatDisplayName(format)}
                      </Label>
                      <p className="text-muted-foreground text-xs">
                        {getGameFormatDescription(format)}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex justify-between gap-4">
            <Button variant="outline" onClick={() => setStep("select-players")}>
              Back
            </Button>
            <Button
              onClick={handleStartGame}
              disabled={!canStartGame || isCreating}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Game
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
