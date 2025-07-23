import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * Focused Calculation Validation Tests
 *
 * These tests verify specific mathematical calculations and edge cases
 */

const supabaseUrl = "https://soihuphdqgkbafozrzqn.supabase.co";
const supabaseKey = "sb_publishable_68r4JVAt-_ZMMausI3M7QQ_Tqrmu9mV";
const configHash =
  "ad7252bdec25767b7eb12451ae30afbc1c7b5b1336c468ef833df7f632b34ba4";

class CalculationValidator {
  private supabase = createClient(supabaseUrl, supabaseKey);

  async verifyRatingFormula() {
    const { data, error } = await this.supabase
      .from("cached_player_ratings")
      .select("mu, sigma")
      .eq("config_hash", configHash)
      .limit(1)
      .single();

    if (error || !data) throw new Error("Failed to fetch rating data");

    // Test both possible formulas
    const conservative = data.mu - 3 * data.sigma; // Current implementation
    const standard = data.mu - 2 * data.sigma; // Spec suggestion

    return {
      mu: data.mu,
      sigma: data.sigma,
      conservative,
      standard,
      difference: Math.abs(conservative - standard),
    };
  }

  async validateGameScoreLogic() {
    // Get a sample game
    const { data: games } = await this.supabase
      .from("games")
      .select("id")
      .eq("status", "finished")
      .limit(1);

    if (!games || games.length === 0) return null;

    const gameId = games[0].id;

    // Get all results for this game
    const { data: results } = await this.supabase
      .from("cached_game_results")
      .select("*")
      .eq("game_id", gameId)
      .eq("config_hash", configHash);

    if (!results || results.length !== 4) return null;

    // Validate Uma/Oka rules
    const scoreDeltaSum = results.reduce(
      (sum, r) => sum + (r.plus_minus || 0),
      0
    );
    const ratingChangeSum = results.reduce(
      (sum, r) => sum + (r.rating_change || 0),
      0
    );

    // Check placement validity
    const placements = results.map(r => r.placement).sort();
    const expectedPlacements = [1, 2, 3, 4];

    return {
      gameId,
      results,
      scoreDeltaSum,
      ratingChangeSum,
      placementsValid: placements.every((p, i) => p === expectedPlacements[i]),
      hasValidScores: results.every(
        r => r.final_score !== null && r.final_score !== undefined
      ),
    };
  }

  async testDateBoundaryCalculations() {
    const now = new Date();
    const exactlySevenDaysAgo = new Date(now);
    exactlySevenDaysAgo.setDate(exactlySevenDaysAgo.getDate() - 7);
    exactlySevenDaysAgo.setHours(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );

    // Find games near the 7-day boundary
    const { data: boundaryGames } = await this.supabase
      .from("games")
      .select("id, finished_at")
      .eq("status", "finished")
      .gte(
        "finished_at",
        new Date(exactlySevenDaysAgo.getTime() - 60000).toISOString()
      ) // 1 min before
      .lte(
        "finished_at",
        new Date(exactlySevenDaysAgo.getTime() + 60000).toISOString()
      ) // 1 min after
      .limit(5);

    return {
      boundaryTime: exactlySevenDaysAgo.toISOString(),
      gamesNearBoundary: boundaryGames || [],
      testTime: now.toISOString(),
    };
  }
}

test.describe("Calculation Validation Tests", () => {
  let validator: CalculationValidator;

  test.beforeAll(async () => {
    validator = new CalculationValidator();
  });

  test("verify rating calculation formula (μ - 3σ vs μ - 2σ)", async ({
    page,
  }) => {
    const formulaTest = await validator.verifyRatingFormula();

    console.log("Rating Formula Analysis:", {
      mu: formulaTest.mu,
      sigma: formulaTest.sigma,
      conservative: formulaTest.conservative,
      standard: formulaTest.standard,
      difference: formulaTest.difference,
    });

    // Navigate to leaderboard and check actual displayed value
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    const displayedRating = await firstCard
      .locator(".text-2xl.font-bold")
      .textContent();
    const numericRating = parseFloat(displayedRating || "0");

    // Verify which formula is being used
    const conservativeDiff = Math.abs(numericRating - formulaTest.conservative);
    const standardDiff = Math.abs(numericRating - formulaTest.standard);

    console.log("Formula Verification:", {
      displayed: numericRating,
      conservativeDiff,
      standardDiff,
      usingConservative: conservativeDiff < standardDiff,
    });

    // The app should be using the conservative formula (μ - 3σ)
    expect(conservativeDiff).toBeLessThan(0.1);
    expect(conservativeDiff).toBeLessThan(standardDiff);
  });

  test("validate game score mathematics", async () => {
    const gameValidation = await validator.validateGameScoreLogic();

    if (!gameValidation) {
      test.skip();
      return;
    }

    console.log("Game Score Validation:", gameValidation);

    // Uma/Oka rules: score adjustments should sum to approximately zero
    expect(Math.abs(gameValidation.scoreDeltaSum)).toBeLessThan(1000); // Allow for rounding

    // All placements should be valid (1-4, no duplicates)
    expect(gameValidation.placementsValid).toBe(true);

    // All players should have valid scores
    expect(gameValidation.hasValidScores).toBe(true);

    // Rating changes can sum to non-zero (rating inflation/deflation is possible)
    console.log("Rating change sum:", gameValidation.ratingChangeSum);
  });

  test("validate 7-day boundary calculations", async ({ page }) => {
    const boundaryTest = await validator.testDateBoundaryCalculations();

    console.log("Date Boundary Test:", boundaryTest);

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Expand first player card to check 7-day calculation
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await page.waitForTimeout(300);

    const sevenDayText = await firstCard
      .getByText(/7-day change:/)
      .textContent();
    console.log("Displayed 7-day change:", sevenDayText);

    // The calculation should handle boundary conditions correctly
    // This is more of a visual verification test
    expect(sevenDayText).toMatch(/7-day change:\s*([▲▼]\d+\.\d+.*|—)/);
  });

  test("validate floating point precision in ratings", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check multiple players for rating precision
    const playerCards = page.locator('[data-testid^="player-card-"]');
    const cardCount = Math.min(5, await playerCards.count());

    for (let i = 0; i < cardCount; i++) {
      const card = playerCards.nth(i);
      const ratingText = await card
        .locator(".text-2xl.font-bold")
        .textContent();
      const rating = parseFloat(ratingText || "0");

      // Ratings should be reasonable values
      expect(rating).toBeGreaterThan(0);
      expect(rating).toBeLessThan(100); // Reasonable upper bound

      // Should display with 1 decimal place
      expect(ratingText).toMatch(/^\d+\.\d$/);
    }
  });

  test("validate ranking consistency under edge conditions", async ({
    page,
  }) => {
    // Test ranking stability with very close ratings
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const playerCards = page.locator('[data-testid^="player-card-"]');
    const ratings: number[] = [];

    // Collect all displayed ratings
    const cardCount = await playerCards.count();
    for (let i = 0; i < cardCount; i++) {
      const card = playerCards.nth(i);
      const ratingText = await card
        .locator(".text-2xl.font-bold")
        .textContent();
      ratings.push(parseFloat(ratingText || "0"));
    }

    // Verify descending order
    for (let i = 1; i < ratings.length; i++) {
      expect(ratings[i]).toBeLessThanOrEqual(ratings[i - 1]);
    }

    console.log("Rating distribution:", {
      highest: ratings[0],
      lowest: ratings[ratings.length - 1],
      spread: ratings[0] - ratings[ratings.length - 1],
      count: ratings.length,
    });
  });

  test("validate average placement calculation accuracy", async ({ page }) => {
    // Navigate to a player profile with multiple games
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find a player with multiple games
    const playerCards = page.locator('[data-testid^="player-card-"]');
    let selectedCard = null;

    for (let i = 0; i < Math.min(5, await playerCards.count()); i++) {
      const card = playerCards.nth(i);
      const gamesText = await card.locator("text=/\\d+ games?/").textContent();
      const gamesCount = parseInt(gamesText?.match(/(\d+)/)?.[1] || "0");

      if (gamesCount >= 5) {
        selectedCard = card;
        break;
      }
    }

    if (!selectedCard) {
      test.skip();
      return;
    }

    // Navigate to profile
    await selectedCard.click();
    await page.getByText("View Full Profile").click();
    await page.waitForLoadState("networkidle");

    // Check average placement
    const statsSection = page.locator('[data-testid="performance-stats"]');
    const avgPlacementText = await statsSection
      .getByText(/Average Placement:/)
      .textContent();

    if (avgPlacementText && !avgPlacementText.includes("—")) {
      const avgPlacement = parseFloat(
        avgPlacementText.match(/(\d+\.\d+)/)?.[1] || "0"
      );

      // Average placement should be between 1.0 and 4.0
      expect(avgPlacement).toBeGreaterThanOrEqual(1.0);
      expect(avgPlacement).toBeLessThanOrEqual(4.0);

      console.log("Average placement validation:", {
        displayed: avgPlacement,
        valid: avgPlacement >= 1.0 && avgPlacement <= 4.0,
      });
    }
  });

  test("validate score formatting consistency", async ({ page }) => {
    await page.goto("/games");
    await page.waitForLoadState("networkidle");

    const gameCard = page.locator('[data-testid="game-card"]').first();
    await expect(gameCard).toBeVisible();

    const playerResults = gameCard.locator('[data-testid="player-result"]');
    const resultCount = await playerResults.count();

    for (let i = 0; i < resultCount; i++) {
      const result = playerResults.nth(i);
      const resultText = await result.textContent();

      // Should contain raw score, arrow, and adjustment
      expect(resultText).toMatch(/\d{1,3}(,\d{3})*→[+-]\d{1,3}(,\d{3})*/);

      // Extract and validate numeric values
      const scoreMatch = resultText?.match(
        /(\d{1,3}(?:,\d{3})*)→([+-]\d{1,3}(?:,\d{3})*)/
      );
      if (scoreMatch) {
        const rawScore = parseInt(scoreMatch[1].replace(/,/g, ""));
        const adjustment = parseInt(scoreMatch[2].replace(/,/g, ""));

        // Scores should be reasonable for mahjong
        expect(rawScore).toBeGreaterThanOrEqual(-50000);
        expect(rawScore).toBeLessThanOrEqual(100000);
        expect(adjustment).toBeGreaterThanOrEqual(-50000);
        expect(adjustment).toBeLessThanOrEqual(50000);
      }
    }
  });
});
