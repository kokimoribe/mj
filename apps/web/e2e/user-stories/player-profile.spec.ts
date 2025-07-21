import { test, expect } from "@playwright/test";
import { navigateTo, takeScreenshot } from "../utils/test-helpers";

test.describe("User Story: Understanding My Performance", () => {
  test("As Mikey, I want to see my rating history over time", async ({
    page,
  }) => {
    // Mikey wants to see if he's improving
    await navigateTo(page, "/");

    // He finds his card and clicks it
    const mikeyCard = page
      .locator('[role="button"]', { hasText: "Mikey" })
      .first();
    await mikeyCard.click();

    // He clicks to view his full profile
    await page.getByText("View Full Profile").click();

    // He should now be on his profile page
    await expect(page).toHaveURL(/\/player\//);

    // He sees his name prominently displayed
    await expect(page.getByText("Mikey").first()).toBeVisible();

    // He sees his current rating in the header
    await expect(page.getByText(/Rank #\d+\.\d+/)).toBeVisible();

    // He sees a rating trend chart
    const chartSection = page.getByText("Rating Trend").locator("..");
    await expect(chartSection).toBeVisible();

    // The chart should be rendered (check for chart container or svg)
    const chart = chartSection.locator('svg, canvas, [role="img"]').first();
    await expect(chart).toBeVisible();

    await takeScreenshot(page, "user-stories/mikey-views-rating-history");
  });

  test("As Josh, I want to see my recent game results", async ({ page }) => {
    // Josh wants to review his recent games
    await navigateTo(page, "/player/josh");

    // He should see a section for recent games
    await expect(page.getByText("Recent Games").first()).toBeVisible();

    // He should see actual game entries
    const gameEntries = page.locator('[data-testid^="player-game-"]');
    const gameCount = await gameEntries.count();
    expect(gameCount).toBeGreaterThan(0);

    // First game should show required information
    const firstGame = gameEntries.first();

    // Should show date
    await expect(firstGame.getByText(/\w{3} \d{1,2}, \d{4}/)).toBeVisible();

    // Should show placement (1st, 2nd, etc)
    await expect(firstGame.getByText(/1st|2nd|3rd|4th/)).toBeVisible();

    // Should show score and plus/minus
    await expect(firstGame.getByText(/[+-]\d+/)).toBeVisible();

    // Should show rating change
    await expect(firstGame.getByText(/↑|↓/)).toBeVisible();

    // He sees a button to load more games
    await expect(
      page.getByRole("button", { name: /Load More|View All/ })
    ).toBeVisible();

    await takeScreenshot(page, "user-stories/josh-views-recent-games");
  });

  test("As Hyun, I want to see my statistics", async ({ page }) => {
    // Hyun is interested in his overall statistics
    await navigateTo(page, "/player/hyun");

    // He wants to see key stats from Performance Stats section
    await expect(page.getByText("Performance Stats")).toBeVisible();

    // Check specific stats that are shown
    await expect(page.getByText(/Average Placement: \d+\.\d+/)).toBeVisible();
    await expect(page.getByText(/Last Played: .* ago/)).toBeVisible();

    // He should NOT see Win Rate (removed per spec)
    await expect(page.getByText("Win Rate")).not.toBeVisible();

    // He should NOT see Advanced Stats toggle (removed per spec)
    await expect(page.getByText("Advanced Stats")).not.toBeVisible();

    // He should see 30-day rating change in the chart section
    await expect(
      page.getByText(/30-day: [↑↓]\d+\.\d+|30-day: N\/A/)
    ).toBeVisible();

    await takeScreenshot(page, "user-stories/hyun-views-statistics");
  });
});
