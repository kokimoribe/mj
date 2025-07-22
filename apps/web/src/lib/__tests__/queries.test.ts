import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePlayerProfile, useLeaderboard, useGameHistory } from "../queries";
import * as React from "react";

// Mock the Supabase queries module
vi.mock("../supabase/queries", () => ({
  fetchPlayerProfile: vi.fn(),
  fetchLeaderboardData: vi.fn(),
  fetchGameHistory: vi.fn(),
  fetchAllPlayers: vi.fn(),
  fetchPlayerGameCounts: vi.fn(),
}));

import * as supabaseQueries from "../supabase/queries";

describe("queries", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe("usePlayerProfile", () => {
    test("fetches player data from Supabase", async () => {
      const mockPlayerData = {
        id: "joseph",
        name: "Joseph",
        rating: 46.26,
        mu: 25.0,
        sigma: 8.33,
        gamesPlayed: 20,
        lastPlayed: "2025-07-06T18:34:24+00:00",
        rating7DayDelta: null,
        ratingHistory: [45.0, 45.5, 46.0, 46.26],
        recentGames: [],
      };

      vi.mocked(supabaseQueries.fetchPlayerProfile).mockResolvedValue(
        mockPlayerData
      );

      const { result } = renderHook(() => usePlayerProfile("joseph"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPlayerData);
      expect(supabaseQueries.fetchPlayerProfile).toHaveBeenCalledWith("joseph");
    });

    test("handles player profile fetch errors", async () => {
      const error = new Error("Failed to fetch player profile");
      vi.mocked(supabaseQueries.fetchPlayerProfile).mockRejectedValue(error);

      const { result } = renderHook(() => usePlayerProfile("joseph"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe("useLeaderboard", () => {
    test("fetches leaderboard data from Supabase", async () => {
      const mockLeaderboardData = {
        players: [
          {
            id: "player1",
            name: "Player 1",
            rating: 50.0,
            mu: 25.0,
            sigma: 8.33,
            gamesPlayed: 10,
            lastPlayed: "2025-07-06T18:34:24+00:00",
            rating7DayDelta: 2.5,
            ratingHistory: [],
            recentGames: [],
          },
        ],
        totalGames: 40,
        lastUpdated: "2025-07-06T18:34:24+00:00",
        seasonName: "Season 3",
      };

      vi.mocked(supabaseQueries.fetchLeaderboardData).mockResolvedValue(
        mockLeaderboardData
      );

      const { result } = renderHook(() => useLeaderboard(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockLeaderboardData);
      expect(supabaseQueries.fetchLeaderboardData).toHaveBeenCalled();
    });
  });

  describe("useGameHistory", () => {
    test("fetches game history with pagination", async () => {
      const mockGameData = {
        games: [
          {
            id: "game1",
            date: "2025-07-06T18:34:24+00:00",
            seasonId: "season_3_2024",
            results: [
              {
                playerId: "player1",
                playerName: "Player 1",
                placement: 1,
                rawScore: 30000,
                scoreAdjustment: 10000,
                ratingBefore: 45.0,
                ratingAfter: 47.5,
                ratingChange: 2.5,
              },
            ],
          },
        ],
        totalGames: 100,
        hasMore: true,
        showingAll: false,
      };

      vi.mocked(supabaseQueries.fetchGameHistory).mockResolvedValue(
        mockGameData
      );

      const { result } = renderHook(() => useGameHistory("player1", 0, 10), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockGameData);
      expect(supabaseQueries.fetchGameHistory).toHaveBeenCalledWith({
        playerId: "player1",
        offset: 0,
        limit: 10,
      });
    });
  });
});
