import { test, expect } from "@playwright/test";

test("Debug average placement display", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.waitForSelector('[data-testid="leaderboard-view"]', {
    timeout: 10000,
  });

  // Get first player card
  const firstCard = page.locator('[data-testid*="player-card"]').first();
  const cardText = await firstCard.textContent();
  console.log("First card text:", cardText);

  // Click to expand
  await firstCard.click();
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({
    path: "test-results/debug-avg-placement-expanded.png",
    fullPage: false,
  });

  // Check expanded content
  const expandedContent = await firstCard.textContent();
  console.log("Expanded content:", expandedContent);

  // Look for specific elements
  const avgPlacementLabel = await page.locator('text="Avg Placement:"').count();
  console.log('Found "Avg Placement:" labels:', avgPlacementLabel);

  // Try different selectors
  const avgPlacementInCard = await firstCard
    .locator('text="Avg Placement"')
    .count();
  console.log("Avg Placement in card:", avgPlacementInCard);

  // Check if expanded section exists
  const expandedSection = firstCard.locator(".bg-muted\\/30");
  const expandedVisible = await expandedSection.isVisible();
  console.log("Expanded section visible:", expandedVisible);

  if (expandedVisible) {
    const expandedText = await expandedSection.textContent();
    console.log("Expanded section text:", expandedText);
  }

  // Debug: Get all text content in the card
  const allTexts = await firstCard
    .locator("text=/.*Placement.*/")
    .allTextContents();
  console.log('All texts matching "Placement":', allTexts);
});
