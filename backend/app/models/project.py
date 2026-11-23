import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="Auto-Detect")
    detected_category = Column(String(50), nullable=True)
    
    # Processing state
    status = Column(String(50), default="pending")  # pending, downloading, analyzing, completed, failed, cancelled
    progress = Column(Float, default=0.0)           # 0.0 to 100.0
    current_stage = Column(String(255), default="Initialized")
    error_message = Column(Text, nullable=True)
    
    # Source media details
    source_type = Column(String(50), default="upload")  # url, livestream, upload
    original_url = Column(Text, nullable=True)
    video_file_path = Column(String(500), nullable=True)
    audio_file_path = Column(String(500), nullable=True)
    video_duration = Column(Float, default=0.0)
    video_width = Column(Integer, default=0)
    video_height = Column(Integer, default=0)
    fps = Column(Float, default=0.0)
    
    # Metadata & transcript
    raw_transcript = Column(Text, nullable=True)
    analysis_data = Column(Text, nullable=True)  # JSON string of scene and audio signals
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="projects")
    clips = relationship("Clip", back_populates="project", cascade="all, delete-orphan", order_by="desc(Clip.viral_score)")
