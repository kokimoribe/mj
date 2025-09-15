import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT /api/games/[gameId]/scores - Update player scores (for testing)
export async function PUT(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const supabase = await createClient();
    const { gameId } = params;
    const scores = await request.json();

    // Get the last hand or create initial state
    const { data: lastHand } = await supabase
      .from("hands")
      .select("*")
      .eq("game_id", gameId)
      .order("hand_number", { ascending: false })
      .limit(1)
      .single();

    if (lastHand) {
      // Update the last hand's scores_after
      const { error } = await supabase
        .from("hands")
        .update({ scores_after: scores })
        .eq("id", lastHand.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // No hands yet, store in game metadata or first hand
      // For now, we'll just return success
      // In a real implementation, you might want to store this differently
    }

    return NextResponse.json({
      success: true,
      scores,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/games/[gameId] - Get game details
export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const supabase = await createClient();
    const { gameId } = params;

    const { data: game, error } = await supabase
      .from("games")
      .select(
        `
        *,
        game_seats (
          *,
          player:players (
            id,
            display_name
          )
        ),
        hands (
          id,
          hand_number,
          scores_after
        )
      `
      )
      .eq("id", gameId)
      .single();

    if (error || !game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Get current scores from last hand or initial scores
    const lastHand = game.hands?.sort(
      (a: any, b: any) => b.hand_number - a.hand_number
    )[0];

    const scores =
      lastHand?.scores_after ||
      game.game_seats.reduce((acc: any, seat: any) => {
        acc[seat.player.id] = 25000;
        return acc;
      }, {});

    return NextResponse.json({
      ...game,
      scores,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
