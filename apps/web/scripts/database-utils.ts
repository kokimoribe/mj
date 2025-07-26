#!/usr/bin/env tsx

/**
 * Consolidated database utility functions
 * Combines functionality from multiple database checking scripts
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Command line arguments
const command = process.argv[2];

async function checkSchema() {
  console.log("📊 Checking database schema...\n");

  try {
    // Get all tables
    const { data: tables, error: tablesError } =
      await supabase.rpc("get_table_info");

    if (tablesError) {
      // Fallback to checking known tables
      console.log("Using fallback method to check schema...");
      const knownTables = [
        "players",
        "games",
        "game_results",
        "cached_player_ratings",
        "cached_game_results",
        "season_configs",
      ];

      for (const table of knownTables) {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });

        if (!error) {
          console.log(`✅ Table '${table}' exists (${count} rows)`);
        } else {
          console.log(`❌ Table '${table}' error: ${error.message}`);
        }
      }
    } else {
      console.log("Database tables:");
      tables?.forEach((table: any) => {
        console.log(`- ${table.table_name}`);
      });
    }
  } catch (error) {
    console.error("Error checking schema:", error);
  }
}

async function checkData() {
  console.log("🔍 Checking database data...\n");

  try {
    // Check players
    const { data: players, count: playerCount } = await supabase
      .from("players")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(5);

    console.log(`Players: ${playerCount} total`);
    if (players?.length) {
      console.log("Recent players:", players.map(p => p.id).join(", "));
    }

    // Check games
    const { data: games, count: gameCount } = await supabase
      .from("games")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(5);

    console.log(`\nGames: ${gameCount} total`);
    if (games?.length) {
      console.log(
        "Recent games:",
        games
          .map(g => `${new Date(g.created_at).toLocaleDateString()}`)
          .join(", ")
      );
    }

    // Check cached data
    const { data: cachedRatings, count: cacheCount } = await supabase
      .from("cached_player_ratings")
      .select("*", { count: "exact" })
      .order("computed_at", { ascending: false })
      .limit(1);

    console.log(`\nCached ratings: ${cacheCount} total`);
    if (cachedRatings?.length) {
      console.log(`Last computed: ${cachedRatings[0].computed_at}`);
    }
  } catch (error) {
    console.error("Error checking data:", error);
  }
}

async function checkCacheTimestamps() {
  console.log("⏰ Checking cache timestamps...\n");

  try {
    const { data: ratings } = await supabase
      .from("cached_player_ratings")
      .select("computed_at, created_at, updated_at")
      .order("computed_at", { ascending: false })
      .limit(5);

    if (ratings?.length) {
      console.log("Latest cache timestamps:");
      ratings.forEach((r, i) => {
        console.log(`${i + 1}. Computed: ${r.computed_at}`);
        console.log(`   Created:  ${r.created_at}`);
        console.log(`   Updated:  ${r.updated_at}\n`);
      });

      // Check if cache is stale
      const latest = new Date(ratings[0].computed_at);
      const now = new Date();
      const hoursSinceUpdate =
        (now.getTime() - latest.getTime()) / (1000 * 60 * 60);

      if (hoursSinceUpdate > 24) {
        console.log(`⚠️  Cache is ${hoursSinceUpdate.toFixed(1)} hours old`);
      } else {
        console.log(`✅ Cache is ${hoursSinceUpdate.toFixed(1)} hours old`);
      }
    }
  } catch (error) {
    console.error("Error checking timestamps:", error);
  }
}

async function checkProduction() {
  console.log("🚀 Checking production data integrity...\n");

  try {
    // Check for data anomalies
    const { data: extremeDeltas } = await supabase
      .from("cached_game_results")
      .select(
        "player_id, game_id, mu_before, mu_after, sigma_before, sigma_after"
      )
      .filter("mu_after", "lt", -100)
      .limit(10);

    if (extremeDeltas?.length) {
      console.log(`⚠️  Found ${extremeDeltas.length} extreme rating deltas`);
      extremeDeltas.forEach(d => {
        const deltaMu = d.mu_after - d.mu_before;
        console.log(`  Player ${d.player_id}: Δμ = ${deltaMu.toFixed(2)}`);
      });
    } else {
      console.log("✅ No extreme rating deltas found");
    }

    // Check season configuration
    const { data: seasonConfig } = await supabase
      .from("season_configs")
      .select("*")
      .eq("is_active", true)
      .single();

    if (seasonConfig) {
      console.log(`\n✅ Active season: ${seasonConfig.name}`);
      console.log(`   Config hash: ${seasonConfig.config_hash}`);
    } else {
      console.log("\n❌ No active season found");
    }
  } catch (error) {
    console.error("Error checking production:", error);
  }
}

// Main execution
async function main() {
  console.log("🗄️  Database Utility Tool\n");

  switch (command) {
    case "schema":
      await checkSchema();
      break;
    case "data":
      await checkData();
      break;
    case "timestamps":
      await checkCacheTimestamps();
      break;
    case "production":
      await checkProduction();
      break;
    case "all":
      await checkSchema();
      console.log("\n" + "=".repeat(50) + "\n");
      await checkData();
      console.log("\n" + "=".repeat(50) + "\n");
      await checkCacheTimestamps();
      console.log("\n" + "=".repeat(50) + "\n");
      await checkProduction();
      break;
    default:
      console.log("Usage: tsx database-utils.ts [command]");
      console.log("\nCommands:");
      console.log("  schema      - Check database schema");
      console.log("  data        - Check data statistics");
      console.log("  timestamps  - Check cache timestamps");
      console.log("  production  - Check production data integrity");
      console.log("  all         - Run all checks");
  }
}

main().catch(console.error);
