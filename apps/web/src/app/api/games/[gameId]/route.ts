import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ gameId: string }>;
}

export interface UpdateGameRequest {
  status?: "scheduled" | "ongoing" | "finished" | "cancelled";
  finishedAt?: string;
  notes?: string;
}

export interface FinalScore {
  seat: string;
  finalScore: number;
}

export interface FinishGameRequest {
  finalScores: FinalScore[];
}

/**
 * GET /api/games/[gameId] - Get a specific game with all details
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { gameId } = await context.params;
    const supabase = await createClient();

    // Fetch game with seats, players, and hand events
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select(
        `
        id,
        started_at,
        finished_at,
        status,
        table_type,
        location,
        notes,
        game_format,
        created_at,
        updated_at,
        game_seats (
          seat,
          player_id,
          final_score,
          players (
            id,
            display_name
          )
        )
      `
      )
      .eq("id", gameId)
      .single();

    if (gameError) {
      if (gameError.code === "PGRST116") {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }
      console.error("Failed to fetch game:", gameError);
      return NextResponse.json(
        { error: "Failed to fetch game" },
        { status: 500 }
      );
    }

    // Fetch hand events for this game
    const { data: handEvents, error: handError } = await supabase
      .from("hand_events")
      .select("*")
      .eq("game_id", gameId)
      .order("hand_seq", { ascending: true })
      .order("seat", { ascending: true });

    if (handError) {
      console.error("Failed to fetch hand events:", handError);
      // Don't fail the request, just return empty hands
    }

    return NextResponse.json({
      ...game,
      handEvents: handEvents || [],
    });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/games/[gameId] - Update game status or details
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { gameId } = await context.params;
    const supabase = await createClient();
    const body: UpdateGameRequest = await request.json();

    const updateData: Record<string, unknown> = {};

    if (body.status) {
      updateData.status = body.status;
      if (body.status === "finished") {
        updateData.finished_at = body.finishedAt || new Date().toISOString();
      }
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No update fields provided" },
        { status: 400 }
      );
    }

    const { data: game, error } = await supabase
      .from("games")
      .update(updateData)
      .eq("id", gameId)
      .select()
      .single();

    if (error) {
      console.error("Failed to update game:", error);
      return NextResponse.json(
        { error: "Failed to update game" },
        { status: 500 }
      );
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/games/[gameId] - Finish a game and record final scores
 * This is a convenience endpoint that updates both game status and final scores
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { gameId } = await context.params;
    const supabase = await createClient();
    const body: FinishGameRequest = await request.json();

    if (!body.finalScores || body.finalScores.length !== 4) {
      return NextResponse.json(
        { error: "Exactly 4 final scores are required" },
        { status: 400 }
      );
    }

    // Validate all seats are provided
    const requiredSeats = ["east", "south", "west", "north"];
    const providedSeats = body.finalScores.map(s => s.seat);
    const missingSeats = requiredSeats.filter(
      seat => !providedSeats.includes(seat)
    );

    if (missingSeats.length > 0) {
      return NextResponse.json(
        { error: `Missing final scores for seats: ${missingSeats.join(", ")}` },
        { status: 400 }
      );
    }

    // Update each seat's final score
    for (const score of body.finalScores) {
      const { error: seatError } = await supabase
        .from("game_seats")
        .update({ final_score: score.finalScore })
        .eq("game_id", gameId)
        .eq("seat", score.seat);

      if (seatError) {
        console.error(`Failed to update seat ${score.seat} score:`, seatError);
        return NextResponse.json(
          { error: `Failed to update score for ${score.seat}` },
          { status: 500 }
        );
      }
    }

    // Update game status to finished
    const { data: game, error: gameError } = await supabase
      .from("games")
      .update({
        status: "finished",
        finished_at: new Date().toISOString(),
      })
      .eq("id", gameId)
      .select()
      .single();

    if (gameError) {
      console.error("Failed to finish game:", gameError);
      return NextResponse.json(
        { error: "Failed to finish game" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Game finished successfully",
      game,
    });
  } catch (error) {
    console.error("Error finishing game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/games/[gameId] - Cancel a game by setting status to 'cancelled'
 * This preserves the game record but marks it as cancelled, excluding it from
 * game lists, materialization, and leaderboard counts. If we want to actually delete the game, we will need to setup a DELETE RLS policy on the 'games' table.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { gameId } = await context.params;
    const supabase = await createClient();

    // Check if game exists
    const { error: fetchError } = await supabase
      .from("games")
      .select("id, status")
      .eq("id", gameId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }
      console.error("Failed to fetch game:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch game" },
        { status: 500 }
      );
    }

    // Update game status to cancelled
    const { error: updateError } = await supabase
      .from("games")
      .update({ status: "cancelled" })
      .eq("id", gameId);

    if (updateError) {
      console.error("Failed to cancel game:", updateError);
      return NextResponse.json(
        { error: "Failed to cancel game" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Game cancelled successfully",
      gameId,
    });
  } catch (error) {
    console.error("Error cancelling game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
