import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GameHistoryView } from "./GameHistoryView";
import * as queries from "@/lib/queries";

// Mock the hooks
vi.mock("@/lib/queries", () => ({
  useGameHistory: vi.fn(),
  useAllPlayers: vi.fn(),
  usePlayerGameCounts: vi.fn(),
}));

const mockGameHistory = {
  games: [
    {
      id: "1",
      date: "2024-01-15",
      seasonId: "season_3_2024",
      results: [
        {
          playerId: "1",
          playerName: "Joseph",
          placement: 1,
          rawScore: 48000,
          scoreAdjustment: 23000,
          ratingBefore: 1499,
          ratingAfter: 1524,
          ratingChange: 25,
        },
        {
          playerId: "2",
          playerName: "Josh",
          placement: 2,
          rawScore: 35000,
          scoreAdjustment: 10000,
          ratingBefore: 1478,
          ratingAfter: 1488,
          ratingChange: 10,
        },
        {
          playerId: "3",
          playerName: "Mikey",
          placement: 3,
          rawScore: 20000,
          scoreAdjustment: -5000,
          ratingBefore: 1405,
          ratingAfter: 1400,
          ratingChange: -5,
        },
        {
          playerId: "4",
          playerName: "Hyun",
          placement: 4,
          rawScore: -3000,
          scoreAdjustment: -28000,
          ratingBefore: 1330,
          ratingAfter: 1300,
          ratingChange: -30,
        },
      ],
    },
    {
      id: "2",
      date: "2024-01-14",
      seasonId: "season_3_2024",
      results: [
        {
          playerId: "5",
          playerName: "Alice",
          placement: 1,
          rawScore: 45000,
          scoreAdjustment: 20000,
          ratingBefore: 1480,
          ratingAfter: 1500,
          ratingChange: 20,
        },
        {
          playerId: "6",
          playerName: "Bob",
          placement: 2,
          rawScore: 30000,
          scoreAdjustment: 5000,
          ratingBefore: 1445,
          ratingAfter: 1450,
          ratingChange: 5,
        },
        {
          playerId: "7",
          playerName: "Charlie",
          placement: 3,
          rawScore: 15000,
          scoreAdjustment: -10000,
          ratingBefore: 1410,
          ratingAfter: 1400,
          ratingChange: -10,
        },
        {
          playerId: "8",
          playerName: "Diana",
          placement: 4,
          rawScore: 10000,
          scoreAdjustment: -15000,
          ratingBefore: 1315,
          ratingAfter: 1300,
          ratingChange: -15,
        },
      ],
    },
  ],
  totalGames: 2,
  hasMore: false,
  showingAll: true,
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Mock data for players and game counts
const mockPlayers = [
  { id: "1", display_name: "Joseph" },
  { id: "2", display_name: "Josh" },
  { id: "3", display_name: "Mikey" },
  { id: "4", display_name: "Hyun" },
  { id: "5", display_name: "Alice" },
  { id: "6", display_name: "Bob" },
  { id: "7", display_name: "Charlie" },
  { id: "8", display_name: "Diana" },
];

const mockGameCounts = {
  "1": 10,
  "2": 8,
  "3": 12,
  "4": 5,
  "5": 6,
  "6": 7,
  "7": 9,
  "8": 4,
};

// Helper to set up default mocks
const setupDefaultMocks = () => {
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
};

const renderWithQuery = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe("GameHistoryView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks();
  });

  it("displays loading state while fetching data", () => {
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    renderWithQuery(<GameHistoryView />);

    // Should show loading skeleton
    expect(screen.getByTestId("game-history-loading")).toBeInTheDocument();
  });

  it("displays error state when data fails to load", () => {
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load games"),
    } as any);

    renderWithQuery(<GameHistoryView />);

    expect(screen.getByText(/Failed to load game history/)).toBeInTheDocument();
  });

  it("displays game history when loaded", () => {
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: mockGameHistory,
      isLoading: false,
      error: null,
    } as any);

    renderWithQuery(<GameHistoryView />);

    // Check heading
    expect(screen.getByText("🎮 Game History")).toBeInTheDocument();

    // Check first game players
    expect(screen.getByText("Joseph")).toBeInTheDocument();
    expect(screen.getByText("Josh")).toBeInTheDocument();
    expect(screen.getByText("Mikey")).toBeInTheDocument();
    expect(screen.getByText("Hyun")).toBeInTheDocument();

    // Check placement medals
    expect(screen.getAllByText("🥇")).toHaveLength(2); // Two games with 1st place
    expect(screen.getAllByText("🥈")).toHaveLength(2);
    expect(screen.getAllByText("🥉")).toHaveLength(2);
    expect(screen.getAllByText("4️⃣")).toHaveLength(2);
  });

  it("formats scores correctly", () => {
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: mockGameHistory,
      isLoading: false,
      error: null,
    } as any);

    renderWithQuery(<GameHistoryView />);

    // Check formatted scores
    expect(screen.getByText("48,000")).toBeInTheDocument();
    expect(screen.getByText("35,000")).toBeInTheDocument();
    expect(screen.getByText("-3,000")).toBeInTheDocument();
  });

  it("displays plus/minus values", () => {
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: mockGameHistory,
      isLoading: false,
      error: null,
    } as any);

    renderWithQuery(<GameHistoryView />);

    // Check plus/minus values
    expect(screen.getByText("+23,000")).toBeInTheDocument();
    expect(screen.getByText("+10,000")).toBeInTheDocument();
    expect(screen.getByText("-5,000")).toBeInTheDocument();
    expect(screen.getByText("-28,000")).toBeInTheDocument();
  });

  it("handles empty game history", () => {
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: { games: [], totalGames: 0, hasMore: false, showingAll: true },
      isLoading: false,
      error: null,
    } as any);

    renderWithQuery(<GameHistoryView />);

    expect(screen.getByText("No games played yet")).toBeInTheDocument();
  });

  it("displays game dates with calendar icon", () => {
    vi.mocked(queries.useGameHistory).mockReturnValue({
      data: mockGameHistory,
      isLoading: false,
      error: null,
    } as any);

    renderWithQuery(<GameHistoryView />);

    // Check that calendar icons exist (one for each game)
    const calendarIcons = document.querySelectorAll('[class*="calendar"]');
    expect(calendarIcons.length).toBeGreaterThan(0);

    // Check that year 2024 is shown (at least once)
    const yearElements = screen.getAllByText(/2024/);
    expect(yearElements.length).toBeGreaterThan(0);
  });
});
