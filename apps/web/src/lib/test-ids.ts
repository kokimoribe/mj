/**
 * Test IDs for E2E testing with Playwright
 * These provide stable selectors that won't break with UI changes
 */
export const TEST_IDS = {
  // Navigation
  NAV_HOME: "nav-home",
  NAV_GAMES: "nav-games",
  NAV_STATS: "nav-stats",
  NAV_PLAYGROUND: "nav-playground",
  NAV_BOTTOM: "nav-bottom",

  // Leaderboard
  LEADERBOARD_VIEW: "leaderboard-view",
  LEADERBOARD_HEADER: "leaderboard-header",
  LEADERBOARD_REFRESH: "leaderboard-refresh",
  REFRESH_BUTTON: "refresh-button",
  PLAYER_CARD: "player-card",
  PLAYER_CARD_EXPANDED: "player-card-expanded",

  // Player Profile
  PLAYER_PROFILE: "player-profile",
  PLAYER_HEADER: "player-header",
  PLAYER_STATS: "player-stats",
  PLAYER_GAMES: "player-games",
  RATING_CHART: "rating-chart",
  RATING_TREND: "rating-trend",
  PERFORMANCE_STATS: "performance-stats",
  GAMES_LIST: "games-list",
  GAME_ENTRY_PREFIX: "game-entry",
  SHOW_MORE_GAMES: "show-more-games",

  // Game History
  GAME_HISTORY_VIEW: "game-history-view",
  GAME_ENTRY: "game-entry",
  GAME_LIST: "game-list",

  // Stats
  STATS_VIEW: "stats-view",
  STATS_CARD: "stats-card",
  STATS_SEASON: "stats-season",

  // Playground
  PLAYGROUND_VIEW: "playground-view",
  CONFIG_FORM: "config-form",
  CONFIG_SLIDER: "config-slider",

  // Common
  LOADING_SKELETON: "loading-skeleton",
  ERROR_MESSAGE: "error-message",
  THEME_TOGGLE: "theme-toggle",
} as const;

export type TestId = (typeof TEST_IDS)[keyof typeof TEST_IDS];

// Structured test IDs for better organization
export const testIds = {
  gameHistory: {
    container: "game-history-container",
    header: "game-history-header",
    gameCount: "game-history-game-count",
    filterDropdown: "game-history-filter-dropdown",
    gamesList: "game-history-games-list",
    gameCard: "game-history-game-card",
    loadMoreButton: "game-history-load-more",
    showLessButton: "game-history-show-less",
    emptyState: "game-history-empty-state",
    loadingState: "game-history-loading",
  },
  // Add other feature test IDs here as needed
} as const;
