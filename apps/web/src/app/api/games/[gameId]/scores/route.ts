import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STARTING_POINTS, type Seat } from "@/lib/mahjong";

interface RouteContext {
  params: Promise<{ gameId: string }>;
}

export interface ScoresResponse {
  scores: Record<Seat, number>;
  riichiSticks: number;
  handCount: number;
}

/**
 * GET /api/games/[gameId]/scores - Calculate current scores from hand events
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { gameId } = await context.params;
    const supabase = await createClient();

    // Initialize scores at starting points
    const scores: Record<Seat, number> = {
      east: STARTING_POINTS,
      south: STARTING_POINTS,
      west: STARTING_POINTS,
      north: STARTING_POINTS,
    };

    // Fetch all hand events for this game
    const { data: hands, error } = await supabase
      .from("hand_events")
      .select("seat, points_delta, pot_delta, hand_seq")
      .eq("game_id", gameId)
      .order("hand_seq", { ascending: true });

    if (error) {
      console.error("Failed to fetch hand events:", error);
      return NextResponse.json(
        { error: "Failed to fetch hand events" },
        { status: 500 }
      );
    }

    // Calculate current scores by applying all point deltas
    // Track riichi sticks by summing pot_delta:
    // - Negative pot_delta = sticks added to pot (riichi declared)
    // - Positive pot_delta = sticks removed from pot (winner collected)
    let riichiSticksValue = 0; // Total value of riichi sticks on table
    const seenHandSeqs = new Set<number>();

    for (const hand of hands || []) {
      const seat = hand.seat as Seat;
      scores[seat] += hand.points_delta;

      // pot_delta tracks the flow of riichi sticks:
      // -1000 when declaring = +1 stick on table
      // +N*1000 when collecting = -N sticks from table
      riichiSticksValue -= hand.pot_delta;

      seenHandSeqs.add(hand.hand_seq);
    }

    // Convert value to stick count (each stick = 1000 points)
    const riichiSticks = Math.max(0, Math.round(riichiSticksValue / 1000));

    // Count unique hands
    const handCount = seenHandSeqs.size;

    const response: ScoresResponse = {
      scores,
      riichiSticks,
      handCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error calculating scores:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
