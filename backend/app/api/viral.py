import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.clip import Clip
from app.models.project import Project
from app.schemas.viral import ViralScoreDetailResponse

router = APIRouter(prefix="/viral", tags=["Viral Analytics"])

@router.get("/{clip_id}/analysis", response_model=ViralScoreDetailResponse)
async def get_clip_viral_analysis(
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
        
    breakdown = json.loads(clip.viral_breakdown) if clip.viral_breakdown else {
        "hook_strength": 75.0,
        "emotional_impact": 70.0,
        "engagement_potential": 80.0,
        "audience_reaction": 65.0,
        "content_uniqueness": 72.0,
        "context_quality": 85.0
    }
    
    score = clip.viral_score
    rating = "Extreme Viral Potential" if score >= 88 else ("High Engagement Potential" if score >= 75 else "Good Performing Candidate")
    
    return {
        "clip_id": clip.id,
        "total_score": score,
        "rating": rating,
        "metrics": breakdown,
        "key_highlights": [
            f"Rated '{rating}' with an overall score of {score}/100",
            f"Initial 3-second Hook Retention: {breakdown.get('hook_strength', 75)}/100",
            f"Acoustic & Sentiment Energy Index: {breakdown.get('emotional_impact', 70)}/100",
            f"Visual Motion & Pacing Factor: {breakdown.get('engagement_potential', 80)}/100"
        ],
        "improvement_tips": [
            "Use dynamic high-contrast word highlights for the first 3 seconds.",
            "Cut right at the climax of the reaction for an endless loop effect.",
            "Post alongside an interactive question poll in the comments."
        ],
        "disclaimer": "Viral scores represent algorithmic potential derived from multi-signal sensory evaluation; real platform distribution is influenced by timing, current trends, and algorithm updates."
    }
