/**
 * Pure helpers for deriving the next hand's round / kyoku / honba / dealer
 * from the most recently completed hand. Used by the live game page, the
 * read-only game view, and the lobby's live-game card so that they all
 * agree on whose turn it is to deal next.
 *
 * The single source of truth for "was the dealer in tenpai at a draw" is
 * `details.tenpaiSeats` from the persisted hand event. The historical
 * `dealer.points_delta > 0` shortcut is wrong whenever the dealer's net
 * delta is 0 or negative *and* they were still tenpai — e.g. dealer-riichi
 * with three players in tenpai (net = +1000 − 1000 = 0) or all-four tenpai
 * with dealer-riichi (net = −1000). Those cases used to silently rotate
 * the dealer; this module fixes that by consulting `tenpaiSeats` first
 * and only falling back to the points heuristic for legacy rows that
 * never recorded the field.
 */
import { SEATS, type Round, type Seat } from "./points";

/**
 * Minimal projection of the last hand's `hand_events` rows needed to
 * derive the next hand's state. `tenpaiSeats` and `winnerSeats` come from
 * `details` and may be absent on older records — both helpers below
 * gracefully fall back to inferring from `points_delta`.
 */
export interface LastHandSummary {
  round: Round;
  kyoku: number;
  honba: number;
  /** Last hand's `event_type` (any of the 4 rows; they all share the value). */
  eventType: string;
  /** One entry per seat with that seat's `points_delta` for the last hand. */
  events: ReadonlyArray<{ seat: Seat; points_delta: number }>;
  /**
   * Seats that were in tenpai at draw time. Pass `undefined` to indicate
   * the source row didn't record the field (legacy data); pass `[]` to
   * explicitly mean "nobody was tenpai".
   */
  tenpaiSeats?: ReadonlyArray<Seat>;
  /**
   * Seats that won the hand. Pass `undefined` for legacy data; in that
   * case dealer-win detection falls back to `dealer.points_delta > 0`.
   */
  winnerSeats?: ReadonlyArray<Seat>;
}

export interface NextHandState {
  round: Round;
  kyoku: number;
  honba: number;
  dealerSeat: Seat;
  /** True iff the last hand was a winning hand and the dealer was a winner. */
  lastEventWasDealerWin: boolean;
}

const ROUND_ORDER: readonly Round[] = ["E", "S", "W", "N"];

const DEFAULT_STATE: NextHandState = {
  round: "E",
  kyoku: 1,
  honba: 0,
  dealerSeat: "east",
  lastEventWasDealerWin: false,
};

/** Map kyoku (1..4) to the seat that holds the dealer chair that hand. */
export function dealerSeatForKyoku(kyoku: number): Seat {
  return SEATS[kyoku - 1];
}

function advanceRoundAndKyoku(round: Round, kyoku: number): {
  round: Round;
  kyoku: number;
} {
  if (kyoku < 4) {
    return { round, kyoku: kyoku + 1 };
  }
  const idx = ROUND_ORDER.indexOf(round);
  if (idx >= 0 && idx < ROUND_ORDER.length - 1) {
    return { round: ROUND_ORDER[idx + 1], kyoku: 1 };
  }
  // Past North 4 — game-end detection handles this separately; keep the
  // round/kyoku stable so we don't produce an invalid dealer seat.
  return { round, kyoku };
}

/**
 * Was the dealer in tenpai at the end of an exhaustive draw?
 *
 * Prefers explicit `tenpaiSeats` when present (modern records). Falls back
 * to the legacy `points_delta > 0` heuristic for rows missing the field.
 */
function dealerWasTenpai(
  dealerSeat: Seat,
  tenpaiSeats: ReadonlyArray<Seat> | undefined,
  dealerDelta: number
): boolean {
  if (tenpaiSeats !== undefined) {
    return tenpaiSeats.includes(dealerSeat);
  }
  return dealerDelta > 0;
}

/**
 * Did the dealer win the last hand?
 *
 * Prefers explicit `winnerSeats` when present. Falls back to checking
 * whether the dealer's `points_delta` is positive on a winning hand.
 */
function dealerWon(
  dealerSeat: Seat,
  eventType: string,
  winnerSeats: ReadonlyArray<Seat> | undefined,
  dealerDelta: number
): boolean {
  if (eventType !== "tsumo" && eventType !== "ron") return false;
  if (winnerSeats !== undefined) {
    return winnerSeats.includes(dealerSeat);
  }
  return dealerDelta > 0;
}

/**
 * Derive the next hand's `{ round, kyoku, honba, dealerSeat }` from the
 * most-recent completed hand. Returns the game-start defaults when given
 * `null` (i.e. no hands have been played yet).
 */
export function computeNextHandState(
  lastHand: LastHandSummary | null
): NextHandState {
  if (!lastHand) return { ...DEFAULT_STATE };

  const { round, kyoku, honba, eventType, events, tenpaiSeats, winnerSeats } =
    lastHand;

  const currentDealerSeat = dealerSeatForKyoku(kyoku);
  const dealerEvent = events.find(e => e.seat === currentDealerSeat);
  const dealerDelta = dealerEvent?.points_delta ?? 0;

  const dealerWonFlag = dealerWon(
    currentDealerSeat,
    eventType,
    winnerSeats,
    dealerDelta
  );

  // Chombo: nothing advances — same dealer, same kyoku, same honba.
  if (eventType === "chombo") {
    return {
      round,
      kyoku,
      honba,
      dealerSeat: currentDealerSeat,
      lastEventWasDealerWin: false,
    };
  }

  // Dealer win: renchan — same dealer, honba +1.
  if (dealerWonFlag) {
    return {
      round,
      kyoku,
      honba: honba + 1,
      dealerSeat: currentDealerSeat,
      lastEventWasDealerWin: true,
    };
  }

  // Abortive draw (kyuushu, suufon, suukan, suucha, sanchahou): dealer
  // stays put, honba +1, no point exchanges (already applied upstream).
  if (eventType === "abortive_draw") {
    return {
      round,
      kyoku,
      honba: honba + 1,
      dealerSeat: currentDealerSeat,
      lastEventWasDealerWin: false,
    };
  }

  // Exhaustive draw: dealer stays iff dealer was tenpai. Honba always +1.
  if (eventType === "draw") {
    const stays = dealerWasTenpai(currentDealerSeat, tenpaiSeats, dealerDelta);
    if (stays) {
      return {
        round,
        kyoku,
        honba: honba + 1,
        dealerSeat: currentDealerSeat,
        lastEventWasDealerWin: false,
      };
    }
    const advanced = advanceRoundAndKyoku(round, kyoku);
    return {
      round: advanced.round,
      kyoku: advanced.kyoku,
      honba: honba + 1,
      dealerSeat: dealerSeatForKyoku(advanced.kyoku),
      lastEventWasDealerWin: false,
    };
  }

  // Non-dealer win (ron/tsumo): rotate dealer, reset honba.
  const advanced = advanceRoundAndKyoku(round, kyoku);
  return {
    round: advanced.round,
    kyoku: advanced.kyoku,
    honba: 0,
    dealerSeat: dealerSeatForKyoku(advanced.kyoku),
    lastEventWasDealerWin: false,
  };
}

/**
 * Convenience overload that accepts the raw `hand_events` rows for a single
 * game (in any order) and returns the next hand's state. Designed to drop
 * straight into the existing `useMemo` blocks in the game pages.
 */
export function computeNextHandStateFromEvents<
  E extends {
    hand_seq: number;
    seat: Seat;
    event_type: string;
    points_delta: number;
    round_kanji: string;
    kyoku: number;
    honba: number;
    details?: Record<string, unknown> | null;
  },
>(handEvents: ReadonlyArray<E> | null | undefined): NextHandState {
  if (!handEvents || handEvents.length === 0) return { ...DEFAULT_STATE };

  const lastHandSeq = Math.max(...handEvents.map(e => e.hand_seq));
  const lastHandEvents = handEvents.filter(e => e.hand_seq === lastHandSeq);
  const sample = lastHandEvents[0];
  if (!sample) return { ...DEFAULT_STATE };

  const details = (sample.details ?? {}) as {
    tenpaiSeats?: Seat[];
    winnerSeats?: Seat[];
    winnerSeat?: Seat;
  };

  const winnerSeats = Array.isArray(details.winnerSeats)
    ? details.winnerSeats
    : details.winnerSeat
      ? [details.winnerSeat]
      : undefined;

  return computeNextHandState({
    round: sample.round_kanji as Round,
    kyoku: sample.kyoku,
    honba: sample.honba,
    eventType: sample.event_type,
    events: lastHandEvents.map(e => ({
      seat: e.seat,
      points_delta: e.points_delta,
    })),
    tenpaiSeats: Array.isArray(details.tenpaiSeats)
      ? details.tenpaiSeats
      : undefined,
    winnerSeats,
  });
}
