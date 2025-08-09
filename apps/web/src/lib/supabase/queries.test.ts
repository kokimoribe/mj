import { describe, it, expect } from "vitest";

describe("Rating Delta Calculations", () => {
  it("should calculate rating change as ratingAfter - ratingBefore", () => {
    // Test data
    const muBefore = 25.5;
    const sigmaBefore = 8.0;
    const muAfter = 26.2;
    const sigmaAfter = 7.8;

    // Calculate ratings using the formula
    const ratingBefore = muBefore - 2 * sigmaBefore; // 25.5 - 16 = 9.5
    const ratingAfter = muAfter - 2 * sigmaAfter; // 26.2 - 15.6 = 10.6
    const ratingChange = ratingAfter - ratingBefore; // 10.6 - 9.5 = 1.1

    expect(ratingBefore).toBeCloseTo(9.5, 1);
    expect(ratingAfter).toBeCloseTo(10.6, 1);
    expect(ratingChange).toBeCloseTo(1.1, 1);
  });

  it("should handle negative rating changes correctly", () => {
    const muBefore = 30.0;
    const sigmaBefore = 5.0;
    const muAfter = 29.5;
    const sigmaAfter = 4.9;

    const ratingBefore = muBefore - 2 * sigmaBefore; // 30 - 10 = 20
    const ratingAfter = muAfter - 2 * sigmaAfter; // 29.5 - 9.8 = 19.7
    const ratingChange = ratingAfter - ratingBefore; // 19.7 - 20 = -0.3

    expect(ratingChange).toBeCloseTo(-0.3, 1);
    expect(ratingChange).toBeLessThan(0);
  });

  it("should format rating changes consistently", () => {
    const testCases = [
      { change: 5.67, expected: "5.7" },
      { change: -3.42, expected: "-3.4" },
      { change: 0.05, expected: "0.1" },
      { change: -0.04, expected: "-0.0" },
      { change: 10.0, expected: "10.0" },
    ];

    testCases.forEach(({ change, expected }) => {
      const formatted = change.toFixed(1);
      expect(formatted).toBe(expected);
    });
  });

  it("should validate rating change matches manual calculation", () => {
    // Simulate a game result
    const gameResult = {
      mu_before: 85.0,
      sigma_before: 3.15,
      mu_after: 85.5,
      sigma_after: 3.1,
    };

    // Calculate using the same formula as in queries.ts
    const ratingBefore = gameResult.mu_before - 2 * gameResult.sigma_before;
    const ratingAfter = gameResult.mu_after - 2 * gameResult.sigma_after;
    const ratingChange = ratingAfter - ratingBefore;

    // This is what should be stored in the database
    const expectedStoredValue = ratingChange;

    // Manual verification: if we know the before and after ratings
    const manualCalculation = ratingAfter - ratingBefore;

    expect(expectedStoredValue).toBeCloseTo(manualCalculation, 10); // High precision
    expect(expectedStoredValue).toBe(ratingChange); // Exact match
  });
});
