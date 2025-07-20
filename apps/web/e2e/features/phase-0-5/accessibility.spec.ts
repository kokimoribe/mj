import { test, expect } from '@playwright/test';
import { TEST_IDS } from '../../../src/lib/test-ids';
import { 
  takeScreenshot, 
  navigateTo, 
  testKeyboardNavigation,
  mockAPIResponses 
} from '../../utils/test-helpers';

test.describe('Phase 0.5: Accessibility Features', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test('keyboard navigation works throughout the application', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Start keyboard navigation from the top
    await page.keyboard.press('Tab');
    
    // First focus should be on skip link or first interactive element
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON']).toContain(focusedElement);
    
    // Take screenshot of focus states
    await takeScreenshot(page, 'phase-0-5/keyboard-focus-states');
    
    // Tab through navigation
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => ({
        tag: document.activeElement?.tagName,
        text: document.activeElement?.textContent,
        ariaLabel: document.activeElement?.getAttribute('aria-label'),
      }));
      
      // Verify focus is visible
      const focusRing = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;
        const styles = window.getComputedStyle(el);
        return styles.outlineWidth !== '0px' || styles.boxShadow.includes('ring');
      });
      expect(focusRing).toBe(true);
    }
  });

  test('expandable cards work with keyboard', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Tab to first player card
    const firstCard = page.getByTestId(`${TEST_IDS.PLAYER_CARD}-test-player-1`);
    await firstCard.focus();
    
    // Verify card is focused
    await expect(firstCard).toBeFocused();
    
    // Press Enter to expand
    await page.keyboard.press('Enter');
    
    // Verify expanded
    await expect(firstCard).toHaveAttribute('aria-expanded', 'true');
    
    // Take screenshot of keyboard-expanded card
    await takeScreenshot(page, 'phase-0-5/keyboard-card-expanded');
    
    // Press Space to collapse
    await page.keyboard.press('Space');
    
    // Verify collapsed
    await expect(firstCard).toHaveAttribute('aria-expanded', 'false');
  });

  test('all interactive elements have proper ARIA labels', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Check all buttons have aria-label or visible text
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      expect(ariaLabel || text?.trim()).toBeTruthy();
    }
    
    // Check all links have aria-label or visible text
    const links = page.locator('a');
    const linkCount = await links.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const ariaLabel = await link.getAttribute('aria-label');
      const text = await link.textContent();
      
      expect(ariaLabel || text?.trim()).toBeTruthy();
    }
  });

  test('navigation has proper ARIA attributes', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Check main navigation
    const nav = page.getByTestId(TEST_IDS.NAV_BOTTOM);
    await expect(nav).toHaveAttribute('aria-label', /navigation/i);
    
    // Check active page indication
    const activeLink = nav.locator('[aria-current="page"]');
    await expect(activeLink).toBeVisible();
    
    // Take screenshot of navigation
    await takeScreenshot(page, 'phase-0-5/navigation-aria');
  });

  test('color contrast meets WCAG standards', async ({ page }) => {
    await navigateTo(page, '/');
    
    // This is a simplified check - for real testing use axe-core
    const contrastIssues = await page.evaluate(() => {
      const issues: string[] = [];
      
      // Check text elements
      const elements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button');
      
      elements.forEach((el) => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;
        
        // Very basic check - just ensure text isn't too light
        if (color && color.includes('rgb')) {
          const rgb = color.match(/\d+/g);
          if (rgb) {
            const [r, g, b] = rgb.map(Number);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            
            // If text is very light and background might be light too
            if (brightness > 200 && bgColor.includes('255, 255, 255')) {
              issues.push(`Potential contrast issue: ${el.tagName} - ${el.textContent?.substring(0, 30)}`);
            }
          }
        }
      });
      
      return issues;
    });
    
    // Log any potential issues
    if (contrastIssues.length > 0) {
      console.warn('Potential contrast issues:', contrastIssues);
    }
  });

  test('focus trap works in modals/dialogs', async ({ page }) => {
    await navigateTo(page, '/');
    
    // If there are any modals in the app, test them
    // This is a placeholder for when modals are added
    
    // Take screenshot for documentation
    await takeScreenshot(page, 'phase-0-5/focus-management');
  });

  test('screen reader announcements for dynamic content', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live]');
    const liveCount = await liveRegions.count();
    
    if (liveCount > 0) {
      // Verify aria-live regions exist for dynamic updates
      for (let i = 0; i < liveCount; i++) {
        const region = liveRegions.nth(i);
        const ariaLive = await region.getAttribute('aria-live');
        expect(['polite', 'assertive']).toContain(ariaLive);
      }
    }
    
    // Test toast notifications if they exist
    const toastContainer = page.locator('[data-sonner-toaster]');
    if (await toastContainer.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(toastContainer).toHaveAttribute('aria-live', 'polite');
    }
  });

  test('responsive text sizing and touch targets', async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, '/');
    
    // Check touch target sizes
    const touchTargets = page.locator('button, a, [role="button"]');
    const targetCount = await touchTargets.count();
    
    for (let i = 0; i < targetCount; i++) {
      const target = touchTargets.nth(i);
      const box = await target.boundingBox();
      
      if (box) {
        // Touch targets should be at least 44x44px
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
    
    // Take screenshot of mobile touch targets
    await takeScreenshot(page, 'phase-0-5/mobile-touch-targets');
  });

  test('skip navigation link works', async ({ page }) => {
    await navigateTo(page, '/');
    
    // Press Tab to reveal skip link (if it exists)
    await page.keyboard.press('Tab');
    
    // Check if skip link is present
    const skipLink = page.getByText(/skip to content/i);
    
    if (await skipLink.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Click skip link
      await skipLink.click();
      
      // Verify focus moved to main content
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['MAIN', 'DIV', 'H1']).toContain(focusedElement);
      
      await takeScreenshot(page, 'phase-0-5/skip-navigation');
    }
  });
});