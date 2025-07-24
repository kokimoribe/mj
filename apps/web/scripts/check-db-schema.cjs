const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function checkSchema() {
  console.log('Checking database schema...\n');

  try {
    // Check games table
    console.log('1. Games table:');
    const { data: gamesSample, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .limit(1);

    if (gamesError) {
      console.error('Error accessing games table:', gamesError);
    } else if (gamesSample && gamesSample.length > 0) {
      console.log('Columns:', Object.keys(gamesSample[0]).join(', '));
    }

    // Check player_games table
    console.log('\n2. Player_games table:');
    const { data: playerGamesSample, error: playerGamesError } = await supabase
      .from('player_games')
      .select('*')
      .limit(1);

    if (playerGamesError) {
      console.error('Error accessing player_games table:', playerGamesError);
    } else if (playerGamesSample && playerGamesSample.length > 0) {
      console.log('Columns:', Object.keys(playerGamesSample[0]).join(', '));
    }

    // Check players table
    console.log('\n3. Players table:');
    const { data: playersSample, error: playersError } = await supabase
      .from('players')
      .select('*')
      .limit(1);

    if (playersError) {
      console.error('Error accessing players table:', playersError);
    } else if (playersSample && playersSample.length > 0) {
      console.log('Columns:', Object.keys(playersSample[0]).join(', '));
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkSchema().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});