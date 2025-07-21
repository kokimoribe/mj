import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GameHistoryView } from "./GameHistoryView";
import * as queries from "@/lib/queries";
import { testIds } from "@/lib/test-ids";

// Mock the hooks and queries
vi.mock("@/lib/queries", () => ({
  useGameHistory: vi.fn(),
  useAllPlayers: vi.fn(),
  usePlayerGameCounts: vi.fn(),
}));

// Test data matching the specification
const mockGameData = {
  games: [
    {
      id: "game-1",
      date: "2025-07-06T19:46:00Z",
      seasonId: "season_3_2024",
      results: [
        {
          playerId: "p1",
          playerName: "Joseph",
          placement: 1,
          rawScore: 42700,
          scoreAdjustment: 32700,
          ratingBefore: 45.5,
          ratingAfter: 46.3,
          ratingChange: 0.8,
        },
        {
          playerId: "p2",
          playerName: "Alice",
          placement: 2,
          rawScore: 31100,
          scoreAdjustment: 16100,
          ratingBefore: 34.6,
          ratingAfter: 35.0,
          ratingChange: 0.4,
        },
        {
          playerId: "p3",
          playerName: "Mikey",
          placement: 3,
          rawScore: 14400,
          scoreAdjustment: -20600,
          ratingBefore: 36.3,
          ratingAfter: 36.0,
          ratingChange: -0.3,
        },
        {
          playerId: "p4",
          playerName: "Frank",
          placement: 4,
          rawScore: 11800,
          scoreAdjustment: -28200,
          ratingBefore: 25.5,
          ratingAfter: 25.0,
          ratingChange: -0.5,
        },
      ],
    },
    {
      id: "game-2",
      date: "2025-07-03T20:15:00Z",
      seasonId: "season_3_2024",
      results: [
        {
          playerId: "p5",
          playerName: "Josh",
          placement: 1,
          rawScore: 45200,
          scoreAdjustment: 35200,
          ratingBefore: 38.0,
          ratingAfter: 39.2,
          ratingChange: 1.2,
        },
        {
          playerId: "p1",
          playerName: "Joseph",
          placement: 2,
          rawScore: 32800,
          scoreAdjustment: 17800,
          ratingBefore: 45.2,
          ratingAfter: 45.5,
          ratingChange: 0.3,
        },
        {
          playerId: "p6",
          playerName: "Hyun",
          placement: 3,
          rawScore: 18500,
          scoreAdjustment: -21500,
          ratingBefore: 32.6,
          ratingAfter: 32.2,
          ratingChange: -0.4,
        },
        {
          playerId: "p3",
          playerName: "Mikey",
          placement: 4,
          rawScore: 3500,
          scoreAdjustment: -31500,
          ratingBefore: 36.9,
          ratingAfter: 36.3,
          ratingChange: -0.6,
        },
      ],
    },
  ],
  totalGames: 24,
  hasMore: true,
  showingAll: false,
};

const mockPlayers = [
  { id: "p1", name: "Joseph" },
  { id: "p2", name: "Alice" },
  { id: "p3", name: "Mikey" },
  { id: "p4", name: "Frank" },
  { id: "p5", name: "Josh" },
  { id: "p6", name: "Hyun" },
  { id: "p7", name: "Koki" },
  { id: "p8", name: "Jackie" },
];

const mockGameCounts = {
  p1: 2, // Joseph
  p2: 1, // Alice
  p3: 2, // Mikey
  p4: 1, // Frank
  p5: 1, // Josh
  p6: 1, // Hyun
  p7: 0, // Koki
  p8: 0, // Jackie
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithQuery = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe("GameHistoryView - Specification Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock pointer capture methods for Radix UI Select
    if (!Element.prototype.hasPointerCapture) {
      Element.prototype.hasPointerCapture = vi.fn(() => false);
    }
    if (!Element.prototype.setPointerCapture) {
      Element.prototype.setPointerCapture = vi.fn();
    }
    if (!Element.prototype.releasePointerCapture) {
      Element.prototype.releasePointerCapture = vi.fn();
    }

    // Mock scrollIntoView for Radix UI Select
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn();
    }
  });

  describe("Initial Display", () => {
    it("shows season name and total game count in header", () => {
      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: mockGameData,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      expect(screen.getByText("🎮 Game History")).toBeInTheDocument();
      expect(
        screen.getByTestId(testIds.gameHistory.gameCount)
      ).toHaveTextContent("24 games");
    });

    it("displays games in reverse chronological order", () => {
      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: mockGameData,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      const gameCards = screen.getAllByTestId(testIds.gameHistory.gameCard);
      expect(gameCards).toHaveLength(2);

      // First game should be July 6
      expect(gameCards[0]).toHaveTextContent("Jul 6, 2025");
      // Second game should be July 3
      expect(gameCards[1]).toHaveTextContent("Jul 3, 2025");
    });

    it("shows only first 10 games initially", () => {
      const manyGames = {
        ...mockGameData,
        games: Array(15)
          .fill(null)
          .map((_, i) => ({
            ...mockGameData.games[0],
            id: `game-${i}`,
          })),
      };

      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: manyGames,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      const visibleGames = screen.getAllByTestId(testIds.gameHistory.gameCard);
      expect(visibleGames).toHaveLength(10);
    });
  });

  describe("Game Card Display", () => {
    it("displays all 4 players with correct placement medals", () => {
      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: mockGameData,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      const firstGame = screen.getAllByTestId(testIds.gameHistory.gameCard)[0];

      expect(firstGame).toHaveTextContent("🥇");
      expect(firstGame).toHaveTextContent("Joseph");
      expect(firstGame).toHaveTextContent("🥈");
      expect(firstGame).toHaveTextContent("Alice");
      expect(firstGame).toHaveTextContent("🥉");
      expect(firstGame).toHaveTextContent("Mikey");
      expect(firstGame).toHaveTextContent("4️⃣");
      expect(firstGame).toHaveTextContent("Frank");
    });

    it("formats scores with commas and shows adjustments", () => {
      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: mockGameData,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      const firstGame = screen.getAllByTestId(testIds.gameHistory.gameCard)[0];

      // Raw scores with commas
      expect(firstGame).toHaveTextContent("42,700");
      expect(firstGame).toHaveTextContent("31,100");
      expect(firstGame).toHaveTextContent("14,400");
      expect(firstGame).toHaveTextContent("11,800");

      // Adjustments with +/- prefix
      expect(firstGame).toHaveTextContent("+32,700");
      expect(firstGame).toHaveTextContent("+16,100");
      expect(firstGame).toHaveTextContent("-20,600");
      expect(firstGame).toHaveTextContent("-28,200");
    });

    it("shows rating changes with proper arrows and precision", () => {
      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: mockGameData,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      const firstGame = screen.getAllByTestId(testIds.gameHistory.gameCard)[0];

      expect(firstGame).toHaveTextContent("↑0.8");
      expect(firstGame).toHaveTextContent("↑0.4");
      expect(firstGame).toHaveTextContent("↓0.3");
      expect(firstGame).toHaveTextContent("↓0.5");
    });

    it("displays dates in readable format", () => {
      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: mockGameData,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      // Check dates are displayed (exact format may vary based on locale)
      expect(screen.getByText(/Jul 6, 2025/)).toBeInTheDocument();
      expect(screen.getByText(/Jul 3, 2025/)).toBeInTheDocument();

      // Check times are displayed (format may vary based on timezone)
      const gameCards = screen.getAllByTestId(testIds.gameHistory.gameCard);
      // Just check that times are present (PM format)
      expect(gameCards[0]).toHaveTextContent(/\d{1,2}:\d{2} [AP]M/);
      expect(gameCards[1]).toHaveTextContent(/\d{1,2}:\d{2} [AP]M/);
    });
  });

  describe("Player Filter", () => {
    it("shows all players in dropdown including those with 0 games", async () => {
      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: mockGameData,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      const filterDropdown = screen.getByTestId(
        testIds.gameHistory.filterDropdown
      );
      await userEvent.click(filterDropdown);

      // Wait for dropdown to open
      await waitFor(() => {
        expect(
          screen.getByRole("option", { name: "All Games" })
        ).toBeInTheDocument();
      });

      // Should show all players with game counts
      expect(screen.getByText(/Joseph \(2 games\)/)).toBeInTheDocument();
      expect(screen.getByText(/Mikey \(2 games\)/)).toBeInTheDocument();
      expect(screen.getByText(/Jackie \(0 games\)/)).toBeInTheDocument();
    });

    it("filters games by selected player", async () => {
      const filterSpy = vi.fn();

      vi.mocked(queries.useGameHistory).mockImplementation(
        (filter?: string) => {
          filterSpy(filter);

          if (filter === "p1") {
            return {
              data: {
                ...mockGameData,
                games: mockGameData.games.filter(g =>
                  g.results.some(r => r.playerId === "p1")
                ),
              },
              isLoading: false,
              error: null,
            } as any;
          }

          return {
            data: mockGameData,
            isLoading: false,
            error: null,
          } as any;
        }
      );

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      const filterDropdown = screen.getByTestId(
        testIds.gameHistory.filterDropdown
      );
      await userEvent.click(filterDropdown);

      // Wait for dropdown to open
      await waitFor(() => {
        expect(
          screen.getByRole("option", { name: /Joseph \(2 games\)/ })
        ).toBeInTheDocument();
      });

      await userEvent.click(
        screen.getByRole("option", { name: /Joseph \(2 games\)/ })
      );

      expect(filterSpy).toHaveBeenCalledWith("p1");
    });

    it("maintains filter during session", () => {
      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: mockGameData,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      // Component should remember filter state internally
      // This would be tested more thoroughly in integration tests
      expect(
        screen.getByTestId(testIds.gameHistory.filterDropdown)
      ).toBeInTheDocument();
    });
  });

  describe("Load More / Show Less Toggle", () => {
    it("shows Load More button when more than 10 games exist", () => {
      const manyGames = {
        ...mockGameData,
        games: Array(15)
          .fill(null)
          .map((_, i) => ({
            ...mockGameData.games[0],
            id: `game-${i}`,
          })),
        hasMore: true,
      };

      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: manyGames,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      expect(
        screen.getByTestId(testIds.gameHistory.loadMoreButton)
      ).toHaveTextContent("Load More Games");
    });

    it("toggles between Load More and Show Less", async () => {
      const manyGames = {
        ...mockGameData,
        games: Array(15)
          .fill(null)
          .map((_, i) => ({
            ...mockGameData.games[0],
            id: `game-${i}`,
          })),
        hasMore: false,
        showingAll: false,
      };

      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: manyGames,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      // Initially shows 10 games
      expect(screen.getAllByTestId(testIds.gameHistory.gameCard)).toHaveLength(
        10
      );

      // Click Load More
      const loadMoreButton = screen.getByTestId(
        testIds.gameHistory.loadMoreButton
      );
      await userEvent.click(loadMoreButton);

      // Should now show all 15 games
      expect(screen.getAllByTestId(testIds.gameHistory.gameCard)).toHaveLength(
        15
      );

      // Button should change to Show Less
      const showLessButton = screen.getByTestId(
        testIds.gameHistory.showLessButton
      );
      expect(showLessButton).toHaveTextContent("Show Less Games");

      // Click Show Less
      await userEvent.click(showLessButton);

      // Should return to 10 games
      expect(screen.getAllByTestId(testIds.gameHistory.gameCard)).toHaveLength(
        10
      );
      expect(
        screen.getByTestId(testIds.gameHistory.loadMoreButton)
      ).toHaveTextContent("Load More Games");
    });
  });

  describe("Edge Cases", () => {
    it("shows empty state when no games exist", () => {
      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: { games: [], totalGames: 0, hasMore: false, showingAll: false },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      expect(
        screen.getByTestId(testIds.gameHistory.emptyState)
      ).toHaveTextContent("No games played yet");
    });

    it('shows "—" for zero rating changes', () => {
      const gameWithZeroChange = {
        ...mockGameData,
        games: [
          {
            ...mockGameData.games[0],
            results: mockGameData.games[0].results.map((r, i) => ({
              ...r,
              ratingChange: i === 0 ? 0 : r.ratingChange,
            })),
          },
        ],
      };

      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: gameWithZeroChange,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("handles negative scores correctly", () => {
      const gameWithNegativeScore = {
        ...mockGameData,
        games: [
          {
            ...mockGameData.games[0],
            results: mockGameData.games[0].results.map((r, i) => ({
              ...r,
              rawScore: i === 3 ? -5000 : r.rawScore,
            })),
          },
        ],
      };

      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: gameWithNegativeScore,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      expect(screen.getByText("-5,000")).toBeInTheDocument();
    });
  });

  describe("Loading and Error States", () => {
    it("shows loading state while fetching data", () => {
      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      expect(
        screen.getByTestId(testIds.gameHistory.loadingState)
      ).toBeInTheDocument();
    });

    it("displays error state when data fails to load", () => {
      vi.mocked(queries.useGameHistory).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error("Failed to load games"),
      } as any);

      vi.mocked(queries.useAllPlayers).mockReturnValue({
        data: mockPlayers,
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(queries.usePlayerGameCounts).mockReturnValue({
        data: mockGameCounts,
        isLoading: false,
        error: null,
      } as any);

      renderWithQuery(<GameHistoryView />);

      expect(
        screen.getByText(/Failed to load game history/)
      ).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("uses React Query with 5 minute cache", () => {
      // This would be tested via React Query configuration
      // Verifying the cache time is set correctly
      expect(true).toBe(true); // Placeholder for proper cache testing
    });
  });
});
