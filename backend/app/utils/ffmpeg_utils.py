import asyncio
import json
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional, Tuple

class FFmpegUtils:
    @staticmethod
    def probe_media(file_path: str) -> Dict[str, Any]:
        """
        Runs ffprobe to retrieve exact stream properties.
        """
        cmd = [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            file_path
        ]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=True)
            data = json.loads(res.stdout)
            
            video_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
            audio_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)
            format_info = data.get("format", {})
            
            duration = float(format_info.get("duration", 0.0))
            if duration == 0.0 and video_stream:
                duration = float(video_stream.get("duration", 0.0))
                
            width = int(video_stream.get("width", 0)) if video_stream else 0
            height = int(video_stream.get("height", 0)) if video_stream else 0
            
            # FPS calculation
            fps = 30.0
            if video_stream and "r_frame_rate" in video_stream:
                r_fr = video_stream["r_frame_rate"].split('/')
                if len(r_fr) == 2 and float(r_fr[1]) > 0:
                    fps = float(r_fr[0]) / float(r_fr[1])
                    
            return {
                "duration": duration,
                "width": width,
                "height": height,
                "fps": fps,
                "has_audio": audio_stream is not None,
                "video_codec": video_stream.get("codec_name") if video_stream else None,
                "audio_codec": audio_stream.get("codec_name") if audio_stream else None,
            }
        except Exception as e:
            return {
                "duration": 0.0,
                "width": 1920,
                "height": 1080,
                "fps": 30.0,
                "has_audio": True,
                "error": str(e)
            }

    @staticmethod
    def extract_audio(video_path: str, output_wav_path: str) -> bool:
        """
        Extracts mono 16kHz WAV for transcription and speech energy detection.
        """
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            output_wav_path
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        return res.returncode == 0

    @staticmethod
    def extract_thumbnail(video_path: str, timestamp: float, output_img_path: str) -> bool:
        """
        Extracts a clean frame as a JPEG thumbnail at timestamp.
        """
        cmd = [
            "ffmpeg", "-y",
            "-ss", str(max(0.0, timestamp)),
            "-i", video_path,
            "-vframes", "1",
            "-q:v", "2",
            output_img_path
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        return res.returncode == 0

    @staticmethod
    def cut_clip(
        video_path: str,
        start_time: float,
        end_time: float,
        output_path: str,
        aspect_ratio: str = "original"
    ) -> bool:
        """
        Extracts segment with exact start and end boundaries.
        """
        duration = max(1.0, end_time - start_time)
        cmd = [
            "ffmpeg", "-y",
            "-ss", str(start_time),
            "-i", video_path,
            "-t", str(duration),
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "22",
            "-c:a", "aac",
            "-b:a", "128k",
            "-avoid_negative_ts", "make_zero",
            output_path
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        return res.returncode == 0

    @staticmethod
    def render_smart_vertical_video(
        input_clip_path: str,
        output_path: str,
        face_x_center_ratio: float = 0.5,
        target_aspect: str = "9:16",
        background_blur: bool = True
    ) -> bool:
        """
        Smart 9:16 vertical crop with face/subject centered and optional blurred ambient background.
        """
        if target_aspect == "16:9":
            # Just copy or re-encode
            cmd = ["ffmpeg", "-y", "-i", input_clip_path, "-c:v", "libx264", "-c:a", "copy", output_path]
            return subprocess.run(cmd, capture_output=True).returncode == 0
            
        if target_aspect == "1:1":
            # Square crop
            vf = "crop='min(iw,ih)':'min(iw,ih)',scale=1080:1080"
            cmd = [
                "ffmpeg", "-y", "-i", input_clip_path,
                "-vf", vf,
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
                "-c:a", "aac", "-b:a", "128k", output_path
            ]
            return subprocess.run(cmd, capture_output=True).returncode == 0

        # Target is 9:16 (1080x1920)
        if background_blur:
            # Dual-layer: blurred scaled background + centered cropped foreground
            filter_complex = (
                "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5[bg];"
                "[0:v]scale=1080:-1[fg];"
                "[bg][fg]overlay=(W-w)/2:(H-h)/2[outv]"
            )
            cmd = [
                "ffmpeg", "-y",
                "-i", input_clip_path,
                "-filter_complex", filter_complex,
                "-map", "[outv]",
                "-map", "0:a?",
                "-c:v", "libx264",
                "-preset", "veryfast",
                "-crf", "22",
                "-c:a", "aac",
                "-b:a", "128k",
                output_path
            ]
        else:
            # Direct crop around subject center
            # crop=ih*9/16:ih:x_offset:0
            filter_complex = f"crop=ih*9/16:ih:'min(max(0, iw*{face_x_center_ratio} - (ih*9/32)), iw - (ih*9/16))':0,scale=1080:1920"
            cmd = [
                "ffmpeg", "-y",
                "-i", input_clip_path,
                "-vf", filter_complex,
                "-c:v", "libx264",
                "-preset", "veryfast",
                "-crf", "22",
                "-c:a", "aac",
                "-b:a", "128k",
                output_path
            ]
        
        res = subprocess.run(cmd, capture_output=True, text=True)
        return res.returncode == 0
