"""
Data Materialization Script

Run data materialization locally for testing and manual updates.
This script connects to production Supabase and materializes data for a
given configuration.

Usage:
    uv run python scripts/materialize_data.py --config season-3
    uv run python scripts/materialize_data.py --config-hash abc123...
    uv run python scripts/materialize_data.py --force-refresh
"""

import argparse
import asyncio
import logging
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

# Add the src directory to the path so we can import our modules
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from lib.materialization import materialize_data_for_config

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class MaterializationScript:
    """Script for manual data materialization."""

    def __init__(self):
        self.supabase: Client | None = None
        self.config_dir = Path(__file__).parent.parent / "configs"

    def connect_to_database(self) -> None:
        """Establish connection to Supabase."""
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SECRET_KEY")

        if not url or not key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SECRET_KEY environment variables "
                "must be set. Create a secret key in Supabase dashboard: "
                "https://supabase.com/dashboard/project/_/settings/api-keys"
            )

        if not key.startswith("sb_secret_"):
            raise ValueError(
                f"Invalid API key format. Expected sb_secret_... key, "
                f"got: {key[:20]}... "
                "Please create a new secret key in Supabase dashboard."
            )

        try:
            self.supabase = create_client(url, key)
            logger.info("✅ Connected to Supabase")
        except Exception as e:
            logger.error(f"❌ Failed to connect to Supabase: {e}")
            raise

    def find_config_hash_by_name(self, config_name: str) -> str:
        """Find config hash by configuration name."""
        if not self.supabase:
            self.connect_to_database()

        # Look for config by name
        result = (
            self.supabase.table("rating_configurations")
            .select("config_hash, name")
            .ilike("name", f"%{config_name}%")
            .execute()
        )

        if not result.data:
            raise ValueError(f"No configuration found matching name: {config_name}")

        if len(result.data) > 1:
            logger.warning(f"Multiple configs found for '{config_name}':")
            for config in result.data:
                logger.warning(f"  - {config['name']} ({config['config_hash'][:8]}...)")
            raise ValueError(
                "Multiple configurations found. Use --config-hash instead."
            )

        config = result.data[0]
        logger.info(f"Found config: {config['name']} ({config['config_hash'][:8]}...)")
        return config["config_hash"]

    def list_configurations(self) -> None:
        """List all available configurations."""
        if not self.supabase:
            self.connect_to_database()

        result = (
            self.supabase.table("rating_configurations")
            .select("config_hash, name, description, is_official, created_at")
            .order("created_at", desc=True)
            .execute()
        )

        if not result.data:
            logger.info("No configurations found in database")
            return

        logger.info("Available configurations:")
        for config in result.data:
            official = "🏆 OFFICIAL" if config["is_official"] else "🧪 Experimental"
            hash_short = config["config_hash"][:8]
            logger.info(f"  {hash_short}... | {config['name']} | {official}")
            if config.get("description"):
                logger.info(f"    {config['description']}")

    async def materialize(
        self, config_hash: str, force_refresh: bool = False
    ) -> dict[str, any]:
        """Run materialization for given config hash."""
        if not self.supabase:
            self.connect_to_database()

        logger.info(f"🚀 Starting materialization for: {config_hash[:8]}...")

        try:
            result = await materialize_data_for_config(
                self.supabase, config_hash, force_refresh=force_refresh
            )

            if result["status"] == "cache_hit":
                logger.info("✅ Cache was valid, no recalculation needed")
            else:
                logger.info(
                    f"✅ Materialization complete! "
                    f"Processed {result['players_count']} players "
                    f"and {result['games_count']} games"
                )

            return result

        except Exception as e:
            logger.error(f"❌ Materialization failed: {e}")
            raise


async def main():
    """Main script entry point."""
    parser = argparse.ArgumentParser(
        description="Manual data materialization script",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    parser.add_argument(
        "--config",
        help="Configuration name to search for (e.g. 'season-3')",
    )

    parser.add_argument(
        "--config-hash",
        help="Exact configuration hash to materialize",
    )

    parser.add_argument(
        "--force-refresh",
        action="store_true",
        help="Force recalculation even if cache is valid",
    )

    parser.add_argument(
        "--list",
        action="store_true",
        help="List all available configurations",
    )

    args = parser.parse_args()

    script = MaterializationScript()

    try:
        # List configurations if requested
        if args.list:
            script.list_configurations()
            return

        # Determine config hash
        config_hash = None
        if args.config_hash:
            config_hash = args.config_hash
        elif args.config:
            config_hash = script.find_config_hash_by_name(args.config)
        else:
            # Default to official Season 3 config
            logger.info("No config specified, looking for Season 3...")
            config_hash = script.find_config_hash_by_name("Season 3")

        # Run materialization
        await script.materialize(config_hash, force_refresh=args.force_refresh)

    except KeyboardInterrupt:
        logger.info("❌ Script interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Script failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
