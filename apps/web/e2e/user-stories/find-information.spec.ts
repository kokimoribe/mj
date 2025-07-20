import { test, expect } from '@playwright/test';
import { navigateTo, takeScreenshot } from '../utils/test-helpers';

test.describe('User Story: Finding Specific Information', () => {
  test('As Joseph, I want to see all games from last week', async ({ page }) => {
    // Joseph wants to review last week's games
    await navigateTo(page, '/games');
    
    // He should see a list of recent games
    await expect(page.getByRole('heading', { name: /Games|History/i })).toBeVisible();
    
    // Games should be sorted by date (most recent first)
    const gameDates = page.locator('.game-date, [data-testid="game-date"]');
    const firstGameDate = await gameDates.first().textContent();
    const lastGameDate = await gameDates.last().textContent();
    
    // Most recent game should be first
    if (firstGameDate && lastGameDate) {
      const firstDate = new Date(firstGameDate);
      const lastDate = new Date(lastGameDate);
      expect(firstDate.getTime()).toBeGreaterThanOrEqual(lastDate.getTime());
    }
    
    // Each game should show key information
    const firstGame = page.locator('.game-entry, [data-testid^="game-"]').first();
    
    // Should show date
    await expect(firstGame.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/)).toBeVisible();
    
    // Should show players
    await expect(firstGame.getByText(/Joseph|Koki|Mikey|Josh/)).toBeVisible();
    
    await takeScreenshot(page, 'user-stories/view-recent-games');
  });

  test('As Koki, I want to see season statistics', async ({ page }) => {
    // Koki wants to see overall season stats
    await navigateTo(page, '/stats');
    
    // He should see season summary
    await expect(page.getByRole('heading', { name: /Season|Statistics/i })).toBeVisible();
    
    // Key stats should be visible
    const statsToCheck = [
      'Total Games',
      'Active Players', 
      'Average Score',
      'Highest Score',
      'Most Wins'
    ];
    
    for (const stat of statsToCheck) {
      const statElement = page.getByText(new RegExp(stat, 'i'));
      await expect(statElement).toBeVisible();
    }
    
    await takeScreenshot(page, 'user-stories/season-statistics');
  });

  test('As Mikey, I want to compare my performance to others', async ({ page }) => {
    // Mikey wants to see how he stacks up
    await navigateTo(page, '/');
    
    // He can see his rank position
    const mikeyCard = page.locator('button:has-text("Mikey")');
    await expect(mikeyCard).toBeVisible();
    
    // He wants to see the rating gap to the next player
    const allCards = page.locator('button[data-testid^="player-card-"]');
    const mikeyIndex = await allCards.evaluateAll((cards, name) => 
      cards.findIndex(card => card.textContent?.includes(name)),
      'Mikey'
    );
    
    if (mikeyIndex > 0) {
      // There's a player above him
      const playerAbove = allCards.nth(mikeyIndex - 1);
      await expect(playerAbove).toBeVisible();
    }
    
    if (mikeyIndex >= 0) {
      // There might be a player below him
      const playerBelow = allCards.nth(mikeyIndex + 1);
      if (await playerBelow.count() > 0) {
        await expect(playerBelow).toBeVisible();
      }
    }
    
    await takeScreenshot(page, 'user-stories/compare-rankings');
  });
});