import { useQuery } from "@tanstack/react-query";
import { hash } from "ohash";
import type { RatingConfiguration } from "@/stores/configStore";
import {
  fetchLeaderboardData,
  fetchPlayerProfile,
  fetchGameHistory,
  fetchAllPlayers,
  fetchPlayerGameCounts,
  type GameHistoryData,
} from "./supabase/queries";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://mj-skill-rating.vercel.app";
const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === "true"; // Feature flag for Supabase

export interface Player {
  id: string;
  name: string;
  rating: number;
  mu: number;
  sigma: number;
  gamesPlayed: number; // Single source of truth
  lastPlayed: string; // Single source of truth
  totalPlusMinus: number;
  averagePlusMinus: number;
  bestGame: number;
  worstGame: number;
  ratingChange?: number; // Rating change since last game
  ratingHistory?: number[]; // Array of historical ratings for sparkline
  rank?: number; // Calculated client-side from leaderboard position
  averagePlacement?: number; // Calculated on-demand
}

export interface LeaderboardData {
  players: Player[];
  totalGames: number;
  lastUpdated: string;
  seasonName: string;
}

export interface GameResult {
  id: string;
  date: string;
  players: Array<{
    name: string;
    placement: number;
    score: number;
    plusMinus: number;
    ratingDelta: number;
  }>;
}

// Leaderboard queries
export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async (): Promise<LeaderboardData> => {
      if (USE_SUPABASE) {
        return fetchLeaderboardData();
      }
      const response = await fetch(`${API_BASE_URL}/leaderboard`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data = await response.json();
      // Transform field names to match our interface
      return {
        ...data,
        players: data.players.map((p: any) => ({
          ...p,
          // Ensure we have the correct field names
          gamesPlayed: p.gamesPlayed ?? p.games ?? 0,
          lastPlayed:
            p.lastPlayed ?? p.lastGameDate ?? new Date().toISOString(),
          // Remove duplicate fields
          games: undefined,
          lastGameDate: undefined,
        })),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    networkMode: "offlineFirst",
  });
}

// Player profile queries
export function usePlayerProfile(playerId: string) {
  return useQuery({
    queryKey: ["player", playerId],
    queryFn: async (): Promise<Player> => {
      if (USE_SUPABASE) {
        return fetchPlayerProfile(playerId);
      }
      const response = await fetch(`${API_BASE_URL}/players/${playerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch player profile");
      }
      const data = await response.json();
      // Transform field names to match our interface
      return {
        ...data,
        // Ensure we have the correct field names
        gamesPlayed: data.gamesPlayed ?? data.games ?? 0,
        lastPlayed:
          data.lastPlayed ?? data.lastGameDate ?? new Date().toISOString(),
        // Remove duplicate fields
        games: undefined,
        lastGameDate: undefined,
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!playerId,
  });
}

// Player game history
export function usePlayerGames(playerId: string, limit: number = 5) {
  return useQuery({
    queryKey: ["player-games", playerId, limit],
    queryFn: async () => {
      const url = `${API_BASE_URL}/players/${playerId}/games?limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch player games");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!playerId,
  });
}

// Game history queries
export function useGameHistory(playerId?: string, offset = 0, limit = 10) {
  return useQuery({
    queryKey: ["games", playerId, offset, limit],
    queryFn: async (): Promise<GameHistoryData> => {
      if (USE_SUPABASE) {
        return fetchGameHistory({ playerId, offset, limit });
      }

      // Fallback to API endpoint
      const url = new URL(`${API_BASE_URL}/games`);
      if (limit) {
        url.searchParams.set("limit", limit.toString());
      }
      if (playerId) {
        url.searchParams.set("playerId", playerId);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch game history");
      }
      const data = await response.json();

      // Transform API data to match component expectations
      let transformedGames = (data.games || []).map((game: any) => ({
        id: game.id,
        date: game.date,
        results: game.players.map((player: any) => ({
          playerId: player.id || player.name.toLowerCase().replace(/\s+/g, "-"),
          playerName: player.name,
          placement: player.placement,
          rawScore: player.score,
          scoreAdjustment: player.plusMinus * 1000, // Convert to score adjustment
          ratingChange: player.ratingDelta || 0,
        })),
      }));

      // Client-side filtering if playerId is provided and API doesn't support it
      if (playerId && !USE_SUPABASE) {
        transformedGames = transformedGames.filter((game: any) =>
          game.results.some((result: any) => result.playerId === playerId)
        );
      }

      return {
        games: transformedGames,
        totalGames: transformedGames.length,
        hasMore: false,
        showingAll: false,
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Query for all players (for filter dropdown)
export function useAllPlayers() {
  return useQuery({
    queryKey: ["players", "all"],
    queryFn: async () => {
      if (USE_SUPABASE) {
        return fetchAllPlayers();
      }

      // Fallback - fetch from API
      const response = await fetch(`${API_BASE_URL}/leaderboard`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data = await response.json();
      return data.players.map((p: any) => {
        return {
          id: p.id || p.name.toLowerCase().replace(/\s+/g, "-"),
          name: p.name,
        };
      });
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  });
}

// Query for player game counts
export function usePlayerGameCounts() {
  return useQuery({
    queryKey: ["players", "gameCounts"],
    queryFn: async () => {
      if (USE_SUPABASE) {
        return fetchPlayerGameCounts();
      }

      // Fallback - fetch from API and calculate counts
      const response = await fetch(`${API_BASE_URL}/leaderboard`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data = await response.json();
      const counts: Record<string, number> = {};
      data.players.forEach((p: any) => {
        const playerId = p.id || p.name.toLowerCase().replace(/\s+/g, "-");
        counts[playerId] = p.games || 0;
      });
      return counts;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Configuration-based rating queries
export function createConfigHash(config: RatingConfiguration): string {
  return hash(config).substring(0, 12); // 12-char hash for readability
}

export function useConfigurationResults(config: RatingConfiguration) {
  const configHash = createConfigHash(config);

  return useQuery({
    queryKey: ["config-results", configHash],
    queryFn: async (): Promise<LeaderboardData> => {
      const response = await fetch(`${API_BASE_URL}/ratings/configuration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config_hash: configHash,
          configuration: config,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate configuration results");
      }
      return response.json();
    },
    staleTime: Infinity, // Configuration results never stale (hash-based)
    gcTime: 24 * 60 * 60 * 1000, // Keep for 24 hours
    enabled: !!config,
  });
}

// Statistics queries
export function useSeasonStats() {
  return useQuery({
    queryKey: ["season-stats"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/stats/season`);
      if (!response.ok) {
        throw new Error("Failed to fetch season statistics");
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}
