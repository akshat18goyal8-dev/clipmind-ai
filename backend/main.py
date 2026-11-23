import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings, BASE_DIR
from app.core.database import init_db
from app.api.auth import router as auth_router
from app.api.projects import router as projects_router
from app.api.videos import router as videos_router
from app.api.clips import router as clips_router
from app.api.viral import router as viral_router
from app.api.social import router as social_router
from app.api.export import router as export_router
from app.api.settings import router as settings_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on startup
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CLIPMIND AI: AI-Powered Universal Video Clipping Platform",
    lifespan=lifespan
)

# Enable CORS for local dev and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve media assets statically (clips, thumbnails, exports)
app.mount("/storage", StaticFiles(directory=str(settings.STORAGE_DIR)), name="storage")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(videos_router, prefix=settings.API_V1_STR)
app.include_router(clips_router, prefix=settings.API_V1_STR)
app.include_router(viral_router, prefix=settings.API_V1_STR)
app.include_router(social_router, prefix=settings.API_V1_STR)
app.include_router(export_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

# Serve frontend dist build if present
frontend_dist = BASE_DIR.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
