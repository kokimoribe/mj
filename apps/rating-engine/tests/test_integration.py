"""
Integration tests using real database structure but with controlled test data.

These tests run against a test database or use database fixtures to verify
the complete data flow from configuration to materialized results.
"""

import os
from unittest.mock import MagicMock

import pytest

from rating_engine.materialization import MaterializationEngine


class TestDatabaseIntegration:
    """
    Integration tests that verify database interactions.

    These tests use mock data but follow the real database schema
    to catch schema mismatches and SQL issues.
    """

    def setup_method(self):
        """Setup mock database with realistic structure."""
        self.mock_supabase = MagicMock()
        self.engine = MaterializationEngine(self.mock_supabase)

        # Mock realistic configuration data matching your schema
        self.mock_config_data = {
            "config_hash": "season3_official_hash",
            "name": "Season 3 Official",
            "description": "Official Season 3 rating configuration",
            "is_official": True,
            "config_data": {
                "timeRange": {
                    "startDate": "2022-02-16",
                    "endDate": "2025-07-22",
                    "name": "Season 3",
                },
                "rating": {
                    "initialMu": 25.0,
                    "initialSigma": 8.33,
                    "confidenceFactor": 2.0,
                    "decayRate": 0.02,
                },
                "scoring": {"oka": 20000, "uma": [10000, 5000, -5000, -10000]},
                "weights": {"divisor": 40, "min": 0.5, "max": 1.5},
                "qualification": {"minGames": 8, "dropWorst": 2},
            },
        }

        # Mock realistic game data matching your schema
        # cspell:disable -- ULID test data
        self.mock_games_data = [
            {
                "id": "01JGMC4Q9PFHQR8Z6X8VT2YR5Q",
                "started_at": "2024-01-15T19:00:00.000000+00:00",
                "finished_at": "2024-01-15T22:30:00.000000+00:00",
                "status": "finished",
                "game_seats": [
                    {
                        "seat": "east",
                        "player_id": "01JGMC4Q9PFHQR8Z6X8VT2YR5A",
                        "final_score": 48100,
                    },
                    {
                        "seat": "south",
                        "player_id": "01JGMC4Q9PFHQR8Z6X8VT2YR5B",
                        "final_score": 32000,
                    },
                    {
                        "seat": "west",
                        "player_id": "01JGMC4Q9PFHQR8Z6X8VT2YR5C",
                        "final_score": 15900,
                    },
                    {
                        "seat": "north",
                        "player_id": "01JGMC4Q9PFHQR8Z6X8VT2YR5D",
                        "final_score": 4000,
                    },
                ],
            },
            {
                "id": "01JGMC4Q9PFHQR8Z6X8VT2YR5R",
                "started_at": "2024-01-22T19:00:00.000000+00:00",
                "finished_at": "2024-01-22T22:15:00.000000+00:00",
                "status": "finished",
                "game_seats": [
                    {
                        "seat": "east",
                        "player_id": "01JGMC4Q9PFHQR8Z6X8VT2YR5B",
                        "final_score": 45000,
                    },
                    {
                        "seat": "south",
                        "player_id": "01JGMC4Q9PFHQR8Z6X8VT2YR5A",
                        "final_score": 33000,
                    },
                    {
                        "seat": "west",
                        "player_id": "01JGMC4Q9PFHQR8Z6X8VT2YR5D",
                        "final_score": 20000,
                    },
                    {
                        "seat": "north",
                        "player_id": "01JGMC4Q9PFHQR8Z6X8VT2YR5C",
                        "final_score": 2000,
                    },
                ],
            },
        ]
        # cspell:enable

    def _setup_table_mocks(self):
        """Setup comprehensive table mocks for full integration test."""

        def table_mock(table_name):
            table = MagicMock()

            if table_name == "rating_configurations":
                # Mock configuration lookup
                (
                    table.select.return_value.eq.return_value.execute.return_value.data
                ) = [self.mock_config_data]

            elif table_name == "games":
                # Mock game data query
                (
                    table.select.return_value.eq.return_value.gte.return_value.lte.return_value.execute.return_value.data
                ) = self.mock_games_data

            elif table_name == "cached_player_ratings":
                # Mock cache miss for fresh calculation
                (
                    table.select.return_value.eq.return_value.limit.return_value.execute.return_value.data
                ) = []

                # Mock successful delete and insert
                table.delete.return_value.eq.return_value.execute.return_value = (
                    MagicMock()
                )
                table.insert.return_value.execute.return_value = MagicMock()

            elif table_name == "cached_game_results":
                # Mock cache operations
                table.delete.return_value.eq.return_value.execute.return_value = (
                    MagicMock()
                )
                table.insert.return_value.execute.return_value = MagicMock()

            return table

        self.mock_supabase.table.side_effect = table_mock

    @pytest.mark.asyncio
    async def test_full_materialization_flow(self):
        """Test the complete materialization flow with realistic data."""
        self._setup_table_mocks()

        # Run full materialization
        result = await self.engine.materialize_for_config(
            "season3_official_hash", force_refresh=True
        )

        # Verify successful completion
        assert result["status"] == "materialized"
        assert result["config_hash"] == "season3_official_hash"
        assert result["players_count"] == 4  # Unique players in test data
        assert result["games_count"] == 2  # Games in test data

        # Verify database operations were called
        self.mock_supabase.table.assert_any_call("rating_configurations")
        self.mock_supabase.table.assert_any_call("games")
        self.mock_supabase.table.assert_any_call("cached_player_ratings")
        self.mock_supabase.table.assert_any_call("cached_game_results")

    @pytest.mark.asyncio
    async def test_cache_hit_scenario(self):
        """Test behavior when valid cache exists."""
        # Setup configuration table
        config_table = MagicMock()
        (config_table.select.return_value.eq.return_value.execute.return_value.data) = [
            self.mock_config_data
        ]

        # Setup games table
        games_table = MagicMock()
        (
            games_table.select.return_value.eq.return_value.gte.return_value.lte.return_value.execute.return_value.data
        ) = self.mock_games_data

        # Setup cache table to return matching hash
        cache_table = MagicMock()
        (
            cache_table.select.return_value.eq.return_value.limit.return_value.execute.return_value.data
        ) = [{"source_data_hash": "matching_hash"}]

        def table_mock(table_name):
            if table_name == "rating_configurations":
                return config_table
            elif table_name == "games":
                return games_table
            elif table_name == "cached_player_ratings":
                return cache_table
            else:
                return MagicMock()

        self.mock_supabase.table.side_effect = table_mock

        # Mock source data hash calculation to match
        original_calc_hash = self.engine._calculate_source_data_hash
        self.engine._calculate_source_data_hash = lambda games: "matching_hash"

        try:
            result = await self.engine.materialize_for_config("season3_official_hash")

            # Should be cache hit
            assert result["status"] == "cache_hit"
            assert result["config_hash"] == "season3_official_hash"

        finally:
            # Restore original method
            self.engine._calculate_source_data_hash = original_calc_hash

    @pytest.mark.asyncio
    async def test_incomplete_game_data_handling(self):
        """Test handling of games with incomplete data."""
        # Create game data with missing seat
        incomplete_games = [
            {
                "id": "incomplete_game",
                "started_at": "2024-01-15T19:00:00.000000+00:00",
                "finished_at": "2024-01-15T22:30:00.000000+00:00",
                "status": "finished",
                "game_seats": [
                    {"seat": "east", "player_id": "player_1", "final_score": 48000},
                    {"seat": "south", "player_id": "player_2", "final_score": 32000},
                    {"seat": "west", "player_id": "player_3", "final_score": 20000},
                    # Missing north seat
                ],
            }
        ]

        # Setup mocks with incomplete data
        config_table = MagicMock()
        (config_table.select.return_value.eq.return_value.execute.return_value.data) = [
            self.mock_config_data
        ]

        games_table = MagicMock()
        (
            games_table.select.return_value.eq.return_value.gte.return_value.lte.return_value.execute.return_value.data
        ) = incomplete_games

        cache_table = MagicMock()
        (
            cache_table.select.return_value.eq.return_value.limit.return_value.execute.return_value.data
        ) = []

        def table_mock(table_name):
            if table_name == "rating_configurations":
                return config_table
            elif table_name == "games":
                return games_table
            else:
                return cache_table

        self.mock_supabase.table.side_effect = table_mock

        # Should handle incomplete games gracefully
        result = await self.engine.materialize_for_config("season3_official_hash")

        # Should complete successfully but with 0 valid games
        assert result["status"] == "materialized"
        assert result["games_count"] == 0

    @pytest.mark.asyncio
    async def test_database_error_handling(self):
        """Test handling of database connection errors."""
        # Mock database error
        self.mock_supabase.table.side_effect = Exception("Connection timeout")

        # Should raise the exception (caller handles error boundary)
        with pytest.raises(Exception, match="Connection timeout"):
            await self.engine.materialize_for_config("test_hash")


class TestPerformanceWithLargeDataset:
    """Test performance characteristics with larger datasets."""

    @pytest.mark.slow
    def test_large_dataset_performance(self):
        """Test performance with a large number of games (marked as slow)."""
        # This test would generate a large dataset and measure performance
        # Marked as 'slow' so it can be skipped during normal development
        pass

    def test_memory_usage_with_many_players(self):
        """Test memory efficiency with many unique players."""
        # Test that the system doesn't load unnecessary data into memory
        pass


@pytest.mark.integration
class TestRealDatabaseConnection:
    """
    Tests that could run against a real test database.

    These would be skipped unless specific environment variables are set,
    allowing for optional integration testing against real Supabase.
    """

    def setup_method(self):
        """Setup real database connection if available."""
        self.skip_if_no_test_db()

    def skip_if_no_test_db(self):
        """Skip test if test database is not configured."""
        if not os.getenv("TEST_SUPABASE_URL"):
            pytest.skip("Test database not configured")

    @pytest.mark.skipif(
        not os.getenv("TEST_SUPABASE_URL"), reason="Test database not configured"
    )
    def test_real_database_schema_compatibility(self):
        """Test that our code works with the real database schema."""
        # This would test against a real test database to catch schema issues
        pass


if __name__ == "__main__":
    # Run integration tests
    pytest.main([__file__, "-v", "-m", "integration"])
