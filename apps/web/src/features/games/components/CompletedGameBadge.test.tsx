import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompletedGameBadge } from "./CompletedGameBadge";

describe("CompletedGameBadge", () => {
  it("renders the baseline completed badge label and styling", () => {
    render(<CompletedGameBadge />);

    const badge = screen.getByText("Completed ✅");
    expect(badge).toHaveClass("border-green-500");
    expect(badge).toHaveClass("text-green-500");
  });
});
