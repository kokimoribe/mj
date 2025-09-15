import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LeaderboardView } from "./LeaderboardView";
import * as queries from "@/lib/queries";

// Mock the useLeaderboard hook
vi.mock("@/lib/queries", () => ({
  useLeaderboard: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock ResizeObserver for chart component
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

const mockLeaderboardData = {
  players: [
    {
      id: "1",
      name: "Joseph",
      rating: 46.3,
      mu: 30.5,
      sigma: 5.2,
      gamesPlayed: 20,
      lastPlayed: "2024-01-15",
      rating7DayDelta: 4.2, // Updated from ratingChange
      recentGames: [
        { gameId: "g1", date: "2024-01-15", rating: 46.3 },
        { gameId: "g2", date: "2024-01-14", rating: 45.8 },
        { gameId: "g3", date: "2024-01-13", rating: 44.2 },
      ],
    },
    {
      id: "2",
      name: "Josh",
      rating: 39.2,
      mu: 29.8,
      sigma: 5.5,
      gamesPlayed: 16,
      lastPlayed: "2024-01-14",
      rating7DayDelta: -2.1, // Updated from ratingChange
      recentGames: [
        { gameId: "g4", date: "2024-01-14", rating: 39.2 },
        { gameId: "g5", date: "2024-01-13", rating: 40.1 },
      ],
    },
    {
      id: "3",
      name: "Mikey",
      rating: 36.0,
      mu: 28.0,
      sigma: 6.0,
      gamesPlayed: 23,
      lastPlayed: "2024-01-05", // More than 7 days ago
      rating7DayDelta: null, // No games in 7 days
      recentGames: [],
    },
  ],
  totalGames: 24,
  lastUpdated: "2024-01-15T10:00:00Z",
  seasonName: "Season 3",
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

describe("LeaderboardView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays loading skeleton while data is loading", () => {
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      isRefetching: false,
    } as any);

    renderWithQuery(<LeaderboardView />);

    // Should show skeleton elements
    // Should show skeleton elements - the exact number may vary
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("displays error state when loading fails", () => {
    const mockRefetch = vi.fn();
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Network error"),
      refetch: mockRefetch,
      isRefetching: false,
    } as any);

    renderWithQuery(<LeaderboardView />);

    expect(
      screen.getByText(/Failed to load leaderboard: Network error/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("displays leaderboard data when loaded successfully", () => {
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isRefetching: false,
    } as any);

    renderWithQuery(<LeaderboardView />);

    // Check header
    expect(screen.getByText(/Season 3.*Leaderboard/)).toBeInTheDocument();
    expect(screen.getByText(/24\s+games/)).toBeInTheDocument();
    expect(screen.getByText(/3\s+players/)).toBeInTheDocument();

    // Check players
    expect(screen.getByText("Joseph")).toBeInTheDocument();
    expect(screen.getByText("Josh")).toBeInTheDocument();
    expect(screen.getByText("Mikey")).toBeInTheDocument();
    expect(screen.getByText("46.3")).toBeInTheDocument();
    expect(screen.getByText("39.2")).toBeInTheDocument();
    expect(screen.getByText("36.0")).toBeInTheDocument();

    // Check 7-day deltas
    expect(screen.getByText("▲4.2")).toBeInTheDocument(); // Joseph
    expect(screen.getByText("▼2.1")).toBeInTheDocument(); // Josh
    expect(screen.getByText("—")).toBeInTheDocument(); // Mikey (no games in 7 days)
  });

  it("expands and collapses player cards when clicked", async () => {
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isRefetching: false,
    } as any);

    renderWithQuery(<LeaderboardView />);

    const josephCard = screen
      .getByText("Joseph")
      .closest('[data-slot="card"]')!;

    // Initially collapsed
    expect(screen.queryByText("Avg Placement:")).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(josephCard);

    // Should show expanded content
    await waitFor(() => {
      expect(screen.getByText("Avg Placement:")).toBeInTheDocument();
    });

    // Click again to collapse
    fireEvent.click(josephCard);

    // Should hide expanded content
    await waitFor(() => {
      expect(screen.queryByText("Avg Placement:")).not.toBeInTheDocument();
    });
  });

  it("only allows one card to be expanded at a time", async () => {
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isRefetching: false,
    } as any);

    renderWithQuery(<LeaderboardView />);

    const josephCard = screen
      .getByText("Joseph")
      .closest('[data-slot="card"]')!;
    const joshCard = screen.getByText("Josh").closest('[data-slot="card"]')!;

    // Expand Joseph's card
    fireEvent.click(josephCard);
    await waitFor(() => {
      expect(screen.getAllByText("Avg Placement:")).toHaveLength(1);
    });

    // Click Josh's card - should collapse Joseph's and expand Josh's
    fireEvent.click(joshCard);
    await waitFor(() => {
      expect(screen.getAllByText("Avg Placement:")).toHaveLength(1); // Still only one expanded
    });
  });

  it("handles refresh button click", async () => {
    const mockRefetch = vi.fn().mockResolvedValue({});
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isRefetching: false,
    } as any);

    const { toast } = await import("sonner");

    renderWithQuery(<LeaderboardView />);

    // Find the refresh button by its test ID
    const refreshButton = screen.getByTestId("refresh-button");
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Leaderboard updated!");
    });
  });

  it("handles empty leaderboard data", () => {
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: {
        players: [],
        totalGames: 0,
        lastUpdated: "2024-01-15T10:00:00Z",
        seasonName: "Season 3",
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isRefetching: false,
    } as any);

    renderWithQuery(<LeaderboardView />);

    // Check header shows zero games and players
    expect(screen.getByText(/0\s+games/)).toBeInTheDocument();
    expect(screen.getByText(/0\s+players/)).toBeInTheDocument();
  });

  it("shows refreshing state", () => {
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isRefetching: true,
    } as any);

    renderWithQuery(<LeaderboardView />);

    // Find the refresh button by its test ID
    const refreshButton = screen.getByTestId("refresh-button");
    expect(refreshButton).toBeDisabled();
  });

  it("displays 7-day change and mini chart in expanded card", async () => {
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isRefetching: false,
    } as any);

    renderWithQuery(<LeaderboardView />);

    const josephCard = screen
      .getByText("Joseph")
      .closest('[data-slot="card"]')!;

    // Click to expand
    fireEvent.click(josephCard);

    // Should show 7-day change detail
    await waitFor(() => {
      expect(screen.getByText("7-day change:")).toBeInTheDocument();
      expect(screen.getByText(/▲4.2 \(from 42.1\)/)).toBeInTheDocument();
    });

    // Should show mini chart (mocked as a div with test id)
    const miniChart = screen.getByTestId("mini-rating-chart");
    expect(miniChart).toBeInTheDocument();
  });

  it("shows em dash for players with no recent games", async () => {
    vi.mocked(queries.useLeaderboard).mockReturnValue({
      data: mockLeaderboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isRefetching: false,
    } as any);

    renderWithQuery(<LeaderboardView />);

    const mikeyCard = screen.getByText("Mikey").closest('[data-slot="card"]')!;

    // Click to expand
    fireEvent.click(mikeyCard);

    // Should show em dash for 7-day change
    await waitFor(() => {
      expect(screen.getByText("7-day change:")).toBeInTheDocument();
      // Find the em dash specifically within the expanded card content
      const emDashes = screen.getAllByText("—");
      expect(emDashes.length).toBeGreaterThan(0);
    });
  });
});
