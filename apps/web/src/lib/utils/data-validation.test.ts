import { describe, it, expect } from "vitest";
import { safeFormatNumber, validatePlayerData } from "./data-validation";

describe("safeFormatNumber", () => {
  it("formats valid numbers correctly", () => {
    expect(safeFormatNumber(42.567, 1)).toBe("42.6");
    expect(safeFormatNumber(1000, 0)).toBe("1000");
    expect(safeFormatNumber(-15.234, 2)).toBe("-15.23");
    expect(safeFormatNumber(0, 1)).toBe("0.0");
  });

  it("returns '--' for invalid numbers", () => {
    expect(safeFormatNumber(NaN, 1)).toBe("--");
    expect(safeFormatNumber(Infinity, 1)).toBe("--");
    expect(safeFormatNumber(-Infinity, 1)).toBe("--");
    expect(safeFormatNumber(undefined as any, 1)).toBe("--");
    expect(safeFormatNumber(null as any, 1)).toBe("--");
  });

  it("handles edge cases", () => {
    expect(safeFormatNumber(0.001, 0)).toBe("0");
    expect(safeFormatNumber(999.999, 0)).toBe("1000");
    expect(safeFormatNumber(-0, 1)).toBe("0.0");
  });
});

describe("validatePlayerData", () => {
  it("returns valid player data unchanged", () => {
    const validPlayer = {
      id: "123",
      name: "Test Player",
      rating: 42.5,
      mu: 45.0,
      sigma: 2.5,
      gamesPlayed: 10,
      lastPlayed: "2024-01-01",
      rating7DayDelta: 2.5,
      ratingHistory: [40.0, 41.0, 42.5],
      recentGames: [{ gameId: "1", date: "2024-01-01", rating: 42.5 }],
    };

    const result = validatePlayerData(validPlayer);
    expect(result).toEqual(validPlayer);
  });

  it("fixes invalid numeric values", () => {
    const invalidPlayer = {
      id: "123",
      name: "Test Player",
      rating: NaN,
      mu: Infinity,
      sigma: -Infinity,
      gamesPlayed: -5,
      lastPlayed: null,
      rating7DayDelta: "invalid" as any,
      ratingHistory: undefined,
      recentGames: null,
    };

    const result = validatePlayerData(invalidPlayer as any);

    expect(result.rating).toBe(0);
    expect(result.mu).toBe(25);
    expect(result.sigma).toBe(8.333);
    expect(result.gamesPlayed).toBe(0);
    expect(result.lastPlayed).toBe("");
    expect(result.rating7DayDelta).toBeNull();
    expect(result.ratingHistory).toEqual([]);
    expect(result.recentGames).toEqual([]);
  });

  it("handles missing player name", () => {
    const playerWithoutName = {
      id: "123",
      rating: 42.5,
      gamesPlayed: 10,
    };

    const result = validatePlayerData(playerWithoutName as any);
    expect(result.name).toBe("Unknown Player");
  });

  it("filters out invalid rating history values", () => {
    const playerWithBadHistory = {
      id: "123",
      name: "Test",
      rating: 42.5,
      ratingHistory: [40.0, NaN, 41.0, Infinity, 42.5, -Infinity],
      gamesPlayed: 5,
    };

    const result = validatePlayerData(playerWithBadHistory as any);
    expect(result.ratingHistory).toEqual([40.0, 41.0, 42.5]);
  });

  it("validates recent games data", () => {
    const playerWithBadGames = {
      id: "123",
      name: "Test",
      rating: 42.5,
      gamesPlayed: 3,
      recentGames: [
        { gameId: "1", date: "2024-01-01", rating: 40.0 },
        { gameId: "2", date: "2024-01-02", rating: NaN },
        { gameId: "3", date: "2024-01-03", rating: Infinity },
        { gameId: "4", date: "2024-01-04", rating: 42.5 },
      ],
    };

    const result = validatePlayerData(playerWithBadGames as any);
    // Should keep games but with sanitized rating values
    expect(result.recentGames?.length).toBe(4);
    expect(result.recentGames?.[0].rating).toBe(40.0);
    expect(result.recentGames?.[1].rating).toBe(0); // NaN becomes 0
    expect(result.recentGames?.[2].rating).toBe(0); // Infinity becomes 0
    expect(result.recentGames?.[3].rating).toBe(42.5);
  });
});
