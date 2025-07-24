#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");

// Supabase configuration
const SUPABASE_URL = "https://soihuphdqgkbafozrzqn.supabase.co";
const SUPABASE_KEY = "sb_publishable_68r4JVAt-_ZMMausI3M7QQ_Tqrmu9mV";
const CONFIG_HASH =
  "ad7252bdec25767b7eb12451ae30afbc1c7b5b1336c468ef833df7f632b34ba4";

async function verifyGameCount() {
  console.log("=== Game Count Verification Script ===\n");
  console.log(`Config Hash: ${CONFIG_HASH}\n`);

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  let playerNames = {};

  try {
    // 1. Count actual finished games
    console.log(
      "1. Counting actual finished games from cached_game_results..."
    );
    const {
      data: gamesData,
      error: gamesError,
      count: gamesCount,
    } = await supabase
      .from("cached_game_results")
      .select("*", { count: "exact", head: true })
      .eq("config_hash", CONFIG_HASH);

    if (gamesError) {
      console.error("Error counting games:", gamesError);
      console.log(
        "   This might be due to table permissions. Tables might require authentication."
      );
    } else {
      console.log(`   Total games in cache: ${gamesCount}`);
    }

    // 2. Get some sample games to understand the data
    if (!gamesError) {
      const { data: sampleGames, error: sampleError } = await supabase
        .from("cached_game_results")
        .select("game_id, finished_at")
        .eq("config_hash", CONFIG_HASH)
        .order("finished_at", { ascending: false })
        .limit(5);

      if (!sampleError && sampleGames && sampleGames.length > 0) {
        console.log("\n   Recent games:");
        sampleGames.forEach(game => {
          console.log(
            `   - Game ${game.game_id}: finished at ${game.finished_at}`
          );
        });
      }
    }

    // 3. Query max games_played from cached_player_ratings
    console.log("\n2. Checking cached player ratings...");
    const { data: maxGamesData, error: maxGamesError } = await supabase
      .from("cached_player_ratings")
      .select("player_id, games_played, display_rating")
      .eq("config_hash", CONFIG_HASH)
      .order("games_played", { ascending: false })
      .limit(5);

    if (maxGamesError) {
      console.error("Error querying cached ratings:", maxGamesError);
      console.log(
        "   This might be due to table permissions. Tables might require authentication."
      );
    } else {
      const maxGamesPlayed = maxGamesData?.[0]?.games_played || 0;
      console.log(`   Max games_played in cache: ${maxGamesPlayed}`);

      // Show top players by games played
      if (maxGamesData && maxGamesData.length > 0) {
        // Get player names
        const playerIds = maxGamesData.map(p => p.player_id);
        const { data: playersInfo, error: playersError } = await supabase
          .from("players")
          .select("id, display_name")
          .in("id", playerIds);

        if (!playersError && playersInfo) {
          playersInfo.forEach(p => {
            playerNames[p.id] = p.display_name;
          });
        }

        console.log("\n   Top players by games played:");
        for (const player of maxGamesData) {
          const name = playerNames[player.player_id] || "Unknown";
          console.log(
            `   - ${name} (${player.player_id}): ${player.games_played} games, Rating: ${player.display_rating}`
          );
        }

        // Check actual games for the player with most games
        const topPlayerId = maxGamesData[0].player_id;
        console.log(`\n   Verifying actual games for player ${topPlayerId}...`);

        const {
          data: playerGames,
          error: playerGamesError,
          count: playerGamesCount,
        } = await supabase
          .from("cached_game_results")
          .select("*", { count: "exact", head: true })
          .eq("config_hash", CONFIG_HASH)
          .or(
            `player_east.eq.${topPlayerId},player_south.eq.${topPlayerId},player_west.eq.${topPlayerId},player_north.eq.${topPlayerId}`
          );

        if (!playerGamesError) {
          console.log(
            `   - Actual games found for this player: ${playerGamesCount}`
          );
          console.log(
            `   - Discrepancy for this player: ${maxGamesData[0].games_played - playerGamesCount}`
          );
        }
      }

      // 4. Get distribution of games_played values
      const { data: distribution, error: distError } = await supabase
        .from("cached_player_ratings")
        .select("games_played")
        .eq("config_hash", CONFIG_HASH);

      if (!distError && distribution) {
        // Group by games_played
        const counts = {};
        distribution.forEach(row => {
          counts[row.games_played] = (counts[row.games_played] || 0) + 1;
        });

        console.log("\n   Distribution of games_played values:");
        const sortedKeys = Object.keys(counts).sort(
          (a, b) => Number(b) - Number(a)
        );
        sortedKeys.slice(0, 10).forEach(key => {
          console.log(`   - ${key} games: ${counts[key]} players`);
        });
      }

      // 5. Compare and analyze
      if (!gamesError) {
        console.log("\n3. Analysis:");
        console.log(`   - Total games in cache: ${gamesCount}`);
        console.log(`   - Max games_played in ratings: ${maxGamesPlayed}`);
        console.log(`   - Discrepancy: ${maxGamesPlayed - gamesCount}`);

        if (maxGamesPlayed > gamesCount) {
          console.log(
            "\n   ⚠️  WARNING: Players show more games than exist in cache!"
          );
          console.log(
            "   This indicates a potential issue with the rating calculation or caching logic."
          );
        } else if (maxGamesPlayed < gamesCount) {
          console.log(
            "\n   ℹ️  Some games might not be counted in player ratings."
          );
          console.log(
            "   This could happen if some players haven't played all games."
          );
        } else {
          console.log("\n   ✅ Game counts match!");
        }
      }
    }

    // 6. Try to query actual games table if accessible
    console.log("\n4. Attempting to query actual games table...");
    const {
      data: actualGames,
      error: actualGamesError,
      count: actualGamesCount,
    } = await supabase
      .from("games")
      .select("*", { count: "exact", head: true })
      .not("finished_at", "is", null);

    if (actualGamesError) {
      console.log(
        "   Could not access games table (might require authentication)"
      );
    } else {
      console.log(
        `   Total finished games across all seasons: ${actualGamesCount}`
      );
    }

    // 7. Summary
    console.log("\n=== SUMMARY ===");
    console.log(`Season Config Hash: ${CONFIG_HASH}`);
    if (!gamesError && !maxGamesError) {
      console.log(`\nKey Findings:`);
      console.log(`1. Total games in cached_game_results table: ${gamesCount}`);
      console.log(
        `2. Maximum games_played for any player: ${maxGamesData?.[0]?.games_played || 0}`
      );

      const maxGames = maxGamesData?.[0]?.games_played || 0;
      if (maxGames > gamesCount) {
        console.log(
          `3. ERROR: Player shows ${maxGames - gamesCount} MORE games than exist!`
        );
        console.log(
          `\nConclusion: The cached_player_ratings table has INCORRECT game counts.`
        );
        console.log(
          `The player "${playerNames[maxGamesData[0].player_id]}" (${maxGamesData[0].player_id})`
        );
        console.log(
          `shows ${maxGames} games played, but there are only ${gamesCount} total games in the season.`
        );
        console.log(
          `\nThis is a critical data integrity issue that needs to be fixed.`
        );
      } else {
        console.log(
          `3. Player participation: ${maxGames} out of ${gamesCount} games (${((maxGames / gamesCount) * 100).toFixed(1)}%)`
        );
        console.log(`\nConclusion: The game counts appear to be CORRECT.`);
        console.log(
          `The most active player has participated in ${maxGames} out of ${gamesCount} total games.`
        );
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the verification
verifyGameCount().catch(console.error);
