/**
 * Centralized configuration for the application
 * All environment variables and config values should be accessed through this file
 */

export const config = {
  // Season configuration
  season: {
    hash: process.env.NEXT_PUBLIC_CURRENT_SEASON_CONFIG_HASH || "season_3_2024",
    name: process.env.NEXT_PUBLIC_CURRENT_SEASON_NAME || "Season 3",
  },

  // API configuration
  api: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },

  // React Query configuration
  query: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retryAttempts: 3,
  },

  // PWA configuration
  pwa: {
    name: "Riichi Tracker",
    shortName: "Riichi",
    description: "Track Riichi Mahjong ratings and games",
    themeColor: "#0a0a0a",
    backgroundColor: "#0a0a0a",
  },

  // Feature flags (for future use)
  features: {
    // All features from specs are enabled by default
    leaderboard: true,
    gameHistory: true,
    playerProfiles: true,
  },

  // Performance thresholds
  performance: {
    pageLoadTarget: 2000, // 2 seconds
    interactionTarget: 100, // 100ms
    refreshTarget: 500, // 500ms
  },
} as const;

// Type-safe config access
export type Config = typeof config;
