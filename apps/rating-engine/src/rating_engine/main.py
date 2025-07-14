"""
FastAPI application for OpenSkill rating calculations.
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client

from .materialization import materialize_data_for_config

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


@app.get("/", response_model=HealthResponse)
async def root() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(message="Riichi Mahjong Rating Engine", status="healthy")


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(status="healthy", message="Rating engine is running")


@app.post("/materialize", response_model=MaterializationResponse)
async def materialize_ratings(
    request: MaterializationRequest,
) -> MaterializationResponse:
    """
    Materialize ratings for a given configuration.

    This endpoint can be called from:
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
            error="Internal server error - check logs",
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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
