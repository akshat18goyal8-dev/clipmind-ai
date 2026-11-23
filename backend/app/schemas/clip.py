from datetime import datetime
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class ClipResponse(BaseModel):
    id: str
    project_id: str
    title: str
    summary: Optional[str] = None
    start_time: float
    end_time: float
    duration: float
    clip_file_path: Optional[str] = None
    processed_9_16_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    transcript: Optional[str] = None
    viral_score: float
    viral_breakdown: Optional[Dict[str, Any]] = None
    viral_explanation: Optional[str] = None
    aspect_ratio: str = "9:16"
    face_tracking_enabled: bool = True
    subtitles_enabled: bool = True
    subtitle_style: Optional[Dict[str, Any]] = None
    background_blur: bool = True
    social_content: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ClipUpdateRequest(BaseModel):
    title: Optional[str] = None
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    aspect_ratio: Optional[str] = None
    face_tracking_enabled: Optional[bool] = None
    subtitles_enabled: Optional[bool] = None
    background_blur: Optional[bool] = None
    subtitle_style: Optional[Dict[str, Any]] = None

class BatchExportRequest(BaseModel):
    clip_ids: List[str]
    aspect_ratio: str = "9:16"  # 9:16, 16:9, 1:1
    render_subtitles: bool = True
    burn_subtitles: bool = True
