import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.clip import Clip
from app.models.project import Project
from app.schemas.social import SocialContentResponse, SocialContentUpdateRequest

router = APIRouter(prefix="/social", tags=["Social Media Generator"])

@router.get("/{clip_id}/posts", response_model=SocialContentResponse)
async def get_clip_social_posts(
    clip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Clip)
        .join(Project, Clip.project_id == Project.id)
        .where(Clip.id == clip_id, Project.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    clip = res.scalar_one_or_none()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
        
    posts = json.loads(clip.social_content) if clip.social_content else {}
    
    # Fallback structure if empty
    if "youtube_shorts" not in posts:
        from app.services.social_generator import SocialGeneratorService
        posts = SocialGeneratorService.generate_posts(clip.title, clip.transcript or "", "Entertainment", clip.viral_score)
        
    return {
        "clip_id": clip.id,
        "youtube_shorts": posts.get("youtube_shorts", {}),
        "instagram_reels": posts.get("instagram_reels", {}),
        "tiktok": posts.get("tiktok", {}),
        "hindi_content": posts.get("hindi_content", {})
    }

@router.put("/{clip_id}/posts")
async def update_clip_social_post(
    clip_id: str,
    req: SocialContentUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Clip)
        .join(Project, Clip.project_id == Project.id)
        .where(Clip.id == clip_id, Project.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    clip = res.scalar_one_or_none()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
        
    posts = json.loads(clip.social_content) if clip.social_content else {}
    target_platform = req.platform
    if target_platform not in posts:
        posts[target_platform] = {}
        
    if req.title is not None:
        posts[target_platform]["title"] = req.title
    if req.caption is not None:
        posts[target_platform]["caption"] = req.caption
    if req.description is not None:
        posts[target_platform]["description"] = req.description
    if req.hook is not None:
        posts[target_platform]["hook"] = req.hook
    if req.hashtags is not None:
        posts[target_platform]["hashtags"] = req.hashtags
        
    clip.social_content = json.dumps(posts)
    await db.commit()
    return {"message": f"Updated copy for {target_platform}", "data": posts[target_platform]}
