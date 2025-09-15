"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Player {
  id: string;
  name: string;
  seat: "east" | "south" | "west" | "north";
  score: number;
  isDealer: boolean;
  hasRiichi: boolean;
}

interface QuickEntryProps {
  players: Player[];
  onSubmit: (handData: any) => void;
  disabled?: boolean;
}

const COMMON_POINTS = {
  tsumo: {
    dealer: [2000, 4000, 6000, 8000, 12000],
    nonDealer: [
      { display: "1000/2000", nonDealer: 1000, dealer: 2000 },
      { display: "2000/4000", nonDealer: 2000, dealer: 4000 },
      { display: "3000/6000", nonDealer: 3000, dealer: 6000 },
      { display: "4000/8000", nonDealer: 4000, dealer: 8000 },
    ],
  },
  ron: [1300, 2600, 3900, 5200, 7700, 8000, 12000, 16000, 24000, 32000],
};

export function QuickEntry({ players, onSubmit, disabled }: QuickEntryProps) {
  const [winner, setWinner] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<"ron" | "tsumo" | "draw" | null>(null);
  const [loser, setLoser] = useState<string | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [tenpaiPlayers, setTenpaiPlayers] = useState<string[]>([]);

  const handleRon = () => {
    if (!winner || !loser || !points) return;

    const winnerPlayer = players.find(p => p.id === winner);
    const loserPlayer = players.find(p => p.id === loser);
    const riichiPlayers = players.filter(p => p.hasRiichi);

    const actions = [
      // Riichi declarations
      ...riichiPlayers.map((p, i) => ({
        player_id: p.id,
        action_type: "riichi",
        action_order: i + 1,
        riichi_stick_delta: -1000,
      })),
      // Winner
      {
        player_id: winner,
        action_type: "win",
        action_order: riichiPlayers.length + 1,
        points_delta:
          points + (riichiPlayers.find(p => p.id === winner) ? 1000 : 0),
        riichi_stick_delta: riichiPlayers.find(p => p.id === winner) ? 1000 : 0,
      },
      // Loser
      {
        player_id: loser,
        action_type: "deal_in",
        action_order: riichiPlayers.length + 2,
        points_delta: -points,
        target_player_id: winner,
      },
    ];

    onSubmit({
      outcome_type: "ron",
      actions,
      description: `${winnerPlayer?.name} ron ${loserPlayer?.name} ${points}`,
      winner_name: winnerPlayer?.name,
      points,
    });

    resetForm();
  };

  const handleTsumo = () => {
    if (!winner || !points) return;

    const winnerPlayer = players.find(p => p.id === winner);
    const isDealer = winnerPlayer?.isDealer;
    const riichiPlayers = players.filter(p => p.hasRiichi);

    let totalWin = 0;
    const actions = [
      // Riichi declarations
      ...riichiPlayers.map((p, i) => ({
        player_id: p.id,
        action_type: "riichi",
        action_order: i + 1,
        riichi_stick_delta: -1000,
      })),
    ];

    if (isDealer) {
      // Dealer tsumo - everyone pays equally
      const paymentPerPlayer = points;
      totalWin = paymentPerPlayer * 3;

      actions.push({
        player_id: winner,
        action_type: "win",
        action_order: riichiPlayers.length + 1,
        points_delta:
          totalWin + (riichiPlayers.find(p => p.id === winner) ? 1000 : 0),
        riichi_stick_delta: riichiPlayers.find(p => p.id === winner) ? 1000 : 0,
      });

      let orderIndex = riichiPlayers.length + 2;
      players
        .filter(p => p.id !== winner)
        .forEach(player => {
          actions.push({
            player_id: player.id,
            action_type: "payment",
            action_order: orderIndex++,
            points_delta: -paymentPerPlayer,
          });
        });
    } else {
      // Non-dealer tsumo
      const selectedPoints = COMMON_POINTS.tsumo.nonDealer.find(
        p => p.nonDealer === points || p.dealer === points
      ) || { nonDealer: 1000, dealer: 2000 };

      players
        .filter(p => p.id !== winner)
        .forEach((player, index) => {
          const payment = player.isDealer
            ? selectedPoints.dealer
            : selectedPoints.nonDealer;
          totalWin += payment;
        });

      actions.push({
        player_id: winner,
        action_type: "win",
        action_order: riichiPlayers.length + 1,
        points_delta:
          totalWin + (riichiPlayers.find(p => p.id === winner) ? 1000 : 0),
        riichi_stick_delta: riichiPlayers.find(p => p.id === winner) ? 1000 : 0,
      });

      let orderIndex = riichiPlayers.length + 2;
      players
        .filter(p => p.id !== winner)
        .forEach(player => {
          const payment = player.isDealer
            ? selectedPoints.dealer
            : selectedPoints.nonDealer;
          actions.push({
            player_id: player.id,
            action_type: "payment",
            action_order: orderIndex++,
            points_delta: -payment,
          });
        });
    }

    onSubmit({
      outcome_type: "tsumo",
      actions,
      description: `${winnerPlayer?.name} tsumo ${totalWin}`,
      winner_name: winnerPlayer?.name,
      points: totalWin,
    });

    resetForm();
  };

  const handleDraw = () => {
    const riichiPlayers = players.filter(p => p.hasRiichi);
    const tenpaiCount = tenpaiPlayers.length;
    const notTenpaiCount = 4 - tenpaiCount;

    if (tenpaiCount === 0 || tenpaiCount === 4) {
      // No payments
      onSubmit({
        outcome_type: "exhaustive_draw",
        actions: riichiPlayers.map((p, i) => ({
          player_id: p.id,
          action_type: "riichi",
          action_order: i + 1,
          riichi_stick_delta: -1000,
        })),
        description: "Draw - no tenpai payments",
      });
    } else {
      // Calculate tenpai payments
      const paymentPerNotTenpai = 3000 / notTenpaiCount;
      const paymentPerTenpai = 3000 / tenpaiCount;

      const actions = [
        ...riichiPlayers.map((p, i) => ({
          player_id: p.id,
          action_type: "riichi",
          action_order: i + 1,
          riichi_stick_delta: -1000,
        })),
        ...tenpaiPlayers.map((playerId, i) => ({
          player_id: playerId,
          action_type: "tenpai",
          action_order: riichiPlayers.length + i + 1,
          points_delta: paymentPerTenpai,
        })),
        ...players
          .filter(p => !tenpaiPlayers.includes(p.id))
          .map((player, i) => ({
            player_id: player.id,
            action_type: "not_tenpai",
            action_order: riichiPlayers.length + tenpaiCount + i + 1,
            points_delta: -paymentPerNotTenpai,
          })),
      ];

      onSubmit({
        outcome_type: "exhaustive_draw",
        actions,
        description: `Draw - ${tenpaiCount} tenpai`,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setWinner(null);
    setOutcome(null);
    setLoser(null);
    setPoints(null);
    setTenpaiPlayers([]);
  };

  return (
    <Card data-testid="quick-entry-panel">
      <CardHeader>
        <CardTitle>Quick Entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Winner selection */}
        <div>
          <label className="text-sm font-medium">Winner</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {players.map(player => (
              <Button
                key={player.id}
                variant={winner === player.id ? "default" : "outline"}
                onClick={() => setWinner(player.id)}
                data-testid={`winner-button-${player.name.toLowerCase()}`}
              >
                {player.name}
                {player.isDealer && " 🔴"}
              </Button>
            ))}
          </div>
        </div>

        {/* Outcome selection */}
        {winner && (
          <div data-testid="outcome-selection">
            <label className="text-sm font-medium">Outcome</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Button
                variant={outcome === "ron" ? "default" : "outline"}
                onClick={() => setOutcome("ron")}
                data-testid="outcome-ron"
              >
                Ron
              </Button>
              <Button
                variant={outcome === "tsumo" ? "default" : "outline"}
                onClick={() => setOutcome("tsumo")}
                data-testid="outcome-tsumo"
              >
                Tsumo
              </Button>
              <Button
                variant={outcome === "draw" ? "default" : "outline"}
                onClick={() => {
                  setOutcome("draw");
                  setWinner(null);
                }}
                data-testid="outcome-draw"
              >
                Draw
              </Button>
            </div>
          </div>
        )}

        {/* Ron: Select loser */}
        {outcome === "ron" && (
          <div>
            <label className="text-sm font-medium">Who dealt in?</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {players
                .filter(p => p.id !== winner)
                .map(player => (
                  <Button
                    key={player.id}
                    variant={loser === player.id ? "default" : "outline"}
                    onClick={() => setLoser(player.id)}
                    data-testid={`loser-button-${player.name.toLowerCase()}`}
                  >
                    {player.name}
                  </Button>
                ))}
            </div>
          </div>
        )}

        {/* Points selection */}
        {((outcome === "ron" && loser) || outcome === "tsumo") && (
          <div>
            <label className="text-sm font-medium">Points</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {outcome === "ron"
                ? COMMON_POINTS.ron.map(p => (
                    <Button
                      key={p}
                      variant={points === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPoints(p)}
                      data-testid={`points-button-${p}`}
                    >
                      {p.toLocaleString()}
                    </Button>
                  ))
                : players.find(p => p.id === winner)?.isDealer
                  ? COMMON_POINTS.tsumo.dealer.map(p => (
                      <Button
                        key={p}
                        variant={points === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPoints(p)}
                        data-testid={`tsumo-points-dealer-${p}`}
                      >
                        {p.toLocaleString()} all
                      </Button>
                    ))
                  : COMMON_POINTS.tsumo.nonDealer.map(p => (
                      <Button
                        key={p.display}
                        variant={points === p.nonDealer ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPoints(p.nonDealer)}
                        data-testid={`tsumo-points-${p.display.replace("/", "-")}`}
                      >
                        {p.display}
                      </Button>
                    ))}
            </div>
          </div>
        )}

        {/* Tsumo quick submit */}
        {outcome === "tsumo" && winner && (
          <Button
            className="w-full"
            onClick={handleTsumo}
            disabled={!points || disabled}
            data-testid={`quick-tsumo-${points ? `${points}-${points * 2}` : ""}`}
          >
            Submit Tsumo
          </Button>
        )}

        {/* Draw: Select tenpai players */}
        {outcome === "draw" && (
          <div>
            <label className="text-sm font-medium">Who was tenpai?</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {players.map(player => (
                <label key={player.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tenpaiPlayers.includes(player.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setTenpaiPlayers([...tenpaiPlayers, player.id]);
                      } else {
                        setTenpaiPlayers(
                          tenpaiPlayers.filter(id => id !== player.id)
                        );
                      }
                    }}
                    data-testid={`tenpai-checkbox-${player.name.toLowerCase()}`}
                  />
                  <span>{player.name}</span>
                </label>
              ))}
            </div>
            {tenpaiPlayers.length > 0 && (
              <div className="mt-2" data-testid="payment-preview">
                {tenpaiPlayers.length === 1 && <Badge>+3000</Badge>}
                {tenpaiPlayers.length === 2 && <Badge>+1500 each</Badge>}
                {tenpaiPlayers.length === 3 && <Badge>+1000 each</Badge>}
                {4 - tenpaiPlayers.length === 1 && (
                  <Badge variant="destructive">-3000</Badge>
                )}
                {4 - tenpaiPlayers.length === 2 && (
                  <Badge variant="destructive">-1500 each</Badge>
                )}
                {4 - tenpaiPlayers.length === 3 && (
                  <Badge variant="destructive">-1000 each</Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submit button */}
        <Button
          className="w-full"
          onClick={() => {
            if (outcome === "ron") handleRon();
            else if (outcome === "tsumo") handleTsumo();
            else if (outcome === "draw") handleDraw();
          }}
          disabled={
            disabled ||
            (outcome === "ron" && (!winner || !loser || !points)) ||
            (outcome === "tsumo" && (!winner || !points)) ||
            (outcome === "draw" && tenpaiPlayers.length === 0)
          }
          data-testid="submit-hand"
        >
          Submit Hand
        </Button>
      </CardContent>
    </Card>
  );
}
