#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = join(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    const value = valueParts.join("=").replace(/^["']|["']$/g, "");
    env[key.trim()] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log("🔍 Checking Supabase database...\n");

  try {
    // 1. Check players table
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("*", { count: "exact" });

    if (playersError) {
      console.error("❌ Error fetching players:", playersError);
    } else {
      console.log(`👥 Players table: ${players?.length || 0} players`);
      if (players?.length > 0) {
        console.log(
          "   Sample players:",
          players
            .slice(0, 3)
            .map(p => p.display_name)
            .join(", ")
        );
      }
    }

    // 2. Check games table
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("*", { count: "exact" });

    if (gamesError) {
      console.error("❌ Error fetching games:", gamesError);
    } else {
      console.log(`🎮 Games table: ${games?.length || 0} games`);
      if (games?.length > 0) {
        const statuses = games.reduce((acc, game) => {
          acc[game.status] = (acc[game.status] || 0) + 1;
          return acc;
        }, {});
        console.log("   Status breakdown:", statuses);
      }
    }

    // 3. Check cached_player_ratings table
    const { data: cachedRatings, error: cachedError } = await supabase
      .from("cached_player_ratings")
      .select("*", { count: "exact" });

    if (cachedError) {
      console.error("❌ Error fetching cached ratings:", cachedError);
    } else {
      console.log(
        `📊 Cached player ratings: ${cachedRatings?.length || 0} entries`
      );

      // Check unique config_hash values
      if (cachedRatings?.length > 0) {
        const configHashes = [
          ...new Set(cachedRatings.map(r => r.config_hash)),
        ];
        console.log(`   Unique config hashes: ${configHashes.length}`);
        configHashes.forEach(hash => {
          const count = cachedRatings.filter(
            r => r.config_hash === hash
          ).length;
          console.log(`   - ${hash.substring(0, 8)}... : ${count} entries`);
        });
      }
    }

    // 4. Check rating_configurations table
    const { data: configs, error: configsError } = await supabase
      .from("rating_configurations")
      .select("*");

    if (configsError) {
      console.error("❌ Error fetching configurations:", configsError);
    } else {
      console.log(`⚙️  Rating configurations: ${configs?.length || 0}`);
      configs?.forEach(config => {
        console.log(
          `   - ${config.config_hash.substring(0, 8)}... : ${config.name} (${config.is_official ? "Official" : "Test"})`
        );
      });
    }

    // 5. Check current season hash from config (hardcoded)
    // Season configuration is now hardcoded in src/config/index.ts
    const currentSeasonHash =
      "ad7252bdec25767b7eb12451ae30afbc1c7b5b1336c468ef833df7f632b34ba4";
    console.log(
      `\n🎯 Current season hash from config: ${currentSeasonHash?.substring(0, 8)}...`
    );

    // 6. Check if cached data exists for current season
    if (currentSeasonHash && cachedRatings) {
      const currentSeasonData = cachedRatings.filter(
        r => r.config_hash === currentSeasonHash
      );
      console.log(
        `   Cached data for current season: ${currentSeasonData.length} entries`
      );

      if (currentSeasonData.length === 0) {
        console.log("\n⚠️  WARNING: No cached data found for current season!");
        console.log("   This might be why the application shows 0 players.");
      }
    }

    // 7. Check game_seats table
    const { data: gameSeats, error: gameSeatsError } = await supabase
      .from("game_seats")
      .select("*", { count: "exact" });

    if (gameSeatsError) {
      console.error("❌ Error fetching game seats:", gameSeatsError);
    } else {
      console.log(`💺 Game seats: ${gameSeats?.length || 0} entries`);
    }

    // 8. Check if we need to run materialization
    console.log("\n📋 Summary:");
    if (players?.length > 0 && games?.length > 0) {
      console.log("✅ Raw data exists in database");

      if (!cachedRatings || cachedRatings.length === 0) {
        console.log("❌ No cached ratings found - need to run materialization");
      } else if (
        currentSeasonHash &&
        !cachedRatings.some(r => r.config_hash === currentSeasonHash)
      ) {
        console.log(
          "❌ No cached ratings for current season - need to run materialization for current config"
        );
      } else {
        console.log("✅ Cached ratings exist");
      }
    } else {
      console.log("❌ Missing raw data in database");
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

checkDatabase();
