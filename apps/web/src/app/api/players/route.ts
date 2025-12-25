import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizePlayerName } from "@/lib/utils";

export interface CreatePlayerRequest {
  display_name: string;
}

export interface PlayerResponse {
  id: string;
  display_name: string;
}

/**
 * POST /api/players - Create a new player
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse request body
    const body: CreatePlayerRequest = await request.json();
    const { display_name } = body;

    // Validate display_name
    if (!display_name || typeof display_name !== "string") {
      return NextResponse.json(
        { error: "display_name is required and must be a string" },
        { status: 400 }
      );
    }

    // Sanitize the name with comprehensive validation
    let sanitizedName: string;
    try {
      sanitizedName = sanitizePlayerName(display_name);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Invalid display_name format",
        },
        { status: 400 }
      );
    }

    // Check if player with this name already exists
    const { data: existingPlayer, error: checkError } = await supabase
      .from("players")
      .select("id, display_name")
      .eq("display_name", sanitizedName)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine
      console.error("Failed to check for existing player:", checkError);
      return NextResponse.json(
        {
          error: "Failed to check for existing player",
          details: checkError.message,
        },
        { status: 500 }
      );
    }

    if (existingPlayer) {
      // Player already exists, return it
      return NextResponse.json(
        {
          id: existingPlayer.id,
          display_name: existingPlayer.display_name,
        },
        { status: 200 }
      );
    }

    // Create the player
    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({
        display_name: sanitizedName,
        auth_user_id: null, // Anonymous player creation
        email: null,
        phone: null,
        timezone: "America/Los_Angeles",
        notification_preferences: {},
      })
      .select()
      .single();

    if (playerError) {
      console.error("Failed to create player:", playerError);
      return NextResponse.json(
        { error: "Failed to create player", details: playerError.message },
        { status: 500 }
      );
    }

    const response: PlayerResponse = {
      id: player.id,
      display_name: player.display_name,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
