import os
from pathlib import Path

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseModel as BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "CLIPMIND AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "clipmind-ai-super-secret-production-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{BASE_DIR}/storage/clipmind.db")
    
    # Storage Paths
    STORAGE_DIR: Path = BASE_DIR / "storage"
    VIDEOS_DIR: Path = BASE_DIR / "storage" / "videos"
    CLIPS_DIR: Path = BASE_DIR / "storage" / "clips"
    EXPORTS_DIR: Path = BASE_DIR / "storage" / "exports"
    TEMP_DIR: Path = BASE_DIR / "temp"
    
    # Video Limits
    MAX_UPLOAD_SIZE_BYTES: int = 2 * 1024 * 1024 * 1024  # 2 GB
    ALLOWED_VIDEO_EXTENSIONS: list = [".mp4", ".mov", ".mkv", ".webm", ".avi", ".ts"]
    
    # Clip Settings
    SUPPORTED_DURATIONS: list = [10, 15, 30, 60]  # Exact requested durations: 10s, 15s, 30s, 60s
    MAX_CLIP_DURATION: int = 60
    
    # Content Categories
    CATEGORIES: list = [
        "Auto-Detect",
        "Gaming",
        "Podcasts",
        "Education",
        "Interviews",
        "Live Streaming",
        "Entertainment",
        "Comedy",
        "Technology",
        "News",
        "Sports",
        "Reactions",
        "Vlogs",
        "Business",
        "Music",
        "Other"
    ]
    
    # External AI keys (Optional - system uses intelligent local multi-signal analysis)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

settings = Settings()

# Ensure directories exist
for d in [settings.STORAGE_DIR, settings.VIDEOS_DIR, settings.CLIPS_DIR, settings.EXPORTS_DIR, settings.TEMP_DIR]:
    d.mkdir(parents=True, exist_ok=True)
