import { test, expect } from "@playwright/test";

test.describe("Production Site Verification", () => {
  test("should load homepage and display main elements", async ({ page }) => {
    // Navigate to the homepage
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check for the main heading
    await expect(
      page.getByRole("heading", { name: "🀄 Riichi Mahjong League" })
    ).toBeVisible({ timeout: 10000 });

    // Check for the leaderboard heading
    await expect(page.getByText("Season 3 Leaderboard")).toBeVisible({
      timeout: 10000,
    });

    // Verify at least one player card is visible (they are buttons with aria-label containing "Rank")
    const playerCards = page.getByRole("button", { name: /Rank \d+\.\d+/ });
    await expect(playerCards.first()).toBeVisible({ timeout: 10000 });

    // Check the bottom navigation exists
    const bottomNav = page.locator('nav[aria-label="Main navigation"]');
    await expect(bottomNav).toBeVisible();

    // Check for navigation links
    await expect(page.getByRole("link", { name: "Leaderboard" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Games|Game History/ })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Players|All Players/ })
    ).toBeVisible();

    // Take a screenshot for verification
    await page.screenshot({
      path: "production-verification.png",
      fullPage: true,
    });

    console.log("Production site verification completed successfully!");
  });
});
