"""
Basic test for rating engine health check.
"""

from fastapi.testclient import TestClient

from api.index import app

client = TestClient(app)


def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "service" in data
    assert data["status"] == "healthy"
    assert "Riichi Mahjong Rating Engine" in data["service"]


def test_root_endpoint():
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert "status" in data
    assert data["status"] == "healthy"
