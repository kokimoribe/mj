import { NextRequest, NextResponse } from "next/server";
import { fetchPlayerAchievements } from "@/lib/supabase/queries";

/**
 * GET /api/achievements/players/:playerId - Fetch achievements for a specific player
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
    const { searchParams } = new URL(request.url);
    const seasonName = searchParams.get("season") || undefined;

    const achievements = await fetchPlayerAchievements(playerId, seasonName);

    return NextResponse.json({ achievements });
  } catch (error) {
    console.error("Error fetching player achievements:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch player achievements",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
