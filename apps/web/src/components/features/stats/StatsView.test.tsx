import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatsView } from "./StatsView";
import * as queries from "@/lib/queries";

// Mock the hooks
vi.mock("@/lib/queries", () => ({
  useSeasonStats: vi.fn(),
}));

const mockSeasonStats = {
  totalGames: 156,
  totalPlayers: 12,
  averageScore: 25000,
  highestScore: 67300,
  mostWins: {
    name: "Josh",
    count: 42,
  },
  biggestWinner: {
    name: "Joseph",
    plusMinus: 48000,
  },
  mostActivePlayer: {
    name: "Josh",
    gamesPlayed: 42,
  },
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

describe("StatsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays loading state while fetching data", () => {
    vi.mocked(queries.useSeasonStats).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    renderWithQuery(<StatsView />);

    // Should show skeleton loaders
    const skeletons = document.querySelectorAll('[data-testid="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("displays error state when data fails to load", () => {
    vi.mocked(queries.useSeasonStats).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load stats"),
    } as any);

    renderWithQuery(<StatsView />);

    expect(
      screen.getByText(/Failed to load season statistics/)
    ).toBeInTheDocument();
  });

  it("displays season overview when loaded", () => {
    vi.mocked(queries.useSeasonStats).mockReturnValue({
      data: mockSeasonStats,
      isLoading: false,
      error: null,
    } as any);

    renderWithQuery(<StatsView />);

    // Check season statistics title
    expect(screen.getByText("Season Statistics")).toBeInTheDocument();

    // Check season overview card
    expect(screen.getByText(/Season 3 Overview/)).toBeInTheDocument();

    // Check stats values are displayed
    expect(screen.getByText("156")).toBeInTheDocument(); // Total games
    expect(screen.getByText("12")).toBeInTheDocument(); // Active players
  });

  it("displays records and achievements section", () => {
    vi.mocked(queries.useSeasonStats).mockReturnValue({
      data: mockSeasonStats,
      isLoading: false,
      error: null,
    } as any);

    renderWithQuery(<StatsView />);

    // Check Records & Achievements section
    expect(screen.getByText("Records & Achievements")).toBeInTheDocument();

    // Check badges
    expect(screen.getByText("Biggest Win")).toBeInTheDocument();
    expect(screen.getByText("Most Games")).toBeInTheDocument();
    expect(screen.getByText("Best Streak")).toBeInTheDocument();
  });

  it("displays record holders", () => {
    vi.mocked(queries.useSeasonStats).mockReturnValue({
      data: mockSeasonStats,
      isLoading: false,
      error: null,
    } as any);

    renderWithQuery(<StatsView />);

    // Check that names appear (may be multiple times)
    const josephElements = screen.getAllByText("Joseph");
    expect(josephElements.length).toBeGreaterThan(0);

    // Check specific values
    expect(screen.getByText("+48,000")).toBeInTheDocument();
    // Josh appears multiple times (Most Wins and Most Games)
    const joshElements = screen.getAllByText("Josh");
    expect(joshElements.length).toBeGreaterThan(0);
    expect(screen.getByText("42 wins")).toBeInTheDocument();
  });

  it("displays exploration sections", () => {
    vi.mocked(queries.useSeasonStats).mockReturnValue({
      data: mockSeasonStats,
      isLoading: false,
      error: null,
    } as any);

    renderWithQuery(<StatsView />);

    // Check exploration sections
    expect(screen.getByText("Placement Analysis")).toBeInTheDocument();
    expect(
      screen.getByText("Hidden Gem: Seat Performance")
    ).toBeInTheDocument();
    expect(screen.getByText("Rating Mathematics")).toBeInTheDocument();
    expect(screen.getByText("Fun Facts & Curiosities")).toBeInTheDocument();
  });

  it("displays exploration section descriptions", () => {
    vi.mocked(queries.useSeasonStats).mockReturnValue({
      data: mockSeasonStats,
      isLoading: false,
      error: null,
    } as any);

    renderWithQuery(<StatsView />);

    // Check descriptions
    expect(
      screen.getByText("Who finishes where most often?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Does your starting position matter?")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "For the curious minds who want to understand the system"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Interesting patterns we.*ve discovered/)
    ).toBeInTheDocument();
  });

  it("handles missing data gracefully", () => {
    vi.mocked(queries.useSeasonStats).mockReturnValue({
      data: {
        totalGames: 0,
        totalPlayers: 0,
        biggestWinner: null,
        mostActivePlayer: null,
      },
      isLoading: false,
      error: null,
    } as any);

    renderWithQuery(<StatsView />);

    // Should still show the main title
    expect(screen.getByText("Season Statistics")).toBeInTheDocument();

    // Should show zero stats
    const zeroElements = screen.getAllByText("0");
    expect(zeroElements.length).toBeGreaterThanOrEqual(2); // At least 2 zeros (games and players)
    expect(screen.getByText("Total Games")).toBeInTheDocument();
    expect(screen.getByText("Active Players")).toBeInTheDocument();
  });
});
