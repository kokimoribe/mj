#!/usr/bin/env node

/**
 * Debug script to test game history data fetching
 * This script directly calls the Supabase endpoint to check how many games are returned
 */

const SUPABASE_URL = "https://gqkfmwreyubvwbowxove.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxa2Ztd3JleXVidndib3d4b3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzODM4NDcsImV4cCI6MjA0Njk1OTg0N30.HS2e7pNQH9kCgqhgT-zVsKc1aTajAPTgFcFhg_PKpLo";

async function fetchGameHistory(userId, limit = 100, offset = 0) {
  console.log(`\n🔍 Fetching game history for user: ${userId}`);
  console.log(`   Limit: ${limit}, Offset: ${offset}`);

  try {
    // Get current season
    const seasonResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/seasons?season_ordinal=eq.0&select=*`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
      }
    );

    const seasons = await seasonResponse.json();
    const currentSeasonId = seasons[0]?.id;
    console.log(`📅 Current season ID: ${currentSeasonId}`);

    // Fetch games
    const url = `${SUPABASE_URL}/rest/v1/games?season_id=eq.${currentSeasonId}&select=*,game_players!inner(player_id,score,penalty_score,rank,combo_count,han,fu)&game_players.player_id=eq.${userId}&order=created_at.desc&limit=${limit}&offset=${offset}`;

    console.log(`📡 Request URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(
      `📊 Response headers:`,
      Object.fromEntries(response.headers.entries())
    );

    const data = await response.json();

    console.log(`\n✅ Results:`);
    console.log(`   Total games returned: ${data.length}`);
    console.log(`   First game created_at: ${data[0]?.created_at || "N/A"}`);
    console.log(
      `   Last game created_at: ${data[data.length - 1]?.created_at || "N/A"}`
    );

    // Check if there might be more games
    if (data.length === limit) {
      console.log(
        `\n⚠️  Returned exactly ${limit} games - there might be more!`
      );
    } else {
      console.log(
        `\n✅ Returned ${data.length} games - this appears to be all of them.`
      );
    }

    // Test pagination
    if (offset === 0 && data.length === limit) {
      console.log(`\n🔄 Testing pagination - fetching next batch...`);
      await fetchGameHistory(userId, limit, limit);
    }

    return data;
  } catch (error) {
    console.error("❌ Error fetching game history:", error);
  }
}

// Test with a sample user ID
// You can replace this with an actual user ID from your database
const TEST_USER_ID = "b982be7f-24f9-4065-b5b0-f965dd3b9a55"; // Replace with a real user ID

console.log("🚀 Starting game history debug...\n");

// Test different limits
(async () => {
  // Test with limit 100
  await fetchGameHistory(TEST_USER_ID, 100, 0);

  // Test with limit 20 (default)
  console.log("\n" + "=".repeat(80) + "\n");
  await fetchGameHistory(TEST_USER_ID, 20, 0);
})();
