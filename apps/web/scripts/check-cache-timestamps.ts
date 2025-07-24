import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCacheTimestamps() {
  console.log("Checking cache timestamps...\n");

  try {
    // Check cached_player_ratings table
    console.log("1. Checking cached_player_ratings table:");
    const { data: cachedRatings, error: cachedError } = await supabase
      .from("cached_player_ratings")
      .select("computed_at, created_at, updated_at")
      .order("computed_at", { ascending: false })
      .limit(5);

    if (cachedError) {
      console.error("Error fetching cached_player_ratings:", cachedError);
    } else if (cachedRatings && cachedRatings.length > 0) {
      console.log("Latest entries:");
      cachedRatings.forEach((entry, index) => {
        console.log(`  Entry ${index + 1}:`);
        console.log(`    computed_at: ${entry.computed_at}`);
        console.log(`    created_at:  ${entry.created_at}`);
        console.log(`    updated_at:  ${entry.updated_at}`);
      });

      // Check if there's any data from today
      const today = new Date().toISOString().split("T")[0];
      const todayData = cachedRatings.filter(
        r => r.computed_at && r.computed_at.startsWith(today)
      );
      console.log(`\n  Entries from today (${today}): ${todayData.length}`);
    } else {
      console.log("  No data found in cached_player_ratings table");
    }

    // Check cache_metadata table if it exists
    console.log("\n2. Checking for cache_metadata table:");
    const { data: metadataTable } = await supabase
      .from("cache_metadata")
      .select("*")
      .limit(1);

    if (metadataTable) {
      const { data: metadata, error: metaError } = await supabase
        .from("cache_metadata")
        .select("*")
        .order("materialized_at", { ascending: false, nullsFirst: false })
        .limit(5);

      if (metaError) {
        console.error("Error fetching cache_metadata:", metaError);
      } else if (metadata && metadata.length > 0) {
        console.log("Latest metadata entries:");
        metadata.forEach((entry, index) => {
          console.log(`  Entry ${index + 1}:`, JSON.stringify(entry, null, 2));
        });
      }
    } else {
      console.log("  cache_metadata table does not exist");
    }

    // Check materialized views if they exist
    console.log("\n3. Checking for materialized views:");
    const { data: views, error: viewsError } = await supabase.rpc(
      "get_materialized_view_info",
      {}
    );

    if (viewsError) {
      // Try a different approach - check information_schema
      const { data: viewInfo, error: infoError } = await supabase
        .from("information_schema.views")
        .select("table_name")
        .like("table_name", "%material%")
        .limit(10);

      if (infoError) {
        console.log("  Could not retrieve materialized view information");
      } else if (viewInfo && viewInfo.length > 0) {
        console.log(
          '  Found views with "material" in name:',
          viewInfo.map(v => v.table_name).join(", ")
        );
      } else {
        console.log("  No materialized views found");
      }
    } else if (views) {
      console.log("  Materialized views:", views);
    }

    // Check the most recent game to understand data freshness
    console.log("\n4. Checking most recent game:");
    const { data: recentGames, error: gamesError } = await supabase
      .from("games")
      .select("game_id, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (gamesError) {
      console.error("Error fetching recent games:", gamesError);
    } else if (recentGames && recentGames.length > 0) {
      console.log("Latest games:");
      recentGames.forEach((game, index) => {
        console.log(`  Game ${index + 1}:`);
        console.log(`    game_id:    ${game.game_id}`);
        console.log(`    created_at: ${game.created_at}`);
        console.log(`    updated_at: ${game.updated_at}`);
      });
    }

    // Check for any custom timestamp columns
    console.log("\n5. Checking table structure of cached_player_ratings:");
    const { data: columns } = await supabase
      .rpc("get_table_columns", {
        table_name: "cached_player_ratings",
      })
      .select("*");

    if (columns) {
      console.log("  Columns:", columns);
    } else {
      // Fallback - just show a sample row
      const { data: sample } = await supabase
        .from("cached_player_ratings")
        .select("*")
        .limit(1);

      if (sample && sample.length > 0) {
        console.log("  Sample row columns:", Object.keys(sample[0]));
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the script
checkCacheTimestamps()
  .then(() => {
    console.log("\nTimestamp check completed.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Script failed:", error);
    process.exit(1);
  });
