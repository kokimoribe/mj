#!/usr/bin/env python3
"""
Legacy Data Migration Script

Migrates legacy CSV mahjong game data to Phase 0 database schema using Supabase client.
Clean, modern implementation with proper error handling and idempotency.

Usage:
    uv run python scripts/migrate_legacy_data.py

Features:
    - Uses official Supabase Python client
    - Fully idempotent - safe to run multiple times
    - Deterministic UUIDs for consistent game IDs
    - Proper enum handling for database schema
    - Comprehensive error handling and logging

Requirements:
    - SUPABASE_URL and SUPABASE_SECRET_KEY in environment
    - CSV file: legacy_logs.csv in project root
    - Season 3 configuration: configs/season-3.yaml
"""

import csv
import hashlib
import json
import logging
import os
import sys
import uuid
from datetime import datetime
from pathlib import Path

import yaml
from dotenv import load_dotenv
from supabase import Client, create_client

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants - CSV is at workspace root, configs in rating-engine
CSV_PATH = Path(__file__).parent.parent.parent.parent / "legacy_logs.csv"
SEASON_3_CONFIG_PATH = Path(__file__).parent.parent / "configs" / "season-3.yaml"


class SupabaseLegacyDataMigrator:
    """Migrates legacy CSV data to Supabase using the official Python client."""

    def __init__(self):
        self.supabase: Client | None = None
        self.season_3_config_id: str | None = None

    def connect_to_supabase(self) -> None:
        """Establish connection to Supabase."""
        url = os.getenv("SUPABASE_URL")
        # Use secret key for admin operations
        key = os.getenv("SUPABASE_SECRET_KEY")

        if not url or not key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SECRET_KEY environment variables must be set"
            )

        self.supabase = create_client(url, key)
        logger.info("✅ Connected to Supabase")

    def load_season_3_config(self) -> dict[str, any]:
        """Load Season 3 configuration from YAML file."""
        if not SEASON_3_CONFIG_PATH.exists():
            raise FileNotFoundError(
                f"Season 3 config not found: {SEASON_3_CONFIG_PATH}"
            )

        with open(SEASON_3_CONFIG_PATH) as file:
            config = yaml.safe_load(file)

        logger.info(f"📋 Loaded Season 3 config: {config['name']}")
        return config

    def ensure_season_3_config_in_db(self) -> str:
        """Ensure Season 3 configuration exists in database and return its hash."""
        config = self.load_season_3_config()

        # Convert to database format (remove metadata)
        db_config = {
            "timeRange": config["timeRange"],
            "rating": config["rating"],
            "scoring": config["scoring"],
            "weights": config["weights"],
            "qualification": config["qualification"],
        }

        # Calculate deterministic hash
        config_json = json.dumps(db_config, sort_keys=True)
        config_hash = hashlib.sha256(config_json.encode()).hexdigest()

        # Upsert configuration
        record = {
            "config_hash": config_hash,
            "config_data": config_json,
            "name": config["name"],
            "description": config.get("description", ""),
            "is_official": config.get("isOfficial", False),
        }

        self.supabase.table("rating_configurations").upsert(
            record, on_conflict="config_hash"
        ).execute()

        logger.info(f"✅ Season 3 config ready with hash {config_hash[:8]}...")
        return config_hash

    def generate_deterministic_uuid(self, namespace: str, name: str) -> str:
        """Generate deterministic UUID for consistent migrations."""
        # Use UUID5 with a custom namespace for deterministic generation
        namespace_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, "mahjong.league")
        return str(uuid.uuid5(namespace_uuid, f"{namespace}:{name}"))

    def get_or_create_player(self, name: str) -> str:
        """Get existing player or create new one with deterministic UUID."""
        # First check if player exists by display_name
        result = (
            self.supabase.table("players")
            .select("id")
            .eq("display_name", name)
            .execute()
        )

        if result.data:
            existing_id = result.data[0]["id"]
            logger.debug(
                f"👤 Player {name} already exists with ID {existing_id[:8]}..."
            )
            return existing_id

        # Create new player with deterministic UUID
        player_id = self.generate_deterministic_uuid("player", name)

        player_record = {
            "id": player_id,
            "display_name": name,
            "auth_user_id": None,  # Legacy players don't have auth accounts
            "email": None,
            "phone": None,
            "timezone": "America/Los_Angeles",  # Default timezone
            "notification_preferences": {},
        }

        self.supabase.table("players").insert(player_record).execute()
        logger.info(f"👤 Created player: {name}")
        return player_id

    def process_csv_game(self, row: dict[str, str]) -> dict[str, any]:
        """Process a single CSV row into game and game_seats data."""
        # Parse CSV data
        timestamp_str = row["Timestamp"]
        date_str = row["date"]

        # Convert timestamp
        try:
            game_datetime = datetime.strptime(timestamp_str, "%m/%d/%Y %H:%M:%S")
        except ValueError:
            logger.error(f"❌ Invalid timestamp format: {timestamp_str}")
            raise

        # Generate deterministic game ID
        game_key = f"{date_str}_{timestamp_str}"
        game_id = self.generate_deterministic_uuid("game", game_key)

        # Process players and scores
        players_data = []
        positions = ["East", "South", "West", "North"]

        for i, position in enumerate(positions):
            player_name = row[f"{position} player"]
            points_str = row[f"{position} points"]

            try:
                final_score = int(points_str)
            except ValueError:
                logger.error(f"❌ Invalid points for {player_name}: {points_str}")
                raise

            player_id = self.get_or_create_player(player_name)

            players_data.append(
                {
                    "player_id": player_id,
                    "player_name": player_name,
                    "seat_wind": position.lower(),
                    "final_score": final_score,
                    "seat_order": i,
                }
            )

        return {
            "game_id": game_id,
            "game_datetime": game_datetime,
            "players_data": players_data,
        }

    def create_game_and_seats(self, game_data: dict[str, any]) -> None:
        """Create game record and associated game_seats records."""
        game_id = game_data["game_id"]

        # Check if game already exists
        result = self.supabase.table("games").select("id").eq("id", game_id).execute()

        if result.data:
            logger.debug(f"🎮 Game {game_id[:8]}... already exists")
            return

        # Create game record
        game_record = {
            "id": game_id,
            "started_at": game_data["game_datetime"].isoformat(),
            "finished_at": game_data["game_datetime"].isoformat(),
            "status": "finished",  # Valid enum: scheduled, ongoing, finished, cancelled
            "table_type": "manual",  # Valid enum: automatic, manual
            "location": "Legacy Import",
            "notes": "Imported from legacy CSV data",
        }

        self.supabase.table("games").insert(game_record).execute()
        logger.info(f"🎮 Created game: {game_id[:8]}...")

        # Create game_seats records
        game_seats = []
        for player_data in game_data["players_data"]:
            seat_record = {
                "game_id": game_id,
                "player_id": player_data["player_id"],
                "seat": player_data["seat_wind"],
                "final_score": player_data["final_score"],
            }
            game_seats.append(seat_record)

        self.supabase.table("game_seats").insert(game_seats).execute()
        logger.info(f"💺 Created {len(game_seats)} game seats")

    def migrate_csv_data(self) -> None:
        """Main migration process for CSV data."""
        if not CSV_PATH.exists():
            raise FileNotFoundError(f"CSV file not found: {CSV_PATH}")

        logger.info(f"📁 Reading CSV data from: {CSV_PATH}")

        games_processed = 0
        with open(CSV_PATH, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            for row in reader:
                try:
                    game_data = self.process_csv_game(row)
                    self.create_game_and_seats(game_data)
                    games_processed += 1
                except Exception as e:
                    logger.error(f"❌ Failed to process game: {e}")
                    logger.error(f"   Row data: {row}")
                    raise

        logger.info(f"✅ Migration completed: {games_processed} games processed")

    def run_migration(self) -> None:
        """Execute the complete migration process."""
        logger.info("🚀 Starting legacy data migration with Supabase client")

        # Connect to Supabase
        self.connect_to_supabase()

        # Ensure Season 3 configuration exists
        self.season_3_config_id = self.ensure_season_3_config_in_db()

        # Migrate CSV data
        self.migrate_csv_data()

        logger.info("🎉 Migration completed successfully!")


def main():
    """Main entry point."""
    migrator = SupabaseLegacyDataMigrator()

    try:
        migrator.run_migration()
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
