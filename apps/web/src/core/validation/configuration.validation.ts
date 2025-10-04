/**
 * Configuration Validation Rules
 *
 * Centralized validation logic for rating configurations.
 * Ensures data integrity and business rule compliance.
 */

import type { RatingConfiguration } from "@/stores/configStore";

/**
 * Validates that Uma values sum to zero
 * Uma is a zero-sum bonus/penalty system in Mahjong
 */
export function validateUmaValues(uma: number[]): boolean {
  const sum = uma.reduce((acc, val) => acc + val, 0);
  return sum === 0;
}

/**
 * Validates the entire rating configuration
 */
export function validateRatingConfiguration(config: RatingConfiguration): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate Uma values
  if (config.scoring?.uma) {
    if (!validateUmaValues(config.scoring.uma)) {
      errors.push("Uma values must sum to zero");
    }
    if (config.scoring.uma.length !== 4) {
      errors.push("Uma must have exactly 4 values");
    }
  }

  // Validate time range
  if (config.timeRange) {
    if (config.timeRange.startDate && config.timeRange.endDate) {
      const start = new Date(config.timeRange.startDate);
      const end = new Date(config.timeRange.endDate);

      if (start >= end) {
        errors.push("Start date must be before end date");
      }
    }
  }

  // Validate rating settings
  if (config.rating) {
    if (config.rating.initialMu < 0) {
      errors.push("Initial Mu must be non-negative");
    }
    if (config.rating.initialSigma < 0) {
      errors.push("Initial Sigma must be non-negative");
    }
    if (
      config.rating.confidenceFactor < 0 ||
      config.rating.confidenceFactor > 1
    ) {
      errors.push("Confidence factor must be between 0 and 1");
    }
  }

  // Validate scoring settings
  if (config.scoring) {
    if (config.scoring.oka < 0) {
      errors.push("Oka must be non-negative");
    }
  }

  // Validate weights
  if (config.weights) {
    const weights = Object.values(config.weights);
    if (weights.some(w => w < 0)) {
      errors.push("All weights must be non-negative");
    }
  }

  // Validate qualification settings
  if (config.qualification) {
    if (config.qualification.minGames < 0) {
      errors.push("Minimum games must be non-negative");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Configuration field constraints for UI validation
 */
export const CONFIG_CONSTRAINTS = {
  uma: {
    min: -100,
    max: 100,
    step: 5,
    tooltip: "Bonus/penalty points that must sum to zero",
  },
  startingScore: {
    min: 0,
    max: 100000,
    step: 1000,
    default: 25000,
    tooltip: "Points each player starts with",
  },
  returnScore: {
    min: 0,
    max: 100000,
    step: 1000,
    default: 30000,
    tooltip: "Target score for calculations",
  },
  initialRating: {
    min: 0,
    max: 5000,
    step: 100,
    default: 1500,
    tooltip: "Starting rating for new players",
  },
  minGames: {
    min: 0,
    max: 100,
    step: 1,
    default: 5,
    tooltip: "Minimum games to appear on leaderboard",
  },
} as const;
