"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Player {
  id: string;
  name: string;
  seat: "east" | "south" | "west" | "north";
  score: number;
  isDealer: boolean;
  hasRiichi: boolean;
}

interface ManualEntryProps {
  players: Player[];
  onSubmit: (handData: any) => void;
  disabled?: boolean;
}

export function ManualEntry({ players, onSubmit, disabled }: ManualEntryProps) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [outcomeType, setOutcomeType] = useState<string>("ron");
  const [incompleteData, setIncompleteData] = useState(false);
  const [notes, setNotes] = useState("");
  const [possibleWinners, setPossibleWinners] = useState<string[]>([]);
  const [uncertainPoints, setUncertainPoints] = useState("");

  const handleSubmit = () => {
    // Calculate point deltas
    const currentScores = players.reduce(
      (acc, p) => {
        acc[p.id] = p.score;
        return acc;
      },
      {} as Record<string, number>
    );

    const actions = players
      .map((player, index) => {
        const scoreDelta =
          (scores[player.id] || currentScores[player.id]) -
          currentScores[player.id];

        return {
          player_id:
            incompleteData && possibleWinners.includes(player.id)
              ? null
              : player.id,
          action_type: scoreDelta > 0 ? "win" : "payment",
          action_order: index + 1,
          points_delta: scoreDelta,
          details: incompleteData
            ? {
                uncertain: true,
                note: notes,
                possible_winners: possibleWinners,
              }
            : {},
        };
      })
      .filter(a => a.points_delta !== 0);

    // Validate point balance
    const totalDelta = actions.reduce((sum, a) => sum + a.points_delta, 0);
    if (Math.abs(totalDelta) > 0.01 && !incompleteData) {
      alert("Points must balance to zero!");
      return;
    }

    onSubmit({
      outcome_type: outcomeType,
      actions,
      completed_at: incompleteData ? null : new Date().toISOString(),
      notes,
      description: `Manual entry: ${outcomeType}`,
    });

    // Reset form
    setScores({});
    setNotes("");
    setPossibleWinners([]);
    setUncertainPoints("");
    setIncompleteData(false);
  };

  const validateScores = () => {
    const totalScores = Object.values(scores).reduce(
      (sum, score) => sum + score,
      0
    );
    const expectedTotal = 100000; // 4 players * 25000 starting
    return Math.abs(totalScores - expectedTotal) < 1;
  };

  return (
    <Card data-testid="manual-entry">
      <CardHeader>
        <CardTitle>Manual Entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Outcome type */}
        <div>
          <Label>Outcome Type</Label>
          <Select value={outcomeType} onValueChange={setOutcomeType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ron">Ron</SelectItem>
              <SelectItem value="tsumo">Tsumo</SelectItem>
              <SelectItem value="exhaustive_draw">Draw</SelectItem>
              <SelectItem value="chombo">Chombo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Score inputs */}
        <div className="space-y-2" data-testid="manual-score-entry">
          <Label>Final Scores</Label>
          {players.map(player => (
            <div key={player.id} className="flex items-center gap-2">
              <Label className="w-20">{player.name}</Label>
              <Input
                type="number"
                value={scores[player.id] || player.score}
                onChange={e =>
                  setScores({
                    ...scores,
                    [player.id]: parseInt(e.target.value) || 0,
                  })
                }
                data-testid={`score-input-${player.name.toLowerCase()}`}
              />
            </div>
          ))}
        </div>

        {/* Validation */}
        {Object.keys(scores).length === 4 && !validateScores() && (
          <div
            className="text-destructive text-sm"
            data-testid="validation-error"
          >
            Points must balance to zero
          </div>
        )}

        {/* Incomplete data option */}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={incompleteData}
            onCheckedChange={checked => setIncompleteData(checked as boolean)}
            data-testid="incomplete-data"
          />
          <Label>Mark as incomplete</Label>
        </div>

        {incompleteData && (
          <>
            {/* Notes for incomplete data */}
            <div>
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Describe what information is missing..."
                data-testid="hand-note"
              />
            </div>

            {/* Possible winners */}
            <div>
              <Label>Possible Winners</Label>
              <div className="grid grid-cols-2 gap-2">
                {players.map(player => (
                  <label key={player.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={possibleWinners.includes(player.id)}
                      onCheckedChange={checked => {
                        if (checked) {
                          setPossibleWinners([...possibleWinners, player.id]);
                        } else {
                          setPossibleWinners(
                            possibleWinners.filter(id => id !== player.id)
                          );
                        }
                      }}
                      data-testid={`possible-winner-${player.name.toLowerCase()}`}
                    />
                    <span>{player.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Uncertain points */}
            <div>
              <Label>Uncertain Points</Label>
              <Input
                value={uncertainPoints}
                onChange={e => setUncertainPoints(e.target.value)}
                placeholder="e.g., 2600"
                data-testid="uncertain-points"
              />
            </div>
          </>
        )}

        {/* Submit button */}
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={disabled || (!incompleteData && !validateScores())}
          data-testid={incompleteData ? "save-incomplete" : "submit-hand"}
        >
          {incompleteData ? "Save Incomplete" : "Submit Hand"}
        </Button>

        {incompleteData && (
          <div
            className="text-muted-foreground text-sm"
            data-testid="incomplete-hand-indicator"
          >
            This hand will be marked for later verification
            <span data-testid="incomplete-hand-note" className="block">
              needs verification
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
