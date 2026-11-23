import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Clip(Base):
    __tablename__ = "clips"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    duration = Column(Float, nullable=False)  # 10, 15, 30, 60 seconds
    
    # Files
    clip_file_path = Column(String(500), nullable=True)
    processed_9_16_path = Column(String(500), nullable=True)
    thumbnail_path = Column(String(500), nullable=True)
    
    # Transcript of this clip
    transcript = Column(Text, nullable=True)
    
    # Viral Potential Scoring (0 - 100)
    viral_score = Column(Float, default=0.0, index=True)
    viral_breakdown = Column(Text, nullable=True)  # JSON: hook_strength, emotional_impact, engagement_potential, etc.
    viral_explanation = Column(Text, nullable=True)
    
    # Smart Editing Configuration
    aspect_ratio = Column(String(20), default="9:16")  # 9:16, 16:9, 1:1
    face_tracking_enabled = Column(Boolean, default=True)
    subtitles_enabled = Column(Boolean, default=True)
    subtitle_style = Column(Text, nullable=True)  # JSON: style, font, colors, keywords
    background_blur = Column(Boolean, default=True)
    
    # AI Social Media Content Generator
    social_content = Column(Text, nullable=True)  # JSON: YouTube Shorts, Instagram Reels, TikTok, Hindi translations
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    project = relationship("Project", back_populates="clips")
