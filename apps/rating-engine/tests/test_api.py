"""
API endpoint tests for the FastAPI application.
Tests HTTP endpoints with mock dependencies.
"""

import os
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from rating_engine.main import app

client = TestClient(app)


class TestHealthEndpoints:
    """Test health and status endpoints."""

    def test_root_endpoint(self):
        """Test the root endpoint returns health status."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "Riichi Mahjong Rating Engine" in data["message"]

    def test_health_endpoint(self):
        """Test the dedicated health endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "Rating engine is running" in data["message"]


class TestMaterializationEndpoint:
    """Test the materialization endpoint with mocked dependencies."""

    @patch.dict(
        os.environ,
        {"SUPABASE_URL": "https://test.supabase.co", "SUPABASE_SECRET_KEY": "test-key"},
    )
    @patch("rating_engine.main.create_client")
    @patch("rating_engine.main.materialize_data_for_config")
    def test_materialize_success(self, mock_materialize, mock_create_client):
        """Test successful materialization request."""
        # Mock the materialization result
        mock_materialize.return_value = {
            "status": "success",
            "config_hash": "test_hash_123",
            "players_count": 50,
            "games_count": 100,
            "source_data_hash": "source_hash_456",
        }

        request_data = {"config_hash": "test_hash_123", "force_refresh": False}

        response = client.post("/materialize", json=request_data)
        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "success"
        assert data["config_hash"] == "test_hash_123"
        assert data["players_count"] == 50
        assert data["games_count"] == 100

        # Verify mocks were called
        mock_create_client.assert_called_once()
        mock_materialize.assert_called_once_with(
            mock_create_client.return_value, "test_hash_123", force_refresh=False
        )

    @patch.dict(
        os.environ,
        {"SUPABASE_URL": "https://test.supabase.co", "SUPABASE_SECRET_KEY": "test-key"},
    )
    @patch("rating_engine.main.create_client")
    @patch("rating_engine.main.materialize_data_for_config")
    def test_materialize_force_refresh(self, mock_materialize, mock_create_client):
        """Test materialization with force refresh."""
        mock_materialize.return_value = {
            "status": "success",
            "config_hash": "test_hash_123",
        }

        request_data = {"config_hash": "test_hash_123", "force_refresh": True}

        response = client.post("/materialize", json=request_data)
        assert response.status_code == 200

        # Verify force_refresh was passed correctly
        mock_materialize.assert_called_once_with(
            mock_create_client.return_value, "test_hash_123", force_refresh=True
        )

    def test_materialize_missing_env_vars(self):
        """Test materialization fails without environment variables."""
        with patch.dict(os.environ, {}, clear=True):
            request_data = {"config_hash": "test_hash_123"}
            response = client.post("/materialize", json=request_data)

            assert response.status_code == 200  # Returns 200 but with error
            data = response.json()
            assert data["status"] == "error"
            assert "Internal server error - check logs" in data["error"]

    @patch.dict(
        os.environ,
        {"SUPABASE_URL": "https://test.supabase.co", "SUPABASE_SECRET_KEY": "test-key"},
    )
    @patch("rating_engine.main.create_client")
    @patch("rating_engine.main.materialize_data_for_config")
    def test_materialize_exception_handling(self, mock_materialize, mock_create_client):
        """Test that exceptions are properly handled and returned."""
        mock_materialize.side_effect = Exception("Database connection failed")

        request_data = {"config_hash": "test_hash_123"}
        response = client.post("/materialize", json=request_data)

        assert response.status_code == 200  # Error returned in response body
        data = response.json()
        assert data["status"] == "error"
        assert data["config_hash"] == "test_hash_123"
        assert "Internal server error - check logs" in data["error"]


class TestConfigurationsEndpoint:
    """Test the configurations listing endpoint."""

    @patch.dict(
        os.environ,
        {"SUPABASE_URL": "https://test.supabase.co", "SUPABASE_SECRET_KEY": "test-key"},
    )
    @patch("rating_engine.main.create_client")
    def test_list_configurations_success(self, mock_create_client):
        """Test successful configuration listing."""
        # Mock Supabase response
        mock_result = MagicMock()
        mock_result.data = [
            {
                "config_hash": "hash1",
                "name": "Season 3",
                "description": "Winter 2024 Season",
                "is_official": True,
                "created_at": "2024-01-01T00:00:00Z",
            },
            {
                "config_hash": "hash2",
                "name": "Test Config",
                "description": "Testing configuration",
                "is_official": False,
                "created_at": "2024-01-02T00:00:00Z",
            },
        ]

        mock_supabase = MagicMock()
        (
            mock_supabase.table.return_value.select.return_value.order.return_value.execute.return_value
        ) = mock_result
        mock_create_client.return_value = mock_supabase

        response = client.get("/configurations")
        assert response.status_code == 200
        data = response.json()

        assert "configurations" in data
        assert "count" in data
        assert data["count"] == 2
        assert len(data["configurations"]) == 2

        # Verify the configurations structure
        config = data["configurations"][0]
        expected_fields = [
            "config_hash",
            "name",
            "description",
            "is_official",
            "created_at",
        ]
        for field in expected_fields:
            assert field in config

    def test_configurations_missing_env_vars(self):
        """Test configurations endpoint fails without environment variables."""
        with patch.dict(os.environ, {}, clear=True):
            response = client.get("/configurations")
            assert response.status_code == 500

    @patch.dict(
        os.environ,
        {"SUPABASE_URL": "https://test.supabase.co", "SUPABASE_SECRET_KEY": "test-key"},
    )
    @patch("rating_engine.main.create_client")
    def test_configurations_database_error(self, mock_create_client):
        """Test configurations endpoint handles database errors."""
        mock_create_client.side_effect = Exception("Database error")

        response = client.get("/configurations")
        assert response.status_code == 500


class TestRequestValidation:
    """Test request validation for POST endpoints."""

    def test_materialize_invalid_request_body(self):
        """Test materialization with invalid request body."""
        # Missing required config_hash field
        response = client.post("/materialize", json={})
        assert response.status_code == 422  # Validation error

    def test_materialize_invalid_field_types(self):
        """Test materialization with invalid field types."""
        request_data = {
            "config_hash": 123,  # Should be string
            "force_refresh": "true",  # Should be boolean
        }
        response = client.post("/materialize", json=request_data)
        assert response.status_code == 422


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
