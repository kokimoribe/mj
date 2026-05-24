import { describe, it, expect } from "vitest";
import {
  computeNextHandState,
  type LastHandSummary,
} from "./dealer-rotation";
import type { Seat } from "./points";

const EMPTY_DELTAS = { east: 0, south: 0, west: 0, north: 0 } as const;

function eventsFromDeltas(
  deltas: Record<Seat, number> = EMPTY_DELTAS
): LastHandSummary["events"] {
  return (Object.entries(deltas) as [Seat, number][]).map(
    ([seat, points_delta]) => ({ seat, points_delta })
  );
}

describe("computeNextHandState", () => {
  describe("initial state (no prior hand)", () => {
    it("returns East 1, honba 0, dealer = east when there are no events", () => {
      const result = computeNextHandState(null);
      expect(result).toEqual({
        round: "E",
        kyoku: 1,
        honba: 0,
        dealerSeat: "east",
        lastEventWasDealerWin: false,
      });
    });
  });

  describe("dealer-tenpai detection for exhaustive draws", () => {
    // Bug repro per user report:
    //   "Dealer (east) is in riichi, draw with 2 OTHER players also tenpai
    //   (3 tenpai total). Each tenpai player receives +1000 from the lone
    //   noten player, but the dealer's net is +1000 - 1000(riichi) = 0.
    //   The legacy `points_delta > 0` heuristic falsely rotates the dealer."
    it("keeps the dealer when dealer was tenpai but net delta is exactly 0 (dealer-riichi + 3 tenpai total)", () => {
      const result = computeNextHandState({
        round: "E",
        kyoku: 1,
        honba: 0,
        eventType: "draw",
        tenpaiSeats: ["east", "south", "west"],
        events: eventsFromDeltas({
          east: 0, // dealer: -1000 riichi + 1000 tenpai = 0
          south: 1000,
          west: 1000,
          north: -3000,
        }),
      });

      expect(result.dealerSeat).toBe("east");
      expect(result.kyoku).toBe(1);
      expect(result.round).toBe("E");
      expect(result.honba).toBe(1);
    });

    it("keeps the dealer when dealer was tenpai but net delta is negative (dealer-riichi + 4 tenpai)", () => {
      const result = computeNextHandState({
        round: "E",
        kyoku: 1,
        honba: 0,
        eventType: "draw",
        tenpaiSeats: ["east", "south", "west", "north"],
        events: eventsFromDeltas({
          east: -1000, // dealer: -1000 riichi, no tenpai payments (all tenpai)
          south: 0,
          west: 0,
          north: 0,
        }),
      });

      expect(result.dealerSeat).toBe("east");
      expect(result.kyoku).toBe(1);
      expect(result.honba).toBe(1);
    });

    it("keeps the dealer when dealer was tenpai but net delta is 0 (no riichi, all 4 tenpai)", () => {
      const result = computeNextHandState({
        round: "S",
        kyoku: 2,
        honba: 0,
        eventType: "draw",
        tenpaiSeats: ["east", "south", "west", "north"],
        events: eventsFromDeltas({
          east: 0,
          south: 0,
          west: 0,
          north: 0,
        }),
      });

      expect(result.dealerSeat).toBe("south");
      expect(result.kyoku).toBe(2);
      expect(result.round).toBe("S");
      expect(result.honba).toBe(1);
    });

    it("rotates the dealer when dealer was noten even if dealer net delta is 0 (no riichi, 0 tenpai)", () => {
      const result = computeNextHandState({
        round: "E",
        kyoku: 1,
        honba: 0,
        eventType: "draw",
        tenpaiSeats: [],
        events: eventsFromDeltas({
          east: 0,
          south: 0,
          west: 0,
          north: 0,
        }),
      });

      expect(result.dealerSeat).toBe("south");
      expect(result.kyoku).toBe(2);
      expect(result.honba).toBe(1);
    });

    it("rotates the dealer when dealer was noten (2 other players tenpai)", () => {
      const result = computeNextHandState({
        round: "E",
        kyoku: 1,
        honba: 0,
        eventType: "draw",
        tenpaiSeats: ["south", "west"],
        events: eventsFromDeltas({
          east: -1500,
          south: 1500,
          west: 1500,
          north: -1500,
        }),
      });

      expect(result.dealerSeat).toBe("south");
      expect(result.kyoku).toBe(2);
      expect(result.honba).toBe(1);
    });

    it("keeps the dealer when dealer was the only tenpai player", () => {
      const result = computeNextHandState({
        round: "S",
        kyoku: 3,
        honba: 2,
        eventType: "draw",
        tenpaiSeats: ["west"], // kyoku 3 → dealer is west
        events: eventsFromDeltas({
          east: -1000,
          south: -1000,
          west: 3000,
          north: -1000,
        }),
      });

      expect(result.dealerSeat).toBe("west");
      expect(result.kyoku).toBe(3);
      expect(result.honba).toBe(3);
    });
  });

  describe("dealer-tenpai legacy fallback (when tenpaiSeats is missing)", () => {
    // Older records may not have `details.tenpaiSeats` populated. Fall back
    // to the historical `dealer points_delta > 0` heuristic so existing data
    // continues to render the same way it did before this fix.
    it("falls back to points_delta heuristic and rotates dealer when delta is 0", () => {
      const result = computeNextHandState({
        round: "E",
        kyoku: 1,
        honba: 0,
        eventType: "draw",
        // no tenpaiSeats provided
        events: eventsFromDeltas({
          east: 0,
          south: 0,
          west: 0,
          north: 0,
        }),
      });

      expect(result.dealerSeat).toBe("south");
      expect(result.kyoku).toBe(2);
    });

    it("falls back to points_delta heuristic and keeps dealer when delta is positive", () => {
      const result = computeNextHandState({
        round: "E",
        kyoku: 1,
        honba: 0,
        eventType: "draw",
        events: eventsFromDeltas({
          east: 1500,
          south: 1500,
          west: -1500,
          north: -1500,
        }),
      });

      expect(result.dealerSeat).toBe("east");
      expect(result.kyoku).toBe(1);
    });
  });

  describe("dealer wins (tsumo / ron)", () => {
    it("keeps dealer and increments honba when dealer wins tsumo", () => {
      const result = computeNextHandState({
        round: "E",
        kyoku: 1,
        honba: 0,
        eventType: "tsumo",
        winnerSeats: ["east"],
        events: eventsFromDeltas({
          east: 12000,
          south: -4000,
          west: -4000,
          north: -4000,
        }),
      });

      expect(result.dealerSeat).toBe("east");
      expect(result.kyoku).toBe(1);
      expect(result.honba).toBe(1);
      expect(result.lastEventWasDealerWin).toBe(true);
    });

    it("keeps dealer and increments honba when dealer is one of multi-ron winners", () => {
      const result = computeNextHandState({
        round: "S",
        kyoku: 4,
        honba: 1,
        eventType: "ron",
        winnerSeats: ["north", "east"], // dealer is north (kyoku 4)
        events: eventsFromDeltas({
          east: 5800,
          south: -11600,
          west: 0,
          north: 5800,
        }),
      });

      expect(result.dealerSeat).toBe("north");
      expect(result.kyoku).toBe(4);
      expect(result.honba).toBe(2);
      expect(result.lastEventWasDealerWin).toBe(true);
    });

    it("rotates dealer and resets honba when non-dealer wins ron", () => {
      const result = computeNextHandState({
        round: "E",
        kyoku: 1,
        honba: 3,
        eventType: "ron",
        winnerSeats: ["south"],
        events: eventsFromDeltas({
          east: 0,
          south: 8000,
          west: -8000,
          north: 0,
        }),
      });

      expect(result.dealerSeat).toBe("south");
      expect(result.kyoku).toBe(2);
      expect(result.honba).toBe(0);
      expect(result.lastEventWasDealerWin).toBe(false);
    });

    it("rotates dealer and resets honba when non-dealer wins tsumo", () => {
      const result = computeNextHandState({
        round: "E",
        kyoku: 2,
        honba: 1,
        eventType: "tsumo",
        winnerSeats: ["west"],
        events: eventsFromDeltas({
          east: -2000,
          south: -1000,
          west: 4000,
          north: -1000,
        }),
      });

      expect(result.dealerSeat).toBe("west");
      expect(result.kyoku).toBe(3);
      expect(result.honba).toBe(0);
      expect(result.lastEventWasDealerWin).toBe(false);
    });

    it("falls back to dealer points_delta heuristic when winnerSeats is missing (legacy data)", () => {
      // Legacy rows recorded only points_delta. A dealer with positive delta
      // on a winning hand is treated as the (or a) winner.
      const result = computeNextHandState({
        round: "E",
        kyoku: 1,
        honba: 0,
        eventType: "tsumo",
        // no winnerSeats
        events: eventsFromDeltas({
          east: 12000,
          south: -4000,
          west: -4000,
          north: -4000,
        }),
      });

      expect(result.dealerSeat).toBe("east");
      expect(result.kyoku).toBe(1);
      expect(result.honba).toBe(1);
      expect(result.lastEventWasDealerWin).toBe(true);
    });
  });

  describe("abortive draws", () => {
    it("keeps dealer and increments honba on any abortive draw type", () => {
      const result = computeNextHandState({
        round: "S",
        kyoku: 1,
        honba: 2,
        eventType: "abortive_draw",
        events: eventsFromDeltas({
          east: 0,
          south: 0,
          west: 0,
          north: 0,
        }),
      });

      expect(result.dealerSeat).toBe("east");
      expect(result.kyoku).toBe(1);
      expect(result.round).toBe("S");
      expect(result.honba).toBe(3);
    });
  });

  describe("chombo", () => {
    it("keeps dealer, kyoku, round, and honba unchanged on chombo", () => {
      const result = computeNextHandState({
        round: "E",
        kyoku: 2,
        honba: 1,
        eventType: "chombo",
        events: eventsFromDeltas({
          east: 2000,
          south: -8000,
          west: 2000,
          north: 4000,
        }),
      });

      expect(result.dealerSeat).toBe("south");
      expect(result.kyoku).toBe(2);
      expect(result.round).toBe("E");
      expect(result.honba).toBe(1);
      expect(result.lastEventWasDealerWin).toBe(false);
    });
  });

  describe("round rollover", () => {
    it("rolls from East 4 to South 1 when non-dealer wins on E4", () => {
      const result = computeNextHandState({
        round: "E",
        kyoku: 4,
        honba: 1,
        eventType: "ron",
        winnerSeats: ["east"],
        events: eventsFromDeltas({
          east: 8000,
          south: 0,
          west: 0,
          north: -8000,
        }),
      });

      expect(result.round).toBe("S");
      expect(result.kyoku).toBe(1);
      expect(result.dealerSeat).toBe("east");
      expect(result.honba).toBe(0);
    });

    it("rolls from East 4 to South 1 when dealer was noten on E4 draw", () => {
      const result = computeNextHandState({
        round: "E",
        kyoku: 4,
        honba: 0,
        eventType: "draw",
        tenpaiSeats: ["east", "south"], // kyoku 4 → dealer is north, not in tenpai
        events: eventsFromDeltas({
          east: 1500,
          south: 1500,
          west: -1500,
          north: -1500,
        }),
      });

      expect(result.round).toBe("S");
      expect(result.kyoku).toBe(1);
      expect(result.dealerSeat).toBe("east");
      expect(result.honba).toBe(1);
    });

    it("stays at S4 when dealer wins on S4", () => {
      const result = computeNextHandState({
        round: "S",
        kyoku: 4,
        honba: 0,
        eventType: "tsumo",
        winnerSeats: ["north"],
        events: eventsFromDeltas({
          east: -4000,
          south: -2000,
          west: -2000,
          north: 8000,
        }),
      });

      expect(result.round).toBe("S");
      expect(result.kyoku).toBe(4);
      expect(result.dealerSeat).toBe("north");
      expect(result.honba).toBe(1);
      expect(result.lastEventWasDealerWin).toBe(true);
    });
  });
});
