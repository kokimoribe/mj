const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error('Missing required environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SECRET_KEY:', !!supabaseSecretKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function checkCacheTimestamps() {
  console.log('Checking cache timestamps...\n');

  try {
    // First, let's check what columns exist
    const { data: sampleRow } = await supabase
      .from('cached_player_ratings')
      .select('*')
      .limit(1);
    
    if (sampleRow && sampleRow.length > 0) {
      console.log('Columns in cached_player_ratings:');
      console.log('  ', Object.keys(sampleRow[0]).join(', '));
      console.log('\nSample row:', JSON.stringify(sampleRow[0], null, 2));
    }

    // 1. Get the latest cached rating entry
    const { data: latestCached, error: cachedError } = await supabase
      .from('cached_player_ratings')
      .select('*')
      .order('computed_at', { ascending: false })
      .limit(1);

    if (cachedError) {
      console.error('Error:', cachedError);
      return;
    }

    if (latestCached && latestCached.length > 0) {
      const latest = latestCached[0];
      console.log('\nLatest cached_player_ratings entry:');
      console.log(`  Player ID: ${latest.player_id}`);
      console.log(`  computed_at: ${latest.computed_at}`);
      if (latest.mu !== undefined && latest.sigma !== undefined) {
        console.log(`  Rating: μ=${latest.mu}, σ=${latest.sigma}`);
      }
      
      // Calculate how old the data is
      const computedDate = new Date(latest.computed_at);
      const now = new Date();
      const hoursAgo = (now.getTime() - computedDate.getTime()) / (1000 * 60 * 60);
      console.log(`  Age: ${hoursAgo.toFixed(1)} hours ago`);
    } else {
      console.log('No data found in cached_player_ratings table!');
    }

    // 2. Count total cached entries
    const { count: totalCached } = await supabase
      .from('cached_player_ratings')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\nTotal cached entries: ${totalCached || 0}`);

    // 3. Check distinct computed_at values (to see how many cache generations exist)
    const { data: distinctComputed } = await supabase
      .from('cached_player_ratings')
      .select('computed_at')
      .order('computed_at', { ascending: false });

    if (distinctComputed) {
      const uniqueDates = [...new Set(distinctComputed.map(d => d.computed_at))];
      console.log(`\nDistinct cache generations: ${uniqueDates.length}`);
      console.log('Latest 5 cache generation times:');
      uniqueDates.slice(0, 5).forEach((date, index) => {
        const d = new Date(date);
        console.log(`  ${index + 1}. ${date} (${d.toLocaleString()})`);
      });
    }

    // 4. Check the most recent game
    const { data: recentGame, error: gameError } = await supabase
      .from('games')
      .select('id, created_at, finished_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (gameError) {
      console.log('\nError fetching recent games:', gameError);
    } else if (recentGame && recentGame.length > 0) {
      console.log(`\nMost recent game:`);
      console.log(`  Game ID: ${recentGame[0].id}`);
      console.log(`  Created: ${recentGame[0].created_at}`);
      console.log(`  Finished: ${recentGame[0].finished_at || 'In progress'}`);
    
      
      // Compare with cache
      if (latestCached && latestCached.length > 0) {
        const gameDate = new Date(recentGame[0].created_at);
        const cacheDate = new Date(latestCached[0].computed_at);
        if (gameDate > cacheDate) {
          console.log('\n⚠️  WARNING: Games exist that are newer than the cached data!');
          console.log(`  Cache is ${((gameDate.getTime() - cacheDate.getTime()) / (1000 * 60 * 60)).toFixed(1)} hours behind`);
        } else {
          console.log('\n✅ Cache appears to be up to date');
        }
      }
    } else {
      console.log('\nNo games found in the games table');
    }


  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
checkCacheTimestamps().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});