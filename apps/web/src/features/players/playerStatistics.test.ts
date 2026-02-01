import { describe, it, expect } from "vitest";
import { calculatePlayerStatistics } from "./playerStatistics";

describe("calculatePlayerStatistics", () => {
  it("computes game-level and hand-level rates with valid data", () => {
    const result = calculatePlayerStatistics({
      games: [
        {
          gameId: "g1",
          startedAt: "2025-12-30T00:00:00Z",
          finishedAt: "2025-12-30T01:00:00Z",
          seat: "east",
          finalScore: 25000,
          placement: 1,
        },
        {
          gameId: "g2",
          startedAt: "2026-01-02T00:00:00Z",
          finishedAt: "2026-01-02T01:00:00Z",
          seat: "south",
          finalScore: -1200,
          placement: 4,
        },
      ],
      handEvents: [
        // Game 1, hand 1: player wins by ron with riichi
        {
          gameId: "g1",
          handSeq: 1,
          seat: "east",
          eventType: "ron",
          riichiDeclared: true,
          pointsDelta: 8000,
          details: {
            winnerSeat: "east",
            loserSeat: "south",
            dealerSeat: "east",
            pointsWon: 8000,
          },
        },
        // Game 1, hand 2: draw, player declared riichi
        {
          gameId: "g1",
          handSeq: 2,
          seat: "east",
          eventType: "draw",
          riichiDeclared: true,
          pointsDelta: 0,
          details: { dealerSeat: "south" },
        },
        // Game 2, hand 1: player deals in (ron) without riichi
        {
          gameId: "g2",
          handSeq: 1,
          seat: "south",
          eventType: "ron",
          riichiDeclared: false,
          pointsDelta: -12000,
          details: {
            winnerSeat: "east",
            loserSeat: "south",
            dealerSeat: "west",
            pointsWon: 12000,
          },
        },
        // Game 2, hand 2: player wins by tsumo without riichi
        {
          gameId: "g2",
          handSeq: 2,
          seat: "south",
          eventType: "tsumo",
          riichiDeclared: false,
          pointsDelta: 4000,
          details: { winnerSeat: "south", dealerSeat: "east", pointsWon: 4000 },
        },
      ],
    });

    expect(result.totals.gamesPlayed).toBe(2);
    expect(result.gameStats.bustedGameRate).toBeCloseTo(50, 5);
    expect(result.gameStats.placementRates["1"]).toBeCloseTo(50, 5);
    expect(result.gameStats.placementRates["4"]).toBeCloseTo(50, 5);
    expect(result.gameStats.seatAssignmentRates.east).toBeCloseTo(50, 5);
    expect(result.gameStats.seatAssignmentRates.south).toBeCloseTo(50, 5);

    // Total unique hands = 4
    expect(result.totals.totalHands).toBe(4);
    expect(result.totals.totalWins).toBe(2);
    expect(result.handStats.winRate).toBeCloseTo(50, 5);
    expect(result.handStats.tsumoRate).toBeCloseTo(50, 5); // 1 tsumo / 2 wins
    expect(result.handStats.dealInRate).toBeCloseTo(25, 5); // 1 deal-in / 4 hands
    expect(result.handStats.riichiRate).toBeCloseTo(50, 5); // 2 riichi hands / 4 hands
    expect(result.handStats.winWithRiichiRate).toBeCloseTo(50, 5); // 1 / 2 wins
    expect(result.handStats.winWithoutRiichiRate).toBeCloseTo(50, 5); // 1 / 2 wins

    expect(result.handStats.biggestWinningHand).toEqual({
      gameId: "g1",
      handSeq: 1,
      value: 8000,
    });
    expect(result.handStats.biggestLosingHand).toEqual({
      gameId: "g2",
      handSeq: 1,
      value: 12000,
    });

    expect(result.handStats.averageWinValue).toBeCloseTo(6000, 5); // (8000 + 4000)/2
    expect(result.handStats.medianWinValue).toBeCloseTo(6000, 5);
    expect(result.handStats.averageDealInValue).toBeCloseTo(12000, 5);
    expect(result.handStats.medianDealInValue).toBeCloseTo(12000, 5);

    // New game-level stats: g1 no deal-ins -> 1 perfect game; g2 has deal-in
    expect(result.gameStats.perfectGames).toBe(1);
    expect(result.gameStats.currentStreak).toBe(-1); // most recent is g2 (4th)
    expect(result.gameStats.longestLosingStreak).toBe(1);
    expect(result.gameStats.comebackRate).toBe(0); // no win with running score < 25000
    expect(result.gameStats.highestFinalScore).toEqual({
      gameId: "g1",
      score: 25000,
    });
    expect(result.gameStats.lowestFinalScore).toEqual({
      gameId: "g2",
      score: -1200,
    });
    expect(result.gameStats.scoreConsistency).not.toBeNull();
  });

  it("handles empty inputs safely", () => {
    const result = calculatePlayerStatistics({ games: [], handEvents: [] });
    expect(result.totals.gamesPlayed).toBe(0);
    expect(result.totals.totalHands).toBe(0);
    expect(result.gameStats.bustedGameRate).toBeNull();
    expect(result.gameStats.perfectGames).toBe(0);
    expect(result.gameStats.currentStreak).toBe(0);
    expect(result.gameStats.longestLosingStreak).toBe(0);
    expect(result.gameStats.comebackRate).toBeNull();
    expect(result.gameStats.highestFinalScore).toBeNull();
    expect(result.gameStats.lowestFinalScore).toBeNull();
    expect(result.handStats.winRate).toBeNull();
    expect(result.handStats.biggestWinningHand).toBeNull();
    expect(result.handStats.bestSeatByWinRate).toBeNull();
    expect(result.handStats.averageHanOnWins).toBeNull();
    expect(result.handStats.highestHanAchieved).toBeNull();
  });
});
