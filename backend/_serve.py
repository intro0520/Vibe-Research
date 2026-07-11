"""
Vibe-Research Production Entrypoint

Mounts the FastAPI backend under /api and serves the built frontend SPA at /.
Run: uvicorn _serve:app --host 0.0.0.0 --port 8000
"""
from __future__ import annotations

import os
from pathlib import Path

from fastapi import Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app import app

# -- Static frontend --
STATIC_DIR = Path(__file__).resolve().parent / "static"

if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="frontend")
    print(f"[_serve] Frontend static files mounted from {STATIC_DIR}")

    # Middleware: catch 404 for non-API GET routes and serve index.html (SPA support)
    @app.middleware("http")
    async def spa_middleware(request: Request, call_next):
        response = await call_next(request)
        if response.status_code == 404 and request.method == "GET" and not request.url.path.startswith("/api/"):
            return FileResponse(STATIC_DIR / "index.html")
        return response
else:
    print(f"[_serve] No static directory at {STATIC_DIR}; API-only mode")

# -- Run (for local testing) --
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("_serve:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
