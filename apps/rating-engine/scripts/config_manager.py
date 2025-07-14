#!/usr/bin/env python3
"""
Configuration Management Utility

Loads YAML configuration files and manages them in the database.
Provides validation and version control for rating configurations.
"""

import hashlib
import json
import logging
import os
import sys
from pathlib import Path

import yaml
from dotenv import load_dotenv
from supabase import Client, create_client

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ConfigurationManager:
    """Manages rating configurations from YAML files to database."""

    def __init__(self):
        self.supabase: Client | None = None
        # Look for configs directory at project root, not in scripts/
        script_dir = Path(__file__).parent
        self.config_dir = script_dir.parent / "configs"

    def connect_to_database(self) -> None:
        """Establish connection to Supabase using new secret key."""
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SECRET_KEY")

        if not url:
            raise ValueError("SUPABASE_URL environment variable must be set")

        if not key:
            raise ValueError(
                "SUPABASE_SECRET_KEY environment variable must be set. "
                "Create a new secret key (sb_secret_...) in Supabase dashboard: "
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
            logger.info("✅ Connected to Supabase with new secret key")
        except Exception as e:
            logger.error(f"❌ Failed to connect to Supabase: {e}")
            raise

    def load_yaml_config(self, config_path: Path) -> dict[str, any]:
        """Load and validate a YAML configuration file."""
        try:
            with open(config_path) as file:
                config = yaml.safe_load(file)

            # Validate required fields
            required_fields = [
                "name",
                "timeRange",
                "rating",
                "scoring",
                "weights",
                "qualification",
            ]
            for field in required_fields:
                if field not in config:
                    raise ValueError(f"Missing required field: {field}")

            logger.info(f"📋 Loaded config: {config['name']}")
            return config

        except Exception as e:
            logger.error(f"❌ Failed to load {config_path}: {e}")
            raise

    def config_to_database_format(self, config: dict[str, any]) -> dict[str, any]:
        """Convert YAML config to database format (remove metadata)."""
        db_config = {
            "timeRange": config["timeRange"],
            "rating": config["rating"],
            "scoring": config["scoring"],
            "weights": config["weights"],
            "qualification": config["qualification"],
        }
        return db_config

    def calculate_config_hash(self, config: dict[str, any]) -> str:
        """Calculate deterministic hash for configuration."""
        config_json = json.dumps(config, sort_keys=True)
        return hashlib.sha256(config_json.encode()).hexdigest()

    def save_config_to_database(
        self, config: dict[str, any], dry_run: bool = False
    ) -> str:
        """Save configuration to database."""
        if not self.supabase:
            self.connect_to_database()

        # Convert to database format
        db_config = self.config_to_database_format(config)
        config_hash = self.calculate_config_hash(db_config)
        config_json = json.dumps(db_config, sort_keys=True)

        # Prepare database record
        name = config["name"]
        description = config.get("description", "")
        is_official = config.get("isOfficial", False)

        record = {
            "config_hash": config_hash,
            "config_data": config_json,
            "name": name,
            "description": description,
            "is_official": is_official,
        }

        if not dry_run:
            # Use upsert to handle conflicts
            self.supabase.table("rating_configurations").upsert(
                record, on_conflict="config_hash"
            ).execute()
            logger.info(f"💾 Saved config '{name}' with hash {config_hash[:8]}...")
        else:
            logger.info(
                f"🔍 DRY RUN: Would save config '{name}' with hash {config_hash[:8]}..."
            )

        return config_hash

    def load_all_configs(self, dry_run: bool = False) -> list[str]:
        """Load all YAML configs from the configs directory."""
        config_hashes = []

        # Load main season configs
        for yaml_file in self.config_dir.glob("season-*.yaml"):
            config = self.load_yaml_config(yaml_file)
            config_hash = self.save_config_to_database(config, dry_run)
            config_hashes.append(config_hash)

        # Load experimental configs
        experimental_dir = self.config_dir / "experimental"
        if experimental_dir.exists():
            for yaml_file in experimental_dir.glob("*.yaml"):
                config = self.load_yaml_config(yaml_file)
                config_hash = self.save_config_to_database(config, dry_run)
                config_hashes.append(config_hash)

        return config_hashes

    def list_database_configs(self) -> None:
        """List all configurations currently in the database."""
        if not self.supabase:
            self.connect_to_database()

        result = (
            self.supabase.table("rating_configurations")
            .select("config_hash, name, description, is_official, created_at")
            .order("is_official", desc=True)
            .order("created_at", desc=False)
            .execute()
        )

        configs = result.data

        print("\n📊 Configurations in database:")
        for config in configs:
            hash_short = config["config_hash"][:8]
            official = "🏆 OFFICIAL" if config["is_official"] else "🧪 Experimental"
            print(f"  {hash_short}... | {config['name']} | {official}")
            print(f"    {config['description']}")
            print()


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Manage rating configurations")
    parser.add_argument(
        "--load-all", action="store_true", help="Load all YAML configs to database"
    )
    parser.add_argument("--list", action="store_true", help="List all database configs")
    parser.add_argument(
        "--dry-run", action="store_true", help="Preview changes without saving"
    )

    args = parser.parse_args()

    manager = ConfigurationManager()

    try:
        if args.list:
            manager.list_database_configs()
        elif args.load_all:
            hashes = manager.load_all_configs(dry_run=args.dry_run)
            logger.info(f"✅ Processed {len(hashes)} configurations")
        else:
            parser.print_help()

    except Exception as e:
        logger.error(f"❌ Operation failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
