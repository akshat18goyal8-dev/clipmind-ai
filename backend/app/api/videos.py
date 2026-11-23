import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.core.config import settings
from app.services.video_downloader import VideoDownloaderService
from app.schemas.project import URLAnalysisRequest, URLAnalysisResponse
from app.api.deps import get_current_user
from app.models.user import User
from app.utils.ffmpeg_utils import FFmpegUtils

router = APIRouter(prefix="/videos", tags=["Videos"])

@router.post("/analyze-url", response_model=URLAnalysisResponse)
async def analyze_universal_url(req: URLAnalysisRequest):
    """
    Analyzes any video or stream URL automatically without separate forms.
    Returns metadata, stream detection, and compatibility status.
    """
    if not req.url or not req.url.strip():
        raise HTTPException(status_code=400, detail="Video URL cannot be empty")
        
    analysis = await VideoDownloaderService.probe_url(req.url)
    return {
        "url": analysis.get("url", req.url),
        "supported": analysis.get("supported", True),
        "source_type": analysis.get("source_type", "web"),
        "is_livestream": analysis.get("is_livestream", False),
        "title": analysis.get("title"),
        "duration": analysis.get("duration"),
        "uploader": analysis.get("uploader"),
        "thumbnail": analysis.get("thumbnail"),
        "message": analysis.get("message", "Analyzed successfully"),
        "can_process": analysis.get("can_process", True)
    }

@router.post("/upload")
async def upload_video_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts direct video upload with validation for format and size.
    """
    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format {ext}. Allowed: {', '.join(settings.ALLOWED_VIDEO_EXTENSIONS)}"
        )
        
    upload_id = str(uuid.uuid4())
    user_upload_dir = settings.VIDEOS_DIR / f"upload_{upload_id}"
    user_upload_dir.mkdir(parents=True, exist_ok=True)
    
    target_path = user_upload_dir / f"source{ext}"
    
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    probe = FFmpegUtils.probe_media(str(target_path))
    
    return {
        "file_path": str(target_path),
        "filename": file.filename,
        "duration": probe.get("duration", 0.0),
        "width": probe.get("width", 1920),
        "height": probe.get("height", 1080),
        "fps": probe.get("fps", 30.0),
        "message": "Video uploaded successfully"
    }
