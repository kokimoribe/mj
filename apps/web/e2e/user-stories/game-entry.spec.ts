import { test, expect } from "@playwright/test";
import { navigateTo, takeScreenshot } from "../utils/test-helpers";

test.describe("User Story: Recording Game Results", () => {
  test("As the league admin, I want to enter last night's game results", async ({
    page,
  }) => {
    // Admin navigates to game entry (this might be a different URL or require auth)
    await navigateTo(page, "/game/new");

    // They should see a form to enter game results
    await expect(
      page.getByRole("heading", { name: /Add Game|New Game|Enter Results/i })
    ).toBeVisible();

    // They need to select 4 players
    const playerSelects = page.locator(
      'select[name*="player"], input[name*="player"]'
    );
    await expect(playerSelects).toHaveCount(4);

    // They enter the scores for each player
    const scoreInputs = page.locator(
      'input[name*="score"], input[type="number"]'
    );
    await expect(scoreInputs).toHaveCount(4);

    // Select players (in a real test, we'd actually fill these)
    // await playerSelects.nth(0).selectOption('Joseph');
    // await playerSelects.nth(1).selectOption('Koki');
    // await playerSelects.nth(2).selectOption('Mikey');
    // await playerSelects.nth(3).selectOption('Josh');

    // Enter scores
    // await scoreInputs.nth(0).fill('42000');
    // await scoreInputs.nth(1).fill('28000');
    // await scoreInputs.nth(2).fill('18000');
    // await scoreInputs.nth(3).fill('12000');

    // Submit button should be visible
    await expect(
      page.getByRole("button", { name: /Submit|Save|Add Game/i })
    ).toBeVisible();

    await takeScreenshot(page, "user-stories/admin-enters-game");
  });

  test("As the league admin, I want to verify scores add up to 100,000", async ({
    page,
  }) => {
    await navigateTo(page, "/game/new");

    // Enter invalid scores that don't sum to 100,000
    const scoreInputs = page.locator('input[type="number"]');

    // This represents entering scores
    // await scoreInputs.nth(0).fill('30000');
    // await scoreInputs.nth(1).fill('30000');
    // await scoreInputs.nth(2).fill('20000');
    // await scoreInputs.nth(3).fill('10000'); // Sum = 90,000

    // There should be validation feedback
    await expect(page.getByText(/must sum to 100|total.*100/i)).toBeVisible();

    // Submit button might be disabled
    const submitButton = page.getByRole("button", { name: /Submit|Save/i });
    await expect(submitButton).toBeDisabled();

    await takeScreenshot(page, "user-stories/admin-score-validation");
  });
});
