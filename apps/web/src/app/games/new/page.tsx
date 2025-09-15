"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

export default function NewGamePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);

  const handleCreateGame = async () => {
    if (players.length !== 4) {
      alert("Please select 4 players");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: players.map((p, i) => ({
            id: p.id,
            seat: ["east", "south", "west", "north"][i],
          })),
          startingPoints: 25000,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create game");
      }

      const game = await response.json();
      router.push("/games/active");
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Players</Label>
            <p className="text-muted-foreground mb-4 text-sm">
              Select 4 players in seating order (East, South, West, North)
            </p>
            {/* Simplified for now - in production, would load players from database */}
            <div className="space-y-2">
              {["East", "South", "West", "North"].map((seat, i) => (
                <div key={seat} className="flex items-center gap-2">
                  <Label className="w-20">{seat}:</Label>
                  <input
                    type="text"
                    placeholder={`Player ${i + 1} name`}
                    className="flex-1 rounded border px-3 py-2"
                    onChange={e => {
                      const newPlayers = [...players];
                      newPlayers[i] = {
                        id: `player-${i + 1}`,
                        name: e.target.value,
                      };
                      setPlayers(newPlayers);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleCreateGame}
            disabled={loading || players.length !== 4}
          >
            {loading ? "Creating..." : "Start Game"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
