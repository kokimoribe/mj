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
# Note: FastAPI CORS middleware doesn't support wildcard patterns like "https://mj-web-*.vercel.app"
# We need to add specific URLs or use allow_origin_regex
import re

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://mj-web-beta.vercel.app",
        "https://mj-web-psi.vercel.app",
        "https://mj-web-git-main-kokimoribes-projects.vercel.app"
    ],
    allow_origin_regex=r"https://mj-web-.*\.vercel\.app",  # Regex pattern for all preview deployments
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
                    "lastGameDate": row["last_game_date"] if row["last_game_date"] else "2024-01-01T00:00:00Z",
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
                "lastGameDate": row["last_game_date"] if row["last_game_date"] else "2024-01-01T00:00:00Z",
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


@app.get("/games")
async def get_game_history(limit: int = 20) -> dict:
    """Get recent game history."""
    try:
        # Connect to Supabase
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SECRET_KEY")

        if not url or not key:
            raise HTTPException(
                status_code=500, detail="Database connection not configured"
            )

        supabase = create_client(url, key)

        # Get recent games
        result = (
            supabase.table("games")
            .select("*, game_scores(*)")
            .order("date", desc=True)
            .limit(limit)
            .execute()
        )

        if not result.data:
            return {"games": []}

        # Transform game data
        games = []
        for game in result.data:
            game_result = {
                "id": game["id"],
                "date": game["date"],
                "players": []
            }
            
            # Sort scores by placement
            scores = sorted(game.get("game_scores", []), key=lambda x: x["placement"])
            
            for score in scores:
                game_result["players"].append({
                    "name": score["player_id"],
                    "placement": score["placement"],
                    "score": score["score"],
                    "plusMinus": score["plus_minus"],
                    "ratingDelta": 0  # Would need to calculate this
                })
            
            games.append(game_result)

        return {"games": games}

    except Exception as e:
        return {
            "games": [],
            "error": str(e)
        }


@app.get("/players/{player_id}")
async def get_player_profile(player_id: str) -> dict:
    """Get detailed player profile."""
    try:
        # Connect to Supabase
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SECRET_KEY")

        if not url or not key:
            raise HTTPException(
                status_code=500, detail="Database connection not configured"
            )

        supabase = create_client(url, key)

        # Get player from leaderboard view
        result = (
            supabase.table("current_leaderboard")
            .select("*")
            .eq("player_name", player_id.replace("_", " ").title())
            .single()
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Player not found")

        player_data = result.data
        
        return {
            "id": player_id,
            "name": player_data["player_name"],
            "rating": float(player_data["display_rating"]),
            "mu": float(player_data["mu"]),
            "sigma": float(player_data["sigma"]),
            "games": player_data["games_played"],
            "lastGameDate": player_data["last_game_date"] if player_data["last_game_date"] else "2024-01-01T00:00:00Z",
            "totalPlusMinus": player_data["total_plus_minus"] or 0,
            "averagePlusMinus": float(player_data["avg_plus_minus"] or 0),
            "bestGame": player_data["best_game_plus"] or 0,
            "worstGame": player_data["worst_game_minus"] or 0,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats/season")
async def get_season_statistics() -> dict:
    """Get season-wide statistics."""
    try:
        # Connect to Supabase
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SECRET_KEY")

        if not url or not key:
            raise HTTPException(
                status_code=500, detail="Database connection not configured"
            )

        supabase = create_client(url, key)

        # Get basic stats from current leaderboard
        leaderboard_result = (
            supabase.table("current_leaderboard")
            .select("*")
            .execute()
        )

        if not leaderboard_result.data:
            return {
                "totalGames": 0,
                "totalPlayers": 0,
                "averageGamesPerPlayer": 0,
                "highestRating": 0,
                "lowestRating": 0,
                "averageRating": 0,
                "totalPlusMinus": 0,
                "mostActivePlayer": None,
                "biggestWinner": None,
                "biggestLoser": None
            }

        players = leaderboard_result.data
        
        # Calculate statistics
        total_games = sum(p["games_played"] for p in players) // 4  # Approximate
        total_players = len(players)
        avg_games_per_player = sum(p["games_played"] for p in players) / total_players if total_players > 0 else 0
        
        ratings = [float(p["display_rating"]) for p in players]
        highest_rating = max(ratings) if ratings else 0
        lowest_rating = min(ratings) if ratings else 0
        average_rating = sum(ratings) / len(ratings) if ratings else 0
        
        # Find special players
        most_active = max(players, key=lambda p: p["games_played"])
        biggest_winner = max(players, key=lambda p: p["total_plus_minus"] or 0)
        biggest_loser = min(players, key=lambda p: p["total_plus_minus"] or 0)
        
        return {
            "totalGames": total_games,
            "totalPlayers": total_players,
            "averageGamesPerPlayer": round(avg_games_per_player, 1),
            "highestRating": round(highest_rating, 2),
            "lowestRating": round(lowest_rating, 2),
            "averageRating": round(average_rating, 2),
            "totalPlusMinus": sum(p["total_plus_minus"] or 0 for p in players),
            "mostActivePlayer": {
                "name": most_active["player_name"],
                "games": most_active["games_played"]
            },
            "biggestWinner": {
                "name": biggest_winner["player_name"],
                "plusMinus": biggest_winner["total_plus_minus"] or 0
            },
            "biggestLoser": {
                "name": biggest_loser["player_name"],
                "plusMinus": biggest_loser["total_plus_minus"] or 0
            } if (biggest_loser["total_plus_minus"] or 0) < 0 else None
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ratings/configuration")
async def calculate_configuration_ratings(request: dict) -> dict:
    """Calculate ratings with a custom configuration."""
    try:
        # Connect to Supabase
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SECRET_KEY")

        if not url or not key:
            raise HTTPException(
                status_code=500, detail="Database connection not configured"
            )

        supabase = create_client(url, key)
        
        # For now, return same data structure as leaderboard
        # In a real implementation, this would recalculate with the custom config
        result = (
            supabase.table("current_leaderboard")
            .select("*")
            .order("display_rating", desc=True)
            .execute()
        )

        if not result.data:
            return {
                "seasonName": "Custom Configuration",
                "players": [],
                "totalGames": 0,
                "lastUpdated": datetime.now().isoformat()
            }

        # Transform data (simplified - would actually recalculate)
        config = request.get("configuration", {})
        mu_offset = config.get("mu", 25) - 25
        sigma_factor = config.get("sigma", 8.33) / 8.33
        
        players = []
        for row in result.data:
            # Simulate different ratings based on config
            adjusted_mu = float(row["mu"]) + mu_offset
            adjusted_sigma = float(row["sigma"]) * sigma_factor
            adjusted_rating = adjusted_mu - 3 * adjusted_sigma
            
            players.append({
                "id": row["player_name"].lower().replace(" ", "_"),
                "name": row["player_name"],
                "rating": adjusted_rating,
                "mu": adjusted_mu,
                "sigma": adjusted_sigma,
                "games": row["games_played"],
                "lastGameDate": row["last_game_date"] if row["last_game_date"] else "2024-01-01T00:00:00Z",
                "totalPlusMinus": row["total_plus_minus"] or 0,
                "averagePlusMinus": float(row["avg_plus_minus"] or 0),
                "bestGame": row["best_game_plus"] or 0,
                "worstGame": row["worst_game_minus"] or 0,
            })

        # Sort by adjusted rating
        players.sort(key=lambda p: p["rating"], reverse=True)

        return {
            "seasonName": "Custom Configuration",
            "players": players,
            "totalGames": max([p["games"] for p in players], default=0),
            "lastUpdated": datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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