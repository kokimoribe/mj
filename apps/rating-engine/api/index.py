"""
FastAPI application for OpenSkill rating calculations.
Vercel serverless function endpoint.
"""

import os
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client

# Import from the proper package location
from rating_engine.materialization import materialize_data_for_config

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


class MaterializationRequest(BaseModel):
    config_hash: str
    force_refresh: bool = False


class MaterializationResponse(BaseModel):
    status: str
    config_hash: str
    players_count: int | None = None
    games_count: int | None = None
    source_data_hash: str | None = None
    error: str | None = None


@app.get("/")
async def health_check():
    """Quick health check - returns service info."""
    return {
        "service": "Riichi Mahjong Rating Engine",
        "status": "healthy",
        "version": "0.1.0",
    }


@app.post("/")
async def materialize_ratings(
    request: MaterializationRequest,
) -> MaterializationResponse:
    """
    Materialize ratings for a given configuration.

    This is the main endpoint for rating calculations.
    Can be called from:
    - Vercel Edge Functions (webhooks)
    - Manual testing (development)
    - Background jobs (maintenance)
    """
    try:
        # Connect to Supabase
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SECRET_KEY")

        if not url or not key:
            raise HTTPException(
                status_code=500, detail="Database connection not configured"
            )

        supabase = create_client(url, key)

        # Run materialization
        result = await materialize_data_for_config(
            supabase, request.config_hash, force_refresh=request.force_refresh
        )

        return MaterializationResponse(**result)

    except (ValueError, KeyError) as e:
        # Handle expected configuration/data errors
        return MaterializationResponse(
            status="error", config_hash=request.config_hash, error=str(e)
        )
    except Exception as e:
        # Log unexpected errors for debugging
        import logging

        logging.exception(f"Unexpected error in materialization: {e}")
        return MaterializationResponse(
            status="error",
            config_hash=request.config_hash,
            error=f"Internal server error: {str(e)}",
        )


@app.get("/leaderboard")
async def get_current_leaderboard() -> dict:
    """Get current leaderboard with ratings and statistics."""
    try:
        # Connect to Supabase
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SECRET_KEY")

        if not url or not key:
            raise HTTPException(
                status_code=500, detail="Database connection not configured"
            )

        supabase = create_client(url, key)

        # Get leaderboard from view
        result = (
            supabase.table("current_leaderboard")
            .select("*")
            .order("display_rating", desc=True)
            .execute()
        )

        if not result.data:
            return {
                "seasonName": "No Data",
                "players": [],
                "totalGames": 0,
                "lastUpdated": datetime.now().isoformat()
            }

        # Get season name from first row
        season_name = "Season 3"  # Default fallback
        if result.data:
            # Try to extract season name from config data
            season_name = "Current Season"

        # Transform data for frontend
        players = []
        total_games = 0
        
        for row in result.data:
            players.append({
                "id": row["display_name"].lower().replace(" ", "_"),  # Create ID from name
                "name": row["display_name"],
                "rating": float(row["display_rating"]),
                "mu": 25.0,  # Will be added when we get real mu/sigma data
                "sigma": 8.33,  # Will be added when we get real mu/sigma data
                "games": row["games_played"],
                "lastGameDate": row["last_game_date"].isoformat() if row["last_game_date"] else "2024-01-01T00:00:00Z",
                "totalPlusMinus": row["total_plus_minus"] or 0,
                "averagePlusMinus": float(row["avg_plus_minus"]) if row["avg_plus_minus"] else 0.0,
                "bestGame": 0,  # Will be added when available
                "worstGame": 0,  # Will be added when available
            })
            total_games = max(total_games, row["games_played"])

        return {
            "seasonName": season_name,
            "players": players,
            "totalGames": total_games,
            "lastUpdated": datetime.now().isoformat()
        }

    except (ValueError, KeyError) as e:
        # Handle expected configuration/data errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log unexpected errors for debugging
        import logging

        logging.exception(f"Unexpected error in leaderboard endpoint: {e}")
        raise HTTPException(
            status_code=500, detail="Internal server error - check logs"
        )


@app.get("/configurations")
async def list_configurations() -> dict:
    """List available rating configurations."""
    try:
        # Connect to Supabase
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SECRET_KEY")

        if not url or not key:
            raise HTTPException(
                status_code=500, detail="Database connection not configured"
            )

        supabase = create_client(url, key)

        # Get configurations
        result = (
            supabase.table("rating_configurations")
            .select("config_hash, name, description, is_official, created_at")
            .order("created_at", desc=True)
            .execute()
        )

        return {"configurations": result.data, "count": len(result.data)}

    except (ValueError, KeyError) as e:
        # Handle expected configuration/data errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log unexpected errors for debugging
        import logging

        logging.exception(f"Unexpected error in configurations endpoint: {e}")
        raise HTTPException(
            status_code=500, detail="Internal server error - check logs"
        )


# This is the ASGI app that Vercel will use
# Export as 'app' for Vercel FastAPI deployment
# handler = app  # Old approach, use 'app' directly