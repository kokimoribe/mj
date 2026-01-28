import { NextRequest, NextResponse } from "next/server";
import { fetchLeaderboardAchievements } from "@/lib/supabase/queries";

/**
 * GET /api/achievements/leaderboard - Fetch achievements for all players on leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configHash = searchParams.get("configHash") || undefined;

    const achievementsByPlayer = await fetchLeaderboardAchievements(configHash);

    return NextResponse.json({ achievementsByPlayer });
  } catch (error) {
    console.error("Error fetching leaderboard achievements:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch leaderboard achievements",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
