#!/usr/bin/env python3
"""
Materialize Rating Data

Runs the materialization process to compute and cache player ratings and game results
for a given configuration. Results are stored in Supabase cache tables.

Usage:
    # Materialize with default config (Season 3)
    uv run python scripts/materialize_data.py

    # Materialize specific config by hash
    uv run python scripts/materialize_data.py --config-hash abc123...

    # Materialize specific config by name
    uv run python scripts/materialize_data.py --config "Season 5"

    # List available configurations
    uv run python scripts/materialize_data.py --list

    # Force refresh (ignore cache)
    uv run python scripts/materialize_data.py --config-hash abc123... --force-refresh

Features:
    - Idempotent - safe to run multiple times
    - Smart caching - skips recalculation if data is unchanged
    - Stores results in cached_player_ratings and cached_game_results tables
    - Provides detailed progress logging

Requirements:
    - SUPABASE_URL and SUPABASE_SECRET_KEY in environment
    - Configuration must exist in rating_configurations table
"""

import argparse
import asyncio
import logging
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

# Import from the rating_engine package
# This assumes the script is run from the rating-engine directory with proper Python path
# or using uv run which handles the environment
try:
    from rating_engine.materialization import materialize_data_for_config
except ImportError:
    # Fallback: add parent directory to path
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from rating_engine.materialization import materialize_data_for_config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)


def load_environment(env: str | None = None) -> None:
    """Load environment variables from appropriate .env file."""
    script_dir = Path(__file__).parent
    rating_engine_dir = script_dir.parent
    
    if env == "prod":
        env_file = rating_engine_dir / ".env.prod"
    elif env == "dev":
        env_file = rating_engine_dir / ".env.dev"
    else:
        # Default: try .env first, fallback to .env.dev
        env_file = rating_engine_dir / ".env"
        if not env_file.exists():
            env_file = rating_engine_dir / ".env.dev"
    
    if not env_file.exists():
        raise FileNotFoundError(
            f"Environment file not found: {env_file}\n"
            f"Create {env_file} with SUPABASE_URL and SUPABASE_SECRET_KEY"
        )
    
    load_dotenv(env_file)
    logger.info(f"📁 Loaded environment from: {env_file.name}")


def get_supabase_client():
    """Create and return Supabase client."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_SECRET_KEY "
            "(or SUPABASE_SERVICE_ROLE_KEY) must be set"
        )

    return create_client(url, key)


def list_configurations(supabase):
    """List all available configurations."""
    result = (
        supabase.table("rating_configurations")
        .select("config_hash, name, description, is_official, created_at")
        .order("created_at", desc=True)
        .execute()
    )

    if not result.data:
        logger.info("No configurations found in database")
        return

    print("\n" + "=" * 80)
    print("Available Configurations")
    print("=" * 80)
    print(f"{'Name':<30} {'Hash':<20} {'Official':<10} {'Description'}")
    print("-" * 80)

    for config in result.data:
        official = "✓" if config.get("is_official") else ""
        description = config.get("description", "")[:40]
        print(
            f"{config['name']:<30} {config['config_hash'][:16]}... {official:<10} {description}"
        )

    print("=" * 80)
    print(f"\nTotal: {len(result.data)} configuration(s)")


def get_config_hash_by_name(supabase, config_name: str) -> str | None:
    """Get config hash by configuration name."""
    result = (
        supabase.table("rating_configurations")
        .select("config_hash")
        .eq("name", config_name)
        .execute()
    )

    if not result.data:
        return None

    # If multiple configs with same name, return the most recent
    return result.data[0]["config_hash"]


async def run_materialization(
    config_hash: str, force_refresh: bool = False
) -> dict:
    """Run materialization for a given config hash."""
    supabase = get_supabase_client()

    logger.info(f"🚀 Starting materialization for config: {config_hash[:16]}...")

    try:
        result = await materialize_data_for_config(
            supabase, config_hash, force_refresh=force_refresh
        )

        # Print results
        print("\n" + "=" * 80)
        print("Materialization Results")
        print("=" * 80)
        print(f"Status: {result.get('status', 'unknown')}")
        print(f"Config Hash: {result.get('config_hash', '')[:16]}...")

        if result.get("status") == "cache_hit":
            logger.info("✅ Cache is valid - no recalculation needed")
        elif result.get("status") == "materialized":
            logger.info(f"✅ Materialization completed successfully")
            if "players_count" in result:
                print(f"Players processed: {result['players_count']}")
            if "games_count" in result:
                print(f"Games processed: {result['games_count']}")
            if "source_data_hash" in result:
                print(f"Source data hash: {result['source_data_hash'][:16]}...")

        if result.get("error"):
            logger.error(f"❌ Error: {result['error']}")
            return result

        print("=" * 80)
        return result

    except Exception as e:
        logger.error(f"❌ Materialization failed: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Materialize rating data for configurations",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # List available configurations
  uv run python scripts/materialize_data.py --list

  # Materialize by config hash
  uv run python scripts/materialize_data.py --config-hash abc123def456...

  # Materialize by config name
  uv run python scripts/materialize_data.py --config "Season 5"

  # Force refresh (ignore cache)
  uv run python scripts/materialize_data.py --config-hash abc123... --force-refresh

  # Use specific environment
  uv run python scripts/materialize_data.py --env prod --config "Season 5"
  uv run python scripts/materialize_data.py --env dev --config "Season 5"
        """,
    )

    parser.add_argument(
        "--config-hash",
        type=str,
        help="Configuration hash to materialize",
    )
    parser.add_argument(
        "--config",
        type=str,
        help="Configuration name to materialize (e.g., 'Season 5')",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List all available configurations",
    )
    parser.add_argument(
        "--force-refresh",
        action="store_true",
        help="Force recalculation even if cache is valid",
    )
    parser.add_argument(
        "--env",
        choices=["dev", "prod"],
        default=None,
        help="Environment to use (dev or prod). Defaults to .env or .env.dev",
    )

    args = parser.parse_args()
    
    # Load environment variables based on --env flag
    load_environment(args.env)

    # Handle list command
    if args.list:
        supabase = get_supabase_client()
        list_configurations(supabase)
        return

    # Determine config hash
    config_hash = None

    if args.config_hash:
        config_hash = args.config_hash
    elif args.config:
        supabase = get_supabase_client()
        config_hash = get_config_hash_by_name(supabase, args.config)
        if not config_hash:
            logger.error(f"❌ Configuration '{args.config}' not found in database")
            logger.info("💡 Use --list to see available configurations")
            sys.exit(1)
        logger.info(f"📋 Found config '{args.config}': {config_hash[:16]}...")
    else:
        # Default: try to find Season 3 (legacy default)
        supabase = get_supabase_client()
        config_hash = get_config_hash_by_name(supabase, "Season 3")
        if not config_hash:
            logger.error("❌ No configuration specified and 'Season 3' not found")
            logger.info("💡 Use --list to see available configurations")
            logger.info("💡 Use --config-hash or --config to specify a configuration")
            sys.exit(1)
        logger.info(f"📋 Using default config 'Season 3': {config_hash[:16]}...")

    # Run materialization
    result = asyncio.run(run_materialization(config_hash, args.force_refresh))

    # Exit with error code if materialization failed
    if result.get("status") == "error":
        sys.exit(1)


if __name__ == "__main__":
    main()
