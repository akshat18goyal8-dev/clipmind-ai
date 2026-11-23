import json
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.clip import Clip
from app.models.project import Project
from app.schemas.clip import ClipResponse, ClipUpdateRequest
from app.utils.ffmpeg_utils import FFmpegUtils
from app.services.smart_editor import SmartEditorService
from app.services.viral_scorer import ViralScorerService
from app.services.social_generator import SocialGeneratorService
from app.core.config import settings

router = APIRouter(prefix="/clips", tags=["Clips"])

def _format_clip(clip: Clip) -> dict:
    return {
        "id": clip.id,
        "project_id": clip.project_id,
        "title": clip.title,
        "summary": clip.summary,
        "start_time": clip.start_time,
        "end_time": clip.end_time,
        "duration": clip.duration,
        "clip_file_path": clip.clip_file_path,
        "processed_9_16_path": clip.processed_9_16_path,
        "thumbnail_path": clip.thumbnail_path,
        "transcript": clip.transcript,
        "viral_score": clip.viral_score,
        "viral_breakdown": json.loads(clip.viral_breakdown) if clip.viral_breakdown else {},
        "viral_explanation": clip.viral_explanation,
        "aspect_ratio": clip.aspect_ratio,
        "face_tracking_enabled": clip.face_tracking_enabled,
        "subtitles_enabled": clip.subtitles_enabled,
        "subtitle_style": json.loads(clip.subtitle_style) if clip.subtitle_style else {},
        "background_blur": clip.background_blur,
        "social_content": json.loads(clip.social_content) if clip.social_content else {},
        "created_at": clip.created_at
    }

@router.get("/{clip_id}")
async def get_clip(
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
    return _format_clip(clip)

@router.patch("/{clip_id}")
async def update_clip(
    clip_id: str,
    req: ClipUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Clip, Project)
        .join(Project, Clip.project_id == Project.id)
        .where(Clip.id == clip_id, Project.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    row = res.first()
    if not row:
        raise HTTPException(status_code=404, detail="Clip not found")
    clip, project = row
    
    if req.title is not None:
        clip.title = req.title
    if req.aspect_ratio is not None:
        clip.aspect_ratio = req.aspect_ratio
    if req.face_tracking_enabled is not None:
        clip.face_tracking_enabled = req.face_tracking_enabled
    if req.subtitles_enabled is not None:
        clip.subtitles_enabled = req.subtitles_enabled
    if req.background_blur is not None:
        clip.background_blur = req.background_blur

    # If timestamps changed, re-render clip segment
    if (req.start_time is not None and req.start_time != clip.start_time) or \
       (req.end_time is not None and req.end_time != clip.end_time):
        new_start = req.start_time if req.start_time is not None else clip.start_time
        new_end = req.end_time if req.end_time is not None else clip.end_time
        new_dur = round(new_end - new_start, 2)
        
        if new_dur <= 0 or new_dur > settings.MAX_CLIP_DURATION:
            raise HTTPException(status_code=400, detail="Invalid duration. Must be between 1 and 60 seconds.")
            
        clip.start_time = new_start
        clip.end_time = new_end
        clip.duration = new_dur
        
        # Re-cut media files
        clip_dir = settings.CLIPS_DIR / clip.project_id
        raw_clip_path = clip_dir / f"{clip.id}_raw.mp4"
        vert_clip_path = clip_dir / f"{clip.id}_9_16.mp4"
        
        if project.video_file_path and os.path.exists(project.video_file_path):
            FFmpegUtils.cut_clip(project.video_file_path, new_start, new_end, str(raw_clip_path))
            
            face_center = 0.5
            if clip.face_tracking_enabled:
                face_center = SmartEditorService.detect_face_center_ratio(
                    project.video_file_path,
                    new_start,
                    new_end
                )
            FFmpegUtils.render_smart_vertical_video(
                str(raw_clip_path),
                str(vert_clip_path),
                face_x_center_ratio=face_center,
                target_aspect=clip.aspect_ratio,
                background_blur=clip.background_blur
            )

    await db.commit()
    await db.refresh(clip)
    return _format_clip(clip)

@router.delete("/{clip_id}")
async def delete_clip(
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
        
    await db.delete(clip)
    await db.commit()
    return {"message": "Clip deleted successfully"}
