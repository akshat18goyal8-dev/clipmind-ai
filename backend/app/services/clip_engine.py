import os
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.utils.ffmpeg_utils import FFmpegUtils
from app.services.smart_editor import SmartEditorService
from app.services.viral_scorer import ViralScorerService
from app.services.social_generator import SocialGeneratorService

class ClipEngineService:
    @classmethod
    def render_clip_artifacts(
        cls,
        source_video_path: str,
        project_id: str,
        clip_id: str,
        start_time: float,
        end_time: float,
        title: str,
        category: str,
        transcript_text: str,
        transcript_segments: List[Dict[str, Any]],
        candidate_meta: Dict[str, Any],
        video_duration: float,
        preferred_aspect: str = "9:16",
        enable_face_tracking: bool = True,
        enable_blur: bool = True
    ) -> Dict[str, Any]:
        """
        Executes FFmpeg operations to cut video clip, generate thumbnail,
        produce 9:16 vertical crop with face tracking, and synthesize viral analytics.
        """
        clip_dir = settings.CLIPS_DIR / project_id
        clip_dir.mkdir(parents=True, exist_ok=True)
        
        raw_clip_filename = f"{clip_id}_raw.mp4"
        raw_clip_path = clip_dir / raw_clip_filename
        
        vertical_clip_filename = f"{clip_id}_9_16.mp4"
        vertical_clip_path = clip_dir / vertical_clip_filename
        
        thumb_filename = f"{clip_id}_thumb.jpg"
        thumb_path = clip_dir / thumb_filename
        
        srt_filename = f"{clip_id}_subtitles.srt"
        srt_path = clip_dir / srt_filename
        
        # 1. Cut raw segment
        FFmpegUtils.cut_clip(
            source_video_path,
            start_time,
            end_time,
            str(raw_clip_path)
        )
        
        # 2. Extract thumbnail at midpoint of clip
        mid_time = start_time + ((end_time - start_time) / 2.0)
        FFmpegUtils.extract_thumbnail(source_video_path, mid_time, str(thumb_path))
        
        # 3. Detect face position for smart horizontal centering
        face_center_ratio = 0.5
        if enable_face_tracking:
            face_center_ratio = SmartEditorService.detect_face_center_ratio(
                source_video_path,
                start_time,
                end_time
            )
            
        # 4. Render smart 9:16 vertical video with dynamic hook overlay
        FFmpegUtils.render_smart_vertical_video(
            str(raw_clip_path),
            str(vertical_clip_path),
            face_x_center_ratio=face_center_ratio,
            target_aspect=preferred_aspect,
            background_blur=enable_blur,
            overlay_text=title
        )
        
        # 5. Generate subtitle file
        SmartEditorService.generate_srt_subtitles(
            transcript_segments,
            start_time,
            end_time,
            str(srt_path)
        )
        
        # 6. Calculate viral metrics
        viral_data = ViralScorerService.calculate_viral_profile(
            candidate_meta,
            category,
            video_duration
        )
        
        # 7. Generate social media copy (Shorts, Reels, TikTok, Hindi)
        social_data = SocialGeneratorService.generate_posts(
            title,
            transcript_text,
            category,
            viral_data["total_score"]
        )
        
        return {
            "clip_file_path": f"/storage/clips/{project_id}/{raw_clip_filename}",
            "processed_9_16_path": f"/storage/clips/{project_id}/{vertical_clip_filename}",
            "thumbnail_path": f"/storage/clips/{project_id}/{thumb_filename}",
            "face_center_ratio": face_center_ratio,
            "viral_score": viral_data["total_score"],
            "viral_breakdown": viral_data["metrics"],
            "viral_explanation": viral_data["explanation"],
            "social_content": social_data,
            "subtitles_path": str(srt_path)
        }
