"use client";

import { useState, useEffect } from "react";
import { Shuffle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Seat, SEATS } from "@/lib/mahjong";

export interface Player {
  id: string;
  display_name: string;
}

export interface SeatAssignment {
  seat: Seat;
  playerId: string;
}

interface SeatAssignmentProps {
  players: Player[];
  assignments: SeatAssignment[];
  onAssignmentsChange: (assignments: SeatAssignment[]) => void;
}

const SEAT_LABELS: Record<
  Seat,
  { label: string; kanji: string; color: string }
> = {
  east: { label: "East", kanji: "東", color: "text-red-500" },
  south: { label: "South", kanji: "南", color: "text-green-500" },
  west: { label: "West", kanji: "西", color: "text-blue-500" },
  north: { label: "North", kanji: "北", color: "text-purple-500" },
};

export function SeatAssignmentComponent({
  players,
  assignments,
  onAssignmentsChange,
}: SeatAssignmentProps) {
  const [localAssignments, setLocalAssignments] = useState<
    Record<Seat, string>
  >({
    east: "",
    south: "",
    west: "",
    north: "",
  });

  // Initialize from props
  useEffect(() => {
    const initial: Record<Seat, string> = {
      east: "",
      south: "",
      west: "",
      north: "",
    };
    for (const assignment of assignments) {
      initial[assignment.seat] = assignment.playerId;
    }
    setLocalAssignments(initial);
  }, [assignments]);

  const handleSeatChange = (seat: Seat, playerId: string) => {
    // If this player is already assigned to another seat, swap them
    const currentSeat = Object.entries(localAssignments).find(
      ([, id]) => id === playerId
    )?.[0] as Seat | undefined;

    const newAssignments = { ...localAssignments };

    if (currentSeat && currentSeat !== seat) {
      // Swap: move the player from old seat to new seat
      const playerAtNewSeat = newAssignments[seat];
      newAssignments[currentSeat] = playerAtNewSeat;
    }

    newAssignments[seat] = playerId;
    setLocalAssignments(newAssignments);

    // Convert to array format for parent
    const assignmentArray: SeatAssignment[] = SEATS.filter(
      s => newAssignments[s]
    ).map(s => ({
      seat: s,
      playerId: newAssignments[s],
    }));

    onAssignmentsChange(assignmentArray);
  };

  const randomizeSeats = () => {
    // Shuffle players randomly
    const shuffled = [...players].sort(() => Math.random() - 0.5);

    const newAssignments: Record<Seat, string> = {
      east: shuffled[0]?.id || "",
      south: shuffled[1]?.id || "",
      west: shuffled[2]?.id || "",
      north: shuffled[3]?.id || "",
    };

    setLocalAssignments(newAssignments);

    const assignmentArray: SeatAssignment[] = SEATS.filter(
      s => newAssignments[s]
    ).map(s => ({
      seat: s,
      playerId: newAssignments[s],
    }));

    onAssignmentsChange(assignmentArray);
  };

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.display_name || "";
  };

  const getAvailablePlayers = (_currentSeat: Seat) => {
    // All players are available - we'll swap if needed
    return players;
  };

  const isComplete = SEATS.every(seat => localAssignments[seat]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Seat Assignment</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={randomizeSeats}
            disabled={players.length !== 4}
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Randomize
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seat Assignment Grid - Visual Table Layout */}
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-2">
          {/* Top row - West */}
          <div className="col-start-2">
            <SeatSelect
              seat="west"
              label={SEAT_LABELS.west}
              value={localAssignments.west}
              players={getAvailablePlayers("west")}
              onChange={playerId => handleSeatChange("west", playerId)}
              getPlayerName={getPlayerName}
            />
          </div>

          {/* Middle row - North and South */}
          <div className="col-start-1 row-start-2">
            <SeatSelect
              seat="north"
              label={SEAT_LABELS.north}
              value={localAssignments.north}
              players={getAvailablePlayers("north")}
              onChange={playerId => handleSeatChange("north", playerId)}
              getPlayerName={getPlayerName}
            />
          </div>
          <div className="col-start-2 row-start-2 flex items-center justify-center">
            <div className="bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-lg text-xs">
              Table
            </div>
          </div>
          <div className="col-start-3 row-start-2">
            <SeatSelect
              seat="south"
              label={SEAT_LABELS.south}
              value={localAssignments.south}
              players={getAvailablePlayers("south")}
              onChange={playerId => handleSeatChange("south", playerId)}
              getPlayerName={getPlayerName}
            />
          </div>

          {/* Bottom row - East */}
          <div className="col-start-2 row-start-3">
            <SeatSelect
              seat="east"
              label={SEAT_LABELS.east}
              value={localAssignments.east}
              players={getAvailablePlayers("east")}
              onChange={playerId => handleSeatChange("east", playerId)}
              getPlayerName={getPlayerName}
            />
          </div>
        </div>

        {/* Deal order indicator */}
        {isComplete && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
            <span>Deal order:</span>
            <div className="flex items-center gap-1">
              {SEATS.map((seat, index) => (
                <span key={seat} className="flex items-center">
                  <span className={SEAT_LABELS[seat].color}>
                    {getPlayerName(localAssignments[seat])}
                  </span>
                  {index < 3 && <ArrowRight className="mx-1 h-3 w-3" />}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SeatSelectProps {
  seat: Seat;
  label: { label: string; kanji: string; color: string };
  value: string;
  players: Player[];
  onChange: (playerId: string) => void;
  getPlayerName: (playerId: string) => string;
}

function SeatSelect({
  seat: _seat,
  label,
  value,
  players,
  onChange,
  getPlayerName,
}: SeatSelectProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`text-sm font-bold ${label.color}`}>
        {label.label} ({label.kanji})
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-auto w-28 py-1 text-xs">
          <SelectValue placeholder="Unassigned">
            {value ? getPlayerName(value) : "Unassigned"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {players.map(player => (
            <SelectItem key={player.id} value={player.id}>
              {player.display_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
