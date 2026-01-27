#!/usr/bin/env python3
"""
Register Season Configurations

Registers season YAML configuration files in the database by generating
deterministic SHA256 hashes and upserting to the rating_configurations table.

Usage:
    # Register specific config files
    uv run python scripts/register_configs.py configs/season-4-v2.yaml configs/season-5.yaml

    # Register all configs in the configs directory
    uv run python scripts/register_configs.py --all

    # Register a single config
    uv run python scripts/register_configs.py configs/season-5.yaml

Features:
    - Generates deterministic SHA256 hashes from config content
    - Idempotent - safe to run multiple times
    - Validates YAML structure before registration
    - Provides clear output with config hashes

Requirements:
    - SUPABASE_URL and SUPABASE_SECRET_KEY in environment
    - Valid YAML configuration files
"""

import argparse
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
logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)


class ConfigRegistrar:
    """Registers season configurations in the database."""

    def __init__(self):
        self.supabase: Client | None = None

    def connect_to_supabase(self) -> None:
        """Establish connection to Supabase."""
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not url or not key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SECRET_KEY "
                "(or SUPABASE_SERVICE_ROLE_KEY) must be set"
            )

        self.supabase = create_client(url, key)
        logger.info("✅ Connected to Supabase")

    def load_season_config(self, config_path: Path) -> dict:
        """Load season configuration from YAML file."""
        if not config_path.exists():
            raise FileNotFoundError(f"Season config not found: {config_path}")

        with open(config_path) as file:
            config = yaml.safe_load(file)

        # Validate required fields
        required_fields = ["name", "timeRange", "rating", "scoring", "weights", "qualification"]
        missing_fields = [field for field in required_fields if field not in config]
        if missing_fields:
            raise ValueError(
                f"Missing required fields in {config_path}: {', '.join(missing_fields)}"
            )

        logger.info(f"📋 Loaded config: {config['name']}")
        return config

    def register_config(self, config_path: Path) -> str:
        """Register season configuration in database and return its hash."""
        config = self.load_season_config(config_path)

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

        logger.info(f"✅ Config '{config['name']}' registered: {config_hash[:8]}...")
        return config_hash

    def register_configs(self, config_paths: list[Path]) -> dict[str, str]:
        """Register multiple configurations and return a map of config names to hashes."""
        if not self.supabase:
            self.connect_to_supabase()

        results = {}
        for config_path in config_paths:
            try:
                config = self.load_season_config(config_path)
                config_hash = self.register_config(config_path)
                results[config["name"]] = config_hash
            except Exception as e:
                logger.error(f"❌ Failed to register {config_path}: {e}")
                raise

        return results


def find_all_configs(configs_dir: Path) -> list[Path]:
    """Find all YAML config files in the configs directory (excluding experimental)."""
    configs = []
    for yaml_file in configs_dir.glob("*.yaml"):
        configs.append(yaml_file)
    return sorted(configs)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Register season configurations in the database",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Register specific configs
  uv run python scripts/register_configs.py configs/season-4-v2.yaml configs/season-5.yaml

  # Register all configs in configs directory
  uv run python scripts/register_configs.py --all

  # Register a single config
  uv run python scripts/register_configs.py configs/season-5.yaml
        """,
    )
    parser.add_argument(
        "configs",
        nargs="*",
        type=Path,
        help="Path(s) to YAML configuration file(s) to register",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Register all YAML files in the configs directory",
    )

    args = parser.parse_args()

    # Determine which configs to register
    if args.all:
        # Find all configs in the configs directory
        script_dir = Path(__file__).parent
        configs_dir = script_dir.parent / "configs"
        config_paths = find_all_configs(configs_dir)
        if not config_paths:
            logger.error(f"No YAML config files found in {configs_dir}")
            sys.exit(1)
        logger.info(f"Found {len(config_paths)} config file(s) to register")
    elif args.configs:
        config_paths = args.configs
    else:
        parser.print_help()
        sys.exit(1)

    # Validate all paths exist before starting
    for config_path in config_paths:
        if not config_path.exists():
            logger.error(f"Config file not found: {config_path}")
            sys.exit(1)

    # Register configurations
    registrar = ConfigRegistrar()
    try:
        results = registrar.register_configs(config_paths)

        # Print summary
        print("\n" + "=" * 60)
        print("📊 Registration Summary")
        print("=" * 60)
        for name, config_hash in results.items():
            print(f"  {name:30} {config_hash}")
        print("=" * 60)
        print(f"\n✅ Successfully registered {len(results)} configuration(s)")

    except Exception as e:
        logger.error(f"❌ Registration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
