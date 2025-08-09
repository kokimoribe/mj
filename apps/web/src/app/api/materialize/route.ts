import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RatingConfiguration } from "@/stores/configStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config_hash, configuration } = body;

    if (!config_hash || !configuration) {
      return NextResponse.json(
        { error: "Missing config_hash or configuration" },
        { status: 400 }
      );
    }

    // Validate configuration structure
    if (!isValidConfiguration(configuration)) {
      return NextResponse.json(
        { error: "Invalid configuration structure" },
        { status: 400 }
      );
    }

    // Check if data already exists
    const supabase = await createClient();
    const { data: existingData } = await supabase
      .from("cached_player_ratings")
      .select("player_id")
      .eq("config_hash", config_hash)
      .limit(1);

    if (existingData && existingData.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Data already exists for this configuration",
      });
    }

    // In a real implementation, this would trigger the Python rating engine
    // For now, we'll simulate the process

    // Store the configuration in the database
    const supabaseInsert = await createClient();
    const { error: insertError } = await supabaseInsert
      .from("rating_configurations")
      .upsert({
        config_hash,
        name: `Custom Config ${new Date().toISOString()}`,
        config_data: JSON.stringify(configuration),
        is_official: false,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Failed to store configuration:", insertError);
      return NextResponse.json(
        { error: "Failed to store configuration" },
        { status: 500 }
      );
    }

    // In production, this would:
    // 1. Queue a job for the Python rating engine
    // 2. The rating engine would process all games with the new configuration
    // 3. Results would be written to cached_player_ratings and cached_game_results

    // For development, you might want to manually trigger the Python script
    // or have a separate endpoint that the Python service can poll

    return NextResponse.json({
      success: true,
      message: "Materialization started. This may take a few minutes.",
    });
  } catch (error) {
    console.error("Materialization error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function isValidConfiguration(config: unknown): config is RatingConfiguration {
  if (!config || typeof config !== "object" || config === null) {
    return false;
  }

  const obj = config as Record<string, unknown>;

  // Time range validation
  if (
    !obj.timeRange ||
    typeof obj.timeRange !== "object" ||
    obj.timeRange === null
  ) {
    return false;
  }
  const timeRange = obj.timeRange as Record<string, unknown>;
  if (typeof timeRange.name !== "string") {
    return false;
  }

  // Rating validation
  if (!obj.rating || typeof obj.rating !== "object" || obj.rating === null) {
    return false;
  }
  const rating = obj.rating as Record<string, unknown>;
  if (
    typeof rating.initialMu !== "number" ||
    typeof rating.initialSigma !== "number" ||
    typeof rating.confidenceFactor !== "number" ||
    typeof rating.decayRate !== "number"
  ) {
    return false;
  }

  // Scoring validation
  if (!obj.scoring || typeof obj.scoring !== "object" || obj.scoring === null) {
    return false;
  }
  const scoring = obj.scoring as Record<string, unknown>;
  if (
    typeof scoring.oka !== "number" ||
    !Array.isArray(scoring.uma) ||
    scoring.uma.length !== 4 ||
    !scoring.uma.every(u => typeof u === "number")
  ) {
    return false;
  }

  // Weights validation
  if (!obj.weights || typeof obj.weights !== "object" || obj.weights === null) {
    return false;
  }
  const weights = obj.weights as Record<string, unknown>;
  if (
    typeof weights.divisor !== "number" ||
    typeof weights.min !== "number" ||
    typeof weights.max !== "number"
  ) {
    return false;
  }

  // Qualification validation
  if (
    !obj.qualification ||
    typeof obj.qualification !== "object" ||
    obj.qualification === null
  ) {
    return false;
  }
  const qualification = obj.qualification as Record<string, unknown>;
  if (
    typeof qualification.minGames !== "number" ||
    typeof qualification.dropWorst !== "number"
  ) {
    return false;
  }

  return true;
}
