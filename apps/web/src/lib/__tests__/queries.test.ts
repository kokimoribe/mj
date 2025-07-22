import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePlayerProfile } from "../queries";
import * as React from "react";

// Mock fetch
global.fetch = vi.fn();

describe("usePlayerProfile", () => {
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
  });

  test("transforms API response fields correctly", async () => {
    const mockApiResponse = {
      id: "joseph",
      name: "Joseph",
      rating: 46.26,
      mu: 25.0,
      sigma: 8.33,
      games: 20, // API returns 'games' instead of 'gamesPlayed'
      lastGameDate: "2025-07-06T18:34:24+00:00", // API returns 'lastGameDate' instead of 'lastPlayed'
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const { result } = renderHook(() => usePlayerProfile("joseph"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify the transformation worked correctly
    expect(result.current.data).toMatchObject({
      id: "joseph",
      name: "Joseph",
      rating: 46.26,
      gamesPlayed: 20, // Should be transformed from 'games'
      lastPlayed: "2025-07-06T18:34:24+00:00", // Should be transformed from 'lastGameDate'
    });

    // Verify duplicate fields are removed
    expect(result.current.data).not.toHaveProperty("games");
    expect(result.current.data).not.toHaveProperty("lastGameDate");
  });

  test("handles missing fields gracefully", async () => {
    const mockApiResponse = {
      id: "newplayer",
      name: "New Player",
      rating: 25.0,
      mu: 25.0,
      sigma: 8.33,
      // Missing 'games' and 'lastGameDate' fields
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const { result } = renderHook(() => usePlayerProfile("newplayer"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify defaults are applied
    expect(result.current.data).toMatchObject({
      id: "newplayer",
      name: "New Player",
      rating: 25.0,
      gamesPlayed: 0, // Should default to 0
      lastPlayed: expect.any(String), // Should default to current date ISO string
    });
  });
});
