"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  calculatePoints,
  formatPoints,
  getValidFuValues,
  getScoringTier,
  getWinnersByTurnOrderFromLoser,
  type Seat,
  SEATS,
} from "@/lib/mahjong";
import { cn } from "@/lib/utils";

export type EventType = "tsumo" | "ron" | "draw" | "abortive_draw" | "chombo";

export interface PlayerInfo {
  seat: Seat;
  playerId: string;
  playerName: string;
}

export type AbortiveDrawType =
  | "kyuushu_kyuuhai"
  | "suufon_renda"
  | "suucha_riichi"
  | "suukan_sanra"
  | "sanchahou";

export interface HandEntryData {
  eventType: EventType;
  winnerSeat?: Seat;
  winnerSeats?: Seat[];
  winnerHandValues?: Partial<Record<Seat, { han: number; fu: number }>>;
  loserSeat?: Seat;
  han?: number;
  fu?: number;
  riichiDeclarations: Seat[];
  yakuList?: string[];
  abortiveDrawType?: AbortiveDrawType;
  tenpaiSeats?: Seat[];
}

interface HandEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: PlayerInfo[];
  dealerSeat: Seat;
  round: string;
  kyoku: number;
  honba: number;
  riichiSticks: number;
  onSubmit: (data: HandEntryData) => void;
  isSubmitting?: boolean;
}

const EVENT_TYPES: { value: EventType; label: string; icon: string }[] = [
  { value: "ron", label: "Ron", icon: "🎯" },
  { value: "tsumo", label: "Tsumo", icon: "🔥" },
  { value: "draw", label: "Draw", icon: "🔄" },
  { value: "abortive_draw", label: "Abortive", icon: "⛔" },
  { value: "chombo", label: "Chombo", icon: "💀" },
];

const HAN_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6-7" },
  { value: 8, label: "8-10" },
  { value: 11, label: "11-12" },
  { value: 13, label: "13+" },
];

const ABORTIVE_DRAW_TYPES: {
  value: AbortiveDrawType;
  label: string;
  japanese: string;
}[] = [
  { value: "kyuushu_kyuuhai", label: "Nine Terminals", japanese: "九種九牌" },
  { value: "suufon_renda", label: "Four Wind Discards", japanese: "四風連打" },
  { value: "suukan_sanra", label: "Four Kans", japanese: "四槓散了" },
  { value: "suucha_riichi", label: "Four Riichi", japanese: "四家立直" },
  { value: "sanchahou", label: "Triple Ron", japanese: "三家和" },
];

const ROUND_DISPLAY: Record<string, { name: string; kanji: string }> = {
  E: { name: "East", kanji: "東" },
  S: { name: "South", kanji: "南" },
  W: { name: "West", kanji: "西" },
  N: { name: "North", kanji: "北" },
};

export function HandEntryForm({
  open,
  onOpenChange,
  players,
  dealerSeat,
  round,
  kyoku,
  honba,
  riichiSticks,
  onSubmit,
  isSubmitting = false,
}: HandEntryFormProps) {
  const [eventType, setEventType] = useState<EventType>("ron");
  const [winnerSeat, setWinnerSeat] = useState<Seat | "">("");
  const [winnerSeats, setWinnerSeats] = useState<Seat[]>([]);
  const [winnerHandValues, setWinnerHandValues] = useState<
    Partial<Record<Seat, { han: number; fu: number }>>
  >({});
  const [loserSeat, setLoserSeat] = useState<Seat | "">("");
  const [han, setHan] = useState<number>(1);
  const [fu, setFu] = useState<number>(30);
  const [riichiDeclarations, setRiichiDeclarations] = useState<Seat[]>([]);
  const [abortiveDrawType, setAbortiveDrawType] = useState<
    AbortiveDrawType | ""
  >("");
  const [tenpaiSeats, setTenpaiSeats] = useState<Seat[]>([]);
  const [isAutoAbortive, setIsAutoAbortive] = useState(false);

  // Reset form when opened (using useEffect to catch programmatic open changes)
  useEffect(() => {
    if (open) {
      setEventType("ron");
      setWinnerSeat("");
      setWinnerSeats([]);
      setWinnerHandValues({});
      setLoserSeat("");
      setHan(1);
      setFu(30);
      setRiichiDeclarations([]);
      setAbortiveDrawType("");
      setTenpaiSeats([]);
      setIsAutoAbortive(false);
    }
  }, [open]);

  // Calculate points preview with detailed breakdown
  const pointsPreview = useMemo(() => {
    if (!winnerSeat || eventType !== "tsumo") {
      return null;
    }

    const isDealer = winnerSeat === dealerSeat;
    const isTsumo = true;

    // Calculate base points (without honba)
    const baseResult = calculatePoints(han, fu, isDealer, isTsumo, 0);
    // Calculate with honba
    const withHonba = calculatePoints(han, fu, isDealer, isTsumo, honba);

    const honbaBonus = honba * 300;
    // Total riichi sticks collected: existing on table + newly declared this hand
    const totalRiichiSticksCollected = riichiSticks + riichiDeclarations.length;
    const riichiValue = totalRiichiSticksCollected * 1000;

    // Grand total = hand points + riichi sticks
    const grandTotal = withHonba.total + riichiValue;

    return {
      ...withHonba,
      basePoints: baseResult.total,
      honbaBonus,
      riichiValue,
      riichiSticksCollected: totalRiichiSticksCollected,
      grandTotal,
    };
  }, [
    eventType,
    winnerSeat,
    dealerSeat,
    han,
    fu,
    honba,
    riichiSticks,
    riichiDeclarations,
  ]);

  const scoringTier = useMemo(() => getScoringTier(han, fu), [han, fu]);

  const ronPointsPreview = useMemo(() => {
    if (eventType !== "ron" || winnerSeats.length === 0) {
      return [];
    }

    const totalRiichiSticksCollected = riichiSticks + riichiDeclarations.length;
    const orderedWinners =
      loserSeat && winnerSeats.length > 0
        ? getWinnersByTurnOrderFromLoser(loserSeat, winnerSeats)
        : [];
    const riichiCollector = orderedWinners[0];

    return winnerSeats.map(seat => {
      const values = winnerHandValues[seat] || { han: 1, fu: 30 };
      const isDealer = seat === dealerSeat;
      const baseResult = calculatePoints(
        values.han,
        values.fu,
        isDealer,
        false,
        0
      );
      const withHonba = calculatePoints(
        values.han,
        values.fu,
        isDealer,
        false,
        honba
      );
      const honbaBonus = honba * 300;
      const getsRiichi = riichiCollector === seat;
      const riichiValue = getsRiichi ? totalRiichiSticksCollected * 1000 : 0;

      return {
        seat,
        han: values.han,
        fu: values.fu,
        basePoints: baseResult.total,
        honbaBonus,
        riichiValue,
        riichiSticksCollected: getsRiichi ? totalRiichiSticksCollected : 0,
        grandTotal: withHonba.total + riichiValue,
      };
    });
  }, [
    eventType,
    winnerSeats,
    winnerHandValues,
    dealerSeat,
    honba,
    riichiSticks,
    riichiDeclarations.length,
    loserSeat,
  ]);

  // Auto-convert draw to abortive_draw when 4 players declare riichi
  useEffect(() => {
    const riichiCount = riichiDeclarations.length;
    if (riichiCount === 4 && eventType === "draw") {
      // 4 riichi = abortive draw (suucha_riichi)
      setEventType("abortive_draw");
      setAbortiveDrawType("suucha_riichi");
      setIsAutoAbortive(true);
    } else if (
      riichiCount === 4 &&
      eventType === "abortive_draw" &&
      !abortiveDrawType
    ) {
      // If user manually selects abortive_draw with 4 riichi, auto-set suucha_riichi
      setAbortiveDrawType("suucha_riichi");
    } else if (riichiCount < 4 && abortiveDrawType === "suucha_riichi") {
      // If user unchecks a riichi and we're at suucha_riichi, clear the type
      // They can select a different abortive draw type or change event type
      setAbortiveDrawType("");
      setIsAutoAbortive(false);
    }
  }, [riichiDeclarations.length, eventType, abortiveDrawType]);

  // Auto-convert ron to abortive_draw when 3 players win (triple ron)
  useEffect(() => {
    const winnerCount = winnerSeats.length;
    if (winnerCount === 3 && eventType === "ron") {
      setEventType("abortive_draw");
      setAbortiveDrawType("sanchahou");
      setIsAutoAbortive(true);
    } else if (
      winnerCount === 3 &&
      eventType === "abortive_draw" &&
      !abortiveDrawType
    ) {
      setAbortiveDrawType("sanchahou");
    } else if (winnerCount < 3 && abortiveDrawType === "sanchahou") {
      setAbortiveDrawType("");
      setIsAutoAbortive(false);
    }
  }, [winnerSeats.length, eventType, abortiveDrawType]);

  // When suucha_riichi is selected, ensure exactly 4 riichi are declared
  useEffect(() => {
    if (
      abortiveDrawType === "suucha_riichi" &&
      riichiDeclarations.length !== 4
    ) {
      // If user manually selects suucha_riichi but doesn't have 4 riichi,
      // we'll validate this in canSubmit
    }
  }, [abortiveDrawType, riichiDeclarations.length]);

  const toggleRiichi = (seat: Seat) => {
    const isCurrentlyRiichi = riichiDeclarations.includes(seat);
    setRiichiDeclarations(prev =>
      isCurrentlyRiichi ? prev.filter(s => s !== seat) : [...prev, seat]
    );
    // If declaring riichi, automatically add to tenpai (riichi requires tenpai)
    if (!isCurrentlyRiichi) {
      setTenpaiSeats(prev => (prev.includes(seat) ? prev : [...prev, seat]));
    }
    // Note: We don't auto-remove from tenpai when unchecking riichi,
    // as a player can be in tenpai without declaring riichi
  };

  const toggleTenpai = (seat: Seat) => {
    // If player has declared riichi, they must be in tenpai - prevent unchecking
    if (riichiDeclarations.includes(seat) && tenpaiSeats.includes(seat)) {
      return; // Can't uncheck tenpai if riichi is declared
    }
    setTenpaiSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  const getPlayerBySeat = (seat: Seat) => {
    return players.find(p => p.seat === seat);
  };

  const toggleRonWinner = (seat: Seat) => {
    setWinnerSeats(prev => {
      const isSelected = prev.includes(seat);
      const next = isSelected ? prev.filter(s => s !== seat) : [...prev, seat];
      return next;
    });
    setWinnerHandValues(prev => {
      if (prev[seat]) return prev;
      return { ...prev, [seat]: { han: 1, fu: 30 } };
    });
  };

  const updateWinnerHandValue = (
    seat: Seat,
    values: Partial<{ han: number; fu: number }>
  ) => {
    setWinnerHandValues(prev => {
      const current = prev[seat] || { han: 1, fu: 30 };
      return {
        ...prev,
        [seat]: {
          han: values.han ?? current.han,
          fu: values.fu ?? current.fu,
        },
      };
    });
  };

  const isWinEvent = eventType === "ron" || eventType === "tsumo";
  const needsLoser = eventType === "ron" || eventType === "chombo";
  const isAbortiveDraw = eventType === "abortive_draw";
  const isDraw = eventType === "draw" || eventType === "abortive_draw";
  const hasFourRiichi = riichiDeclarations.length === 4;
  const hasThreeRonWinners = winnerSeats.length === 3;
  const isSuuchaRiichi = abortiveDrawType === "suucha_riichi";
  const isSanchahou = abortiveDrawType === "sanchahou";
  const ronWinnersValid = winnerSeats.every(seat => {
    const values = winnerHandValues[seat];
    return !!values && values.han >= 1;
  });

  const canSubmit = () => {
    if (eventType === "tsumo") {
      if (!winnerSeat || han < 1) return false;
    }
    if (eventType === "ron") {
      if (winnerSeats.length < 1 || winnerSeats.length > 2) return false;
      if (!loserSeat) return false;
      if (winnerSeats.includes(loserSeat as Seat)) return false;
      if (!ronWinnersValid) return false;
    }
    if (eventType === "chombo" && !loserSeat) return false;
    if (isAbortiveDraw && !abortiveDrawType) return false;
    // If suucha_riichi is selected, exactly 4 riichi must be declared
    if (isSuuchaRiichi && riichiDeclarations.length !== 4) return false;
    // If 4 riichi are declared, it must be abortive_draw with suucha_riichi
    if (hasFourRiichi && (eventType !== "abortive_draw" || !isSuuchaRiichi))
      return false;
    // If sanchahou is selected, exactly 3 ron winners must be retained
    if (isSanchahou && winnerSeats.length !== 3) return false;
    // If 3 ron winners are selected, it must be abortive_draw with sanchahou
    if (
      hasThreeRonWinners &&
      (eventType !== "abortive_draw" || abortiveDrawType !== "sanchahou")
    ) {
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;

    const data: HandEntryData = {
      eventType,
      riichiDeclarations,
    };

    if (eventType === "tsumo") {
      data.winnerSeat = winnerSeat as Seat;
      data.han = han;
      data.fu = fu;
    }

    if (eventType === "ron") {
      data.winnerSeats = winnerSeats;
      data.winnerHandValues = winnerHandValues;
      // Keep backwards compatibility for single-winner consumers
      if (winnerSeats.length === 1) {
        const singleWinner = winnerSeats[0];
        const singleValues = winnerHandValues[singleWinner];
        if (singleWinner && singleValues) {
          data.winnerSeat = singleWinner;
          data.han = singleValues.han;
          data.fu = singleValues.fu;
        }
      }
    }

    if (needsLoser && loserSeat) {
      data.loserSeat = loserSeat as Seat;
    }

    if (isAbortiveDraw) {
      // If 4 riichi are declared, it must be suucha_riichi
      if (hasFourRiichi) {
        data.abortiveDrawType = "suucha_riichi";
      } else if (hasThreeRonWinners) {
        data.abortiveDrawType = "sanchahou";
      } else if (abortiveDrawType) {
        data.abortiveDrawType = abortiveDrawType;
      }
      if (winnerSeats.length > 0) {
        data.winnerSeats = winnerSeats;
      }
    }

    // Sanchahou has no tenpai payments — omit tenpaiSeats so the API doesn't
    // misinterpret the riichi-populated tenpai list as a noten/tenpai split.
    if (isDraw && tenpaiSeats.length > 0 && !isSanchahou) {
      data.tenpaiSeats = tenpaiSeats;
    }

    onSubmit(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="px-6">
          <SheetTitle>Record Hand Result</SheetTitle>
          <SheetDescription>
            {ROUND_DISPLAY[round]?.name ?? round} (
            {ROUND_DISPLAY[round]?.kanji ?? ""}) {kyoku} (局){" "}
            {honba > 0 && `${honba} Honba (本場)`}
            {riichiSticks > 0 && ` • ${riichiSticks} riichi sticks`}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 py-4">
          {/* Event Type Selection */}
          <div className="space-y-2">
            <Label>Result Type</Label>
            {hasFourRiichi && eventType === "draw" && (
              <div className="mb-2 rounded-md border border-amber-500/50 bg-amber-500/10 p-2 text-sm">
                <span className="text-amber-700 dark:text-amber-400">
                  ⚠️ 4 players declared riichi - this must be an abortive draw
                  (四家立直)
                </span>
              </div>
            )}
            <div className="grid grid-cols-5 gap-2">
              {EVENT_TYPES.map(type => {
                const isDisabled = type.value === "draw" && hasFourRiichi;
                return (
                  <Button
                    key={type.value}
                    variant={eventType === type.value ? "default" : "outline"}
                    className="flex h-11 items-center justify-center gap-1 px-2"
                    onClick={() => {
                      if (!isDisabled) {
                        setEventType(type.value);
                        setIsAutoAbortive(false);
                        // If switching away from abortive_draw, clear the type
                        if (type.value !== "abortive_draw") {
                          setAbortiveDrawType("");
                        }
                      }
                    }}
                    disabled={isDisabled}
                    title={
                      isDisabled
                        ? "Cannot select draw when 4 players declared riichi"
                        : undefined
                    }
                  >
                    <span className="text-base">{type.icon}</span>
                    <span className="text-xs">{type.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Abortive Draw Type Selection */}
          {isAbortiveDraw && (
            <div className="space-y-2">
              <Label>Abortive Draw Type</Label>
              {isSanchahou && isAutoAbortive && (
                <div className="mb-2 rounded-md border border-blue-500/50 bg-blue-500/10 p-2 text-sm">
                  <span className="text-blue-700 dark:text-blue-400">
                    ℹ️ 3 players won by Ron — this is a Triple Ron (三家和) and
                    counts as an abortive draw
                  </span>
                </div>
              )}
              {isSuuchaRiichi && isAutoAbortive && (
                <div className="mb-2 rounded-md border border-blue-500/50 bg-blue-500/10 p-2 text-sm">
                  <span className="text-blue-700 dark:text-blue-400">
                    ℹ️ All 4 players declared riichi — this is a Four Riichi
                    (四家立直) abortive draw
                  </span>
                </div>
              )}
              {isSuuchaRiichi &&
                !isAutoAbortive &&
                riichiDeclarations.length !== 4 && (
                  <div className="mb-2 rounded-md border border-red-500/50 bg-red-500/10 p-2 text-sm">
                    <span className="text-red-700 dark:text-red-400">
                      ⚠️ Four Riichi (四家立直) requires exactly 4 players to
                      declare riichi
                    </span>
                  </div>
                )}
              <div className="grid grid-cols-1 gap-2">
                {ABORTIVE_DRAW_TYPES.filter(
                  type => !isAutoAbortive || type.value === abortiveDrawType
                ).map(type => {
                  const isSuuchaRiichiType = type.value === "suucha_riichi";
                  const isSanchahouType = type.value === "sanchahou";
                  const isSelected = abortiveDrawType === type.value;
                  return (
                    <Button
                      key={type.value}
                      variant={isSelected ? "default" : "outline"}
                      className="flex h-auto min-h-11 items-center justify-start px-4 py-3"
                      onClick={() => {
                        if (isAutoAbortive) return;
                        if (type.value === "sanchahou") {
                          // Switch to ron so the user can pick 3 winners; the
                          // auto-convert effect will switch back to abortive_draw
                          // with sanchahou once the 3rd winner is selected.
                          setEventType("ron");
                          setAbortiveDrawType("");
                        } else if (type.value === "suucha_riichi") {
                          // Pre-select all 4 riichi/tenpai declarations so that
                          // riichiCount is already 4 when React runs the effect,
                          // preventing the "riichiCount < 4" branch from clearing
                          // the selection.
                          setAbortiveDrawType("suucha_riichi");
                          setRiichiDeclarations([...SEATS]);
                          setTenpaiSeats([...SEATS]);
                        } else {
                          setAbortiveDrawType(type.value);
                        }
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{type.label}</span>
                        {isSuuchaRiichiType && !isAutoAbortive && (
                          <span className="mt-1 text-xs text-amber-500 italic">
                            Requires 4 riichi declarations
                          </span>
                        )}
                        {isSanchahouType && !isAutoAbortive && (
                          <span className="mt-1 text-xs text-amber-500 italic">
                            Tap to select 3 ron winners — will auto-confirm as
                            Triple Ron
                          </span>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Winner Selection (for wins) */}
          {isWinEvent && (
            <div className="space-y-2">
              <Label>{eventType === "ron" ? "Winner(s)" : "Winner"}</Label>
              <div className="grid grid-cols-2 gap-2">
                {SEATS.map(seat => {
                  const player = getPlayerBySeat(seat);
                  if (!player) return null;
                  const isDealer = seat === dealerSeat;
                  const isSelected =
                    eventType === "ron"
                      ? winnerSeats.includes(seat)
                      : winnerSeat === seat;

                  return (
                    <Button
                      key={seat}
                      variant={isSelected ? "default" : "outline"}
                      className="flex h-11 items-center justify-between gap-2 px-3"
                      onClick={() =>
                        eventType === "ron"
                          ? toggleRonWinner(seat)
                          : setWinnerSeat(seat)
                      }
                    >
                      <span className="truncate text-sm font-medium">
                        {player.playerName}
                      </span>
                      {isDealer && (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-yellow-500 bg-yellow-500/20 text-xs"
                        >
                          Dealer (親)
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loser Selection (for ron/chombo) */}
          {needsLoser && (
            <div className="space-y-2">
              <Label>{eventType === "chombo" ? "Offender" : "Deal-in"}</Label>
              <div className="grid grid-cols-4 gap-2">
                {SEATS.map(seat => {
                  const player = getPlayerBySeat(seat);
                  if (!player) return null;
                  // Can't deal into yourself - disable instead of hiding
                  const isDisabled =
                    eventType === "ron" && winnerSeats.includes(seat);

                  return (
                    <Button
                      key={seat}
                      variant={loserSeat === seat ? "destructive" : "outline"}
                      className="flex h-11 items-center justify-center px-2"
                      onClick={() => setLoserSeat(seat)}
                      disabled={isDisabled}
                      title={
                        isDisabled ? "Cannot deal into yourself" : undefined
                      }
                    >
                      <span className="max-w-full truncate text-sm font-medium">
                        {player.playerName}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Han/Fu Selection (for tsumo) */}
          {eventType === "tsumo" && (
            <Card
              className={cn(
                !winnerSeat ? "pointer-events-none opacity-50" : ""
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>Hand Value</span>
                  {scoringTier && (
                    <Badge variant="secondary">{scoringTier}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              {!winnerSeat && (
                <div className="px-6 pb-4">
                  <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
                    <span className="text-amber-700 dark:text-amber-400">
                      ⚠️ Please select Winner first
                    </span>
                  </div>
                </div>
              )}
              <CardContent className="space-y-4">
                {/* Han Selection */}
                <div className="space-y-2">
                  <Label>Han (翻)</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {HAN_OPTIONS.map(option => (
                      <Button
                        key={option.value}
                        variant={han === option.value ? "default" : "outline"}
                        size="sm"
                        className="h-8 min-w-8 px-2"
                        onClick={() => setHan(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Fu Selection (only if not mangan+) */}
                {han < 5 && (
                  <div className="space-y-2">
                    <Label>Fu (符)</Label>
                    <div className="flex flex-wrap gap-1">
                      {getValidFuValues().map(f => (
                        <Button
                          key={f}
                          variant={fu === f ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-10 p-0"
                          onClick={() => setFu(f)}
                        >
                          {f}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Points Preview */}
                {pointsPreview && (
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-muted-foreground mb-2 text-center text-sm">
                      {eventType === "tsumo" ? "Tsumo" : "Ron"} Points
                    </div>

                    {/* Point breakdown */}
                    <div className="space-y-1 text-sm">
                      {/* Base points */}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Hand value ({han} Han{han < 5 && `, ${fu} Fu`})
                        </span>
                        <span className="text-amber-500">
                          {formatPoints(pointsPreview.basePoints)}
                        </span>
                      </div>

                      {/* Honba bonus */}
                      {pointsPreview.honbaBonus > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Honba bonus ({honba}本場 × 300)
                          </span>
                          <span className="text-foreground">
                            +{formatPoints(pointsPreview.honbaBonus)}
                          </span>
                        </div>
                      )}

                      {/* Riichi sticks */}
                      {pointsPreview.riichiValue > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Riichi sticks ({pointsPreview.riichiSticksCollected}
                            本 × 1,000)
                          </span>
                          <span className="text-blue-500">
                            +{formatPoints(pointsPreview.riichiValue)}
                          </span>
                        </div>
                      )}

                      {/* Divider and total */}
                      <div className="border-foreground/20 my-2 border-t" />
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total</span>
                        <span className="text-2xl font-bold text-green-500">
                          {formatPoints(pointsPreview.grandTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Payment breakdown for tsumo */}
                    {eventType === "tsumo" && "allPay" in pointsPreview && (
                      <div className="text-muted-foreground border-foreground/10 mt-2 border-t pt-2 text-center text-xs">
                        Payment:{" "}
                        {winnerSeat === dealerSeat
                          ? `All pay ${formatPoints((pointsPreview as { allPay: number }).allPay)}`
                          : `${formatPoints((pointsPreview as { nonDealerPays?: number }).nonDealerPays || 0)} / ${formatPoints((pointsPreview as { dealerPays?: number }).dealerPays || 0)}`}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Han/Fu Selection (for ron winners) */}
          {eventType === "ron" && winnerSeats.length > 0 && (
            <div className="space-y-4">
              {winnerSeats.map(seat => {
                const player = getPlayerBySeat(seat);
                const values = winnerHandValues[seat] || { han: 1, fu: 30 };
                const preview = ronPointsPreview.find(p => p.seat === seat);
                return (
                  <Card key={seat}>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-sm">
                        Hand Value: {player?.playerName || seat}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Han (翻)</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {HAN_OPTIONS.map(option => (
                            <Button
                              key={`${seat}-han-${option.value}`}
                              variant={
                                values.han === option.value
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="h-8 min-w-8 px-2"
                              onClick={() =>
                                updateWinnerHandValue(seat, {
                                  han: option.value,
                                })
                              }
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {values.han < 5 && (
                        <div className="space-y-2">
                          <Label>Fu (符)</Label>
                          <div className="flex flex-wrap gap-1">
                            {getValidFuValues().map(f => (
                              <Button
                                key={`${seat}-fu-${f}`}
                                variant={
                                  values.fu === f ? "default" : "outline"
                                }
                                size="sm"
                                className="h-8 w-10 p-0"
                                onClick={() =>
                                  updateWinnerHandValue(seat, { fu: f })
                                }
                              >
                                {f}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {preview && (
                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-muted-foreground mb-2 text-center text-sm">
                            Ron Points Preview
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Hand value ({preview.han} Han
                                {preview.han < 5 && `, ${preview.fu} Fu`})
                              </span>
                              <span className="text-amber-500">
                                {formatPoints(preview.basePoints)}
                              </span>
                            </div>

                            {preview.honbaBonus > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Honba bonus ({honba}本場 × 300)
                                </span>
                                <span className="text-foreground">
                                  +{formatPoints(preview.honbaBonus)}
                                </span>
                              </div>
                            )}

                            {preview.riichiValue > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Riichi sticks ({preview.riichiSticksCollected}
                                  本 × 1,000)
                                </span>
                                <span className="text-blue-500">
                                  +{formatPoints(preview.riichiValue)}
                                </span>
                              </div>
                            )}

                            <div className="border-foreground/20 my-2 border-t" />
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Total</span>
                              <span className="text-2xl font-bold text-green-500">
                                {formatPoints(preview.grandTotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Riichi Declarations */}
          <div className="space-y-2">
            <Label>Riichi Declared This Hand</Label>
            {hasFourRiichi && !isAutoAbortive && (
              <div className="mb-2 rounded-md border border-blue-500/50 bg-blue-500/10 p-2 text-sm">
                <span className="text-blue-700 dark:text-blue-400">
                  ℹ️ All 4 players declared riichi - this is an abortive draw
                  (四家立直)
                </span>
              </div>
            )}
            <div className="grid grid-cols-4 gap-2">
              {SEATS.map(seat => {
                const player = getPlayerBySeat(seat);
                if (!player) return null;

                return (
                  <div
                    key={seat}
                    className={cn(
                      "flex h-11 items-center gap-2 rounded-lg border px-3",
                      riichiDeclarations.includes(seat) &&
                        "border-primary bg-primary/10"
                    )}
                  >
                    <Checkbox
                      id={`riichi-${seat}`}
                      checked={riichiDeclarations.includes(seat)}
                      onCheckedChange={() => toggleRiichi(seat)}
                    />
                    <label
                      htmlFor={`riichi-${seat}`}
                      className="flex flex-1 cursor-pointer items-center"
                    >
                      <span className="max-w-full truncate text-sm font-medium">
                        {player.playerName}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tenpai Selection (for draws) */}
          {isDraw && !isSanchahou && !isAutoAbortive && (
            <div className="space-y-2">
              <Label>Players in Tenpai (聴牌)</Label>
              <div className="grid grid-cols-4 gap-2">
                {SEATS.map(seat => {
                  const player = getPlayerBySeat(seat);
                  if (!player) return null;
                  const hasRiichi = riichiDeclarations.includes(seat);
                  const isTenpai = tenpaiSeats.includes(seat);
                  const isDisabled = hasRiichi && isTenpai; // Can't uncheck tenpai if riichi is declared

                  return (
                    <div
                      key={seat}
                      className={cn(
                        "flex gap-2 rounded-lg border px-3 py-2",
                        hasRiichi ? "min-h-[3.5rem]" : "h-11 items-center",
                        isTenpai && "border-green-500 bg-green-500/10",
                        isDisabled && "opacity-75"
                      )}
                    >
                      <Checkbox
                        id={`tenpai-${seat}`}
                        checked={isTenpai}
                        disabled={isDisabled}
                        onCheckedChange={() => toggleTenpai(seat)}
                        className={hasRiichi ? "mt-1" : ""}
                      />
                      <label
                        htmlFor={`tenpai-${seat}`}
                        className={cn(
                          "flex flex-1 cursor-pointer flex-col justify-center",
                          isDisabled && "cursor-not-allowed"
                        )}
                      >
                        <span className="max-w-full truncate text-sm font-medium">
                          {player.playerName}
                        </span>
                        {hasRiichi && (
                          <span className="text-muted-foreground text-xs">
                            (Riichi)
                          </span>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row gap-2 px-6 pt-6 pb-8">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Recording..." : "Record Hand"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
