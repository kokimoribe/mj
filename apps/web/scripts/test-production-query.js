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
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductionQuery() {
  console.log("🔍 Testing production query...\n");

  // Season configuration is now hardcoded in src/config/index.ts
  const currentSeasonConfigHash =
    "ad7252bdec25767b7eb12451ae30afbc1c7b5b1336c468ef833df7f632b34ba4";
  console.log(
    `🎯 Config hash from config (hardcoded): ${currentSeasonConfigHash.substring(0, 8)}...`
  );

  try {
    // Test 1: Query with hardcoded hash from config
    const { data: ratingsWithConfigHash, error: error1 } = await supabase
      .from("cached_player_ratings")
      .select("*")
      .eq("config_hash", currentSeasonConfigHash)
      .order("display_rating", { ascending: false });

    if (error1) {
      console.error("❌ Error with config hash:", error1);
    } else {
      console.log(
        `✅ Query with config hash (${currentSeasonConfigHash.substring(0, 8)}...): ${ratingsWithConfigHash?.length || 0} players`
      );
    }

    // Test 2: Query with fallback hash
    const { data: ratingsWithFallback, error: error2 } = await supabase
      .from("cached_player_ratings")
      .select("*")
      .eq("config_hash", "season_3_2024")
      .order("display_rating", { ascending: false });

    if (error2) {
      console.error("❌ Error with fallback hash:", error2);
    } else {
      console.log(
        `✅ Query with fallback hash ("season_3_2024"): ${ratingsWithFallback?.length || 0} players`
      );
    }

    // Test 3: Show all available hashes
    const { data: allRatings, error: error3 } = await supabase
      .from("cached_player_ratings")
      .select("config_hash");

    if (!error3 && allRatings) {
      const uniqueHashes = [...new Set(allRatings.map(r => r.config_hash))];
      console.log(`\n📊 Available config hashes in cached_player_ratings:`);
      uniqueHashes.forEach(hash => {
        console.log(`   - ${hash}`);
      });
    }

    // Test 4: Note about configuration
    console.log(`\n🔧 Configuration note:`);
    console.log(
      `   Season configuration is now hardcoded in src/config/index.ts`
    );
    console.log(`   No environment variables needed for season config`);
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

testProductionQuery();
