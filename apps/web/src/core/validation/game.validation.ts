/**
 * Game Validation Rules
 *
 * Centralized validation logic for game-related data.
 * Ensures game integrity and scoring accuracy.
 */

import { GAME_CONSTANTS } from "@/core/domain/constants";

/**
 * Validates game scores sum to the expected total
 */
export function validateScoresSum(
  scores: number[],
  expectedTotal: number
): boolean {
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.abs(sum - expectedTotal) < 0.01; // Allow for floating point errors
}

/**
 * Validates a complete game submission
 */
export interface GameValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateGameSubmission(data: {
  player_ids: string[];
  scores: number[];
  timestamp?: string;
}): GameValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate player count
  if (data.player_ids.length !== GAME_CONSTANTS.PLAYERS_PER_GAME) {
    errors.push(
      `Game must have exactly ${GAME_CONSTANTS.PLAYERS_PER_GAME} players`
    );
  }

  // Validate unique players
  const uniquePlayers = new Set(data.player_ids);
  if (uniquePlayers.size !== data.player_ids.length) {
    errors.push("All players must be unique");
  }

  // Validate scores count matches players
  if (data.scores.length !== data.player_ids.length) {
    errors.push("Number of scores must match number of players");
  }

  // Validate scores sum
  if (data.scores.length === GAME_CONSTANTS.PLAYERS_PER_GAME) {
    const expectedTotal =
      GAME_CONSTANTS.INITIAL_SCORE * GAME_CONSTANTS.PLAYERS_PER_GAME;
    if (!validateScoresSum(data.scores, expectedTotal)) {
      errors.push(`Scores must sum to ${expectedTotal}`);
    }
  }

  // Validate individual scores
  data.scores.forEach((score, index) => {
    if (score < -100000 || score > 200000) {
      errors.push(`Score for player ${index + 1} is out of reasonable range`);
    }
    if (score < 0) {
      warnings.push(`Player ${index + 1} has negative score`);
    }
  });

  // Validate timestamp if provided
  if (data.timestamp) {
    const date = new Date(data.timestamp);
    if (isNaN(date.getTime())) {
      errors.push("Invalid timestamp format");
    }
    if (date > new Date()) {
      warnings.push("Game timestamp is in the future");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates hand recording data
 */
export function validateHandRecording(data: {
  round: number;
  hand: number;
  winner_id?: string;
  loser_id?: string;
  points?: number;
  hand_type?: string;
}): GameValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate round number
  if (data.round < 1 || data.round > 4) {
    errors.push("Round must be between 1 and 4");
  }

  // Validate hand number
  if (data.hand < 1 || data.hand > 8) {
    warnings.push("Unusual hand number (typically 1-8)");
  }

  // Validate winner/loser relationship
  if (data.winner_id && data.loser_id) {
    if (data.winner_id === data.loser_id) {
      errors.push("Winner and loser cannot be the same player");
    }
  }

  // Validate points
  if (data.points !== undefined) {
    if (data.points < 0) {
      errors.push("Points cannot be negative");
    }
    if (data.points > 100000) {
      warnings.push("Unusually high point value");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Common score patterns for quick validation
 */
export const SCORE_PATTERNS = {
  // Common ending scores that sum correctly
  STANDARD_GAME: {
    total: 100000,
    valid_patterns: [
      [42000, 33000, 15000, 10000], // Typical distribution
      [50000, 30000, 15000, 5000], // Clear winner
      [35000, 30000, 25000, 10000], // Balanced game
    ],
  },
  MIN_VALID_SCORE: -30000,
  MAX_VALID_SCORE: 130000,
} as const;
