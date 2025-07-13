// Shared constants and configuration
export const PHASE_0_RATING_CONFIG = {
  // OpenSkill base parameters
  mu: 25.0,
  sigma: 8.333,
  beta: 4.167,
  tau: 0.0833,

  // Display rating calculation
  confidenceFactor: 2.0,

  // Mahjong margin-of-victory weighting
  weightDivisor: 40,
  weightMin: 0.5,
  weightMax: 1.5,

  // Season qualification rules
  minGamesForRanking: 8,
  worstGamesDropped: 2,

  // Plus-minus calculation (traditional Japanese scoring)
  oka: 20000,
  uma: [15000, 5000, -5000, -15000] as const,
} as const;

// Utility functions
export const calculateDisplayRating = (mu: number, sigma: number): number => {
  return mu - PHASE_0_RATING_CONFIG.confidenceFactor * sigma;
};

export const calculateWeightScale = (plusMinus: number): number => {
  const weight = 1 + plusMinus / PHASE_0_RATING_CONFIG.weightDivisor;
  return Math.max(
    PHASE_0_RATING_CONFIG.weightMin,
    Math.min(PHASE_0_RATING_CONFIG.weightMax, weight),
  );
};

export const calculatePlusMinus = (
  finalScore: number,
  finishPosition: number,
): number => {
  const umaBonus = PHASE_0_RATING_CONFIG.uma[finishPosition - 1]; // 1st=0, 2nd=1, etc.
  return finalScore - PHASE_0_RATING_CONFIG.oka + umaBonus;
};
