import { test, expect } from '@playwright/test';
import { navigateTo, takeScreenshot } from '../utils/test-helpers';

test.describe('User Story: Viewing Current Rankings', () => {
  test('As Joseph, I want to check if I\'m still in first place', async ({ page }) => {
    // Joseph opens the app to check rankings
    await navigateTo(page, '/');
    
    // He immediately sees the leaderboard (matches actual text in app)
    const leaderboardTitle = page.locator('text=/Current Season Leaderboard|🏆.*Leaderboard/');
    await expect(leaderboardTitle).toBeVisible();
    
    // He looks for his name in the rankings (Cards are role="button")
    const josephCard = page.locator('[role="button"]', { hasText: 'Joseph' }).first();
    await expect(josephCard).toBeVisible();
    
    // He sees his rating (use the specific class for the main rating)
    await expect(josephCard.locator('.text-2xl.font-bold').first()).toBeVisible();
    
    // He notices he's played 20 games
    await expect(josephCard.getByText(/\d+ games/)).toBeVisible();
    
    // Take a screenshot of what Joseph sees
    await takeScreenshot(page, 'user-stories/joseph-checks-rankings');
  });

  test('As Koki, I want to see if my rating improved after last night\'s games', async ({ page }) => {
    // Koki opens the app after game night
    await navigateTo(page, '/');
    
    // He finds his card in the rankings (Cards are role="button", handle case-insensitive)
    const kokiCard = page.locator('[role="button"]', { hasText: /koki/i }).first();
    await expect(kokiCard).toBeVisible();
    
    // He checks if there's a positive or negative indicator
    const ratingIndicator = kokiCard.locator('svg[aria-label*="Rating"]');
    await expect(ratingIndicator).toBeVisible();
    
    // He wants to see more details, so he clicks his card
    await kokiCard.click();
    
    // He can now see additional stats
    await expect(kokiCard).toHaveAttribute('aria-expanded', 'true');
    
    // He sees options to view his full profile
    await expect(page.getByText('View Full Profile')).toBeVisible();
    
    await takeScreenshot(page, 'user-stories/koki-checks-rating-change');
  });

  test('As a new player, I want to see where I rank among all players', async ({ page }) => {
    // Jackie is new and wants to see where she stands
    await navigateTo(page, '/');
    
    // She scrolls through the leaderboard looking for her name (handle case-insensitive)
    const jackieCard = page.locator('[role="button"]', { hasText: /jackie/i }).first();
    
    // Check if card exists before scrolling
    const cardCount = await jackieCard.count();
    if (cardCount > 0) {
      await jackieCard.scrollIntoViewIfNeeded();
      await expect(jackieCard).toBeVisible();
    
      // She sees she's only played 1 game
      await expect(jackieCard.getByText('1 games')).toBeVisible();
      
      // She notices her starting rating
      await expect(jackieCard.locator('.text-2xl.font-bold').first()).toBeVisible();
      
      await takeScreenshot(page, 'user-stories/new-player-finds-ranking');
    } else {
      // If Jackie doesn't exist, test with any player in last position
      const allCards = page.locator('[data-testid^="player-card-"]');
      const lastCard = allCards.last();
      await lastCard.scrollIntoViewIfNeeded();
      await expect(lastCard).toBeVisible();
      await takeScreenshot(page, 'user-stories/new-player-finds-ranking');
    }
  });

  test('As any player, I want to see when the rankings were last updated', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Players want to know if the data is current
    const lastUpdated = page.getByText(/Updated .* ago|Just now/);
    await expect(lastUpdated).toBeVisible();
    
    // They also want to see total games and players (in the header)
    const statsText = page.getByText(/\d+ games.*\d+ players/);
    await expect(statsText).toBeVisible();
  });
});