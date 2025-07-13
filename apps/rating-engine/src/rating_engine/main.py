"""
FastAPI application for OpenSkill rating calculations.
"""

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()


app = FastAPI(
    title="Riichi Mahjong Rating Engine",
    description="OpenSkill-based rating calculations for mahjong games",
    version="0.1.0",
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    message: str
    status: str


class GameResult(BaseModel):
    player_ids: list[str]
    final_scores: list[int]
    game_date: str


@app.get("/", response_model=HealthResponse)
async def root() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(message="Riichi Mahjong Rating Engine", status="healthy")


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(status="healthy", message="Rating engine is running")


@app.post("/calculate-ratings")
async def calculate_ratings(game: GameResult) -> dict:
    """
    Calculate new ratings after a game.
    Placeholder for Phase 0 - will implement OpenSkill logic later.
    """
    return {
        "message": "Rating calculation received",
        "game": game.dict(),
        "note": "OpenSkill implementation coming in next phase",
    }


@app.get("/ratings/current")
async def get_current_ratings() -> dict:
    """
    Get current season ratings.
    Mock data for Phase 0 - will connect to Supabase later.
    """
    return {
        "season": "Winter 2024",
        "players": [
            {"id": "1", "name": "Alice", "rating": 1650, "games": 12},
            {"id": "2", "name": "Bob", "rating": 1580, "games": 10},
            {"id": "3", "name": "Charlie", "rating": 1520, "games": 8},
            {"id": "4", "name": "Diana", "rating": 1480, "games": 9},
        ],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
