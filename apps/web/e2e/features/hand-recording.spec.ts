import { test, expect } from "@playwright/test";
import {
  navigateTo,
  waitForDataLoad,
  takeScreenshot,
} from "../utils/test-helpers";

/**
 * Hand Recording Feature - E2E Tests
 * Based on Hand Recording Feature Specification v3.2
 *
 * These tests verify the complete hand-by-hand recording functionality
 * for riichi mahjong games. Tests should fail until feature is implemented.
 *
 * NOTE: These tests require a database with an active game. They cannot be
 * mocked because the HandRecordingView component directly queries Supabase.
 * To run these tests:
 * 1. Ensure database migration is applied
 * 2. Create a test game in the database
 * 3. Run the tests
 */

test.describe.skip("Hand Recording - Core Recording", () => {
  test.beforeEach(async ({ page }) => {
    // Mock an active game for testing
    await page.route("**/api/games", async route => {
      if (route.request().method() === "GET") {
        // Return a mock active game
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            games: [
              {
                id: "test-game-1",
                started_at: new Date().toISOString(),
                status: "ongoing",
                game_seats: [
                  {
                    seat: "east",
                    player: { id: "player-josh", display_name: "Josh" },
                    player_id: "player-josh",
                    final_score: null,
                  },
                  {
                    seat: "south",
                    player: { id: "player-mikey", display_name: "Mikey" },
                    player_id: "player-mikey",
                    final_score: null,
                  },
                  {
                    seat: "west",
                    player: { id: "player-koki", display_name: "Koki" },
                    player_id: "player-koki",
                    final_score: null,
                  },
                  {
                    seat: "north",
                    player: { id: "player-jo", display_name: "Jo" },
                    player_id: "player-jo",
                    final_score: null,
                  },
                ],
              },
            ],
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock hands endpoint for the test game
    await page.route("**/api/games/*/hands", async route => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            hands: [],
            dataQuality: "final_only",
          }),
        });
      } else {
        // Allow POST requests to continue
        await route.continue();
      }
    });

    // Navigate to an active game that supports hand recording
    await navigateTo(page, "/games/active");
    await page.waitForSelector('[data-testid="hand-recording-view"]', {
      timeout: 10000,
    });
  });

  test("displays hand recording interface for active games", async ({
    page,
  }) => {
    // Round indicator should be visible
    await expect(page.locator('[data-testid="round-compass"]')).toBeVisible();
    await expect(page.locator('[data-testid="round-compass"]')).toContainText(
      "EAST 1"
    );

    // Honba counter should be visible
    await expect(page.locator('[data-testid="honba-counter"]')).toContainText(
      "Honba: 0"
    );

    // Riichi pot display should be visible
    await expect(page.locator('[data-testid="riichi-pot"]')).toContainText(
      "Riichi: 0"
    );
    await expect(page.locator('[data-testid="pot-display"]')).toContainText(
      "Pot: 0"
    );

    // Player scores should be visible with dealer indicator
    const playerScores = page.locator('[data-testid="player-score"]');
    await expect(playerScores).toHaveCount(4);

    // Dealer indicator should be present
    const dealerIndicator = page.locator('[data-testid="dealer-indicator"]');
    await expect(dealerIndicator).toBeVisible();
  });

  test("records basic ron outcome", async ({ page }) => {
    // Select winner
    await page.locator('[data-testid="winner-button-josh"]').click();

    // Select method (Ron)
    await page.locator('[data-testid="outcome-ron"]').click();

    // Select loser (who dealt in)
    await page.locator('[data-testid="loser-button-mikey"]').click();

    // Enter or select points
    await page.locator('[data-testid="points-button-5800"]').click();

    // Submit hand
    await page.locator('[data-testid="submit-hand"]').click();

    // Verify scores updated correctly
    await expect(
      page.locator('[data-testid="player-score-josh"]')
    ).toContainText("30,800");
    await expect(
      page.locator('[data-testid="player-score-mikey"]')
    ).toContainText("19,200");

    // Verify hand appears in history
    const handHistory = page
      .locator('[data-testid="hand-history-item"]')
      .first();
    await expect(handHistory).toContainText("E1");
    await expect(handHistory).toContainText("Josh ron Mikey 5800");
  });

  test("records tsumo with proper payment distribution", async ({ page }) => {
    // Select winner
    await page.locator('[data-testid="winner-button-koki"]').click();

    // Select tsumo
    await page.locator('[data-testid="outcome-tsumo"]').click();

    // Select points (1000/2000 for non-dealer)
    await page.locator('[data-testid="tsumo-points-1000-2000"]').click();

    // Submit
    await page.locator('[data-testid="submit-hand"]').click();

    // Verify payment distribution (non-dealers pay 1000, dealer pays 2000)
    const scoreChanges = page.locator('[data-testid="score-animation"]');
    await expect(scoreChanges).toContainText("-1000"); // Non-dealers
    await expect(scoreChanges).toContainText("-2000"); // Dealer
    await expect(scoreChanges).toContainText("+4000"); // Winner
  });

  test("handles riichi declarations correctly", async ({ page }) => {
    // Click riichi button for a player
    await page.locator('[data-testid="riichi-button-josh"]').click();

    // Score should decrease by 1000
    await expect(
      page.locator('[data-testid="player-score-josh"]')
    ).toContainText("24,000");

    // Riichi indicator should appear
    await expect(
      page.locator('[data-testid="riichi-indicator-josh"]')
    ).toBeVisible();

    // Riichi pot should update
    await expect(page.locator('[data-testid="riichi-pot"]')).toContainText(
      "Riichi: 1"
    );

    // Record a win
    await page.locator('[data-testid="winner-button-josh"]').click();
    await page.locator('[data-testid="outcome-ron"]').click();
    await page.locator('[data-testid="loser-button-mikey"]').click();
    await page.locator('[data-testid="points-button-5800"]').click();
    await page.locator('[data-testid="submit-hand"]').click();

    // Verify riichi stick is returned to winner
    await expect(
      page.locator('[data-testid="player-score-josh"]')
    ).toContainText("29,800");
    await expect(page.locator('[data-testid="riichi-pot"]')).toContainText(
      "Riichi: 0"
    );
  });

  test("records exhaustive draw with tenpai payments", async ({ page }) => {
    // Select draw outcome
    await page.locator('[data-testid="outcome-draw"]').click();

    // Select tenpai players (Josh and Mikey)
    await page.locator('[data-testid="tenpai-checkbox-josh"]').check();
    await page.locator('[data-testid="tenpai-checkbox-mikey"]').check();

    // Calculate payments should show automatically
    await expect(page.locator('[data-testid="payment-preview"]')).toContainText(
      "+1500"
    );
    await expect(page.locator('[data-testid="payment-preview"]')).toContainText(
      "-1500"
    );

    // Submit
    await page.locator('[data-testid="submit-hand"]').click();

    // Verify scores
    await expect(
      page.locator('[data-testid="player-score-josh"]')
    ).toContainText("26,500");
    await expect(
      page.locator('[data-testid="player-score-mikey"]')
    ).toContainText("26,500");
    await expect(
      page.locator('[data-testid="player-score-koki"]')
    ).toContainText("23,500");
    await expect(page.locator('[data-testid="player-score-jo"]')).toContainText(
      "23,500"
    );

    // Verify honba increases
    await expect(page.locator('[data-testid="honba-counter"]')).toContainText(
      "Honba: 1"
    );
  });

  test("handles double ron correctly", async ({ page }) => {
    // Open advanced options
    await page.locator('[data-testid="advanced-options"]').click();

    // Select double ron
    await page.locator('[data-testid="double-ron"]').click();

    // Select first winner
    await page.locator('[data-testid="winner-1-josh"]').click();
    await page.locator('[data-testid="points-1-12000"]').click();

    // Select second winner
    await page.locator('[data-testid="winner-2-justin"]').click();
    await page.locator('[data-testid="points-2-5200"]').click();

    // Select loser (dealer in this case)
    await page.locator('[data-testid="loser-dealer"]').click();

    // Submit
    await page.locator('[data-testid="submit-hand"]').click();

    // Verify dealer lost total points
    await expect(page.locator('[data-testid="dealer-score"]')).toContainText(
      "7,800"
    ); // 25000 - 17200

    // Verify winners received correct amounts
    await expect(
      page.locator('[data-testid="player-score-josh"]')
    ).toContainText("37,000");
    await expect(
      page.locator('[data-testid="player-score-justin"]')
    ).toContainText("30,200");
  });

  test("handles chombo penalty correctly", async ({ page }) => {
    // Open advanced options
    await page.locator('[data-testid="advanced-options"]').click();

    // Select chombo
    await page.locator('[data-testid="penalty-chombo"]').click();

    // Select player who committed chombo
    await page.locator('[data-testid="chombo-player-east"]').click();

    // Submit
    await page.locator('[data-testid="submit-hand"]').click();

    // Verify reverse mangan payments
    // Non-dealer chombo: pays 2000 to non-dealers, 4000 to dealer
    await expect(
      page.locator('[data-testid="player-score-east"]')
    ).toContainText("17,000"); // -8000
    await expect(
      page.locator('[data-testid="player-score-south"]')
    ).toContainText("29,000"); // +4000 (dealer)
    await expect(
      page.locator('[data-testid="player-score-west"]')
    ).toContainText("27,000"); // +2000
    await expect(
      page.locator('[data-testid="player-score-north"]')
    ).toContainText("27,000"); // +2000

    // Hand should be replayed (same round)
    await expect(page.locator('[data-testid="round-compass"]')).toContainText(
      "SOUTH 2"
    );
  });
});

test.describe.skip("Hand Recording - Score Validation", () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, "/games/active");
    await page.waitForSelector('[data-testid="hand-recording-view"]');
  });

  test("validates point balance sums to zero", async ({ page }) => {
    // Try to submit invalid point distribution
    await page.locator('[data-testid="manual-score-entry"]').click();

    // Enter scores that don't sum to zero
    await page.locator('[data-testid="score-input-josh"]').fill("30000");
    await page.locator('[data-testid="score-input-mikey"]').fill("25000");
    await page.locator('[data-testid="score-input-koki"]').fill("25000");
    await page.locator('[data-testid="score-input-jo"]').fill("25000"); // Sum = 105000

    await page.locator('[data-testid="submit-hand"]').click();

    // Should show validation error
    await expect(
      page.locator('[data-testid="validation-error"]')
    ).toContainText("Points must balance to zero");

    // Submit button should be disabled
    await expect(page.locator('[data-testid="submit-hand"]')).toBeDisabled();
  });

  test("validates riichi deposits correctly", async ({ page }) => {
    // Declare riichi
    await page.locator('[data-testid="riichi-button-josh"]').click();

    // Win by tsumo
    await page.locator('[data-testid="winner-button-josh"]').click();
    await page.locator('[data-testid="outcome-tsumo"]').click();
    await page.locator('[data-testid="tsumo-points-1000-2000"]').click();
    await page.locator('[data-testid="submit-hand"]').click();

    // Verify riichi stick is returned (1000 points)
    const finalScore = await page
      .locator('[data-testid="player-score-josh"]')
      .textContent();
    // Should be: 25000 - 1000 (riichi) + 4000 (tsumo) + 1000 (riichi returned) = 29000
    expect(finalScore).toContain("29,000");
  });

  test("enforces tobi (bankruptcy) rules", async ({ page }) => {
    // Set a player to low points
    await page.locator('[data-testid="edit-scores"]').click();
    await page.locator('[data-testid="score-input-jo"]').fill("2000");
    await page.locator('[data-testid="save-scores"]').click();

    // Make Jo lose 5800 points
    await page.locator('[data-testid="winner-button-josh"]').click();
    await page.locator('[data-testid="outcome-ron"]').click();
    await page.locator('[data-testid="loser-button-jo"]').click();
    await page.locator('[data-testid="points-button-5800"]').click();
    await page.locator('[data-testid="submit-hand"]').click();

    // Game should end immediately
    await expect(page.locator('[data-testid="game-ended-tobi"]')).toBeVisible();
    await expect(page.locator('[data-testid="player-score-jo"]')).toContainText(
      "-3,800"
    );

    // Should not allow further hand recording
    await expect(page.locator('[data-testid="submit-hand"]')).not.toBeVisible();
  });
});

test.describe.skip("Hand Recording - Dealer Rotation", () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, "/games/active");
    await page.waitForSelector('[data-testid="hand-recording-view"]');
  });

  test("rotates dealer correctly on non-dealer win", async ({ page }) => {
    // Initial state: East 1, East player is dealer
    await expect(
      page.locator('[data-testid="dealer-indicator"]')
    ).toHaveAttribute("data-player", "east");

    // Non-dealer (South) wins
    await page.locator('[data-testid="winner-button-south"]').click();
    await page.locator('[data-testid="outcome-tsumo"]').click();
    await page.locator('[data-testid="tsumo-points-1000-2000"]').click();
    await page.locator('[data-testid="submit-hand"]').click();

    // Dealer should rotate to South
    await expect(page.locator('[data-testid="round-compass"]')).toContainText(
      "EAST 2"
    );
    await expect(
      page.locator('[data-testid="dealer-indicator"]')
    ).toHaveAttribute("data-player", "south");
  });

  test("dealer continues on dealer win (renchan)", async ({ page }) => {
    // Dealer wins
    await page.locator('[data-testid="winner-button-east"]').click();
    await page.locator('[data-testid="outcome-tsumo"]').click();
    await page.locator('[data-testid="tsumo-points-dealer-2000"]').click();
    await page.locator('[data-testid="submit-hand"]').click();

    // Dealer should continue
    await expect(page.locator('[data-testid="round-compass"]')).toContainText(
      "EAST 1"
    );
    await expect(page.locator('[data-testid="honba-counter"]')).toContainText(
      "Honba: 1"
    );
    await expect(
      page.locator('[data-testid="dealer-indicator"]')
    ).toHaveAttribute("data-player", "east");
  });

  test("handles dealer continuity on draw based on tenpai", async ({
    page,
  }) => {
    // Draw with dealer in tenpai
    await page.locator('[data-testid="outcome-draw"]').click();
    await page.locator('[data-testid="tenpai-checkbox-east"]').check(); // Dealer in tenpai
    await page.locator('[data-testid="tenpai-checkbox-south"]').check();
    await page.locator('[data-testid="submit-hand"]').click();

    // Dealer should continue (tenpai renchan rule)
    await expect(page.locator('[data-testid="round-compass"]')).toContainText(
      "EAST 1"
    );
    await expect(page.locator('[data-testid="honba-counter"]')).toContainText(
      "Honba: 1"
    );
    await expect(
      page.locator('[data-testid="dealer-indicator"]')
    ).toHaveAttribute("data-player", "east");
  });
});

test.describe.skip("Hand Recording - UI/UX Mobile Experience", () => {
  test.use({
    viewport: { width: 375, height: 667 },
    hasTouch: true,
  });

  test("bottom-heavy controls for thumb reach", async ({ page }) => {
    await navigateTo(page, "/games/active");

    // Quick entry buttons should be at bottom
    const quickEntry = page.locator('[data-testid="quick-entry-panel"]');
    const quickEntryBox = await quickEntry.boundingBox();

    // Should be in bottom half of screen
    expect(quickEntryBox?.y).toBeGreaterThan(333);

    // Touch targets should be minimum 44x44px
    const winnerButton = page.locator('[data-testid="winner-button-josh"]');
    const buttonBox = await winnerButton.boundingBox();
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test("2-tap quick entry for common scenarios", async ({ page }) => {
    await navigateTo(page, "/games/active");

    // Tap 1: Select winner
    await page.locator('[data-testid="winner-button-josh"]').tap();

    // Should automatically show next step
    await expect(
      page.locator('[data-testid="outcome-selection"]')
    ).toBeVisible();

    // Tap 2: Select tsumo with common points
    await page.locator('[data-testid="quick-tsumo-1000-2000"]').tap();

    // Should auto-submit for common scenarios
    await waitForDataLoad(page);

    // Verify hand was recorded
    await expect(page.locator('[data-testid="hand-history-item"]')).toHaveCount(
      1
    );
  });

  test("swipe gestures for navigation", async ({ page }) => {
    await navigateTo(page, "/games/active");

    // Record a few hands first
    for (let i = 0; i < 3; i++) {
      await page.locator('[data-testid="winner-button-josh"]').tap();
      await page.locator('[data-testid="quick-tsumo-1000-2000"]').tap();
      await waitForDataLoad(page);
    }

    // Swipe up to view hand history
    await page.locator('[data-testid="hand-history-panel"]').evaluate(el => {
      const touch = new Touch({
        identifier: 1,
        target: el,
        clientX: 187,
        clientY: 600,
      });

      const touchStart = new TouchEvent("touchstart", {
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch],
      });

      const touchEnd = new TouchEvent("touchend", {
        touches: [],
        targetTouches: [],
        changedTouches: [touch],
      });

      el.dispatchEvent(touchStart);
      el.dispatchEvent(touchEnd);
    });

    // Hand history should be expanded
    await expect(
      page.locator('[data-testid="hand-history-expanded"]')
    ).toBeVisible();
  });
});

test.describe.skip("Hand Recording - Backward Compatibility", () => {
  test("displays games without hand history normally", async ({ page }) => {
    // Navigate to a legacy game (pre-July)
    await navigateTo(page, "/games/legacy-game-123");

    // Should show final scores only
    await expect(
      page.locator('[data-testid="final-scores-only"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="hand-history-unavailable"]')
    ).toContainText("No hand history available");

    // Should still show player scores
    const scores = page.locator('[data-testid="final-score"]');
    await expect(scores).toHaveCount(4);

    // Should NOT show hand recording interface
    await expect(
      page.locator('[data-testid="hand-recording-view"]')
    ).not.toBeVisible();
  });

  test("supports partial hand recording mid-game", async ({ page }) => {
    // Start with a game that has no hands recorded
    await navigateTo(page, "/games/active-no-hands");

    // Enable hand recording
    await page.locator('[data-testid="enable-hand-recording"]').click();

    // Should show current round (e.g., South 2) not East 1
    await expect(page.locator('[data-testid="round-compass"]')).toContainText(
      "SOUTH"
    );

    // Record a hand
    await page.locator('[data-testid="winner-button-josh"]').click();
    await page.locator('[data-testid="outcome-ron"]').click();
    await page.locator('[data-testid="loser-button-mikey"]').click();
    await page.locator('[data-testid="points-button-5800"]').click();
    await page.locator('[data-testid="submit-hand"]').click();

    // Should indicate partial history
    await expect(
      page.locator('[data-testid="data-quality-indicator"]')
    ).toContainText("Partial hand history available");
  });

  test("rating calculations work without hand data", async ({ page }) => {
    // Navigate to player profile
    await navigateTo(page, "/player/josh");

    // Should show games with and without hand history
    const gamesList = page.locator('[data-testid="player-games"]');

    // Games with hand history
    const detailedGames = gamesList.locator('[data-testid="game-detailed"]');
    await expect(detailedGames.first()).toHaveAttribute(
      "data-has-hands",
      "true"
    );

    // Games without hand history
    const simpleGames = gamesList.locator('[data-testid="game-simple"]');
    await expect(simpleGames.first()).toHaveAttribute(
      "data-has-hands",
      "false"
    );

    // Rating should be calculated from all games
    await expect(page.locator('[data-testid="player-rating"]')).toBeVisible();
    await expect(page.locator('[data-testid="games-played"]')).toContainText(
      /\d+ games/
    );
  });
});

test.describe.skip("Hand Recording - Advanced Features", () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, "/games/active");
    await page.waitForSelector('[data-testid="hand-recording-view"]');
  });

  test("calculates han/fu for scoring", async ({ page }) => {
    // Open han/fu calculator
    await page.locator('[data-testid="calculate-han-fu"]').click();

    // Select han
    await page.locator('[data-testid="han-selector"]').selectOption("3");

    // Select fu
    await page.locator('[data-testid="fu-selector"]').selectOption("30");

    // Select yaku
    await page.locator('[data-testid="yaku-riichi"]').check();
    await page.locator('[data-testid="yaku-tanyao"]').check();
    await page.locator('[data-testid="yaku-pinfu"]').check();

    // Should calculate to 5800 points
    await expect(
      page.locator('[data-testid="calculated-score"]')
    ).toContainText("5,800");

    // Use this score
    await page.locator('[data-testid="use-calculated-score"]').click();

    // Score should be applied to hand entry
    await expect(page.locator('[data-testid="selected-points"]')).toContainText(
      "5800"
    );
  });

  test("handles yakuman scoring", async ({ page }) => {
    // Open advanced options
    await page.locator('[data-testid="advanced-options"]').click();

    // Select yakuman
    await page.locator('[data-testid="yakuman-option"]').click();

    // Select yakuman type
    await page.locator('[data-testid="yakuman-type"]').selectOption("suuankou");

    // Dealer yakuman tsumo = 48000 (16000 from each)
    await page.locator('[data-testid="winner-button-dealer"]').click();
    await page.locator('[data-testid="outcome-tsumo"]').click();

    // Points should auto-calculate
    await expect(page.locator('[data-testid="yakuman-points"]')).toContainText(
      "48,000"
    );

    // Submit
    await page.locator('[data-testid="submit-hand"]').click();

    // Verify massive point swing
    await expect(page.locator('[data-testid="dealer-score"]')).toContainText(
      "73,000"
    ); // 25000 + 48000
  });

  test("supports undo/edit for last hand", async ({ page }) => {
    // Record a hand
    await page.locator('[data-testid="winner-button-josh"]').click();
    await page.locator('[data-testid="outcome-ron"]').click();
    await page.locator('[data-testid="loser-button-mikey"]').click();
    await page.locator('[data-testid="points-button-5800"]').click();
    await page.locator('[data-testid="submit-hand"]').click();

    // Should show undo option
    await expect(
      page.locator('[data-testid="last-action-undo"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="last-action-undo"]')
    ).toContainText("E1: Josh ron Mikey 5800");

    // Click undo
    await page.locator('[data-testid="undo-button"]').click();

    // Scores should revert
    await expect(
      page.locator('[data-testid="player-score-josh"]')
    ).toContainText("25,000");
    await expect(
      page.locator('[data-testid="player-score-mikey"]')
    ).toContainText("25,000");

    // Hand should be removed from history
    await expect(page.locator('[data-testid="hand-history-item"]')).toHaveCount(
      0
    );
  });

  test("handles incomplete data with notes", async ({ page }) => {
    // Open manual entry
    await page.locator('[data-testid="manual-entry"]').click();

    // Mark as incomplete
    await page.locator('[data-testid="incomplete-data"]').check();

    // Add note
    await page
      .locator('[data-testid="hand-note"]')
      .fill("Either mikey or josh won, need to verify from final scores");

    // Select possible winners
    await page.locator('[data-testid="possible-winner-mikey"]').check();
    await page.locator('[data-testid="possible-winner-josh"]').check();

    // Enter known points
    await page.locator('[data-testid="uncertain-points"]').fill("2600");

    // Save as incomplete
    await page.locator('[data-testid="save-incomplete"]').click();

    // Should show as pending verification
    await expect(
      page.locator('[data-testid="incomplete-hand-indicator"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="incomplete-hand-note"]')
    ).toContainText("needs verification");
  });
});

test.describe.skip("Hand Recording - Offline Support", () => {
  test("queues hand entries when offline", async ({ page, context }) => {
    await navigateTo(page, "/games/active");

    // Go offline
    await context.setOffline(true);

    // Try to record a hand
    await page.locator('[data-testid="winner-button-josh"]').click();
    await page.locator('[data-testid="outcome-ron"]').click();
    await page.locator('[data-testid="loser-button-mikey"]').click();
    await page.locator('[data-testid="points-button-5800"]').click();
    await page.locator('[data-testid="submit-hand"]').click();

    // Should show offline indicator
    await expect(
      page.locator('[data-testid="offline-indicator"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="sync-status"]')).toContainText(
      "Will sync when online"
    );

    // Hand should appear locally
    await expect(page.locator('[data-testid="hand-history-item"]')).toHaveCount(
      1
    );
    await expect(
      page.locator('[data-testid="hand-sync-pending"]')
    ).toBeVisible();

    // Go back online
    await context.setOffline(false);

    // Should sync automatically
    await page.waitForSelector('[data-testid="sync-complete"]', {
      timeout: 5000,
    });
    await expect(
      page.locator('[data-testid="hand-sync-pending"]')
    ).not.toBeVisible();
  });
});

test.describe.skip("Hand Recording - Performance", () => {
  test("hand entry response time under 500ms", async ({ page }) => {
    await navigateTo(page, "/games/active");

    const startTime = Date.now();

    // Quick entry
    await page.locator('[data-testid="winner-button-josh"]').click();
    await page.locator('[data-testid="quick-tsumo-1000-2000"]').click();

    // Wait for score update
    await page.waitForSelector('[data-testid="score-updated"]');

    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(500);
  });

  test("loads 100 hands in under 1 second", async ({ page }) => {
    // Navigate to a game with many hands
    await navigateTo(page, "/games/game-with-100-hands");

    const startTime = Date.now();

    // Open hand history
    await page.locator('[data-testid="view-hand-history"]').click();

    // Wait for all hands to load
    await page.waitForSelector(
      '[data-testid="hand-history-item"]:nth-child(100)'
    );

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(1000);
  });

  test("real-time validation feedback", async ({ page }) => {
    await navigateTo(page, "/games/active");

    // Enter invalid point value
    await page.locator('[data-testid="manual-points-entry"]').click();
    await page.locator('[data-testid="points-input"]').fill("5700"); // Not a standard value

    // Should show validation immediately
    await expect(
      page.locator('[data-testid="validation-warning"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="validation-warning"]')
    ).toContainText("Not standard");

    // Correct the value
    await page.locator('[data-testid="points-input"]').fill("5800");

    // Validation should clear
    await expect(
      page.locator('[data-testid="validation-success"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="validation-warning"]')
    ).not.toBeVisible();
  });
});
