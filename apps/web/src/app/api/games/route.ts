import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/games - Create a new game
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { players, startingPoints = 25000 } = body;

    if (!players || players.length !== 4) {
      return NextResponse.json(
        { error: "Exactly 4 players required" },
        { status: 400 }
      );
    }

    // Create the game
    const { data: game, error: gameError } = await supabase
      .from("games")
      .insert({
        started_at: new Date().toISOString(),
        status: "ongoing",
      })
      .select()
      .single();

    if (gameError) {
      return NextResponse.json({ error: gameError.message }, { status: 500 });
    }

    // Create game seats
    const gameSeats = players.map((player: any) => ({
      game_id: game.id,
      seat: player.seat,
      player_id: player.id,
      final_score: null, // Game is ongoing
    }));

    const { error: seatsError } = await supabase
      .from("game_seats")
      .insert(gameSeats);

    if (seatsError) {
      // Rollback game creation
      await supabase.from("games").delete().eq("id", game.id);
      return NextResponse.json({ error: seatsError.message }, { status: 500 });
    }

    return NextResponse.json({
      id: game.id,
      status: game.status,
      started_at: game.started_at,
      players,
      startingPoints,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/games - Get all games
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: games, error } = await supabase
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
        )
      `
      )
      .order("started_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      games: games || [],
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
