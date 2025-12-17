"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPoints, type Seat } from "@/lib/mahjong";
import { cn } from "@/lib/utils";

export interface HandEvent {
  handSeq: number;
  round: string;
  kyoku: number;
  honba: number;
  eventType: string;
  events: {
    seat: Seat;
    playerName: string;
    pointsDelta: number;
    riichiDeclared: boolean;
  }[];
  details?: {
    han?: number;
    fu?: number;
    winnerSeat?: Seat;
    loserSeat?: Seat;
    pointsWon?: number;
    tier?: string;
    riichiSticks?: number; // Sticks on table before this hand
    tenpaiSeats?: Seat[]; // Players in tenpai for draw hands
  };
}

interface HandHistoryProps {
  hands: HandEvent[];
  playerNames: Record<Seat, string>;
}

const ROUND_DISPLAY: Record<string, string> = {
  E: "East",
  S: "South",
  W: "West",
  N: "North",
};

const EVENT_LABELS: Record<string, { label: string; icon: string }> = {
  ron: { label: "Ron", icon: "🎯" },
  tsumo: { label: "Tsumo", icon: "🔥" },
  draw: { label: "Draw", icon: "🔄" },
  abortive_draw: { label: "Abortive Draw", icon: "⛔" },
  chombo: { label: "Chombo", icon: "💀" },
};

// Tier class mapping for animated styles
const TIER_CLASSES: Record<string, string> = {
  Haneman: "tier-haneman",
  Baiman: "tier-baiman",
  Sanbaiman: "tier-sanbaiman",
  Yakuman: "tier-yakuman",
};

// Dealer seat based on kyoku number
const DEALER_BY_KYOKU: Record<number, Seat> = {
  1: "east",
  2: "south",
  3: "west",
  4: "north",
};

export function HandHistory({ hands, playerNames }: HandHistoryProps) {
  if (hands.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No hands recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Hand History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          <div className="divide-y">
            {hands.map(hand => (
              <HandHistoryItem
                key={hand.handSeq}
                hand={hand}
                playerNames={playerNames}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface HandHistoryItemProps {
  hand: HandEvent;
  playerNames: Record<Seat, string>;
}

function HandHistoryItem({
  hand,
  playerNames: _playerNames,
}: HandHistoryItemProps) {
  const eventInfo = EVENT_LABELS[hand.eventType] || {
    label: hand.eventType,
    icon: "❓",
  };

  const dealerSeat = DEALER_BY_KYOKU[hand.kyoku] || "east";
  const isChombo = hand.eventType === "chombo";
  const isDraw =
    hand.eventType === "draw" || hand.eventType === "abortive_draw";
  const winnerEvent = hand.events.find(e => e.pointsDelta > 0);
  const winnerEvents = isChombo
    ? hand.events.filter(e => e.pointsDelta > 0)
    : winnerEvent
      ? [winnerEvent]
      : [];
  const loserEvents = hand.events.filter(e => e.pointsDelta < 0);
  const riichiEvents = hand.events.filter(e => e.riichiDeclared);

  // For draws: separate tenpai and non-tenpai players
  // Tenpai players are those in tenpaiSeats (may have 0 net if riichi was declared)
  // Non-tenpai players are those not in tenpaiSeats (always negative)
  const tenpaiSeats = hand.details?.tenpaiSeats || [];
  const tenpaiEvents = isDraw
    ? hand.events.filter(e => tenpaiSeats.includes(e.seat))
    : [];
  const nonTenpaiEvents = isDraw
    ? hand.events.filter(
        e => !tenpaiSeats.includes(e.seat) && e.pointsDelta < 0
      )
    : [];

  // Calculate point breakdown for winning hands
  const getPointBreakdown = () => {
    if (!winnerEvent || !hand.details?.pointsWon) return null;

    const honbaBonus = hand.honba * 300;
    // Riichi sticks collected = sticks on table + newly declared riichi this hand
    const existingRiichiSticks = hand.details?.riichiSticks || 0;
    const newRiichiSticks = riichiEvents.length;
    const totalRiichiSticks = existingRiichiSticks + newRiichiSticks;
    const riichiValue = totalRiichiSticks * 1000;

    // Base points = pointsWon (which includes honba) - honba bonus
    const basePoints = (hand.details?.pointsWon || 0) - honbaBonus;

    return {
      basePoints,
      honbaBonus,
      riichiValue,
      riichiSticksCollected: totalRiichiSticks,
      grandTotal: winnerEvent.pointsDelta,
    };
  };

  const breakdown = getPointBreakdown();

  return (
    <div className="p-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-2 text-base">
            #{hand.handSeq}
          </Badge>
          <span className="text-muted-foreground text-base">
            {ROUND_DISPLAY[hand.round] || hand.round} {hand.kyoku}
            {hand.honba > 0 && ` • ${hand.honba} Honba`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{eventInfo.icon}</span>
          <span className="text-xs font-medium">{eventInfo.label}</span>
        </div>
      </div>

      {/* Win details (or chombo recipients) - exclude draws, they use tenpai section */}
      {!isDraw && winnerEvents.length > 0 && hand.details && (
        <div className="mt-2 space-y-1 text-sm">
          {winnerEvents.map(event => (
            <div key={event.seat} className="flex items-center">
              <div className="w-12 flex-shrink-0">
                {event.seat === dealerSeat && (
                  <Badge
                    variant="outline"
                    className="border-yellow-500 bg-yellow-500/20 px-2 text-xs"
                  >
                    親
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-500">
                  {event.playerName}
                </span>
                <span className="text-green-500">
                  +{formatPoints(event.pointsDelta)}
                </span>
                {!isChombo && hand.details?.tier && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      TIER_CLASSES[hand.details.tier] &&
                        "m-1 !overflow-visible border-0 bg-transparent px-4 py-2"
                    )}
                  >
                    <span className={TIER_CLASSES[hand.details.tier] || ""}>
                      {hand.details.tier}
                    </span>
                  </Badge>
                )}
              </div>
            </div>
          ))}

          {/* Han/Fu info (only for wins, not chombo) */}
          {!isChombo && hand.details?.han && (
            <div className="text-muted-foreground pl-12 text-xs">
              {hand.details.han} Han (翻){" "}
              {hand.details.fu &&
                hand.details.han < 5 &&
                `${hand.details.fu} Fu (符)`}
            </div>
          )}

          {/* Point breakdown (only for wins, not chombo) */}
          {!isChombo &&
            breakdown &&
            (breakdown.honbaBonus > 0 || breakdown.riichiValue > 0) && (
              <div className="bg-muted/50 mt-1.5 ml-12 rounded px-2 py-1 text-xs">
                <span className="text-amber-500">
                  {formatPoints(breakdown.basePoints)} base
                </span>
                {breakdown.honbaBonus > 0 && (
                  <span className="text-foreground">
                    {" "}
                    + {formatPoints(breakdown.honbaBonus)} honba
                  </span>
                )}
                {breakdown.riichiValue > 0 && (
                  <span className="text-blue-500">
                    {" "}
                    + {formatPoints(breakdown.riichiValue)} riichi (
                    {breakdown.riichiSticksCollected}本)
                  </span>
                )}
              </div>
            )}
        </div>
      )}

      {/* Draw: Tenpai players (receive points) */}
      {isDraw && tenpaiEvents.length > 0 && (
        <div className="mt-2 space-y-1 text-sm">
          {tenpaiEvents.map(event => {
            // Calculate tenpai payment amount based on number of tenpai players
            const tenpaiCount = hand.details?.tenpaiSeats?.length || 0;
            let tenpaiPayment = 0;
            let paymentDescription = "";

            if (tenpaiCount === 1) {
              tenpaiPayment = 3000;
              paymentDescription = "1000 from each non-tenpai";
            } else if (tenpaiCount === 2) {
              tenpaiPayment = 1500;
              paymentDescription = "750 from each non-tenpai";
            } else if (tenpaiCount === 3) {
              tenpaiPayment = 1000;
              paymentDescription = "from 1 non-tenpai";
            }

            const riichiDeduction = event.riichiDeclared ? 1000 : 0;

            return (
              <div key={event.seat}>
                <div className="flex items-center">
                  <div className="w-12 flex-shrink-0">
                    {event.seat === dealerSeat && (
                      <Badge
                        variant="outline"
                        className="border-yellow-500 bg-yellow-500/20 px-2 text-xs"
                      >
                        親
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-bold",
                        event.pointsDelta >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      )}
                    >
                      {event.playerName}
                    </span>
                    <span
                      className={
                        event.pointsDelta >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {event.pointsDelta >= 0
                        ? `+${formatPoints(event.pointsDelta)}`
                        : formatPoints(event.pointsDelta)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Tenpai (聴牌)
                    </Badge>
                  </div>
                </div>

                {/* Tenpai payment breakdown with riichi deduction */}
                {tenpaiPayment > 0 && (
                  <div className="bg-muted/50 mt-1.5 ml-12 rounded px-2 py-1 text-xs">
                    <span className="text-green-500">
                      +{formatPoints(tenpaiPayment)} Tenpai
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      ({paymentDescription})
                    </span>
                    {riichiDeduction > 0 && (
                      <span className="text-red-500">
                        {" "}
                        - {formatPoints(riichiDeduction)} riichi
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Draw: Non-tenpai players (pay points) */}
      {isDraw && nonTenpaiEvents.length > 0 && (
        <div className="mt-2 space-y-1 text-sm">
          {nonTenpaiEvents.map(event => (
            <div key={event.seat} className="flex items-center">
              <div className="w-12 flex-shrink-0">
                {event.seat === dealerSeat && (
                  <Badge
                    variant="outline"
                    className="border-yellow-500 bg-yellow-500/20 px-2 text-xs"
                  >
                    親
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500">{event.playerName}</span>
                <span className="text-red-500">
                  {formatPoints(event.pointsDelta)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loser details (for wins/chombo, not draws) */}
      {!isDraw && loserEvents.length > 0 && (
        <div className="mt-2 space-y-1 text-sm">
          {loserEvents.map(loser => (
            <div key={loser.seat} className="flex items-center">
              <div className="w-12 flex-shrink-0">
                {loser.seat === dealerSeat && (
                  <Badge
                    variant="outline"
                    className="border-yellow-500 bg-yellow-500/20 px-2 text-xs"
                  >
                    親
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500">{loser.playerName}</span>
                <span className="text-red-500">
                  {formatPoints(loser.pointsDelta)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Riichi declarations */}
      {riichiEvents.length > 0 && (
        <div className="text-muted-foreground mt-1 pl-12 text-xs">
          Riichi: {riichiEvents.map(e => e.playerName).join(", ")}
        </div>
      )}
    </div>
  );
}
