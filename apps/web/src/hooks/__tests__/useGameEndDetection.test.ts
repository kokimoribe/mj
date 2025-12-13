import { describe, test, expect } from "vitest";
import {
  checkGameEnd,
  type GameEndDetectionParams,
} from "../useGameEndDetection";
import type { Seat, Round } from "@/lib/mahjong";

describe("Game End Detection", () => {
  const defaultPlayerNames = {
    east: "East",
    south: "South",
    west: "West",
    north: "North",
  };

  const defaultScores: Record<Seat, number> = {
    east: 25000,
    south: 25000,
    west: 25000,
    north: 25000,
  };

  describe("Scenario 1: Hanchan natural end", () => {
    test("Play through South 4 with dealer rotation, verify game prompts to end", () => {
      // After completing S4 with non-dealer win, we're about to enter West
      // Leader has 30k+ points, so game should end
      const params: GameEndDetectionParams = {
        scores: {
          east: 30000,
          south: 25000,
          west: 20000,
          north: 25000,
        },
        round: "W", // Just completed S4, about to enter West
        kyoku: 1,
        gameFormat: "hanchan",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);

      expect(result.shouldEnd).toBe(true);
      expect(result.reason).toBe("natural_end");
      expect(result.inEnchousen).toBe(false);
      expect(result.endMessage).toContain("Hanchan complete");
    });

    test("After S4 with leader at 30k+, game ends", () => {
      // Leader has exactly 30k after S4
      const params: GameEndDetectionParams = {
        scores: {
          east: 30000,
          south: 25000,
          west: 20000,
          north: 25000,
        },
        round: "W", // Just completed S4
        kyoku: 1,
        gameFormat: "hanchan",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);
      expect(result.shouldEnd).toBe(true);
      expect(result.reason).toBe("natural_end");
    });
  });

  describe("Scenario 2: Hanchan dealer repeat on South 4", () => {
    test("Dealer wins on S4 but is not leader, verify game continues", () => {
      // Dealer (North, kyoku 4) wins on S4 but isn't leader
      const params: GameEndDetectionParams = {
        scores: {
          east: 35000, // Leader
          south: 25000,
          west: 20000,
          north: 20000, // Dealer, but not leader
        },
        round: "S", // Still at S4 (dealer won, so no rotation)
        kyoku: 4, // North is dealer
        gameFormat: "hanchan",
        lastEventWasDealerWin: true,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);

      expect(result.shouldEnd).toBe(false);
      expect(result.reason).toBe(null);
      expect(result.isFinalRound).toBe(true);
      expect(result.endMessage).toContain("Game continues with dealer repeat");
    });

    test("Dealer wins on S4, is leader but < 30k, verify game continues", () => {
      // Dealer is leader but doesn't have 30k+
      const params: GameEndDetectionParams = {
        scores: {
          east: 20000,
          south: 20000,
          west: 20000,
          north: 28000, // Dealer is leader but < 30k
        },
        round: "S",
        kyoku: 4,
        gameFormat: "hanchan",
        lastEventWasDealerWin: true,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);

      expect(result.shouldEnd).toBe(false);
      expect(result.reason).toBe(null);
      expect(result.isFinalRound).toBe(true);
      expect(result.endMessage).toContain("Game continues with dealer repeat");
    });

    test("Dealer wins on S4, is leader with 30k+, verify game ends", () => {
      // Dealer is leader and has 30k+
      const params: GameEndDetectionParams = {
        scores: {
          east: 20000,
          south: 20000,
          west: 20000,
          north: 30000, // Dealer is leader with 30k+
        },
        round: "S",
        kyoku: 4,
        gameFormat: "hanchan",
        lastEventWasDealerWin: true,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);

      expect(result.shouldEnd).toBe(true);
      expect(result.reason).toBe("natural_end");
      expect(result.isFinalRound).toBe(true);
      expect(result.endMessage).toContain("Hanchan complete");
    });
  });

  describe("Scenario 3: Enchousen trigger", () => {
    test("End South 4 with leader at 28,000 points, verify West round starts", () => {
      // After completing S4 with non-dealer win, leader has < 30k
      // Game should continue in enchousen (West round)
      const params: GameEndDetectionParams = {
        scores: {
          east: 28000, // Leader but < 30k
          south: 25000,
          west: 20000,
          north: 27000,
        },
        round: "W", // Just completed S4, about to enter West
        kyoku: 1,
        gameFormat: "hanchan",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);

      expect(result.shouldEnd).toBe(false);
      expect(result.reason).toBe(null);
      expect(result.inEnchousen).toBe(true);
      expect(result.endMessage).toContain("Enchousen");
      expect(result.endMessage).toContain("West round");
    });

    test("End South 4 with leader at 29,999 points, verify West round starts", () => {
      // Edge case: leader has 29,999 (< 30k threshold)
      const params: GameEndDetectionParams = {
        scores: {
          east: 29999, // Leader but < 30k
          south: 25000,
          west: 20000,
          north: 25001,
        },
        round: "W",
        kyoku: 1,
        gameFormat: "hanchan",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);
      expect(result.shouldEnd).toBe(false);
      expect(result.inEnchousen).toBe(true);
    });
  });

  describe("Scenario 4: Enchousen end", () => {
    test("End West round with leader at 32,000, verify game ends", () => {
      // In West round (enchousen), leader reaches 30k+
      // We've actually played hands in enchousen (kyoku > 1)
      const params: GameEndDetectionParams = {
        scores: {
          east: 32000, // Leader with 30k+
          south: 25000,
          west: 20000,
          north: 23000,
        },
        round: "W", // In enchousen
        kyoku: 2, // Actually played hands in West round
        gameFormat: "hanchan",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);

      expect(result.shouldEnd).toBe(true);
      expect(result.reason).toBe("enchousen_end");
      expect(result.inEnchousen).toBe(true);
      expect(result.endMessage).toContain("Sudden death");
      expect(result.endMessage).toContain("Enchousen complete");
    });

    test("End West round with leader at exactly 30,000, verify game ends", () => {
      // Edge case: leader has exactly 30k, actually in enchousen
      const params: GameEndDetectionParams = {
        scores: {
          east: 30000, // Leader with exactly 30k
          south: 25000,
          west: 20000,
          north: 25000,
        },
        round: "W",
        kyoku: 2, // Actually played hands in enchousen
        gameFormat: "hanchan",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);
      expect(result.shouldEnd).toBe(true);
      expect(result.reason).toBe("enchousen_end");
      expect(result.inEnchousen).toBe(true);
    });

    test("Continue in West round with leader at 29,000, verify game continues", () => {
      // In enchousen but leader doesn't have 30k yet
      const params: GameEndDetectionParams = {
        scores: {
          east: 29000, // Leader but < 30k
          south: 25000,
          west: 20000,
          north: 26000,
        },
        round: "W",
        kyoku: 2,
        gameFormat: "hanchan",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);
      expect(result.shouldEnd).toBe(false);
      expect(result.inEnchousen).toBe(true);
    });
  });

  describe("Scenario 5: Bust detection", () => {
    test("Player score goes to -100, verify immediate end prompt", () => {
      const params: GameEndDetectionParams = {
        scores: {
          east: 25000,
          south: 25000,
          west: -100, // Busted!
          north: 30000,
        },
        round: "E", // Can happen at any round
        kyoku: 1,
        gameFormat: "hanchan",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);

      expect(result.shouldEnd).toBe(true);
      expect(result.reason).toBe("bust");
      expect(result.bustedSeat).toBe("west");
      expect(result.endMessage).toContain("busted");
      expect(result.endMessage).toContain("-100");
    });

    test("Player score goes to exactly 0, verify game continues", () => {
      // 0 is not a bust (must be < 0)
      const params: GameEndDetectionParams = {
        scores: {
          east: 25000,
          south: 25000,
          west: 0, // Not busted (0 is allowed)
          north: 50000,
        },
        round: "E",
        kyoku: 1,
        gameFormat: "hanchan",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);
      expect(result.shouldEnd).toBe(false);
      expect(result.bustedSeat).toBe(null);
    });

    test("Multiple players bust, verify first bust is detected", () => {
      // Should detect the first busted player found
      const params: GameEndDetectionParams = {
        scores: {
          east: -500,
          south: -200,
          west: 25000,
          north: 55000,
        },
        round: "S",
        kyoku: 2,
        gameFormat: "hanchan",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);
      expect(result.shouldEnd).toBe(true);
      expect(result.reason).toBe("bust");
      // Should detect one of the busted players
      expect(result.bustedSeat).toBeTruthy();
      expect(["east", "south"]).toContain(result.bustedSeat);
    });
  });

  describe("Scenario 6: Tonpuusen", () => {
    test("Create tonpuusen game, verify it ends after East 4", () => {
      // After completing E4 with non-dealer win, leader has 30k+
      const params: GameEndDetectionParams = {
        scores: {
          east: 30000, // Leader
          south: 25000,
          west: 20000,
          north: 25000,
        },
        round: "S", // Just completed E4, about to enter South
        kyoku: 1,
        gameFormat: "tonpuusen",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);

      expect(result.shouldEnd).toBe(true);
      expect(result.reason).toBe("natural_end");
      expect(result.inEnchousen).toBe(false);
      expect(result.endMessage).toContain("Tonpuusen complete");
    });

    test("Tonpuusen: Dealer wins on E4 but is not leader, verify game continues", () => {
      // Dealer (East, kyoku 1) wins on E4 but isn't leader
      const params: GameEndDetectionParams = {
        scores: {
          east: 20000, // Dealer but not leader
          south: 35000, // Leader
          west: 20000,
          north: 25000,
        },
        round: "E", // Still at E4 (dealer won)
        kyoku: 1, // East is dealer
        gameFormat: "tonpuusen",
        lastEventWasDealerWin: true,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);

      expect(result.shouldEnd).toBe(false);
      expect(result.reason).toBe(null);
      expect(result.isFinalRound).toBe(true);
      expect(result.endMessage).toContain("Game continues with dealer repeat");
    });

    test("Tonpuusen: End E4 with leader at 28,000, verify South round starts (enchousen)", () => {
      // After E4, leader has < 30k, should enter enchousen (South round)
      const params: GameEndDetectionParams = {
        scores: {
          east: 20000,
          south: 28000, // Leader but < 30k
          west: 25000,
          north: 27000,
        },
        round: "S", // Just completed E4, about to enter South
        kyoku: 1,
        gameFormat: "tonpuusen",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);

      expect(result.shouldEnd).toBe(false);
      expect(result.reason).toBe(null);
      expect(result.inEnchousen).toBe(true);
      expect(result.endMessage).toContain("Enchousen");
      expect(result.endMessage).toContain("South round");
    });

    test("Tonpuusen: End South round with leader at 32,000, verify game ends", () => {
      // In South round (enchousen), leader reaches 30k+
      // We've actually played hands in enchousen (kyoku > 1)
      const params: GameEndDetectionParams = {
        scores: {
          east: 20000,
          south: 32000, // Leader with 30k+
          west: 25000,
          north: 23000,
        },
        round: "S", // In enchousen
        kyoku: 2, // Actually played hands in South round
        gameFormat: "tonpuusen",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);

      expect(result.shouldEnd).toBe(true);
      expect(result.reason).toBe("enchousen_end");
      expect(result.inEnchousen).toBe(true);
      expect(result.endMessage).toContain("Sudden death");
    });
  });

  describe("Edge cases and additional scenarios", () => {
    test("Game in progress before final round, should not end", () => {
      const params: GameEndDetectionParams = {
        scores: defaultScores,
        round: "E",
        kyoku: 2,
        gameFormat: "hanchan",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);
      expect(result.shouldEnd).toBe(false);
      expect(result.reason).toBe(null);
    });

    test("At S4 but not completed yet, should not end", () => {
      // We're about to play S4, haven't completed it yet
      const params: GameEndDetectionParams = {
        scores: {
          east: 35000,
          south: 25000,
          west: 20000,
          north: 20000,
        },
        round: "S",
        kyoku: 4, // About to play S4
        gameFormat: "hanchan",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);
      // Should not end yet - we haven't completed S4
      expect(result.shouldEnd).toBe(false);
      expect(result.isFinalRound).toBe(true); // But we're at the final round
    });

    test("North round in enchousen (hanchan)", () => {
      // After West round, can continue to North round
      const params: GameEndDetectionParams = {
        scores: {
          east: 29000, // Leader but < 30k
          south: 25000,
          west: 20000,
          north: 26000,
        },
        round: "N", // In North round (enchousen)
        kyoku: 1,
        gameFormat: "hanchan",
        lastEventWasDealerWin: false,
        playerNames: defaultPlayerNames,
      };

      const result = checkGameEnd(params);
      expect(result.shouldEnd).toBe(false);
      expect(result.inEnchousen).toBe(true);
    });
  });
});
