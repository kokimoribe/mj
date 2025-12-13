/**
 * Riichi Mahjong Point Calculation Utility
 *
 * Standard scoring tables for Japanese Riichi Mahjong.
 * All point values follow the standard Japanese scoring system.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface PointResult {
  /** Total points won (before honba bonus) */
  total: number;
  /** Points paid by each non-dealer when non-dealer wins by tsumo */
  nonDealerPays?: number;
  /** Points paid by dealer when non-dealer wins by tsumo */
  dealerPays?: number;
  /** Points paid by each player when dealer wins by tsumo */
  allPay?: number;
  /** The scoring tier name (e.g., "Mangan", "Haneman") */
  tier?: string;
}

export interface TsumoPointResult extends PointResult {
  /** For dealer tsumo: all three pay this amount */
  allPay: number;
  /** For non-dealer tsumo: what each non-dealer pays */
  nonDealerPays?: number;
  /** For non-dealer tsumo: what dealer pays */
  dealerPays?: number;
}

export interface RonPointResult extends PointResult {
  /** Total points paid by the loser */
  total: number;
}

// =============================================================================
// POINT LOOKUP TABLES
// =============================================================================

/**
 * Non-dealer (ko) ron points
 * Indexed by [han][fu]
 */
const NON_DEALER_RON: Record<number, Record<number, number>> = {
  1: {
    30: 1000,
    40: 1300,
    50: 1600,
    60: 2000,
    70: 2300,
    80: 2600,
    90: 2900,
    100: 3200,
    110: 3600,
  },
  2: {
    20: 1300, // Pinfu tsumo special case shown as ron equivalent
    25: 1600, // Chiitoitsu
    30: 2000,
    40: 2600,
    50: 3200,
    60: 3900,
    70: 4500,
    80: 5200,
    90: 5800,
    100: 6400,
    110: 7100,
  },
  3: {
    20: 2600,
    25: 3200, // Chiitoitsu
    30: 3900,
    40: 5200,
    50: 6400,
    60: 7700,
    // 70+ fu at 3 han is mangan
  },
  4: {
    20: 5200,
    25: 6400, // Chiitoitsu
    30: 7700,
    // 40+ fu at 4 han is mangan
  },
};

/**
 * Dealer (oya) ron points
 * Indexed by [han][fu]
 */
const DEALER_RON: Record<number, Record<number, number>> = {
  1: {
    30: 1500,
    40: 2000,
    50: 2400,
    60: 2900,
    70: 3400,
    80: 3900,
    90: 4400,
    100: 4800,
    110: 5300,
  },
  2: {
    20: 2000,
    25: 2400, // Chiitoitsu
    30: 2900,
    40: 3900,
    50: 4800,
    60: 5800,
    70: 6800,
    80: 7700,
    90: 8700,
    100: 9600,
    110: 10600,
  },
  3: {
    20: 3900,
    25: 4800, // Chiitoitsu
    30: 5800,
    40: 7700,
    50: 9600,
    60: 11600,
    // 70+ fu at 3 han is mangan
  },
  4: {
    20: 7700,
    25: 9600, // Chiitoitsu
    30: 11600,
    // 40+ fu at 4 han is mangan
  },
};

/**
 * Non-dealer tsumo points
 * Returns [nonDealerPays, dealerPays]
 * Indexed by [han][fu]
 */
const NON_DEALER_TSUMO: Record<number, Record<number, [number, number]>> = {
  1: {
    30: [300, 500],
    40: [400, 700],
    50: [400, 800],
    60: [500, 1000],
    70: [600, 1200],
    80: [700, 1300],
    90: [800, 1500],
    100: [800, 1600],
    110: [900, 1800],
  },
  2: {
    20: [400, 700],
    30: [500, 1000],
    40: [700, 1300],
    50: [800, 1600],
    60: [1000, 2000],
    70: [1200, 2300],
    80: [1300, 2600],
    90: [1500, 2900],
    100: [1600, 3200],
    110: [1800, 3600],
  },
  3: {
    20: [700, 1300],
    25: [800, 1600], // Chiitoitsu
    30: [1000, 2000],
    40: [1300, 2600],
    50: [1600, 3200],
    60: [2000, 3900],
    // 70+ fu at 3 han is mangan
  },
  4: {
    20: [1300, 2600],
    25: [1600, 3200], // Chiitoitsu
    30: [2000, 3900],
    // 40+ fu at 4 han is mangan
  },
};

/**
 * Dealer tsumo points (each player pays this amount)
 * Indexed by [han][fu]
 */
const DEALER_TSUMO: Record<number, Record<number, number>> = {
  1: {
    30: 500,
    40: 700,
    50: 800,
    60: 1000,
    70: 1200,
    80: 1300,
    90: 1500,
    100: 1600,
    110: 1800,
  },
  2: {
    20: 700,
    30: 1000,
    40: 1300,
    50: 1600,
    60: 2000,
    70: 2300,
    80: 2600,
    90: 2900,
    100: 3200,
    110: 3600,
  },
  3: {
    20: 1300,
    25: 1600, // Chiitoitsu
    30: 2000,
    40: 2600,
    50: 3200,
    60: 3900,
    // 70+ fu at 3 han is mangan
  },
  4: {
    20: 2600,
    25: 3200, // Chiitoitsu
    30: 3900,
    // 40+ fu at 4 han is mangan
  },
};

// =============================================================================
// LIMIT HAND THRESHOLDS
// =============================================================================

/** Mangan: 5 han, or 3 han 70+ fu, or 4 han 40+ fu */
const MANGAN = { nonDealerRon: 8000, dealerRon: 12000, tiers: "Mangan" };
/** Haneman: 6-7 han */
const HANEMAN = { nonDealerRon: 12000, dealerRon: 18000, tier: "Haneman" };
/** Baiman: 8-10 han */
const BAIMAN = { nonDealerRon: 16000, dealerRon: 24000, tier: "Baiman" };
/** Sanbaiman: 11-12 han */
const SANBAIMAN = { nonDealerRon: 24000, dealerRon: 36000, tier: "Sanbaiman" };
/** Yakuman: 13+ han or counted yakuman */
const YAKUMAN = { nonDealerRon: 32000, dealerRon: 48000, tier: "Yakuman" };

// =============================================================================
// MAIN CALCULATION FUNCTIONS
// =============================================================================

/**
 * Check if the hand qualifies for a limit hand (mangan+)
 */
function getLimitHand(
  han: number,
  fu: number
): { nonDealerRon: number; dealerRon: number; tier: string } | null {
  // Yakuman: 13+ han
  if (han >= 13) {
    return { ...YAKUMAN };
  }

  // Sanbaiman: 11-12 han
  if (han >= 11) {
    return { ...SANBAIMAN, tier: "Sanbaiman" };
  }

  // Baiman: 8-10 han
  if (han >= 8) {
    return { ...BAIMAN, tier: "Baiman" };
  }

  // Haneman: 6-7 han
  if (han >= 6) {
    return { ...HANEMAN, tier: "Haneman" };
  }

  // Mangan: 5 han
  if (han === 5) {
    return { ...MANGAN, tier: "Mangan" };
  }

  // Check for mangan by fu
  // 4 han 40+ fu = mangan
  if (han === 4 && fu >= 40) {
    return { ...MANGAN, tier: "Mangan" };
  }

  // 3 han 70+ fu = mangan
  if (han === 3 && fu >= 70) {
    return { ...MANGAN, tier: "Mangan" };
  }

  return null;
}

/**
 * Round up to the nearest 100
 */
function roundUp100(value: number): number {
  return Math.ceil(value / 100) * 100;
}

/**
 * Calculate ron points
 *
 * @param han - Number of han (yaku value)
 * @param fu - Number of fu (minipoints)
 * @param isDealer - Whether the winner is the dealer
 * @param honba - Number of honba (consecutive dealer wins/draws)
 * @returns Point result with total and optional tier
 */
export function calculateRonPoints(
  han: number,
  fu: number,
  isDealer: boolean,
  honba: number = 0
): RonPointResult {
  // Check for limit hand
  const limitHand = getLimitHand(han, fu);
  if (limitHand) {
    const base = isDealer ? limitHand.dealerRon : limitHand.nonDealerRon;
    return {
      total: base + honba * 300,
      tier: limitHand.tier,
    };
  }

  // Look up from tables
  const table = isDealer ? DEALER_RON : NON_DEALER_RON;
  const hanTable = table[han];

  if (!hanTable) {
    // Fallback to mangan if han not in table (shouldn't happen)
    const base = isDealer ? MANGAN.dealerRon : MANGAN.nonDealerRon;
    return { total: base + honba * 300, tier: "Mangan" };
  }

  // Find the closest fu value (round up to nearest valid fu)
  const validFu = Object.keys(hanTable)
    .map(Number)
    .sort((a, b) => a - b);
  const actualFu = validFu.find(f => f >= fu) || validFu[validFu.length - 1];

  const basePoints = hanTable[actualFu];
  if (!basePoints) {
    // Edge case - use mangan
    const base = isDealer ? MANGAN.dealerRon : MANGAN.nonDealerRon;
    return { total: base + honba * 300, tier: "Mangan" };
  }

  return {
    total: basePoints + honba * 300,
  };
}

/**
 * Calculate tsumo points
 *
 * @param han - Number of han (yaku value)
 * @param fu - Number of fu (minipoints)
 * @param isDealer - Whether the winner is the dealer
 * @param honba - Number of honba (consecutive dealer wins/draws)
 * @returns Point result with payment breakdown
 */
export function calculateTsumoPoints(
  han: number,
  fu: number,
  isDealer: boolean,
  honba: number = 0
): TsumoPointResult {
  const honbaBonus = honba * 100; // Each player pays 100 more per honba

  // Check for limit hand
  const limitHand = getLimitHand(han, fu);
  if (limitHand) {
    if (isDealer) {
      // Dealer tsumo: all three pay equal
      const allPay = limitHand.dealerRon / 3;
      return {
        total: limitHand.dealerRon + honba * 300,
        allPay: roundUp100(allPay) + honbaBonus,
        tier: limitHand.tier,
      };
    } else {
      // Non-dealer tsumo: dealer pays double
      const dealerPays = limitHand.nonDealerRon / 2;
      const nonDealerPays = limitHand.nonDealerRon / 4;
      return {
        total: limitHand.nonDealerRon + honba * 300,
        dealerPays: roundUp100(dealerPays) + honbaBonus,
        nonDealerPays: roundUp100(nonDealerPays) + honbaBonus,
        allPay: 0,
        tier: limitHand.tier,
      };
    }
  }

  // Look up from tables
  if (isDealer) {
    const table = DEALER_TSUMO;
    const hanTable = table[han];

    if (!hanTable) {
      // Fallback to mangan
      const allPay = MANGAN.dealerRon / 3;
      return {
        total: MANGAN.dealerRon + honba * 300,
        allPay: roundUp100(allPay) + honbaBonus,
        tier: "Mangan",
      };
    }

    const validFu = Object.keys(hanTable)
      .map(Number)
      .sort((a, b) => a - b);
    const actualFu = validFu.find(f => f >= fu) || validFu[validFu.length - 1];
    const allPay = hanTable[actualFu];

    if (!allPay) {
      const fallbackAllPay = MANGAN.dealerRon / 3;
      return {
        total: MANGAN.dealerRon + honba * 300,
        allPay: roundUp100(fallbackAllPay) + honbaBonus,
        tier: "Mangan",
      };
    }

    return {
      total: allPay * 3 + honba * 300,
      allPay: allPay + honbaBonus,
    };
  } else {
    const table = NON_DEALER_TSUMO;
    const hanTable = table[han];

    if (!hanTable) {
      // Fallback to mangan
      const dealerPays = MANGAN.nonDealerRon / 2;
      const nonDealerPays = MANGAN.nonDealerRon / 4;
      return {
        total: MANGAN.nonDealerRon + honba * 300,
        dealerPays: roundUp100(dealerPays) + honbaBonus,
        nonDealerPays: roundUp100(nonDealerPays) + honbaBonus,
        allPay: 0,
        tier: "Mangan",
      };
    }

    const validFu = Object.keys(hanTable)
      .map(Number)
      .sort((a, b) => a - b);
    const actualFu = validFu.find(f => f >= fu) || validFu[validFu.length - 1];
    const payments = hanTable[actualFu];

    if (!payments) {
      const dealerPays = MANGAN.nonDealerRon / 2;
      const nonDealerPays = MANGAN.nonDealerRon / 4;
      return {
        total: MANGAN.nonDealerRon + honba * 300,
        dealerPays: roundUp100(dealerPays) + honbaBonus,
        nonDealerPays: roundUp100(nonDealerPays) + honbaBonus,
        allPay: 0,
        tier: "Mangan",
      };
    }

    const [nonDealerPays, dealerPays] = payments;
    return {
      total: nonDealerPays * 2 + dealerPays + honba * 300,
      nonDealerPays: nonDealerPays + honbaBonus,
      dealerPays: dealerPays + honbaBonus,
      allPay: 0,
    };
  }
}

/**
 * Calculate points for a winning hand
 *
 * @param han - Number of han (yaku value)
 * @param fu - Number of fu (minipoints)
 * @param isDealer - Whether the winner is the dealer
 * @param isTsumo - Whether the win was by tsumo (self-draw)
 * @param honba - Number of honba (consecutive dealer wins/draws)
 * @returns Point result
 */
export function calculatePoints(
  han: number,
  fu: number,
  isDealer: boolean,
  isTsumo: boolean,
  honba: number = 0
): PointResult {
  if (isTsumo) {
    return calculateTsumoPoints(han, fu, isDealer, honba);
  } else {
    return calculateRonPoints(han, fu, isDealer, honba);
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the valid fu values for selection UI
 * Note: 20 fu is only valid for pinfu tsumo, 25 fu is for chiitoitsu
 */
export function getValidFuValues(): number[] {
  return [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110];
}

/**
 * Get the scoring tier name for a given han count
 */
export function getScoringTier(han: number, fu: number = 30): string | null {
  if (han >= 13) return "Yakuman";
  if (han >= 11) return "Sanbaiman";
  if (han >= 8) return "Baiman";
  if (han >= 6) return "Haneman";
  if (han >= 5) return "Mangan";
  if (han === 4 && fu >= 40) return "Mangan";
  if (han === 3 && fu >= 70) return "Mangan";
  return null;
}

/**
 * Format points for display (e.g., 8000 -> "8,000")
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}

/**
 * Calculate the delta for each player in a ron scenario
 *
 * @param winnerSeat - Seat of the winner ('east', 'south', 'west', 'north')
 * @param loserSeat - Seat of the loser
 * @param points - Total points won
 * @param riichiSticks - Number of riichi sticks on table (1000 points each)
 * @returns Record of seat to points delta
 */
export function calculateRonDeltas(
  winnerSeat: string,
  loserSeat: string,
  points: number,
  riichiSticks: number = 0
): Record<string, number> {
  const deltas: Record<string, number> = {
    east: 0,
    south: 0,
    west: 0,
    north: 0,
  };

  // Winner gains points + riichi sticks
  deltas[winnerSeat] = points + riichiSticks * 1000;
  // Loser pays all points
  deltas[loserSeat] = -points;

  return deltas;
}

/**
 * Calculate the delta for each player in a tsumo scenario
 *
 * @param winnerSeat - Seat of the winner
 * @param dealerSeat - Current dealer's seat
 * @param tsumoResult - Result from calculateTsumoPoints
 * @param riichiSticks - Number of riichi sticks on table
 * @returns Record of seat to points delta
 */
export function calculateTsumoDeltas(
  winnerSeat: string,
  dealerSeat: string,
  tsumoResult: TsumoPointResult,
  riichiSticks: number = 0
): Record<string, number> {
  const seats = ["east", "south", "west", "north"];
  const deltas: Record<string, number> = {
    east: 0,
    south: 0,
    west: 0,
    north: 0,
  };

  const isWinnerDealer = winnerSeat === dealerSeat;

  if (isWinnerDealer) {
    // Dealer tsumo: all three pay equal
    for (const seat of seats) {
      if (seat === winnerSeat) {
        deltas[seat] = tsumoResult.allPay * 3 + riichiSticks * 1000;
      } else {
        deltas[seat] = -tsumoResult.allPay;
      }
    }
  } else {
    // Non-dealer tsumo: dealer pays double
    for (const seat of seats) {
      if (seat === winnerSeat) {
        deltas[seat] = tsumoResult.total + riichiSticks * 1000;
      } else if (seat === dealerSeat) {
        deltas[seat] = -(tsumoResult.dealerPays || 0);
      } else {
        deltas[seat] = -(tsumoResult.nonDealerPays || 0);
      }
    }
  }

  return deltas;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Starting points for each player */
export const STARTING_POINTS = 25000;

/** Points needed to be in 1st place for oka calculation */
export const RETURN_POINTS = 30000;

/** Standard riichi bet */
export const RIICHI_BET = 1000;

/** Seats in wind order */
export const SEATS = ["east", "south", "west", "north"] as const;
export type Seat = (typeof SEATS)[number];

/** Round identifiers */
export const ROUNDS = ["E", "S", "W", "N"] as const;
export type Round = (typeof ROUNDS)[number];
