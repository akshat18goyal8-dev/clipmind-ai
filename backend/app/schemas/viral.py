from pydantic import BaseModel
from typing import Dict, Any

class ViralScoreMetrics(BaseModel):
    hook_strength: float         # 0-100 (First 3-5 seconds impact)
    emotional_impact: float      # 0-100 (Sentiment / pitch variation)
    engagement_potential: float  # 0-100 (Speech density / motion energy)
    audience_reaction: float     # 0-100 (Chat bursts or audio excitement)
    content_uniqueness: float    # 0-100 (Novelty & key phrase density)
    context_quality: float       # 0-100 (Completeness of thought / punchline)

class ViralScoreDetailResponse(BaseModel):
    clip_id: str
    total_score: float
    rating: str  # "Extreme Viral", "High Engagement", "Good Potential", "Moderate"
    metrics: ViralScoreMetrics
    key_highlights: list[str]
    improvement_tips: list[str]
    disclaimer: str = "Estimated viral potential calculated by multi-signal AI analysis; actual platform distribution depends on algorithm dynamics, posting time, and audience trends."
