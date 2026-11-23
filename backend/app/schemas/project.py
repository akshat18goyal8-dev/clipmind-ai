from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from app.schemas.clip import ClipResponse

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Auto-Detect"

class ProjectCreateURL(BaseModel):
    url: str
    category: str = "Auto-Detect"
    title: Optional[str] = None
    preferred_durations: Optional[List[int]] = [10, 15, 30, 60]

class ProjectResponse(ProjectBase):
    id: str
    user_id: int
    detected_category: Optional[str] = None
    status: str
    progress: float
    current_stage: str
    error_message: Optional[str] = None
    source_type: str
    original_url: Optional[str] = None
    video_duration: float
    video_width: int
    video_height: int
    fps: float
    created_at: datetime
    updated_at: datetime
    clips: List[ClipResponse] = []

    class Config:
        from_attributes = True

class URLAnalysisRequest(BaseModel):
    url: str

class URLAnalysisResponse(BaseModel):
    url: str
    supported: bool
    source_type: str  # youtube, twitch, livestream, direct_video, other
    is_livestream: bool
    title: Optional[str] = None
    duration: Optional[float] = None
    uploader: Optional[str] = None
    thumbnail: Optional[str] = None
    message: str
    can_process: bool
