#!/usr/bin/env python3
"""
Legacy Data Cleanup Script

Cleans up legacy imported game data to match proper schema defaults and conventions.
This ensures data consistency before moving to derived data materialization.

Usage:
    uv run python scripts/cleanup_legacy_data.py

Cleanup Actions:
    - Update game locations from "Legacy Import" to "Host House"
    - Verify data integrity after cleanup
    - Report changes made
"""

import logging
import os
from typing import Any

from dotenv import load_dotenv
from supabase import Client, create_client

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LegacyDataCleanup:
    """Handles cleanup of legacy imported data."""

    def __init__(self):
        self.supabase: Client | None = None

    def connect_to_supabase(self) -> None:
        """Establish connection to Supabase."""
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SECRET_KEY")

        if not url or not key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SECRET_KEY environment variables must be set"
            )

        self.supabase = create_client(url, key)
        logger.info("✅ Connected to Supabase")

    def analyze_current_state(self) -> dict[str, Any]:
        """Analyze current state of data before cleanup."""
        logger.info("🔍 Analyzing current data state...")

        # Get games with current location/table_type values
        games_result = (
            self.supabase.table("games")
            .select("id, location, table_type, status, created_at")
            .execute()
        )

        games = games_result.data

        # Analyze current values
        location_counts = {}
        table_type_counts = {}

        legacy_games = []

        for game in games:
            location = game.get("location")
            table_type = game.get("table_type")

            if location:
                location_counts[location] = location_counts.get(location, 0) + 1

            if table_type:
                table_type_counts[table_type] = table_type_counts.get(table_type, 0) + 1

            # Track games that need cleanup
            if location == "Legacy Import":
                legacy_games.append(game["id"])

        logger.info("📊 Current data analysis:")
        logger.info(f"   Total games: {len(games)}")
        logger.info(f"   Location breakdown: {location_counts}")
        logger.info(f"   Table type breakdown: {table_type_counts}")
        logger.info(f"   Games needing location cleanup: {len(legacy_games)}")

        return {
            "total_games": len(games),
            "location_counts": location_counts,
            "table_type_counts": table_type_counts,
            "legacy_games": legacy_games,
            "games": games,
        }

    def cleanup_game_locations(self, legacy_game_ids: list[str]) -> dict[str, Any]:
        """Update legacy game locations to proper values."""
        if not legacy_game_ids:
            logger.info("✅ No games need location cleanup")
            return {"updated": 0, "success": True}

        logger.info(f"🧹 Updating {len(legacy_game_ids)} game locations...")

        try:
            # Update all legacy games to use "Host House" location
            result = (
                self.supabase.table("games")
                .update({"location": "Host House", "updated_at": "NOW()"})
                .in_("id", legacy_game_ids)
                .execute()
            )

            updated_count = len(result.data) if result.data else 0
            logger.info(
                f"✅ Updated {updated_count} games from 'Legacy Import' to 'Host House'"
            )

            return {"updated": updated_count, "success": True}

        except Exception as e:
            logger.error(f"❌ Failed to update game locations: {e}")
            return {"updated": 0, "success": False, "error": str(e)}

    def verify_cleanup_results(self) -> dict[str, Any]:
        """Verify that cleanup was successful."""
        logger.info("🔍 Verifying cleanup results...")

        # Re-check the data state
        games_result = (
            self.supabase.table("games").select("location, table_type").execute()
        )

        location_counts = {}
        table_type_counts = {}

        for game in games_result.data:
            location = game.get("location")
            table_type = game.get("table_type")

            if location:
                location_counts[location] = location_counts.get(location, 0) + 1
            if table_type:
                table_type_counts[table_type] = table_type_counts.get(table_type, 0) + 1

        logger.info("📊 Post-cleanup state:")
        logger.info(f"   Location breakdown: {location_counts}")
        logger.info(f"   Table type breakdown: {table_type_counts}")

        # Check if any legacy imports remain
        legacy_remaining = location_counts.get("Legacy Import", 0)
        cleanup_successful = legacy_remaining == 0

        if cleanup_successful:
            logger.info("✅ Cleanup verification: SUCCESS")
        else:
            logger.warning(
                f"⚠️  Cleanup verification: {legacy_remaining} legacy records remain"
            )

        return {
            "location_counts": location_counts,
            "table_type_counts": table_type_counts,
            "legacy_remaining": legacy_remaining,
            "cleanup_successful": cleanup_successful,
        }

    def run_cleanup(self) -> dict[str, Any]:
        """Run complete legacy data cleanup process."""
        logger.info("🚀 Starting legacy data cleanup")

        # Connect to database
        self.connect_to_supabase()

        # Analyze current state
        current_state = self.analyze_current_state()

        # Perform cleanup
        cleanup_result = self.cleanup_game_locations(current_state["legacy_games"])

        # Verify results
        verification = self.verify_cleanup_results()

        logger.info("🎉 Legacy data cleanup completed")

        return {
            "current_state": current_state,
            "cleanup_result": cleanup_result,
            "verification": verification,
            "overall_success": (
                cleanup_result["success"] and verification["cleanup_successful"]
            ),
        }


def main():
    """Main entry point."""
    cleanup = LegacyDataCleanup()

    try:
        results = cleanup.run_cleanup()

        if results["overall_success"]:
            logger.info("🎊 All cleanup operations completed successfully!")
        else:
            logger.error("❌ Some cleanup operations failed")

        return results

    except Exception as e:
        logger.error(f"❌ Cleanup failed: {e}")
        raise


if __name__ == "__main__":
    main()
