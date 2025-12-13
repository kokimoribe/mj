import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface CreateGameRequest {
  players: {
    playerId: string;
    seat: "east" | "south" | "west" | "north";
  }[];
  startedAt?: string;
  tableType?: "automatic" | "manual";
  location?: string;
  notes?: string;
  /** Game format: hanchan (East+South) or tonpuusen (East only). Defaults to hanchan. */
  gameFormat?: "hanchan" | "tonpuusen";
}

export interface GameResponse {
  id: string;
  status: string;
  startedAt: string;
  /** Game format: hanchan (East+South) or tonpuusen (East only) */
  gameFormat: "hanchan" | "tonpuusen";
  players: {
    playerId: string;
    playerName: string;
    seat: string;
    finalScore: number | null;
  }[];
}

/**
 * POST /api/games - Create a new game
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse request body
    const body: CreateGameRequest = await request.json();
    const { players, startedAt, tableType, location, notes, gameFormat } = body;

    // Validate exactly 4 players
    if (!players || players.length !== 4) {
      return NextResponse.json(
        { error: "Exactly 4 players are required" },
        { status: 400 }
      );
    }

    // Validate unique seats
    const seats = players.map(p => p.seat);
    const uniqueSeats = new Set(seats);
    if (uniqueSeats.size !== 4) {
      return NextResponse.json(
        { error: "Each player must have a unique seat" },
        { status: 400 }
      );
    }

    // Validate unique players
    const playerIds = players.map(p => p.playerId);
    const uniquePlayerIds = new Set(playerIds);
    if (uniquePlayerIds.size !== 4) {
      return NextResponse.json(
        { error: "Each player must be unique" },
        { status: 400 }
      );
    }

    // Create the game
    const { data: game, error: gameError } = await supabase
      .from("games")
      .insert({
        started_at: startedAt || new Date().toISOString(),
        status: "ongoing",
        table_type: tableType || "automatic",
        location: location || "Host House",
        notes: notes || null,
        game_format: gameFormat || "hanchan",
      })
      .select()
      .single();

    if (gameError) {
      console.error("Failed to create game:", gameError);
      return NextResponse.json(
        { error: "Failed to create game", details: gameError.message },
        { status: 500 }
      );
    }

    // Create game seats for each player
    const seatInserts = players.map(p => ({
      game_id: game.id,
      player_id: p.playerId,
      seat: p.seat,
      final_score: null,
    }));

    const { error: seatsError } = await supabase
      .from("game_seats")
      .insert(seatInserts);

    if (seatsError) {
      console.error("Failed to create game seats:", seatsError);
      // Attempt to clean up the game
      await supabase.from("games").delete().eq("id", game.id);
      return NextResponse.json(
        { error: "Failed to create game seats", details: seatsError.message },
        { status: 500 }
      );
    }

    // Fetch player names for the response
    const { data: playerData } = await supabase
      .from("players")
      .select("id, display_name")
      .in("id", playerIds);

    const playerNameMap = new Map(
      playerData?.map(p => [p.id, p.display_name]) || []
    );

    const response: GameResponse = {
      id: game.id,
      status: game.status,
      startedAt: game.started_at,
      gameFormat: game.game_format || "hanchan",
      players: players.map(p => ({
        playerId: p.playerId,
        playerName: playerNameMap.get(p.playerId) || "Unknown",
        seat: p.seat,
        finalScore: null,
      })),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/games - List games (with optional filters)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    let query = supabase
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
      .order("started_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: games, error } = await query;

    if (error) {
      console.error("Failed to fetch games:", error);
      return NextResponse.json(
        { error: "Failed to fetch games" },
        { status: 500 }
      );
    }

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
