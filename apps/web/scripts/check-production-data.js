const fetch = require("node-fetch");

async function checkProductionData() {
  console.log("=== CHECKING PRODUCTION DATA ===\n");

  // Check game history page
  console.log("1. Checking game history page...");
  try {
    const response = await fetch("https://mj-web-psi.vercel.app/games");
    const html = await response.text();

    // Check for uma/oka adjustments (should NOT be present)
    const hasUmaOka =
      html.includes("+15,000 pts") ||
      html.includes("+35,000 pts") ||
      html.includes("-15,000 pts") ||
      html.includes("→");

    console.log(
      `   Uma/Oka adjustments present: ${hasUmaOka ? "❌ YES" : "✅ NO"}`
    );

    // Check for NaN
    const hasNaN = html.includes("NaN");
    console.log(`   NaN values present: ${hasNaN ? "❌ YES" : "✅ NO"}`);
  } catch (error) {
    console.log("   Error fetching game history:", error.message);
  }

  // Check player profile
  console.log("\n2. Checking player profile page...");
  try {
    const response = await fetch(
      "https://mj-web-psi.vercel.app/player/e0f959ee-eb77-57de-b3af-acdecf679e70"
    );
    const html = await response.text();

    // Check for "need more games" message
    const needsMoreGames = html.includes("Need more games for chart");
    const gamesCount = html.match(/(\d+) games/)?.[1];

    console.log(`   Player has ${gamesCount} games`);
    console.log(
      `   Shows "Need more games": ${needsMoreGames ? "❌ YES" : "✅ NO"}`
    );

    // Check for NaN
    const hasNaN = html.includes("NaN");
    console.log(`   NaN values present: ${hasNaN ? "❌ YES" : "✅ NO"}`);
  } catch (error) {
    console.log("   Error fetching player profile:", error.message);
  }

  // Check leaderboard
  console.log("\n3. Checking leaderboard page...");
  try {
    const response = await fetch("https://mj-web-psi.vercel.app/");
    const html = await response.text();

    // Check for NaN
    const hasNaN = html.includes("NaN");
    console.log(`   NaN values present: ${hasNaN ? "❌ YES" : "✅ NO"}`);
  } catch (error) {
    console.log("   Error fetching leaderboard:", error.message);
  }

  console.log("\n=== CHECK COMPLETE ===");
}

checkProductionData();
