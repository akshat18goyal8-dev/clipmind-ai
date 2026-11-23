from pydantic import BaseModel
from typing import List, Optional

class PlatformPost(BaseModel):
    title: Optional[str] = None
    caption: str
    description: Optional[str] = None
    hook: str
    hashtags: List[str]

class HindiPlatformPost(BaseModel):
    title: Optional[str] = None
    caption: str
    hook: str
    hashtags: List[str]

class SocialContentResponse(BaseModel):
    clip_id: str
    youtube_shorts: PlatformPost
    instagram_reels: PlatformPost
    tiktok: PlatformPost
    hindi_content: HindiPlatformPost

class SocialContentUpdateRequest(BaseModel):
    platform: str  # "youtube_shorts", "instagram_reels", "tiktok", "hindi_content"
    title: Optional[str] = None
    caption: Optional[str] = None
    description: Optional[str] = None
    hook: Optional[str] = None
    hashtags: Optional[List[str]] = None
