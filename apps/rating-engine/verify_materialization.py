#!/usr/bin/env python3
"""
Verification script for rating engine materialization.

Tests the complete materialization pipeline:
1. Connects to Supabase
2. Gets Season 3 configuration
3. Runs materialization
4. Verifies results are stored correctly
5. Displays leaderboard
"""

import asyncio
import os
from dotenv import load_dotenv
from supabase import create_client
from rating_engine.materialization import materialize_data_for_config


async def verify_materialization():
    """Verify the complete materialization pipeline."""
    print("🔍 Verifying Rating Engine Materialization Pipeline")
    print("=" * 60)
    
    # Load environment
    load_dotenv()
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SECRET_KEY')
    
    if not url or not key:
        print("❌ Missing environment variables")
        return False
        
    print(f"✅ Environment loaded")
    print(f"   URL: {url[:30]}...")
    print(f"   Key: {key[:20]}...")
    
    try:
        # Connect to Supabase
        supabase = create_client(url, key)
        print(f"✅ Supabase connection established")
        
        # Get Season 3 configuration (official)
        config_result = supabase.table('rating_configurations').select('config_hash, name, is_official').eq('name', 'Season 3').execute()
        
        if not config_result.data:
            print("❌ Season 3 configuration not found")
            return False
            
        config = config_result.data[0]
        config_hash = config['config_hash']
        print(f"✅ Found Season 3 configuration")
        print(f"   Hash: {config_hash[:16]}...")
        print(f"   Official: {config['is_official']}")
        
        # Run materialization
        print(f"\n🚀 Running materialization...")
        result = await materialize_data_for_config(supabase, config_hash, force_refresh=True)
        
        print(f"✅ Materialization completed")
        print(f"   Status: {result['status']}")
        print(f"   Players processed: {result.get('players_count', 'unknown')}")
        print(f"   Games processed: {result.get('games_count', 'unknown')}")
        print(f"   Source data hash: {result.get('source_data_hash', 'unknown')[:16]}...")
        
        # Verify cached data exists
        ratings_check = supabase.table('cached_player_ratings').select('*').eq('config_hash', config_hash).execute()
        game_results_check = supabase.table('cached_game_results').select('*').eq('config_hash', config_hash).execute()
        
        print(f"\n📊 Verification Results:")
        print(f"   Cached player ratings: {len(ratings_check.data)}")
        print(f"   Cached game results: {len(game_results_check.data)}")
        
        if ratings_check.data:
            # Display leaderboard
            print(f"\n🏆 Season 3 Leaderboard:")
            print(f"{'Rank':<4} {'Player':<15} {'Rating':<8} {'Games':<6} {'Total +/-':<10}")
            print("-" * 50)
            
            # Sort by display rating
            sorted_ratings = sorted(ratings_check.data, key=lambda x: x['display_rating'], reverse=True)
            
            for i, rating in enumerate(sorted_ratings[:10]):  # Top 10
                # Get player name
                player_result = supabase.table('players').select('display_name').eq('id', rating['player_id']).execute()
                player_name = player_result.data[0]['display_name'] if player_result.data else 'Unknown'
                
                print(f"{i+1:<4} {player_name:<15} {rating['display_rating']:<8.2f} {rating['games_played']:<6} {rating['total_plus_minus']:+<10}")
                
            # Additional stats
            total_games = len(game_results_check.data) // 4  # Each game has 4 results
            avg_rating = sum(r['display_rating'] for r in sorted_ratings) / len(sorted_ratings)
            
            print(f"\n📈 Statistics:")
            print(f"   Total unique games: {total_games}")
            print(f"   Average rating: {avg_rating:.2f}")
            print(f"   Rating range: {sorted_ratings[-1]['display_rating']:.2f} - {sorted_ratings[0]['display_rating']:.2f}")
            
        print(f"\n✅ Verification completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main entry point."""
    success = asyncio.run(verify_materialization())
    exit(0 if success else 1)


if __name__ == "__main__":
    main()