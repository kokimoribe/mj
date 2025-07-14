"""
Vercel Serverless Function entry point for the Rating Engine.

This file serves as the entry point for Vercel's Python serverless functions.
It imports the FastAPI app and exposes it as a handler for Vercel.
"""

from rating_engine.main import app

# Export the FastAPI app for Vercel
# Vercel will automatically detect this and create serverless functions
# The app variable must be named 'app' for ASGI applications

# This import is required for Vercel to detect the ASGI application
__all__ = ["app"]
