/**
 * String utility functions for formatting and sanitization
 */

/**
 * Maximum length for player display names
 */
const MAX_DISPLAY_NAME_LENGTH = 100;

/**
 * Minimum length for player display names (after sanitization)
 */
const MIN_DISPLAY_NAME_LENGTH = 1;

/**
 * Sanitizes and capitalizes a player name with comprehensive validation
 *
 * Handles:
 * - Trimming and normalizing whitespace
 * - Removing control characters (newlines, tabs, etc.)
 * - Length validation
 * - Proper capitalization
 * - Unicode normalization
 * - Preserving valid name characters (letters, spaces, apostrophes, hyphens, periods)
 *
 * @param str - The string to sanitize and capitalize
 * @returns The sanitized and capitalized string (e.g., "alice" -> "Alice", "alice smith" -> "Alice Smith")
 * @throws Error if the string is invalid or too short after sanitization
 */
export function sanitizePlayerName(str: string): string {
  if (!str || typeof str !== "string") {
    throw new Error("Name must be a non-empty string");
  }

  // Step 1: Remove control characters (newlines, tabs, carriage returns, etc.)
  // This prevents issues with display and potential injection attempts
  let sanitized = str.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

  // Step 2: Normalize Unicode (NFC form - canonical composition)
  // This ensures consistent representation of characters with accents
  sanitized = sanitized.normalize("NFC");

  // Step 3: Trim whitespace from start and end
  sanitized = sanitized.trim();

  // Step 4: Validate length before processing
  if (sanitized.length === 0) {
    throw new Error("Name cannot be empty or contain only whitespace");
  }

  if (sanitized.length > MAX_DISPLAY_NAME_LENGTH) {
    throw new Error(
      `Name must be ${MAX_DISPLAY_NAME_LENGTH} characters or less (got ${sanitized.length})`
    );
  }

  // Step 5: Normalize internal whitespace (multiple spaces -> single space)
  // Split on any whitespace sequence and rejoin with single spaces
  sanitized = sanitized.split(/\s+/).join(" ");

  // Step 6: Validate minimum length after whitespace normalization
  if (sanitized.length < MIN_DISPLAY_NAME_LENGTH) {
    throw new Error("Name must contain at least one non-whitespace character");
  }

  // Step 7: Capitalize each word properly
  // Preserve apostrophes, hyphens, and periods within names (e.g., "O'Brien", "Mary-Jane", "Dr. Smith")
  const words = sanitized.split(/\s+/);
  const capitalized = words
    .map(word => {
      if (word.length === 0) return word;

      // Handle words with internal punctuation (apostrophes, hyphens, periods)
      // Split on these characters but preserve them
      return word
        .split(/(['\-\.])/)
        .map(part => {
          // Skip punctuation marks
          if (["'", "-", "."].includes(part)) {
            return part;
          }
          // Capitalize the first letter, lowercase the rest
          if (part.length === 0) return part;
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join("");
    })
    .join(" ");

  return capitalized;
}

/**
 * Capitalizes the first letter of each word in a string
 * This is a simpler version that doesn't perform full sanitization.
 * Use sanitizePlayerName() for production use.
 *
 * @param str - The string to capitalize
 * @returns The capitalized string (e.g., "alice" -> "Alice", "alice smith" -> "Alice Smith")
 * @deprecated Use sanitizePlayerName() instead for better security and validation
 */
export function capitalizeName(str: string): string {
  if (!str || str.trim().length === 0) {
    return str;
  }

  return str
    .trim()
    .split(/\s+/) // Split on one or more whitespace characters
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
