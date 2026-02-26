import { describe, it, expect } from "vitest";
import {
  calculateMultiRonDeltas,
  getWinnersByTurnOrderFromLoser,
} from "./points";

describe("multi ron helpers", () => {
  it("orders winners by counter-clockwise turn order from loser", () => {
    const ordered = getWinnersByTurnOrderFromLoser("east", ["west", "south"]);
    expect(ordered).toEqual(["south", "west"]);
  });

  it("applies full loser payment and gives riichi sticks to nearest winner", () => {
    const deltas = calculateMultiRonDeltas(
      ["south", "west"],
      "east",
      {
        south: 3900,
        west: 7700,
      },
      2
    );

    expect(deltas).toEqual({
      east: -11600,
      south: 5900,
      west: 7700,
      north: 0,
    });
  });
});
