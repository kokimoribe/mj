import { test, expect } from "@playwright/test";

test.describe("Configuration Playground Quick Verification", () => {
  test("should show configuration UI elements", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check that Season 3 is displayed
    const leaderboardHeader = page.locator(
      '[data-testid="leaderboard-header"]'
    );
    await expect(leaderboardHeader).toBeVisible();

    // Find the expand button
    const expandButton = page.locator(
      'button[aria-label*="Expand configuration"]'
    );
    await expect(expandButton).toBeVisible();

    // Click to expand configuration
    await expandButton.click();

    // Check that configuration panel appears
    const configPanel = page.locator('[data-testid="configuration-panel"]');
    await expect(configPanel).toBeVisible();

    // Check for configuration dropdown
    const configSelect = page.locator("select#config-select");
    await expect(configSelect).toBeVisible();

    // Take a screenshot for manual verification
    await page.screenshot({
      path: "config-playground-test.png",
      fullPage: true,
    });

    console.log(
      "✅ Configuration Playground UI elements are present and working!"
    );
  });
});
