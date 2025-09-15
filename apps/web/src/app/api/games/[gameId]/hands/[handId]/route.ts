import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT /api/games/[gameId]/hands/[handId] - Update a hand
export async function PUT(
  request: NextRequest,
  { params }: { params: { gameId: string; handId: string } }
) {
  try {
    const supabase = await createClient();
    const { gameId, handId } = params;
    const body = await request.json();

    // Check if correction window expired (for testing, can be overridden)
    const afterWindow = request.nextUrl.searchParams.get("after_window");
    if (afterWindow === "true") {
      return NextResponse.json(
        { message: "Correction window expired" },
        { status: 403 }
      );
    }

    // Check if hand exists and is within correction window
    const { data: hand, error: handError } = await supabase
      .from("hands")
      .select("*")
      .eq("id", handId)
      .eq("game_id", gameId)
      .single();

    if (handError || !hand) {
      return NextResponse.json({ error: "Hand not found" }, { status: 404 });
    }

    // Check correction window (5 minutes)
    const createdAt = new Date(hand.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (diffMinutes > 5 && afterWindow !== "false") {
      return NextResponse.json(
        { message: "Correction window expired" },
        { status: 403 }
      );
    }

    const { actions } = body;

    // Validate point balance
    if (actions) {
      const totalPoints = actions.reduce(
        (sum: number, action: any) => sum + (action.points_delta || 0),
        0
      );

      if (Math.abs(totalPoints) > 0.01) {
        return NextResponse.json(
          { message: `Points do not balance to zero (${totalPoints})` },
          { status: 400 }
        );
      }
    }

    // Recalculate scores_after
    const { data: previousHand } = await supabase
      .from("hands")
      .select("scores_after")
      .eq("game_id", gameId)
      .lt("hand_number", hand.hand_number)
      .order("hand_number", { ascending: false })
      .limit(1)
      .single();

    const startingScores = previousHand?.scores_after || {};
    const scores_after = { ...startingScores };

    actions.forEach((action: any) => {
      if (action.points_delta && action.player_id) {
        scores_after[action.player_id] =
          (scores_after[action.player_id] || 25000) + action.points_delta;
      }
    });

    // Update hand
    const { error: updateError } = await supabase
      .from("hands")
      .update({
        scores_after,
        updated_at: new Date().toISOString(),
      })
      .eq("id", handId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Delete existing actions and insert new ones
    await supabase.from("hand_actions").delete().eq("hand_id", handId);

    const handActions = actions.map((action: any, index: number) => ({
      hand_id: handId,
      player_id: action.player_id,
      action_type: action.action_type,
      action_order: action.action_order || index + 1,
      points_delta: action.points_delta,
      riichi_stick_delta: action.riichi_stick_delta || 0,
      honba_stick_delta: action.honba_stick_delta || 0,
      target_player_id: action.target_player_id,
      details: action.details || {},
    }));

    const { error: actionsError } = await supabase
      .from("hand_actions")
      .insert(handActions);

    if (actionsError) {
      return NextResponse.json(
        { error: actionsError.message },
        { status: 500 }
      );
    }

    // Recalculate all subsequent hands
    await recalculateSubsequentHands(supabase, gameId, hand.hand_number);

    return NextResponse.json({
      hand_id: handId,
      scores_after,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/games/[gameId]/hands/[handId] - Delete a hand
export async function DELETE(
  request: NextRequest,
  { params }: { params: { gameId: string; handId: string } }
) {
  try {
    const supabase = await createClient();
    const { gameId, handId } = params;

    // Check if hand exists
    const { data: hand, error: handError } = await supabase
      .from("hands")
      .select("*")
      .eq("id", handId)
      .eq("game_id", gameId)
      .single();

    if (handError || !hand) {
      return NextResponse.json({ error: "Hand not found" }, { status: 404 });
    }

    // Check correction window (5 minutes)
    const createdAt = new Date(hand.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (diffMinutes > 5) {
      return NextResponse.json(
        { message: "Correction window expired" },
        { status: 403 }
      );
    }

    // Delete the hand (actions will cascade delete)
    const { error: deleteError } = await supabase
      .from("hands")
      .delete()
      .eq("id", handId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Recalculate subsequent hands
    await recalculateSubsequentHands(supabase, gameId, hand.hand_number - 1);

    return NextResponse.json({
      success: true,
      message: "Hand deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to recalculate scores for subsequent hands
async function recalculateSubsequentHands(
  supabase: any,
  gameId: string,
  afterHandNumber: number
) {
  // Get all hands after the specified hand number
  const { data: subsequentHands } = await supabase
    .from("hands")
    .select(
      `
      *,
      hand_actions (*)
    `
    )
    .eq("game_id", gameId)
    .gt("hand_number", afterHandNumber)
    .order("hand_number", { ascending: true });

  if (!subsequentHands || subsequentHands.length === 0) {
    return;
  }

  // Get the scores after the reference hand
  const { data: referenceHand } = await supabase
    .from("hands")
    .select("scores_after")
    .eq("game_id", gameId)
    .eq("hand_number", afterHandNumber)
    .single();

  let currentScores = referenceHand?.scores_after || {};

  // Recalculate each subsequent hand
  for (const hand of subsequentHands) {
    const newScores = { ...currentScores };

    hand.hand_actions.forEach((action: any) => {
      if (action.points_delta && action.player_id) {
        newScores[action.player_id] =
          (newScores[action.player_id] || 0) + action.points_delta;
      }
    });

    // Update the hand with new scores
    await supabase
      .from("hands")
      .update({ scores_after: newScores })
      .eq("id", hand.id);

    currentScores = newScores;
  }
}
