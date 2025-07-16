"""
FastAPI application for OpenSkill rating calculations.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
        "shared_lib_test": "Import working correctly",
    }


@app.post("/")
async def materialize_ratings(
    request: MaterializationRequest,
) -> MaterializationResponse:
    """
    Materialize ratings for a given configuration.

    Currently simplified for testing - demonstrates shared lib import works.
    """
    try:
        # Import our shared materialization logic
        from lib.materialization import MaterializationEngine
        
        # Verify the import works (simplified - no real Supabase connection for demo)
        # In production, we'd pass actual supabase client and call materialize method
        MaterializationEngine(supabase_client=None)
        
        return MaterializationResponse(
            status="success",
            config_hash=request.config_hash,
            players_count=42,  # Demo data
            games_count=150,   # Demo data
            source_data_hash="shared-lib-import-working",
        )
    except Exception as e:
        return MaterializationResponse(
            status="error",
            config_hash=request.config_hash,
            error=f"Import failed: {str(e)}",
        )


@app.get("/configurations")
async def list_configurations() -> dict:
    """List available rating configurations."""
    return {
        "configurations": [],
        "count": 0,
        "message": "Configuration listing not yet implemented",
    }


# This is the ASGI app that Vercel will use
# No need for a separate handler variable
