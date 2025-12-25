"""
Data Materialization Engine

Core function for computing derived data (ratings, statistics) and storing them
in Supabase cache tables. Designed to be idempotent and configuration-driven.

This module can be called from:
1. Vercel Edge Functions (production webhooks)
2. Local scripts (manual materialization)
3. FastAPI endpoints (development/testing)
"""

import hashlib
import json
import logging
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

from openskill.models import PlackettLuce
from supabase import Client

logger = logging.getLogger(__name__)

# Create global OpenSkill model instance
openskill_model = PlackettLuce()


@dataclass
class MaterializationConfig:
    """Configuration extracted from rating_configurations table."""

    config_hash: str
    name: str

    # Time bounds
    start_date: str  # ISO format: "2022-02-16"
    end_date: str  # ISO format: "2025-07-22"

    # OpenSkill parameters
    initial_mu: float = 25.0
    initial_sigma: float = 8.33
    confidence_factor: float = 2.0
    decay_rate: float = 0.02

    # Scoring system
    oka: int = 20000
    uma: list[int] | None = None  # [10000, 5000, -5000, -10000]

    # Weight calculation
    weight_divisor: float = 40.0
    weight_min: float = 0.5
    weight_max: float = 1.5

    # Qualification criteria
    min_games: int = 8
    drop_worst: int = 2

    def __post_init__(self) -> None:
        """Validate configuration after initialization."""
        if self.uma is None:
            self.uma = [10000, 5000, -5000, -10000]

        # Validate uma array
        if len(self.uma) != 4:
            raise ValueError(
                f"Uma array must have exactly 4 values, got {len(self.uma)}"
            )

        # Validate weight parameters
        if self.weight_min <= 0 or self.weight_max <= 0:
            raise ValueError("Weight min/max must be positive")

        if self.weight_min >= self.weight_max:
            raise ValueError("Weight min must be less than weight max")

        # Validate OpenSkill parameters
        if self.initial_sigma <= 0:
            raise ValueError("Initial sigma must be positive")

        if self.confidence_factor <= 0:
            raise ValueError("Confidence factor must be positive")


@dataclass
class GameData:
    """Raw game data from source tables."""

    game_id: str
    started_at: datetime
    finished_at: datetime | None
    status: str

    # Player data (indexed by seat)
    seats: dict[str, dict[str, Any]]  # seat -> {player_id, final_score}


@dataclass
class PlayerRating:
    """Player rating state for OpenSkill calculations."""

    player_id: str
    mu: float
    sigma: float
    display_rating: float

    # Statistics
    games_played: int = 0
    total_plus_minus: int = 0
    best_game_plus: int | None = None
    worst_game_minus: int | None = None

    # Streak tracking
    longest_first_streak: int = 0
    longest_fourth_free_streak: int = 0

    # Performance stats (will be calculated from hand data in Phase 1)
    tsumo_rate: float | None = None
    ron_rate: float | None = None
    riichi_rate: float | None = None
    deal_in_rate: float | None = None

    last_game_date: datetime | None = None


class MaterializationEngine:
    """
    Core engine for materializing derived data from source tables.

    This class is responsible for:
    1. Loading configuration and source data
    2. Computing OpenSkill ratings
    3. Calculating statistics and performance metrics
    4. Storing results in cache tables (idempotent)
    """

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def materialize_for_config(
        self, config_hash: str, force_refresh: bool = False
    ) -> dict[str, Any]:
        """
        Main materialization function - idempotent for given config hash.

        Args:
            config_hash: SHA-256 hash of configuration
            force_refresh: If True, recalculates even if cache exists

        Returns:
            Dictionary with materialization results and metadata
        """
        logger.info(f"🚀 Starting materialization for config: {config_hash[:8]}...")

        # 1. Load configuration
        config = await self._load_configuration(config_hash)
        logger.info(f"📋 Loaded config: {config.name}")

        # 2. Load source game data
        games = await self._load_source_games(config)
        logger.info(f"🎮 Loaded {len(games)} games in time range")

        # 3. Check if recalculation needed
        source_data_hash = self._calculate_source_data_hash(games)
        if not force_refresh and await self._is_cache_valid(
            config_hash, source_data_hash
        ):
            logger.info("✅ Cache is valid, skipping recalculation")
            return {"status": "cache_hit", "config_hash": config_hash}

        # 4. Calculate ratings and statistics
        player_ratings, game_results = await self._calculate_ratings(config, games)
        logger.info(f"📊 Calculated ratings for {len(player_ratings)} players")

        # 5. Store results (replace existing cache)
        await self._store_materialized_data(
            config_hash, config, player_ratings, game_results, source_data_hash
        )
        logger.info("💾 Stored materialized data")

        return {
            "status": "materialized",
            "config_hash": config_hash,
            "players_count": len(player_ratings),
            "games_count": len(games),
            "source_data_hash": source_data_hash,
        }

    async def _load_configuration(self, config_hash: str) -> MaterializationConfig:
        """Load configuration from database."""
        result = (
            self.supabase.table("rating_configurations")
            .select("*")
            .eq("config_hash", config_hash)
            .execute()
        )

        if not result.data:
            raise ValueError(f"Configuration not found: {config_hash}")

        config_row = result.data[0]
        config_data = config_row["config_data"]

        # Parse JSON if it's a string
        if isinstance(config_data, str):
            import json

            config_data = json.loads(config_data)

        return MaterializationConfig(
            config_hash=config_hash,
            name=config_row["name"],
            start_date=config_data["timeRange"]["startDate"],
            end_date=config_data["timeRange"]["endDate"],
            initial_mu=config_data["rating"]["initialMu"],
            initial_sigma=config_data["rating"]["initialSigma"],
            confidence_factor=config_data["rating"]["confidenceFactor"],
            decay_rate=config_data["rating"]["decayRate"],
            oka=config_data["scoring"]["oka"],
            uma=config_data["scoring"]["uma"],
            weight_divisor=config_data["weights"]["divisor"],
            weight_min=config_data["weights"]["min"],
            weight_max=config_data["weights"]["max"],
            min_games=config_data["qualification"]["minGames"],
            drop_worst=config_data["qualification"]["dropWorst"],
        )

    async def _load_source_games(self, config: MaterializationConfig) -> list[GameData]:
        """Load games within configuration time range."""
        # Query games with seats in one go using JOIN
        result = (
            self.supabase.table("games")
            .select("""
            id,
            started_at,
            finished_at,
            status,
            game_seats (
                seat,
                player_id,
                final_score
            )
        """)
            .eq("status", "finished")
            .gte("started_at", config.start_date)
            .lte("started_at", config.end_date)
            .execute()
        )

        games = []
        for game_row in result.data:
            # Skip games without complete data
            if not game_row.get("game_seats") or len(game_row["game_seats"]) != 4:
                logger.warning(f"Skipping incomplete game: {game_row['id']}")
                continue

            # Convert seats list to dictionary
            seats = {}
            for seat_data in game_row["game_seats"]:
                if seat_data["final_score"] is None:
                    logger.warning(
                        f"Skipping game with missing scores: {game_row['id']}"
                    )
                    break
                seats[seat_data["seat"]] = {
                    "player_id": seat_data["player_id"],
                    "final_score": seat_data["final_score"],
                }

            if len(seats) == 4:  # Only include complete games
                games.append(
                    GameData(
                        game_id=game_row["id"],
                        started_at=datetime.fromisoformat(
                            game_row["started_at"].replace("Z", "+00:00")
                        ),
                        finished_at=datetime.fromisoformat(
                            game_row["finished_at"].replace("Z", "+00:00")
                        )
                        if game_row["finished_at"]
                        else None,
                        status=game_row["status"],
                        seats=seats,
                    )
                )

        # Sort by start time to ensure chronological processing
        games.sort(key=lambda g: g.started_at)
        return games

    def _calculate_source_data_hash(self, games: list[GameData]) -> str:
        """Calculate hash of source game data for cache invalidation."""
        game_data = [
            {
                "id": game.game_id,
                "started_at": game.started_at.isoformat(),
                "seats": game.seats,
            }
            for game in games
        ]

        data_str = json.dumps(game_data, sort_keys=True)
        return hashlib.sha256(data_str.encode()).hexdigest()

    async def _is_cache_valid(self, config_hash: str, source_data_hash: str) -> bool:
        """Check if cached data is still valid."""
        result = (
            self.supabase.table("cached_player_ratings")
            .select("source_data_hash")
            .eq("config_hash", config_hash)
            .limit(1)
            .execute()
        )

        if not result.data:
            return False

        return bool(result.data[0]["source_data_hash"] == source_data_hash)

    async def _calculate_ratings(
        self, config: MaterializationConfig, games: list[GameData]
    ) -> tuple[dict[str, PlayerRating], list[dict[str, Any]]]:
        """Calculate OpenSkill ratings and game results."""

        # Initialize player ratings
        player_ratings: dict[str, PlayerRating] = {}
        game_results: list[dict[str, Any]] = []

        # Get all unique players
        all_players = set()
        for game in games:
            for seat_data in game.seats.values():
                all_players.add(seat_data["player_id"])

        # Initialize ratings for all players
        for player_id in all_players:
            player_ratings[player_id] = PlayerRating(
                player_id=player_id,
                mu=config.initial_mu,
                sigma=config.initial_sigma,
                display_rating=config.initial_mu
                - config.confidence_factor * config.initial_sigma,
            )

        # Process games chronologically
        for game in games:
            await self._process_single_game(config, game, player_ratings, game_results)

        return player_ratings, game_results

    async def _process_single_game(
        self,
        config: MaterializationConfig,
        game: GameData,
        player_ratings: dict[str, PlayerRating],
        game_results: list[dict[str, Any]],
    ) -> None:
        """Process a single game and update ratings."""

        # Prepare OpenSkill teams (each player is their own team)
        teams = []
        players_in_game = []

        for seat in ["east", "south", "west", "north"]:
            if seat in game.seats:
                player_id = game.seats[seat]["player_id"]
                players_in_game.append((seat, player_id))

                # Create OpenSkill rating
                current_rating = player_ratings[player_id]
                rating = openskill_model.rating(
                    mu=current_rating.mu, sigma=current_rating.sigma
                )
                teams.append([rating])

        # Calculate placements and plus-minus scores
        placements_data = []
        for seat, player_id in players_in_game:
            final_score = game.seats[seat]["final_score"]

            placements_data.append(
                {
                    "seat": seat,
                    "player_id": player_id,
                    "final_score": final_score,
                }
            )

        # Sort by final score to determine placements
        placements_data.sort(key=lambda x: x["final_score"], reverse=True)

        # Assign placements and calculate plus-minus with uma
        for i, player_data in enumerate(placements_data):
            placement = i + 1
            final_score = player_data["final_score"]
            uma_bonus = config.uma[placement - 1]  # Convert 1-based to 0-based index
            plus_minus = final_score - config.oka + uma_bonus

            player_data["placement"] = placement
            player_data["plus_minus"] = plus_minus
            player_data["weight"] = self._calculate_weight(plus_minus, config)

        # Update OpenSkill ratings based on placements
        # IMPORTANT: Match the order of teams (created in seat order)
        # Create a mapping from player_id to placement/weight
        player_to_data = {p["player_id"]: p for p in placements_data}

        # Build ranks and weights in the same order as teams/players_in_game
        ranks = []
        weights = []
        for _seat, player_id in players_in_game:
            player_data = player_to_data[player_id]
            ranks.append(player_data["placement"])
            weights.append([player_data["weight"]])

        # Apply OpenSkill calculation
        new_ratings = openskill_model.rate(teams, ranks, weights=weights)

        # Update player ratings and create game results
        for i, (seat, player_id) in enumerate(players_in_game):
            old_rating = player_ratings[player_id]
            new_rating = new_ratings[i][0]  # First (and only) player in team

            # Find this player's data
            player_data = next(
                p for p in placements_data if p["player_id"] == player_id
            )

            # Update player rating
            player_ratings[player_id] = PlayerRating(
                player_id=player_id,
                mu=new_rating.mu,
                sigma=new_rating.sigma,
                display_rating=new_rating.mu
                - config.confidence_factor * new_rating.sigma,
                games_played=old_rating.games_played + 1,
                total_plus_minus=old_rating.total_plus_minus
                + player_data["plus_minus"],
                best_game_plus=max(
                    old_rating.best_game_plus or 0, player_data["plus_minus"]
                )
                if player_data["plus_minus"] > 0
                else old_rating.best_game_plus,
                worst_game_minus=min(
                    old_rating.worst_game_minus or 0, player_data["plus_minus"]
                )
                if player_data["plus_minus"] < 0
                else old_rating.worst_game_minus,
                last_game_date=game.started_at,
            )

            # Create game result record
            game_results.append(
                {
                    "config_hash": config.config_hash,
                    "game_id": game.game_id,
                    "player_id": player_id,
                    "seat": seat,
                    "final_score": player_data["final_score"],
                    "placement": player_data["placement"],
                    "plus_minus": player_data["plus_minus"],
                    "rating_weight": player_data["weight"],
                    "mu_before": old_rating.mu,
                    "sigma_before": old_rating.sigma,
                    "mu_after": new_rating.mu,
                    "sigma_after": new_rating.sigma,
                }
            )

    def _calculate_weight(
        self, plus_minus: int, config: MaterializationConfig
    ) -> float:
        """Calculate margin-of-victory weight for OpenSkill."""
        weight = 1.0 + plus_minus / config.weight_divisor
        return max(config.weight_min, min(config.weight_max, weight))

    async def _store_materialized_data(
        self,
        config_hash: str,
        config: MaterializationConfig,
        player_ratings: dict[str, PlayerRating],
        game_results: list[dict[str, Any]],
        source_data_hash: str,
    ) -> None:
        """Store materialized data in cache tables (idempotent)."""

        # Delete existing cache for this config (idempotent replacement)
        await self._clear_cache_for_config(config_hash)

        # Prepare player ratings records
        rating_records = [
            {
                "config_hash": config_hash,
                "player_id": rating.player_id,
                "games_start_date": config.start_date,
                "games_end_date": config.end_date,
                "mu": rating.mu,
                "sigma": rating.sigma,
                "display_rating": rating.display_rating,
                "games_played": rating.games_played,
                "total_plus_minus": rating.total_plus_minus,
                "best_game_plus": rating.best_game_plus,
                "worst_game_minus": rating.worst_game_minus,
                "longest_first_streak": rating.longest_first_streak,
                "longest_fourth_free_streak": rating.longest_fourth_free_streak,
                "tsumo_rate": rating.tsumo_rate,
                "ron_rate": rating.ron_rate,
                "riichi_rate": rating.riichi_rate,
                "deal_in_rate": rating.deal_in_rate,
                "last_game_date": rating.last_game_date.isoformat()
                if rating.last_game_date
                else None,
                "source_data_hash": source_data_hash,
                "computed_at": datetime.now(UTC).isoformat(),
            }
            for rating in player_ratings.values()
        ]

        # Insert player ratings
        if rating_records:
            self.supabase.table("cached_player_ratings").insert(
                rating_records
            ).execute()

        # Insert game results
        if game_results:
            # Add computed_at timestamp to all records
            for result in game_results:
                result["computed_at"] = datetime.now(UTC).isoformat()

            self.supabase.table("cached_game_results").insert(game_results).execute()

    async def _clear_cache_for_config(self, config_hash: str) -> None:
        """Clear existing cache data for configuration."""
        # Delete player ratings
        self.supabase.table("cached_player_ratings").delete().eq(
            "config_hash", config_hash
        ).execute()

        # Delete game results
        self.supabase.table("cached_game_results").delete().eq(
            "config_hash", config_hash
        ).execute()


# Convenience function for external usage
async def materialize_data_for_config(
    supabase: Client, config_hash: str, force_refresh: bool = False
) -> dict[str, Any]:
    """
    Main entry point for data materialization.

    Args:
        supabase: Connected Supabase client
        config_hash: SHA-256 hash of configuration to materialize
        force_refresh: If True, recalculates even if cache exists

    Returns:
        Materialization results and metadata
    """
    engine = MaterializationEngine(supabase)
    return await engine.materialize_for_config(config_hash, force_refresh)
