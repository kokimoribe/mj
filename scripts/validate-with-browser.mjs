#!/usr/bin/env node

/**
 * Browser-based validation script for the Mahjong app
 * Uses automated browser testing to ensure functionality remains intact
 */

import { chromium } from 'playwright';
import chalk from 'chalk';

const BASE_URL = 'http://localhost:3000';

class BrowserValidator {
  constructor() {
    this.browser = null;
    this.page = null;
    this.errors = [];
    this.warnings = [];
  }

  async init() {
    console.log(chalk.blue('🚀 Starting browser validation...'));
    this.browser = await chromium.launch({
      headless: true,
      timeout: 30000
    });
    this.page = await this.browser.newPage();

    // Capture console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.errors.push(`Console error: ${msg.text()}`);
      }
    });

    // Capture page errors
    this.page.on('pageerror', error => {
      this.errors.push(`Page error: ${error.message}`);
    });
  }

  async validateLeaderboard() {
    console.log(chalk.yellow('📊 Validating Leaderboard...'));

    try {
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });

      // Check if leaderboard loads
      const leaderboard = await this.page.waitForSelector('[data-testid="leaderboard-view"]', { timeout: 5000 });
      if (!leaderboard) throw new Error('Leaderboard not found');

      // Check if players are displayed
      const players = await this.page.$$('[data-testid="player-card"]');
      if (players.length === 0) {
        this.warnings.push('No players found in leaderboard');
      }

      // Check if ratings are displayed
      const ratings = await this.page.$$eval('[data-testid="player-rating"]', els => els.map(el => el.textContent));
      if (ratings.length === 0) {
        this.errors.push('No ratings displayed');
      }

      console.log(chalk.green(`  ✓ Leaderboard loaded with ${players.length} players`));
      return true;
    } catch (error) {
      this.errors.push(`Leaderboard validation failed: ${error.message}`);
      return false;
    }
  }

  async validateConfigurationPlayground() {
    console.log(chalk.yellow('⚙️ Validating Configuration Playground...'));

    try {
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });

      // Click configuration toggle
      const configToggle = await this.page.$('[data-testid="configuration-toggle"], button:has-text("Season"), [aria-label*="config"]');
      if (configToggle) {
        await configToggle.click();
        await this.page.waitForTimeout(500);

        // Check if configuration panel opens
        const configPanel = await this.page.$('[data-testid="configuration-panel"], [role="dialog"]');
        if (!configPanel) {
          this.warnings.push('Configuration panel did not open');
        } else {
          console.log(chalk.green('  ✓ Configuration panel opens correctly'));
        }
      } else {
        this.warnings.push('Configuration toggle not found');
      }

      return true;
    } catch (error) {
      this.errors.push(`Configuration playground validation failed: ${error.message}`);
      return false;
    }
  }

  async validatePlayerProfiles() {
    console.log(chalk.yellow('👤 Validating Player Profiles...'));

    try {
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });

      // Click on first player
      const firstPlayer = await this.page.$('[data-testid="player-card"]:first-child, tr:first-child a, .player-link:first-child');
      if (firstPlayer) {
        await firstPlayer.click();
        await this.page.waitForTimeout(1000);

        // Check if we're on player page
        const url = this.page.url();
        if (!url.includes('/player/')) {
          this.errors.push('Player profile navigation failed');
          return false;
        }

        // Check for player stats
        const playerStats = await this.page.$('[data-testid="player-stats"], .player-profile');
        if (!playerStats) {
          this.warnings.push('Player stats not displayed');
        }

        console.log(chalk.green('  ✓ Player profile loads correctly'));
      } else {
        this.warnings.push('No clickable players found');
      }

      return true;
    } catch (error) {
      this.errors.push(`Player profile validation failed: ${error.message}`);
      return false;
    }
  }

  async validateGamesHistory() {
    console.log(chalk.yellow('🎮 Validating Games History...'));

    try {
      await this.page.goto(`${BASE_URL}/games`, { waitUntil: 'networkidle' });

      // Check if games list loads
      const gamesList = await this.page.$('[data-testid="games-list"], .games-history, main');
      if (!gamesList) {
        this.errors.push('Games list not found');
        return false;
      }

      // Check for game entries
      const games = await this.page.$$('[data-testid="game-entry"], .game-card, article');
      if (games.length === 0) {
        this.warnings.push('No games found in history');
      } else {
        console.log(chalk.green(`  ✓ Games history loaded with ${games.length} games`));
      }

      return true;
    } catch (error) {
      this.errors.push(`Games history validation failed: ${error.message}`);
      return false;
    }
  }

  async validateDarkMode() {
    console.log(chalk.yellow('🌙 Validating Dark Mode...'));

    try {
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });

      // Find and click dark mode toggle
      const darkModeToggle = await this.page.$('[data-testid="theme-toggle"], button[aria-label*="theme"], button:has-text("🌙"), button:has-text("☀️")');
      if (darkModeToggle) {
        // Get initial theme
        const initialTheme = await this.page.evaluate(() => document.documentElement.classList.contains('dark'));

        await darkModeToggle.click();
        await this.page.waitForTimeout(500);

        // Check if theme changed
        const newTheme = await this.page.evaluate(() => document.documentElement.classList.contains('dark'));
        if (initialTheme === newTheme) {
          this.warnings.push('Dark mode toggle did not change theme');
        } else {
          console.log(chalk.green('  ✓ Dark mode toggle works'));
        }
      } else {
        this.warnings.push('Dark mode toggle not found');
      }

      return true;
    } catch (error) {
      this.errors.push(`Dark mode validation failed: ${error.message}`);
      return false;
    }
  }

  async validateAPIResponses() {
    console.log(chalk.yellow('🔌 Validating API Responses...'));

    try {
      // Test games API
      const gamesResponse = await fetch(`${BASE_URL}/api/games`);
      if (!gamesResponse.ok) {
        this.errors.push(`Games API returned ${gamesResponse.status}`);
      } else {
        console.log(chalk.green('  ✓ Games API responds correctly'));
      }

      // Test materialize API (just check it exists)
      const materializeResponse = await fetch(`${BASE_URL}/api/materialize`, { method: 'HEAD' });
      if (materializeResponse.status === 404) {
        this.errors.push('Materialize API not found');
      }

      return true;
    } catch (error) {
      this.errors.push(`API validation failed: ${error.message}`);
      return false;
    }
  }

  async runAllValidations() {
    await this.init();

    const validations = [
      this.validateLeaderboard(),
      this.validateConfigurationPlayground(),
      this.validatePlayerProfiles(),
      this.validateGamesHistory(),
      this.validateDarkMode(),
      this.validateAPIResponses()
    ];

    const results = await Promise.all(validations);

    await this.cleanup();

    return results.every(r => r === true);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  printReport() {
    console.log('\n' + chalk.bold('Validation Report:'));
    console.log('=' . repeat(50));

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(chalk.green.bold('✅ All validations passed!'));
    } else {
      if (this.errors.length > 0) {
        console.log(chalk.red.bold(`\n❌ Errors (${this.errors.length}):`));
        this.errors.forEach(err => console.log(chalk.red(`  - ${err}`)));
      }

      if (this.warnings.length > 0) {
        console.log(chalk.yellow.bold(`\n⚠️ Warnings (${this.warnings.length}):`));
        this.warnings.forEach(warn => console.log(chalk.yellow(`  - ${warn}`)));
      }
    }

    console.log('\n' + '=' . repeat(50));

    return this.errors.length === 0;
  }
}

async function main() {
  const validator = new BrowserValidator();

  try {
    console.log(chalk.cyan.bold('\n🔍 Mahjong App Browser Validation\n'));

    const success = await validator.runAllValidations();
    const reportSuccess = validator.printReport();

    if (!reportSuccess) {
      process.exit(1);
    }

    console.log(chalk.green.bold('\n✨ Validation complete!\n'));
  } catch (error) {
    console.error(chalk.red.bold('\n💥 Validation failed:'), error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { BrowserValidator };