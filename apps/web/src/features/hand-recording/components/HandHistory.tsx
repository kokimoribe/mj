"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp } from "lucide-react";
import { useState } from "react";

interface Hand {
  hand_id: string;
  hand_number: number;
  round: string;
  outcome: string;
  winner?: string;
  points?: number;
  scores_after: Record<string, number>;
}

interface HandHistoryProps {
  hands: Hand[];
  dataQuality: "final_only" | "partial" | "complete";
}

export function HandHistory({ hands, dataQuality }: HandHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (dataQuality === "final_only") {
    return (
      <Card data-testid="final-scores-only">
        <CardContent className="p-4">
          <p
            className="text-muted-foreground text-sm"
            data-testid="hand-history-unavailable"
          >
            No hand history available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="hand-history-panel">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Hand History ({hands.length})
            {dataQuality === "partial" && (
              <Badge
                variant="secondary"
                className="ml-2"
                data-testid="data-quality-indicator"
              >
                Partial hand history available
              </Badge>
            )}
          </CardTitle>
          <ChevronUp
            className={`h-5 w-5 transition-transform ${expanded ? "" : "rotate-180"}`}
          />
        </div>
      </CardHeader>
      {expanded && (
        <CardContent data-testid="hand-history-expanded">
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {hands.map((hand, _index) => (
                <div
                  key={hand.hand_id}
                  className="rounded-lg border p-3"
                  data-testid="hand-history-item"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-semibold">
                        {hand.round}
                      </span>
                      {hand.winner && (
                        <p className="mt-1 text-sm">
                          {hand.winner} {hand.outcome} {hand.points}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">#{hand.hand_number}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}
