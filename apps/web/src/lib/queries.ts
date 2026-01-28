import { useQuery } from "@tanstack/react-query";
import {
  fetchLeaderboardData,
  fetchPlayerProfile,
  fetchGameHistory,
  fetchAllPlayers,
  fetchPlayerGameCounts,
} from "./supabase/queries";
import { config } from "@/config";
import { useConfigStore } from "@/stores/configStore";

// Re-export types from supabase queries for consistency
export type {
  Player,
  LeaderboardData,
  Game,
  GameResult,
  GameHistoryData,
  Achievement,
  PlayerAchievement,
} from "./supabase/queries";

// Leaderboard queries - now using Supabase exclusively
export function useLeaderboard() {
  const activeConfig = useConfigStore(state => state.activeConfig);
  const configHash = activeConfig?.hash || config.season.hash;

  return useQuery({
    queryKey: ["leaderboard", configHash],
    queryFn: () => fetchLeaderboardData(configHash),
    staleTime: config.query.staleTime,
    gcTime: config.query.gcTime,
    retry: config.query.retryAttempts,
    networkMode: "offlineFirst",
  });
}

// Player profile queries
export function usePlayerProfile(playerId: string) {
  const activeConfig = useConfigStore(state => state.activeConfig);
  const configHash = activeConfig?.hash || config.season.hash;

  return useQuery({
    queryKey: ["player", playerId, configHash],
    queryFn: () => fetchPlayerProfile(playerId, configHash),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!playerId,
  });
}

// Game history queries
export function useGameHistory(playerId?: string, offset = 0, limit = 10) {
  const activeConfig = useConfigStore(state => state.activeConfig);
  const configHash = activeConfig?.hash || config.season.hash;

  return useQuery({
    queryKey: ["games", playerId, offset, limit, configHash],
    queryFn: () => fetchGameHistory({ playerId, offset, limit, configHash }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Query for all players (for filter dropdown)
export function useAllPlayers() {
  const activeConfig = useConfigStore(state => state.activeConfig);
  const configHash = activeConfig?.hash || config.season.hash;

  return useQuery({
    queryKey: ["players", "all", configHash],
    queryFn: () => fetchAllPlayers(configHash),
    staleTime: 10 * 60 * 1000, // 10 minutes for less frequently changing data
    gcTime: config.query.gcTime,
  });
}

// Query for player game counts
export function usePlayerGameCounts() {
  const activeConfig = useConfigStore(state => state.activeConfig);
  const configHash = activeConfig?.hash || config.season.hash;

  return useQuery({
    queryKey: ["players", "gameCounts", configHash],
    queryFn: () => fetchPlayerGameCounts(configHash),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Query for specific player's games
export function usePlayerGames(playerId: string, limit = 10) {
  const activeConfig = useConfigStore(state => state.activeConfig);
  const configHash = activeConfig?.hash || config.season.hash;

  return useQuery({
    queryKey: ["player", playerId, "games", limit, configHash],
    queryFn: async () => {
      // DEBUG usePlayerGames: Starting with playerId, limit, configHash
      const data = await fetchGameHistory({
        playerId,
        offset: 0,
        limit,
        configHash,
      });
      // DEBUG usePlayerGames: fetchGameHistory returned data

      // Convert playerId to UUID if needed (same logic as fetchGameHistory)
      let actualPlayerId = playerId;
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!uuidPattern.test(playerId)) {
        // For display names, we need to find the UUID from the results
        // Since fetchGameHistory already filtered to games with this player,
        // we can look at the first game's results to find the matching UUID
        const firstGame = data.games[0];
        if (firstGame) {
          const matchingResult = firstGame.results.find(
            r =>
              r.playerName &&
              r.playerName.toLowerCase() === playerId.toLowerCase()
          );
          if (matchingResult) {
            actualPlayerId = matchingResult.playerId;
            // DEBUG usePlayerGames: Converted display name to UUID
          }
        }
      }

      const processedGames = data.games
        .map((game, index) => {
          const playerResult = game.results.find(
            r => r.playerId === actualPlayerId
          );

          // Debug logging for playerId matching
          if (index < 3) {
            // Only log first 3 games to avoid spam
            // DEBUG usePlayerGames game info
          }

          if (!playerResult) return null;

          return {
            id: game.id,
            date: game.date,
            placement: playerResult.placement,
            score: playerResult.rawScore,
            ratingBefore: playerResult.ratingBefore,
            ratingAfter: playerResult.ratingAfter,
            ratingChange: playerResult.ratingChange,
            opponents: game.results
              .filter(r => r.playerId !== playerId)
              .map(r => ({
                id: r.playerId,
                name: r.playerName,
                placement: r.placement,
                score: r.rawScore,
              })),
          };
          // Note: scoreAdjustment (uma/oka) intentionally excluded from frontend
        })
        .filter((game): game is NonNullable<typeof game> => game !== null);

      // DEBUG usePlayerGames: Final result processed

      return processedGames;
    },
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
