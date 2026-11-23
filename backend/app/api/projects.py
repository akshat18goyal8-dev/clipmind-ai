import asyncio
import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.clip import Clip
from app.schemas.project import ProjectCreateURL, ProjectResponse
from app.core.worker import PipelineWorker, active_tasks
from app.services.video_downloader import VideoDownloaderService
from app.utils.ffmpeg_utils import FFmpegUtils
from pydantic import BaseModel

router = APIRouter(prefix="/projects", tags=["Projects"])

class ProjectCreateUpload(BaseModel):
    title: str
    file_path: str
    category: str = "Auto-Detect"
    description: Optional[str] = None

def _format_project_response(project: Project) -> dict:
    clips_data = []
    for c in project.clips:
        v_breakdown = json.loads(c.viral_breakdown) if c.viral_breakdown else {}
        s_content = json.loads(c.social_content) if c.social_content else {}
        s_style = json.loads(c.subtitle_style) if c.subtitle_style else {}
        clips_data.append({
            "id": c.id,
            "project_id": c.project_id,
            "title": c.title,
            "summary": c.summary,
            "start_time": c.start_time,
            "end_time": c.end_time,
            "duration": c.duration,
            "clip_file_path": c.clip_file_path,
            "processed_9_16_path": c.processed_9_16_path,
            "thumbnail_path": c.thumbnail_path,
            "transcript": c.transcript,
            "viral_score": c.viral_score,
            "viral_breakdown": v_breakdown,
            "viral_explanation": c.viral_explanation,
            "aspect_ratio": c.aspect_ratio,
            "face_tracking_enabled": c.face_tracking_enabled,
            "subtitles_enabled": c.subtitles_enabled,
            "subtitle_style": s_style,
            "background_blur": c.background_blur,
            "social_content": s_content,
            "created_at": c.created_at
        })
    return {
        "id": project.id,
        "user_id": project.user_id,
        "title": project.title,
        "description": project.description,
        "category": project.category,
        "detected_category": project.detected_category,
        "status": project.status,
        "progress": project.progress,
        "current_stage": project.current_stage,
        "error_message": project.error_message,
        "source_type": project.source_type,
        "original_url": project.original_url,
        "video_duration": project.video_duration,
        "video_width": project.video_width,
        "video_height": project.video_height,
        "fps": project.fps,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "clips": clips_data
    }

@router.get("", response_model=List[dict])
async def list_user_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Project)
        .where(Project.user_id == current_user.id)
        .options(selectinload(Project.clips))
        .order_by(desc(Project.created_at))
    )
    res = await db.execute(stmt)
    projects = res.scalars().all()
    return [_format_project_response(p) for p in projects]

@router.post("/from-url")
async def create_project_from_url(
    req: ProjectCreateURL,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    source_info = VideoDownloaderService.identify_source(req.url)
    
    title = req.title or f"{source_info['source_type'].capitalize()} Clipmind Project"
    project_id = str(uuid.uuid4())
    
    project = Project(
        id=project_id,
        user_id=current_user.id,
        title=title,
        category=req.category,
        status="processing",
        progress=2.0,
        current_stage="Queueing URL analysis...",
        source_type="livestream" if source_info.get("is_livestream") else "url",
        original_url=req.url
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    # Spawn background processing task
    task = asyncio.create_task(PipelineWorker.run_pipeline(project_id))
    active_tasks[project_id] = task
    
    return {"project_id": project_id, "status": "processing", "message": "Job initiated successfully"}

@router.post("/from-upload")
async def create_project_from_upload(
    req: ProjectCreateUpload,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    probe = FFmpegUtils.probe_media(req.file_path)
    project_id = str(uuid.uuid4())
    
    project = Project(
        id=project_id,
        user_id=current_user.id,
        title=req.title,
        description=req.description,
        category=req.category,
        status="processing",
        progress=5.0,
        current_stage="Initializing local video...",
        source_type="upload",
        video_file_path=req.file_path,
        video_duration=probe.get("duration", 0.0),
        video_width=probe.get("width", 1920),
        video_height=probe.get("height", 1080),
        fps=probe.get("fps", 30.0)
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    task = asyncio.create_task(PipelineWorker.run_pipeline(project_id))
    active_tasks[project_id] = task
    
    return {"project_id": project_id, "status": "processing", "message": "Job initiated successfully"}

@router.get("/{project_id}")
async def get_project_details(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Project)
        .where(Project.id == project_id, Project.user_id == current_user.id)
        .options(selectinload(Project.clips))
    )
    res = await db.execute(stmt)
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    return _format_project_response(project)

@router.post("/{project_id}/cancel")
async def cancel_project_processing(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await PipelineWorker.cancel_job(project_id)
    return {"cancelled": res, "message": "Processing cancelled by user"}

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Project).where(Project.id == project_id, Project.user_id == current_user.id)
    res = await db.execute(stmt)
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    await PipelineWorker.cancel_job(project_id)
    await db.delete(project)
    await db.commit()
    return {"message": "Project deleted successfully"}
