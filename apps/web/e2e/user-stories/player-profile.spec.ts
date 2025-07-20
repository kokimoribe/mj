import { test, expect } from '@playwright/test';
import { navigateTo, takeScreenshot } from '../utils/test-helpers';

test.describe('User Story: Understanding My Performance', () => {
  test('As Mikey, I want to see my rating history over time', async ({ page }) => {
    // Mikey wants to see if he's improving
    await navigateTo(page, '/');
    
    // He finds his card and clicks it
    const mikeyCard = page.locator('[role="button"]', { hasText: 'Mikey' }).first();
    await mikeyCard.click();
    
    // He clicks to view his full profile
    await page.getByText('View Full Profile').click();
    
    // He should now be on his profile page
    await expect(page).toHaveURL(/\/player\//);
    
    // He sees his name prominently displayed
    await expect(page.getByText('Mikey').first()).toBeVisible();
    
    // He sees his current rating in the header
    await expect(page.getByText(/Rank #\d+\.\d+/)).toBeVisible();
    
    // He sees a chart placeholder (will be implemented)
    const chartSection = page.getByText('Rating Trend').locator('..');
    await expect(chartSection).toBeVisible();
    
    // For now, there's a placeholder
    await expect(page.getByText('Rating chart will go here')).toBeVisible();
    
    await takeScreenshot(page, 'user-stories/mikey-views-rating-history');
  });

  test('As Josh, I want to see my recent game results', async ({ page }) => {
    // Josh wants to review his recent games
    await navigateTo(page, '/player/josh');
    
    // He should see a section for recent games
    await expect(page.getByText('Recent Games').first()).toBeVisible();
    
    // Currently shows placeholder (to be implemented)
    await expect(page.getByText('Recent games will be displayed here')).toBeVisible();
    
    // He sees a button to view all games
    await expect(page.getByRole('button', { name: /View All Games/ })).toBeVisible();
    
    await takeScreenshot(page, 'user-stories/josh-views-recent-games');
  });

  test('As Hyun, I want to see my statistics', async ({ page }) => {
    // Hyun is interested in his overall statistics
    await navigateTo(page, '/player/hyun');
    
    // He wants to see key stats from Quick Stats section
    await expect(page.getByText('Quick Stats')).toBeVisible();
    
    // Check specific stats that are shown
    await expect(page.getByText('Win Rate')).toBeVisible();
    await expect(page.getByText('Avg Placement')).toBeVisible();
    await expect(page.getByText('Last Played')).toBeVisible();
    await expect(page.getByText('Best Game')).toBeVisible();
    
    // He can also access advanced stats
    const advancedStatsButton = page.getByText('Advanced Stats');
    await advancedStatsButton.click();
    
    // Now he sees the detailed stats
    await expect(page.getByText(/Skill \(μ\)/)).toBeVisible();
    await expect(page.getByText(/Total Points/)).toBeVisible();
    
    await takeScreenshot(page, 'user-stories/hyun-views-statistics');
  });
});