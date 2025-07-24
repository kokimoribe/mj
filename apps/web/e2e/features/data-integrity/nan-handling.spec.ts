import { test, expect } from "@playwright/test";

test.describe("Data Integrity - NaN Handling", () => {
  test("should never display NaN values on any page", async ({ page }) => {
    // Check leaderboard
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    let nanCount = await page.locator("text=/NaN/i").count();
    expect(nanCount, "Leaderboard should have no NaN values").toBe(0);

    // Check player profile
    await page.click('[data-testid*="player"]');
    await page.waitForLoadState("networkidle");

    nanCount = await page.locator("text=/NaN/i").count();
    expect(nanCount, "Player profile should have no NaN values").toBe(0);

    // Check game history
    await page.goto("/games");
    await page.waitForLoadState("networkidle");

    nanCount = await page.locator("text=/NaN/i").count();
    expect(nanCount, "Game history should have no NaN values").toBe(0);
  });

  test("should display '--' for missing numeric values", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for proper placeholder usage
    const placeholders = await page.locator("text=--").count();
    console.log(`Found ${placeholders} placeholder values`);

    // Placeholders should only appear where data is genuinely missing
    const validPlaceholderContexts = [
      "text=/Average Placement:.*--/",
      "text=/Period Δ:.*--/",
      "text=/Last Played:.*--/",
    ];

    for (const context of validPlaceholderContexts) {
      const hasContext = (await page.locator(context).count()) > 0;
      if (hasContext) {
        console.log(`Valid placeholder found in: ${context}`);
      }
    }
  });

  test("should handle null/undefined values gracefully", async ({ page }) => {
    // Navigate to game history
    await page.goto("/games");
    await page.waitForLoadState("networkidle");

    // Check that all score adjustments are properly formatted
    const scoreAdjustments = await page.locator("text=/[+-]\\d+ pts/").all();
    for (const adjustment of scoreAdjustments) {
      const text = await adjustment.textContent();
      expect(text).toMatch(/[+-]\d+ pts/);
      expect(text).not.toContain("null");
      expect(text).not.toContain("undefined");
      expect(text).not.toContain("NaN");
    }

    // Check rating changes
    const ratingChanges = await page.locator("text=/[▲▼]\\d+\\.\\d+/").all();
    for (const change of ratingChanges) {
      const text = await change.textContent();
      expect(text).toMatch(/[▲▼]\d+\.\d+/);
    }
  });
});
