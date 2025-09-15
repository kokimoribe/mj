import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/games/[gameId]/hands/reconcile - Reconcile incomplete hands with final scores
export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const supabase = await createClient();
    const { gameId } = params;
    const body = await request.json();
    const { finalScores } = body;

    if (!finalScores) {
      return NextResponse.json(
        { error: "Missing finalScores" },
        { status: 400 }
      );
    }

    // Get all hands for the game
    const { data: hands, error: handsError } = await supabase
      .from("hands")
      .select(
        `
        *,
        hand_actions (*)
      `
      )
      .eq("game_id", gameId)
      .order("hand_number", { ascending: true });

    if (handsError) {
      return NextResponse.json({ error: handsError.message }, { status: 500 });
    }

    // Get game seats for player mapping
    const { data: gameSeats, error: seatsError } = await supabase
      .from("game_seats")
      .select(
        `
        *,
        player:players (
          id,
          display_name
        )
      `
      )
      .eq("game_id", gameId);

    if (seatsError) {
      return NextResponse.json({ error: seatsError.message }, { status: 500 });
    }

    // Find incomplete hands
    const incompleteHands =
      hands?.filter(
        h => !h.completed_at || h.hand_actions.some((a: any) => !a.player_id)
      ) || [];

    if (incompleteHands.length === 0) {
      return NextResponse.json({
        reconciled: true,
        message: "No incomplete hands to reconcile",
        inferred_hands: [],
      });
    }

    // Calculate total point movements from complete hands
    const completeHands =
      hands?.filter(
        h => h.completed_at && h.hand_actions.every((a: any) => a.player_id)
      ) || [];

    const startingScores =
      gameSeats?.reduce((acc: any, seat: any) => {
        acc[seat.player.id] = 25000;
        return acc;
      }, {}) || {};

    const currentScores = { ...startingScores };

    completeHands.forEach(hand => {
      hand.hand_actions.forEach((action: any) => {
        if (action.points_delta && action.player_id) {
          currentScores[action.player_id] += action.points_delta;
        }
      });
    });

    // Calculate the missing point movements
    const missingPoints: Record<string, number> = {};
    Object.keys(finalScores).forEach(playerId => {
      missingPoints[playerId] = finalScores[playerId] - currentScores[playerId];
    });

    // Attempt to infer incomplete hands based on patterns
    const inferredHands = incompleteHands.map(hand => {
      // Try to match unknown winners based on point patterns
      const possibleWinners = hand.hand_actions
        .filter((a: any) => a.action_type === "win" && !a.player_id)
        .map((a: any) => {
          // Find player with matching positive point delta
          const matchingPlayer = Object.keys(missingPoints).find(
            playerId =>
              Math.abs(missingPoints[playerId] - (a.points_delta || 0)) < 100
          );

          return {
            action_id: a.id,
            inferred_player_id: matchingPlayer,
            confidence: matchingPlayer ? 0.8 : 0.2,
          };
        });

      return {
        hand_id: hand.id,
        hand_number: hand.hand_number,
        inferred_winners: possibleWinners,
        notes: hand.notes,
      };
    });

    // Update hands with high-confidence inferences
    for (const inference of inferredHands) {
      const highConfidence = inference.inferred_winners.filter(
        (w: any) => w.confidence > 0.7
      );

      if (highConfidence.length > 0) {
        for (const winner of highConfidence) {
          if (winner.inferred_player_id) {
            await supabase
              .from("hand_actions")
              .update({
                player_id: winner.inferred_player_id,
                details: {
                  ...(await getActionDetails(supabase, winner.action_id)),
                  reconciled: true,
                  confidence: winner.confidence,
                },
              })
              .eq("id", winner.action_id);
          }
        }

        // Mark hand as completed
        await supabase
          .from("hands")
          .update({
            completed_at: new Date().toISOString(),
            notes: `${inference.notes || ""} [Reconciled with ${highConfidence[0].confidence * 100}% confidence]`,
          })
          .eq("id", inference.hand_id);
      }
    }

    return NextResponse.json({
      reconciled: true,
      inferred_hands: inferredHands,
      confidence_summary: {
        high_confidence: inferredHands.filter(h =>
          h.inferred_winners.some((w: any) => w.confidence > 0.7)
        ).length,
        low_confidence: inferredHands.filter(h =>
          h.inferred_winners.every((w: any) => w.confidence <= 0.7)
        ).length,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getActionDetails(supabase: any, actionId: string) {
  const { data } = await supabase
    .from("hand_actions")
    .select("details")
    .eq("id", actionId)
    .single();

  return data?.details || {};
}
