import shutil
from fastapi import APIRouter, Depends
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/system")
async def get_system_settings(current_user: User = Depends(get_current_user)):
    # Calculate storage used in backend/storage
    total_bytes = 0
    file_count = 0
    if settings.STORAGE_DIR.exists():
        for path in settings.STORAGE_DIR.rglob('*'):
            if path.is_file():
                total_bytes += path.stat().st_size
                file_count += 1
                
    total_disk, used_disk, free_disk = shutil.disk_usage(str(settings.STORAGE_DIR))
    
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "categories": settings.CATEGORIES,
        "supported_durations": settings.SUPPORTED_DURATIONS,
        "max_clip_duration": settings.MAX_CLIP_DURATION,
        "max_upload_size_mb": settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024),
        "allowed_extensions": settings.ALLOWED_VIDEO_EXTENSIONS,
        "storage_usage": {
            "app_storage_used_mb": round(total_bytes / (1024 * 1024), 2),
            "files_stored": file_count,
            "system_disk_free_gb": round(free_disk / (1024**3), 2)
        },
        "ai_models": {
            "speech_to_text": "faster-whisper (tiny/base quantized int8)",
            "scene_detection": "PySceneDetect (ContentDetector & Adaptive)",
            "face_tracking": "OpenCV MultiScale Haar Cascade",
            "audio_energy_profiler": "FFmpeg PCM Waveform RMS"
        }
    }
