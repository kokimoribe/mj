import { test, expect, devices } from '@playwright/test';
import { navigateTo, takeScreenshot } from '../utils/test-helpers';

test.use({
  ...devices['iPhone 12']
});

test.describe('User Story: Using the App on Mobile During League Night', () => {
  test('As Joseph, I want to quickly check standings between games on my phone', async ({ page }) => {
    // Joseph pulls out his phone between games
    await navigateTo(page, '/');
    
    // The app should load quickly and be readable
    await expect(page.getByText('Current Season Leaderboard')).toBeVisible();
    
    // He should see the rankings without scrolling horizontally
    const viewport = page.viewportSize();
    const leaderboard = page.locator('[data-testid="leaderboard-view"]');
    const box = await leaderboard.boundingBox();
    
    if (box && viewport) {
      // Content should fit within viewport
      expect(box.width).toBeLessThanOrEqual(viewport.width);
    }
    
    // Player cards should stack nicely on mobile
    const firstCard = page.locator('button[data-testid^="player-card-"]').first();
    await expect(firstCard).toBeVisible();
    
    // Text should be large enough to read
    const fontSize = await firstCard.locator('h3').evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    expect(parseInt(fontSize)).toBeGreaterThanOrEqual(16);
    
    await takeScreenshot(page, 'user-stories/mobile-quick-check');
  });

  test('As Koki, I want to look up another player\'s stats on my phone', async ({ page }) => {
    // Koki wants to check Joseph's recent performance
    await navigateTo(page, '/');
    
    // He taps on Joseph's card
    const josephCard = page.locator('button:has-text("Joseph")').first();
    await josephCard.click();
    
    // The card should expand smoothly
    await expect(josephCard).toHaveAttribute('aria-expanded', 'true');
    
    // He taps to view full profile
    await page.getByText('View Full Profile').click();
    
    // The profile should be mobile-optimized
    await expect(page).toHaveURL(/\/player\//);
    
    // Stats should be easy to read on mobile
    await expect(page.getByRole('heading', { name: 'Joseph' })).toBeVisible();
    
    await takeScreenshot(page, 'user-stories/mobile-player-lookup');
  });

  test('As any player, I want the app to work offline after loading once', async ({ page }) => {
    // Load the app initially
    await navigateTo(page, '/');
    
    // Verify it loaded
    await expect(page.getByText('Current Season Leaderboard')).toBeVisible();
    
    // Simulate going offline
    await page.context().setOffline(true);
    
    // Refresh the page
    await page.reload();
    
    // The app should still work (PWA feature)
    // This might fail if PWA isn't fully implemented yet
    await expect(page.getByText('Current Season Leaderboard')).toBeVisible();
    
    await takeScreenshot(page, 'user-stories/offline-usage');
  });
});