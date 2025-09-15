/**
 * Core Application Constants
 *
 * Centralized constants to avoid magic numbers and strings throughout the codebase
 */

// ============================================================================
// Game Constants
// ============================================================================

export const GAME_CONSTANTS = {
  PLAYERS_PER_GAME: 4,
  INITIAL_SCORE: 25000,
  OKA: 20000,
  RETURN_SCORE: 30000,
} as const;

export const GAME_STATUS = {
  SCHEDULED: "scheduled",
  ONGOING: "ongoing",
  FINISHED: "finished",
  CANCELLED: "cancelled",
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

// ============================================================================
// Seat Positions
// ============================================================================

export const SEAT_POSITIONS = {
  EAST: "east",
  SOUTH: "south",
  WEST: "west",
  NORTH: "north",
} as const;

export type SeatPosition = (typeof SEAT_POSITIONS)[keyof typeof SEAT_POSITIONS];

export const SEAT_ORDER = [
  SEAT_POSITIONS.EAST,
  SEAT_POSITIONS.SOUTH,
  SEAT_POSITIONS.WEST,
  SEAT_POSITIONS.NORTH,
] as const;

// ============================================================================
// Rating Configuration
// ============================================================================

export const RATING_CONFIG = {
  SEASON_3_HASH:
    "9322cbcf3e11a1fc1e63802f5f8f8c731e5a3f84584fc83a0f3b2f64d9c4fd6f",
  SEASON_4_HASH:
    "dbe6c12c7d30f5b6fb86e8bc4af3f973f5b0f65e407e9a8fb1e1ac0e5b5a9a2e",
  DEFAULT_MU: 25.0,
  DEFAULT_SIGMA: 8.333333333333334,
  CONFIDENCE_FACTOR: 2.0,
  DECAY_RATE: 0.02,
} as const;

// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  CACHE_TTL: 60 * 5, // 5 minutes
  REQUEST_TIMEOUT: 30000, // 30 seconds
} as const;

// ============================================================================
// UI Constants
// ============================================================================

export const UI_CONSTANTS = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 4000,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
} as const;

// ============================================================================
// Validation Rules
// ============================================================================

export const VALIDATION = {
  MIN_PLAYER_NAME_LENGTH: 1,
  MAX_PLAYER_NAME_LENGTH: 50,
  MIN_GAME_NOTES_LENGTH: 0,
  MAX_GAME_NOTES_LENGTH: 500,
  VALID_SCORE_RANGE: {
    MIN: -999999,
    MAX: 999999,
  },
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  GENERIC: "An error occurred. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  NOT_FOUND: "Resource not found.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  VALIDATION: "Please check your input and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  GAME_CREATED: "Game created successfully.",
  GAME_UPDATED: "Game updated successfully.",
  GAME_DELETED: "Game deleted successfully.",
  CONFIGURATION_SAVED: "Configuration saved successfully.",
  MATERIALIZATION_STARTED: "Rating calculation started.",
} as const;
