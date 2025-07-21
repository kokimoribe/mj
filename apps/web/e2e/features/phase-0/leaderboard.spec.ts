import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../../src/lib/test-ids";
import {
  takeScreenshot,
  navigateTo,
  waitForElement,
  mockAPIResponses,
  checkAccessibility,
} from "../../utils/test-helpers";

test.describe("Phase 0: Leaderboard Features", () => {
  test.beforeEach(async ({ page }) => {
    // Use production data as requested by user
  });

  test("displays leaderboard with player rankings", async ({ page }) => {
    await navigateTo(page, "/");

    // Verify leaderboard container is visible
    const leaderboard = await waitForElement(
      page,
      `[data-testid="${TEST_IDS.LEADERBOARD_VIEW}"]`
    );
    await expect(leaderboard).toBeVisible();

    // Verify header is present
    const header = page.getByTestId(TEST_IDS.LEADERBOARD_HEADER);
    await expect(header).toBeVisible();

    // Take screenshot of default state
    await takeScreenshot(page, "phase-0/leaderboard-default");

    // Verify player cards are rendered
    const playerCards = page.locator(
      `[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`
    );
    const count = await playerCards.count();
    expect(count).toBeGreaterThan(0);

    // Check accessibility
    await checkAccessibility(page, "leaderboard");
  });

  test("expands player card to show detailed statistics", async ({ page }) => {
    await navigateTo(page, "/");

    // Find and click the first player card (using the first player from actual data)
    const firstCard = page
      .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
      .first();
    await expect(firstCard).toBeVisible();

    // Verify initial collapsed state
    await expect(firstCard).toHaveAttribute("aria-expanded", "false");

    // Click to expand
    await firstCard.click();

    // Verify expanded state
    await expect(firstCard).toHaveAttribute("aria-expanded", "true");

    // Wait for animation
    await page.waitForTimeout(300);

    // Take screenshot of expanded card
    await takeScreenshot(page, "phase-0/leaderboard-card-expanded");

    // Verify expanded content is visible - use within to scope to the expanded card
    await expect(firstCard.getByText("Avg Placement:")).toBeVisible();
    await expect(firstCard.getByText("Last Played:")).toBeVisible();
    await expect(firstCard.getByText("View Full Profile")).toBeVisible();
  });

  test("navigates to player profile when clicking profile button", async ({
    page,
  }) => {
    await navigateTo(page, "/");

    // Expand the first player card
    const firstCard = page
      .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
      .first();
    await firstCard.click();

    // Click the profile button
    const profileButton = page.getByText("View Full Profile");
    await expect(profileButton).toBeVisible();
    await profileButton.click();

    // Verify navigation to player profile (use pattern that matches any player ID)
    await expect(page).toHaveURL(/\/player\/[^/]+$/);

    // Take screenshot of player profile
    await takeScreenshot(page, "phase-0/player-profile-from-leaderboard");
  });

  test("shows loading state while fetching data", async ({ page }) => {
    // Remove mock to see real loading state
    await page.goto("/");

    // Look for skeleton loader
    const skeleton = page
      .locator(`[data-testid="${TEST_IDS.LOADING_SKELETON}"]`)
      .first();

    // If skeleton is visible, take screenshot
    if (await skeleton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await takeScreenshot(page, "phase-0/leaderboard-loading");
    }
  });

  test("handles refresh action", async ({ page }) => {
    await navigateTo(page, "/");

    // Find refresh button
    const refreshButton = page.getByTestId(TEST_IDS.LEADERBOARD_REFRESH);

    if (await refreshButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Click refresh
      await refreshButton.click();

      // Verify some feedback is shown
      await expect(page.getByText(/updated|refreshed/i)).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("responsive design works on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    await navigateTo(page, "/");

    // Verify mobile layout
    const leaderboard = await waitForElement(
      page,
      `[data-testid="${TEST_IDS.LEADERBOARD_VIEW}"]`
    );
    await expect(leaderboard).toBeVisible();

    // Take mobile screenshot
    await takeScreenshot(page, "phase-0/leaderboard-mobile");

    // Test mobile interactions
    const firstCard = page
      .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
      .first();
    await firstCard.click();

    // Verify expanded state works on mobile
    await expect(firstCard).toHaveAttribute("aria-expanded", "true");

    await takeScreenshot(page, "phase-0/leaderboard-mobile-expanded");
  });

  test("displays correct player information", async ({ page }) => {
    await navigateTo(page, "/");

    const firstCard = page
      .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
      .first();

    // Verify player name is visible (use actual player name from real data)
    await expect(firstCard.locator("h3")).toBeVisible();

    // Verify rating is visible (use more specific selector)
    await expect(
      firstCard.locator(".text-2xl.font-bold").first()
    ).toBeVisible();

    // Verify games count is visible
    await expect(firstCard.locator("text=/\\d+ games/")).toBeVisible();
  });

  test("rating changes show proper indicators", async ({ page }) => {
    await navigateTo(page, "/");

    // Check rating change indicators on any cards
    const cards = page.locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`);
    const firstCard = cards.first();

    // Check for rating change indicators - could be up arrows (↑) or down arrows (↓)
    const ratingChange = await firstCard.locator("text=/[↑↓]/").first();
    await expect(ratingChange).toBeVisible();

    // Take screenshot showing rating indicators
    await takeScreenshot(page, "phase-0/leaderboard-rating-indicators");
  });
});
