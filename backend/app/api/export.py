import os
import zipfile
import uuid
import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.clip import Clip
from app.models.project import Project
from app.schemas.clip import BatchExportRequest
from app.core.config import settings

router = APIRouter(prefix="/export", tags=["Export Center"])

@router.post("/batch")
async def batch_export_clips(
    req: BatchExportRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not req.clip_ids:
        raise HTTPException(status_code=400, detail="No clips selected for export")
        
    stmt = (
        select(Clip, Project)
        .join(Project, Clip.project_id == Project.id)
        .where(Clip.id.in_(req.clip_ids), Project.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    rows = res.all()
    
    if not rows:
        raise HTTPException(status_code=404, detail="No valid clips found to export")
        
    export_bundle_id = str(uuid.uuid4())[:8]
    zip_filename = f"clipmind_export_{export_bundle_id}.zip"
    zip_path = settings.EXPORTS_DIR / zip_filename
    
    manifest = {
        "export_id": export_bundle_id,
        "total_clips": len(rows),
        "aspect_ratio": req.aspect_ratio,
        "clips": []
    }
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for clip, project in rows:
            # Pick file based on aspect ratio
            target_file_rel = clip.processed_9_16_path if req.aspect_ratio == "9:16" else clip.clip_file_path
            
            # Map path to disk
            if target_file_rel and target_file_rel.startswith("/storage/"):
                rel_clean = target_file_rel.replace("/storage/", "")
                source_disk_file = settings.STORAGE_DIR / rel_clean
                
                safe_title = "".join(c for c in clip.title if c.isalnum() or c in (' ', '_', '-')).strip()
                dest_filename = f"{safe_title}_{clip.duration}s.mp4"
                
                if source_disk_file.exists():
                    zip_file.write(source_disk_file, arcname=f"videos/{dest_filename}")
                    
            manifest["clips"].append({
                "id": clip.id,
                "title": clip.title,
                "duration": clip.duration,
                "viral_score": clip.viral_score,
                "transcript": clip.transcript,
                "social_copy": json.loads(clip.social_content) if clip.social_content else {}
            })
            
        zip_file.writestr("clipmind_metadata.json", json.dumps(manifest, indent=2))
        
    return {
        "download_url": f"/api/v1/export/download/{zip_filename}",
        "filename": zip_filename,
        "total_clips": len(rows),
        "message": f"Successfully packaged {len(rows)} clips into export bundle"
    }

@router.get("/download/{filename}")
async def download_exported_file(filename: str):
    file_path = settings.EXPORTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Export file not found")
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/zip"
    )
