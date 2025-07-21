import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExpandablePlayerCard } from "./ExpandablePlayerCard";

describe("ExpandablePlayerCard", () => {
  const mockPlayer = {
    id: "1",
    name: "Joseph",
    rating: 1524,
    mu: 30.5,
    sigma: 5.2,
    gamesPlayed: 42,
    lastPlayed: "2024-01-15",
    totalPlusMinus: 15000,
    averagePlusMinus: 357,
    bestGame: 48000,
    worstGame: -25000,
    ratingChange: 25,
  };

  const mockOnToggle = vi.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it("renders player basic information when collapsed", () => {
    render(
      <ExpandablePlayerCard
        player={mockPlayer}
        rank={1}
        isExpanded={false}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText("Joseph")).toBeInTheDocument();
    expect(screen.getByText("1524.0")).toBeInTheDocument();
    expect(screen.getByText("42 games")).toBeInTheDocument();
  });

  it("shows rating change indicator when rating increases", () => {
    render(
      <ExpandablePlayerCard
        player={mockPlayer}
        rank={2}
        isExpanded={false}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText("↑ 25.0")).toBeInTheDocument();
    // Find the element containing the rating change with green color
    const container = screen.getByText("↑ 25.0").closest(".text-green-600");
    expect(container).toBeInTheDocument();
  });

  it("shows rating change indicator when rating decreases", () => {
    const playerWithLoss = { ...mockPlayer, ratingChange: -15 };
    render(
      <ExpandablePlayerCard
        player={playerWithLoss}
        rank={3}
        isExpanded={false}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText("↓ 15.0")).toBeInTheDocument();
    // Find the element containing the rating change with red color
    const container = screen.getByText("↓ 15.0").closest(".text-red-600");
    expect(container).toBeInTheDocument();
  });

  it("calls onToggle when clicked", () => {
    render(
      <ExpandablePlayerCard
        player={mockPlayer}
        rank={1}
        isExpanded={false}
        onToggle={mockOnToggle}
      />
    );

    const card = screen.getByText("Joseph").closest('[data-slot="card"]')!;
    fireEvent.click(card);

    expect(mockOnToggle).toHaveBeenCalled();
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it("shows expanded content when isExpanded is true", () => {
    render(
      <ExpandablePlayerCard
        player={mockPlayer}
        rank={1}
        isExpanded={true}
        onToggle={mockOnToggle}
      />
    );

    // Check for expanded stats
    expect(screen.getByText("Avg Placement:")).toBeInTheDocument();
    expect(screen.getByText("Last Played:")).toBeInTheDocument();

    // Check for action button
    expect(screen.getByText("View Full Profile")).toBeInTheDocument();
  });

  it("handles players with no rating change", () => {
    const playerNoChange = { ...mockPlayer, ratingChange: undefined };
    render(
      <ExpandablePlayerCard
        player={playerNoChange}
        rank={1}
        isExpanded={false}
        onToggle={mockOnToggle}
      />
    );

    // Should show "↑ 0.0" for no change (still shown as positive)
    expect(screen.getByText("↑ 0.0")).toBeInTheDocument();
  });
});
