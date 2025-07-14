"""
Vercel Serverless Function entry point for the Rating Engine.

This file serves as the entry point for Vercel's Python serverless functions.
It imports the FastAPI app and exposes it as a handler for Vercel.
"""

import sys
from pathlib import Path

# Add the src directory to the Python path so we can import rating_engine
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

# Now import after path setup
# ruff: noqa: E402
from rating_engine.main import app

# Export the FastAPI app for Vercel
# Vercel will automatically detect this and create serverless functions
# The app variable must be named 'app' for ASGI applications

# This import is required for Vercel to detect the ASGI application
__all__ = ["app"]
