/**
 * Configuration hash utilities
 * Generates deterministic SHA256 hashes for rating configurations
 */

import type { RatingConfiguration } from "@/stores/configStore";

/**
 * Sort object keys recursively to ensure consistent JSON stringification
 */
function sortObjectKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  const sorted: Record<string, unknown> = {};
  const record = obj as Record<string, unknown>;
  Object.keys(record)
    .sort()
    .forEach(key => {
      sorted[key] = sortObjectKeys(record[key]);
    });

  return sorted;
}

/**
 * Generate a deterministic hash for a rating configuration
 * Uses Web Crypto API in browser, falls back to Node crypto for SSR
 */
export async function generateConfigHash(
  config: RatingConfiguration
): Promise<string> {
  // Sort keys to ensure consistent hashing
  const sortedConfig = sortObjectKeys(config);
  const configString = JSON.stringify(sortedConfig);

  // Browser environment
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(configString);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
  }

  // Node environment (SSR)
  const cryptoModule = await import("crypto");
  return cryptoModule.createHash("sha256").update(configString).digest("hex");
}

/**
 * Get a short version of the hash suitable for URLs
 */
export function getShortHash(fullHash: string, length: number = 8): string {
  return fullHash.substring(0, length);
}

/**
 * Check if a string is a valid configuration hash
 */
export function isValidHash(hash: string): boolean {
  // SHA256 produces 64 character hex string
  return /^[a-f0-9]{64}$/i.test(hash) || /^[a-f0-9]{8,12}$/i.test(hash);
}
