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


@app.get("/debug")
async def debug_env():
    """Debug endpoint to check environment configuration."""
    return {
        "has_supabase_url": bool(os.getenv("SUPABASE_URL")),
        "has_supabase_secret_key": bool(os.getenv("SUPABASE_SECRET_KEY")),
        "supabase_url_prefix": (os.getenv("SUPABASE_URL") or "")[:30] + "..." if os.getenv("SUPABASE_URL") else None,
        "secret_key_prefix": (os.getenv("SUPABASE_SECRET_KEY") or "")[:20] + "..." if os.getenv("SUPABASE_SECRET_KEY") else None,
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

        # First, check if the view exists and has data
        try:
            result = (
                supabase.table("current_leaderboard")
                .select("*")
                .limit(1)
                .execute()
            )
        except Exception as view_error:
            # View might not exist or have issues, let's try a simpler approach
            # Get data from cached_player_ratings directly
            result = (
                supabase.table("cached_player_ratings")
                .select("*, players!inner(display_name)")
                .order("display_rating", desc=True)
                .limit(20)
                .execute()
            )
            
            if not result.data:
                return {
                    "seasonName": "No Data Available",
                    "players": [],
                    "totalGames": 0,
                    "lastUpdated": datetime.now().isoformat(),
                    "debug": "No cached ratings found"
                }

            # Transform cached_player_ratings data
            players = []
            for row in result.data:
                players.append({
                    "id": row["players"]["display_name"].lower().replace(" ", "_"),
                    "name": row["players"]["display_name"],
                    "rating": float(row["display_rating"]),
                    "mu": float(row["mu"]),
                    "sigma": float(row["sigma"]),
                    "games": row["games_played"],
                    "lastGameDate": row["last_game_date"].isoformat() if row["last_game_date"] else "2024-01-01T00:00:00Z",
                    "totalPlusMinus": row["total_plus_minus"] or 0,
                    "averagePlusMinus": float(row["total_plus_minus"] / max(row["games_played"], 1)),
                    "bestGame": row["best_game_plus"] or 0,
                    "worstGame": row["worst_game_minus"] or 0,
                })

            return {
                "seasonName": "Season 3",
                "players": players,
                "totalGames": max([p["games"] for p in players], default=0),
                "lastUpdated": datetime.now().isoformat(),
                "debug": f"Used cached_player_ratings, found {len(players)} players"
            }

        # If we get here, the view worked
        if not result.data:
            return {
                "seasonName": "No Data",
                "players": [],
                "totalGames": 0,
                "lastUpdated": datetime.now().isoformat(),
                "debug": "current_leaderboard view is empty"
            }

        # Get all data from view
        result = (
            supabase.table("current_leaderboard")
            .select("*")
            .order("display_rating", desc=True)
            .execute()
        )

        # Transform view data for frontend
        players = []
        total_games = 0
        
        for row in result.data:
            players.append({
                "id": row["display_name"].lower().replace(" ", "_"),
                "name": row["display_name"],
                "rating": float(row["display_rating"]),
                "mu": 25.0,  # View doesn't have mu/sigma
                "sigma": 8.33,  # View doesn't have mu/sigma
                "games": row["games_played"],
                "lastGameDate": row["last_game_date"].isoformat() if row["last_game_date"] else "2024-01-01T00:00:00Z",
                "totalPlusMinus": row["total_plus_minus"] or 0,
                "averagePlusMinus": float(row["avg_plus_minus"]) if row["avg_plus_minus"] else 0.0,
                "bestGame": 0,  # Will be added when available
                "worstGame": 0,  # Will be added when available
            })
            total_games = max(total_games, row["games_played"])

        return {
            "seasonName": "Current Season",
            "players": players,
            "totalGames": total_games,
            "lastUpdated": datetime.now().isoformat(),
            "debug": f"Used current_leaderboard view, found {len(players)} players"
        }

    except Exception as e:
        # Return detailed error for debugging
        return {
            "seasonName": "Error",
            "players": [],
            "totalGames": 0,
            "lastUpdated": datetime.now().isoformat(),
            "error": str(e),
            "debug": "Exception occurred in leaderboard endpoint"
        }


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