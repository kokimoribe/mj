/**
 * Data validation utilities for handling edge cases
 */

/**
 * Safely format a numeric value, handling infinity, NaN, and other edge cases
 * @param value - The value to format
 * @param decimals - Number of decimal places
 * @param fallback - Fallback value if invalid (default: "--")
 * @returns Formatted string
 */
export function safeFormatNumber(
  value: number | null | undefined,
  decimals: number = 1,
  fallback: string = "--"
): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  // Check for invalid numeric values
  if (!isFinite(value) || isNaN(value)) {
    console.warn(`Invalid numeric value detected: ${value}`);
    return fallback;
  }

  return value.toFixed(decimals);
}

/**
 * Safely format a rating delta with directional indicator
 * @param delta - The rating change value
 * @param decimals - Number of decimal places
 * @returns Formatted string with ▲/▼/— indicator
 */
export function safeFormatDelta(
  delta: number | null | undefined,
  decimals: number = 1
): string {
  if (delta === null || delta === undefined) {
    return "—";
  }

  // Check for invalid numeric values
  if (!isFinite(delta) || isNaN(delta)) {
    console.warn(`Invalid delta value detected: ${delta}`);
    return "—";
  }

  if (delta === 0) {
    return "—";
  }

  const formatted = Math.abs(delta).toFixed(decimals);
  return delta > 0 ? `▲${formatted}` : `▼${formatted}`;
}

/**
 * Safely format game count, ensuring non-negative integer
 * @param count - The game count
 * @returns Formatted count or 0
 */
export function safeFormatGameCount(count: number | null | undefined): number {
  if (count === null || count === undefined) {
    return 0;
  }

  // Check for invalid numeric values
  if (!isFinite(count) || isNaN(count) || count < 0) {
    console.warn(`Invalid game count detected: ${count}`);
    return 0;
  }

  return Math.floor(count);
}

/**
 * Validate and sanitize player data
 * @param player - Player data to validate
 * @returns Sanitized player data
 */
import type { Player } from "@/lib/queries";

export function validatePlayerData(player: Player): Player {
  return {
    ...player,
    name: player.name || "Unknown Player",
    rating:
      typeof player.rating === "number" && isFinite(player.rating)
        ? player.rating
        : 0,
    gamesPlayed: safeFormatGameCount(player.gamesPlayed),
    rating7DayDelta:
      player.rating7DayDelta !== null &&
      player.rating7DayDelta !== undefined &&
      typeof player.rating7DayDelta === "number" &&
      isFinite(player.rating7DayDelta)
        ? player.rating7DayDelta
        : null,
    averagePlacement:
      player.averagePlacement !== null &&
      player.averagePlacement !== undefined &&
      typeof player.averagePlacement === "number" &&
      isFinite(player.averagePlacement) &&
      player.averagePlacement >= 1 &&
      player.averagePlacement <= 4
        ? player.averagePlacement
        : undefined,
  };
}

/**
 * Check if a value should be displayed or use fallback
 * @param value - Value to check
 * @returns Boolean indicating if value is valid for display
 */
export function isValidDisplayValue(value: unknown): boolean {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === "number" &&
    isFinite(value) &&
    !isNaN(value)
  );
}
