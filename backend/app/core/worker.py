import asyncio
import os
import json
import uuid
from typing import Dict, Any, Optional
from sqlalchemy import select, update
from app.core.database import AsyncSessionLocal
from app.models.project import Project
from app.models.clip import Clip
from app.core.config import settings
from app.services.video_downloader import VideoDownloaderService
from app.services.scene_detector import SceneDetectorService
from app.services.audio_analyzer import AudioAnalyzerService
from app.services.transcription import TranscriptionService
from app.services.highlight_detector import HighlightDetectorService
from app.services.clip_engine import ClipEngineService
from app.utils.ffmpeg_utils import FFmpegUtils

# Global registry for active background tasks for job cancellation support
active_tasks: Dict[str, asyncio.Task] = {}

class PipelineWorker:
    @classmethod
    async def cancel_job(cls, project_id: str) -> bool:
        if project_id in active_tasks:
            task = active_tasks[project_id]
            task.cancel()
            del active_tasks[project_id]
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(Project).where(Project.id == project_id).values(
                        status="cancelled",
                        current_stage="Cancelled by user"
                    )
                )
                await db.commit()
            return True
        return False

    @classmethod
    async def run_pipeline(cls, project_id: str):
        """
        Orchestrates full AI video processing lifecycle.
        """
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Project).where(Project.id == project_id))
            project = result.scalar_one_or_none()
            if not project:
                return

        temp_wav_path = settings.TEMP_DIR / f"{project_id}_audio.wav"

        async def update_progress(pct: float, stage: str):
            async with AsyncSessionLocal() as local_db:
                await local_db.execute(
                    update(Project).where(Project.id == project_id).values(
                        progress=round(pct, 1),
                        current_stage=stage
                    )
                )
                await local_db.commit()

        try:
            # Stage 1: Download or locate video file (0% - 20%)
            await update_progress(5.0, "Acquiring video source...")
            video_file = project.video_file_path
            
            if project.source_type in ["url", "livestream"] and (not video_file or not os.path.exists(video_file)):
                await update_progress(10.0, "Downloading universal video source...")
                dl_result = await VideoDownloaderService.download_video(
                    project.original_url,
                    project_id
                )
                video_file = dl_result["file_path"]
                
                async with AsyncSessionLocal() as db:
                    await db.execute(
                        update(Project).where(Project.id == project_id).values(
                            video_file_path=video_file,
                            video_duration=dl_result["duration"],
                            video_width=dl_result["width"],
                            video_height=dl_result["height"],
                            fps=dl_result["fps"],
                            title=project.title or dl_result["title"]
                        )
                    )
                    await db.commit()
            
            # Probe metadata if not set
            probe_data = FFmpegUtils.probe_media(video_file)
            duration = probe_data.get("duration", 0.0)
            
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(Project).where(Project.id == project_id).values(
                        video_duration=duration,
                        video_width=probe_data.get("width", 1920),
                        video_height=probe_data.get("height", 1080),
                        fps=probe_data.get("fps", 30.0)
                    )
                )
                await db.commit()

            # Stage 2: Audio extraction and acoustic energy profiling (20% - 40%)
            await update_progress(25.0, "Extracting audio and analyzing acoustic energy...")
            FFmpegUtils.extract_audio(video_file, str(temp_wav_path))
            
            audio_analysis = AudioAnalyzerService.analyze_audio_energy(str(temp_wav_path))
            await update_progress(38.0, "Identified acoustic excitement peaks and speech intervals.")

            # Stage 3: Speech recognition & transcription (40% - 60%)
            await update_progress(45.0, "Running AI speech-to-text transcription...")
            loop = asyncio.get_running_loop()
            transcript_data = await loop.run_in_executor(
                None,
                lambda: TranscriptionService.transcribe(str(temp_wav_path))
            )
            full_transcript = transcript_data.get("full_text", "")
            await update_progress(58.0, f"Transcribed speech ({len(full_transcript.split())} words, {transcript_data.get('language', 'en')}).")

            # Stage 4: Visual scene boundary & motion detection (60% - 75%)
            await update_progress(65.0, "Detecting visual scene boundaries and motion...")
            scenes = await loop.run_in_executor(
                None,
                lambda: SceneDetectorService.detect_scenes(video_file)
            )
            motion_scores = await loop.run_in_executor(
                None,
                lambda: SceneDetectorService.calculate_visual_motion_activity(video_file)
            )
            await update_progress(74.0, f"Analyzed {len(scenes)} visual scene changes.")

            # Stage 5: Category Auto-Detection & Multi-signal highlight ranking (75% - 85%)
            await update_progress(78.0, "Fusing multi-signal sensory data for highlight detection...")
            active_category = project.category
            if active_category == "Auto-Detect":
                active_category = HighlightDetectorService.auto_detect_category(
                    project.title,
                    full_transcript
                )
            
            candidate_highlights = HighlightDetectorService.generate_candidate_highlights(
                video_duration=duration,
                audio_data=audio_analysis,
                motion_data=motion_scores,
                transcript_data=transcript_data,
                category=active_category,
                target_durations=[10, 15, 30, 60]
            )

            await update_progress(84.0, f"Found {len(candidate_highlights)} high-potential candidate clips.")

            # Stage 6: Clip generation, 9:16 vertical crop, subtitles, viral score (85% - 98%)
            step_pct = 14.0 / max(1, len(candidate_highlights))
            current_pct = 85.0
            
            for idx, cand in enumerate(candidate_highlights):
                await update_progress(
                    current_pct,
                    f"Generating clip {idx + 1}/{len(candidate_highlights)} ({cand['duration']}s) with 9:16 face tracking..."
                )
                
                clip_id = str(uuid.uuid4())
                clip_title = f"{active_category} Highlight #{idx + 1}"
                if cand.get("text"):
                    words = cand["text"].split()
                    if words:
                        clip_title = " ".join(words[:6]).capitalize() + "..."
                
                # Execute FFmpeg rendering in threadpool
                clip_artifacts = await loop.run_in_executor(
                    None,
                    lambda c=cand, cid=clip_id, ctitle=clip_title: ClipEngineService.render_clip_artifacts(
                        source_video_path=video_file,
                        project_id=project_id,
                        clip_id=cid,
                        start_time=c["start"],
                        end_time=c["end"],
                        title=ctitle,
                        category=active_category,
                        transcript_text=c.get("text", ""),
                        transcript_segments=transcript_data.get("segments", []),
                        candidate_meta=c,
                        video_duration=duration,
                        preferred_aspect="9:16",
                        enable_face_tracking=True,
                        enable_blur=True
                    )
                )
                
                # Insert Clip into database
                async with AsyncSessionLocal() as db:
                    new_clip = Clip(
                        id=clip_id,
                        project_id=project_id,
                        title=clip_title,
                        summary=cand.get("text", "")[:300],
                        start_time=cand["start"],
                        end_time=cand["end"],
                        duration=cand["duration"],
                        clip_file_path=clip_artifacts["clip_file_path"],
                        processed_9_16_path=clip_artifacts["processed_9_16_path"],
                        thumbnail_path=clip_artifacts["thumbnail_path"],
                        transcript=cand.get("text", ""),
                        viral_score=clip_artifacts["viral_score"],
                        viral_breakdown=json.dumps(clip_artifacts["viral_breakdown"]),
                        viral_explanation=clip_artifacts["viral_explanation"],
                        aspect_ratio="9:16",
                        face_tracking_enabled=True,
                        subtitles_enabled=True,
                        background_blur=True,
                        social_content=json.dumps(clip_artifacts["social_content"])
                    )
                    db.add(new_clip)
                    await db.commit()
                
                current_pct += step_pct

            # Stage 7: Finalize project state (100%)
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(Project).where(Project.id == project_id).values(
                        status="completed",
                        progress=100.0,
                        current_stage="All clips generated successfully!",
                        detected_category=active_category,
                        raw_transcript=full_transcript
                    )
                )
                await db.commit()

        except asyncio.CancelledError:
            pass
        except Exception as e:
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(Project).where(Project.id == project_id).values(
                        status="failed",
                        error_message=str(e),
                        current_stage=f"Processing failed: {str(e)[:150]}"
                    )
                )
                await db.commit()
        finally:
            if project_id in active_tasks:
                del active_tasks[project_id]
            # Cleanup temp audio
            if temp_wav_path.exists():
                try:
                    os.remove(temp_wav_path)
                except Exception:
                    pass
