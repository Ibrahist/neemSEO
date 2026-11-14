"""
Main FastAPI Application Entrypoint for neemSEO.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse

from neemseo import __version__
from neemseo.core.config import settings
from neemseo.db.session import init_db
from neemseo.api.v1 import api_v1_router
from neemseo.api.v1.bot_page import router as bot_router
from neemseo.api.web_dashboard import router as web_router

# Ensure tables are created
init_db()

app = FastAPI(
    title="neemSEO API",
    description="An all-in-one, open-source SEO tool and alternative to Semrush/Ahrefs that is simple, focused, and pay-as-you-go.",
    version=__version__,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for frontend and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
static_dir = os.path.join(os.path.dirname(__file__), "..", "neemseo", "static")
if os.path.isdir(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    favicon_path = os.path.join(static_dir, "neemseo-mark-a.svg")
    if os.path.exists(favicon_path):
        return FileResponse(favicon_path, media_type="image/svg+xml")
    return None

root_index_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "index.html"))

@app.get("/overview", include_in_schema=False)
def overview_page():
    if os.path.exists(root_index_path):
        return FileResponse(root_index_path, media_type="text/html")
    return HTMLResponse("<h1>Overview page not found</h1>", status_code=404)

# Register routes
app.include_router(web_router)
app.include_router(bot_router)
app.include_router(api_v1_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
