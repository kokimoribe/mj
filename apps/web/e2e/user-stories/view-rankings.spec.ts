import { test, expect } from "@playwright/test";
import { navigateTo, takeScreenshot } from "../utils/test-helpers";

test.describe("User Story: Viewing Current Rankings", () => {
  test("As a player in first place, I want to check my ranking", async ({
    page,
  }) => {
    // Player opens the app to check rankings
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("networkidle");

    // They immediately see the leaderboard (matches actual text in app)
    await page.waitForSelector('[data-testid="leaderboard-header"]', {
      timeout: 10000,
    });
    const leaderboardTitle = page.locator("text=/🏆.*Leaderboard/");
    await expect(leaderboardTitle).toBeVisible();

    // Get the first player card (whoever is in first place)
    const firstPlaceCard = page
      .locator('[data-testid^="player-card-"]')
      .first();
    await expect(firstPlaceCard).toBeVisible();

    // They see their rating (use the specific class for the main rating)
    await expect(
      firstPlaceCard.locator(".text-2xl.font-bold").first()
    ).toBeVisible();

    // They see how many games they've played
    await expect(firstPlaceCard.getByText(/\d+ games?/)).toBeVisible();

    // Take a screenshot of what the first place player sees
    await takeScreenshot(page, "user-stories/first-place-checks-rankings");
  });

  test("As a player, I want to see if my rating improved after last night's games", async ({
    page,
  }) => {
    // Player opens the app after game night
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("networkidle");

    // Find a player card in the middle of the leaderboard
    const allCards = page.locator('[data-testid^="player-card-"]');
    const cardCount = await allCards.count();

    // Get a card from the middle of the leaderboard
    const middleIndex = Math.floor(cardCount / 2);
    const playerCard = allCards.nth(middleIndex);
    await expect(playerCard).toBeVisible();

    // Check if there's a positive or negative indicator
    const ratingIndicator = playerCard.locator('svg[aria-label*="Rating"]');
    await expect(ratingIndicator).toBeVisible();

    // They want to see more details, so they click their card
    await playerCard.click();

    // They can now see additional stats
    await expect(playerCard).toHaveAttribute("aria-expanded", "true");

    // They see options to view their full profile
    await expect(page.getByText("View Full Profile")).toBeVisible();

    await takeScreenshot(page, "user-stories/player-checks-rating-change");
  });

  test("As a new player, I want to see where I rank among all players", async ({
    page,
  }) => {
    // New player wants to see where they stand
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("networkidle");

    // Find a player with only 1 game (typically a newer player)
    const allCards = page.locator('[data-testid^="player-card-"]');
    const cardCount = await allCards.count();

    let newPlayerCard = null;

    // Look for a player with 1 game
    for (let i = 0; i < cardCount; i++) {
      const card = allCards.nth(i);
      const gamesText = await card.locator("text=/\\d+ games?/").textContent();
      if (gamesText && gamesText.includes("1 game")) {
        newPlayerCard = card;
        break;
      }
    }

    // If no player with 1 game found, use the last player (lowest rank)
    if (!newPlayerCard) {
      newPlayerCard = allCards.last();
    }

    await newPlayerCard.scrollIntoViewIfNeeded();
    await expect(newPlayerCard).toBeVisible();

    // They see their game count
    await expect(newPlayerCard.getByText(/\d+ games?/)).toBeVisible();

    // They notice their rating
    await expect(
      newPlayerCard.locator(".text-2xl.font-bold").first()
    ).toBeVisible();

    await takeScreenshot(page, "user-stories/new-player-finds-ranking");
  });

  test("As any player, I want to see when the rankings were last updated", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("networkidle");

    // Players want to know if the data is current
    const lastUpdated = page.getByText(/Updated .* ago|Just now/);
    await expect(lastUpdated).toBeVisible();

    // They also want to see total games and players (in the header)
    // Look for the stats in the header that shows "X games • Y players • Updated Z ago"
    const statsContainer = page.locator(`[data-testid="leaderboard-header"]`);
    await expect(statsContainer).toContainText(/\d+ games/);
    await expect(statsContainer).toContainText(/\d+ players/);
  });
});
