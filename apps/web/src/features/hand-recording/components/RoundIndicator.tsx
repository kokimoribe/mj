"use client";

import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

interface RoundIndicatorProps {
  windRound: "east" | "south" | "west" | "north";
  roundNumber: number;
}

export function RoundIndicator({
  windRound,
  roundNumber,
}: RoundIndicatorProps) {
  const windSymbols = {
    east: "東",
    south: "南",
    west: "西",
    north: "北",
  };

  const windColors = {
    east: "bg-red-500",
    south: "bg-green-500",
    west: "bg-blue-500",
    north: "bg-gray-500",
  };

  return (
    <Card data-testid="round-compass">
      <CardContent className="p-3 text-center">
        <div
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-white ${windColors[windRound]}`}
        >
          <span className="text-2xl font-bold">{windSymbols[windRound]}</span>
          <span className="text-lg font-semibold">
            {windRound.toUpperCase()} {roundNumber}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
