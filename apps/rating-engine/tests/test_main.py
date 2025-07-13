"""
Basic test for rating engine health check.
"""

from fastapi.testclient import TestClient

from rating_engine.main import app

client = TestClient(app)


def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "message" in data
    assert data["status"] == "healthy"
    assert data["message"] == "Rating engine is running"


def test_root_endpoint():
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "status" in data
    assert data["status"] == "healthy"


def test_leaderboard_endpoint():
    """Test the leaderboard endpoint."""
    response = client.get("/ratings/current")
    assert response.status_code == 200
    data = response.json()
    assert "season" in data
    assert "players" in data
    assert isinstance(data["players"], list)

    # Check if players have the required fields
    if data["players"]:
        player = data["players"][0]
        assert "id" in player
        assert "name" in player
        assert "rating" in player
        assert "games" in player
