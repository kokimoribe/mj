#!/usr/bin/env python3
"""
Database Verification Script

Verifies that the production database contains the expected data from our migration.
Reports on data integrity and provides insights for optimization.

Usage:
    uv run python scripts/verify_database.py
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


class DatabaseVerifier:
    """Verifies database state and data integrity."""

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

    def verify_configurations(self) -> dict[str, Any]:
        """Verify rating configurations in database."""
        logger.info("🔍 Checking rating configurations...")

        result = self.supabase.table("rating_configurations").select("*").execute()
        configs = result.data

        logger.info(f"📊 Found {len(configs)} configurations:")
        for config in configs:
            hash_short = config["config_hash"][:8]
            official = "🏆 OFFICIAL" if config["is_official"] else "🧪 Experimental"
            logger.info(f"   {hash_short}... | {config['name']} | {official}")

        return {"count": len(configs), "configs": configs}

    def verify_players(self) -> dict[str, Any]:
        """Verify players in database."""
        logger.info("🔍 Checking players...")

        result = self.supabase.table("players").select("*").execute()
        players = result.data

        logger.info(f"👥 Found {len(players)} players:")
        for player in players:
            logger.info(f"   {player['display_name']} (ID: {player['id'][:8]}...)")

        return {"count": len(players), "players": players}

    def verify_games(self) -> dict[str, Any]:
        """Verify games in database."""
        logger.info("🔍 Checking games...")

        result = self.supabase.table("games").select("*").execute()
        games = result.data

        logger.info(f"🎮 Found {len(games)} games:")

        # Group by status
        status_counts = {}
        table_type_counts = {}
        location_counts = {}

        for game in games:
            status = game["status"]
            table_type = game["table_type"]
            location = game["location"]

            status_counts[status] = status_counts.get(status, 0) + 1
            table_type_counts[table_type] = table_type_counts.get(table_type, 0) + 1
            location_counts[location] = location_counts.get(location, 0) + 1

        logger.info(f"   Status breakdown: {status_counts}")
        logger.info(f"   Table type breakdown: {table_type_counts}")
        logger.info(f"   Location breakdown: {location_counts}")

        return {
            "count": len(games),
            "status_counts": status_counts,
            "table_type_counts": table_type_counts,
            "location_counts": location_counts,
            "games": games,
        }

    def verify_game_seats(self) -> dict[str, Any]:
        """Verify game seats in database."""
        logger.info("🔍 Checking game seats...")

        result = self.supabase.table("game_seats").select("*").execute()
        seats = result.data

        logger.info(f"💺 Found {len(seats)} game seats:")

        # Check data integrity
        games_with_seats = {}
        seat_counts = {}

        for seat in seats:
            game_id = seat["game_id"]
            seat_position = seat["seat"]

            if game_id not in games_with_seats:
                games_with_seats[game_id] = []
            games_with_seats[game_id].append(seat_position)

            seat_counts[seat_position] = seat_counts.get(seat_position, 0) + 1

        # Check for games with != 4 seats
        invalid_games = []
        for game_id, game_seats in games_with_seats.items():
            if len(game_seats) != 4:
                invalid_games.append((game_id, len(game_seats)))

        logger.info(f"   Seat position distribution: {seat_counts}")
        valid_games = len(games_with_seats) - len(invalid_games)
        logger.info(f"   Games with 4 seats: {valid_games}")
        if invalid_games:
            logger.warning(f"   ⚠️  Games with invalid seat count: {invalid_games}")

        return {
            "count": len(seats),
            "seat_counts": seat_counts,
            "games_with_seats": len(games_with_seats),
            "invalid_games": invalid_games,
        }

    def verify_data_integrity(self) -> dict[str, Any]:
        """Perform comprehensive data integrity checks."""
        logger.info("🔍 Performing data integrity checks...")

        # Check for orphaned game_seats (seats without games)
        seats_result = self.supabase.table("game_seats").select("game_id").execute()
        games_result = self.supabase.table("games").select("id").execute()

        seat_game_ids = {seat["game_id"] for seat in seats_result.data}
        game_ids = {game["id"] for game in games_result.data}

        orphaned_seats = seat_game_ids - game_ids
        games_without_seats = game_ids - seat_game_ids

        logger.info(f"   Orphaned game seats: {len(orphaned_seats)}")
        logger.info(f"   Games without seats: {len(games_without_seats)}")

        if orphaned_seats:
            orphaned_list = list(orphaned_seats)[:5]
            logger.warning(f"   ⚠️  Orphaned seat game IDs: {orphaned_list}...")
        if games_without_seats:
            games_list = list(games_without_seats)[:5]
            logger.warning(f"   ⚠️  Games without seats: {games_list}...")

        data_consistent = len(orphaned_seats) == 0 and len(games_without_seats) == 0
        return {
            "orphaned_seats": len(orphaned_seats),
            "games_without_seats": len(games_without_seats),
            "data_consistent": data_consistent,
        }

    def get_schema_info(self) -> dict[str, Any]:
        """Get information about table schemas."""
        logger.info("🔍 Checking table schemas...")

        # This is a simplified check - in production you'd query information_schema
        tables = ["players", "games", "game_seats", "rating_configurations"]
        table_info = {}

        for table in tables:
            try:
                result = self.supabase.table(table).select("*").limit(1).execute()
                if result.data:
                    columns = list(result.data[0].keys())
                    table_info[table] = {
                        "exists": True,
                        "columns": columns,
                        "column_count": len(columns),
                    }
                    logger.info(f"   {table}: {len(columns)} columns")
                else:
                    table_info[table] = {
                        "exists": True,
                        "columns": [],
                        "column_count": 0,
                    }
                    logger.info(f"   {table}: empty but exists")
            except Exception as e:
                table_info[table] = {"exists": False, "error": str(e)}
                logger.error(f"   {table}: ❌ {e}")

        return table_info

    def investigate_schema_usage(self) -> dict[str, Any]:
        """Investigate usage patterns of location and table_type columns."""
        logger.info("🔍 Investigating schema column usage...")

        # Get all games with location and table_type data
        games_result = (
            self.supabase.table("games")
            .select("location, table_type, created_at")
            .execute()
        )

        # Analyze location values
        locations = {}
        table_types = {}

        for game in games_result.data:
            location = game.get("location")
            table_type = game.get("table_type")

            if location:
                locations[location] = locations.get(location, 0) + 1
            if table_type:
                table_types[table_type] = table_types.get(table_type, 0) + 1

        logger.info("📍 Location column analysis:")
        for location, count in sorted(locations.items()):
            logger.info(f"   '{location}': {count} games")

        logger.info("🎮 Table type column analysis:")
        for table_type, count in sorted(table_types.items()):
            logger.info(f"   '{table_type}': {count} games")

        # Sample some records for context
        sample_games = (
            self.supabase.table("games")
            .select("id, location, table_type, created_at")
            .limit(3)
            .execute()
        )

        logger.info("📊 Sample game records:")
        for game in sample_games.data:
            game_id = game["id"][:8] + "..."
            location = game.get("location", "NULL")
            table_type = game.get("table_type", "NULL")
            created = (
                game.get("created_at", "NULL")[:10]
                if game.get("created_at")
                else "NULL"
            )
            logger.info(
                f"   {game_id} | Location: {location} | "
                f"Type: {table_type} | Created: {created}"
            )

        return {
            "locations": locations,
            "table_types": table_types,
            "unique_locations": len(locations),
            "unique_table_types": len(table_types),
        }

    def run_verification(self) -> dict[str, Any]:
        """Run complete database verification."""
        logger.info("🚀 Starting database verification")

        # Connect to database
        self.connect_to_supabase()

        # Run all verification checks
        results = {
            "schema": self.get_schema_info(),
            "configurations": self.verify_configurations(),
            "players": self.verify_players(),
            "games": self.verify_games(),
            "game_seats": self.verify_game_seats(),
            "integrity": self.verify_data_integrity(),
            "schema_usage": self.investigate_schema_usage(),
        }

        logger.info("🎉 Database verification completed")

        # Summary
        logger.info("📊 Summary:")
        logger.info(f"   Configurations: {results['configurations']['count']}")
        logger.info(f"   Players: {results['players']['count']}")
        logger.info(f"   Games: {results['games']['count']}")
        logger.info(f"   Game Seats: {results['game_seats']['count']}")

        integrity_status = (
            "✅ PASS" if results["integrity"]["data_consistent"] else "❌ ISSUES"
        )
        logger.info(f"   Data Integrity: {integrity_status}")

        return results


def main():
    """Main entry point."""
    verifier = DatabaseVerifier()

    try:
        results = verifier.run_verification()
        return results
    except Exception as e:
        logger.error(f"❌ Verification failed: {e}")
        raise


if __name__ == "__main__":
    main()
