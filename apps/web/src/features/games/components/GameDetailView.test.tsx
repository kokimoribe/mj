import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameDetailView } from "./GameDetailView";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/components/ui/game-id-tooltip", () => ({
  GameIdTooltip: ({ gameId }: { gameId: string }) => (
    <span data-testid="game-id-tooltip">{gameId}</span>
  ),
}));

const finishedGame = {
  id: "game-1",
  started_at: "2024-01-15T14:00:00.000Z",
  finished_at: "2024-01-15T16:13:00.000Z",
  status: "finished",
  game_format: "hanchan",
  game_seats: [
    {
      seat: "east",
      player_id: "p1",
      final_score: 48000,
      players: { id: "p1", display_name: "Joseph" },
    },
    {
      seat: "south",
      player_id: "p2",
      final_score: 35000,
      players: { id: "p2", display_name: "Josh" },
    },
    {
      seat: "west",
      player_id: "p3",
      final_score: 20000,
      players: { id: "p3", display_name: "Mikey" },
    },
    {
      seat: "north",
      player_id: "p4",
      final_score: -3000,
      players: { id: "p4", display_name: "Hyun" },
    },
  ],
  handEvents: [],
};

describe("GameDetailView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => finishedGame,
      } as any)
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows start/end time and duration in the game details header when finished", async () => {
    render(<GameDetailView gameId="game-1" />);

    const dateRow = await screen.findByTestId("game-date");
    expect(dateRow).toHaveTextContent(/2024/);
    expect(dateRow).toHaveTextContent(" - ");
    expect(dateRow).toHaveTextContent("(2h 13m)");

    // Status badge should use the standardized completed label.
    expect(screen.getByText("Completed ✅")).toBeInTheDocument();
  });

  it("shows a single timestamp in the header when the game is ongoing", async () => {
    const ongoingGame = {
      ...finishedGame,
      id: "game-2",
      status: "ongoing",
      finished_at: null,
    };

    vi.mocked(globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ongoingGame,
    } as any);

    render(<GameDetailView gameId="game-2" />);

    const dateRow = await screen.findByTestId("game-date");
    expect(dateRow).toHaveTextContent(/2024/);
    expect(dateRow).not.toHaveTextContent(" - ");

    // Non-finished games display the raw status in a badge.
    expect(screen.getByText("ongoing")).toBeInTheDocument();
  });
});
