import os
import re
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional
import yt_dlp
from app.core.config import settings

class VideoDownloaderService:
    @staticmethod
    def identify_source(url: str) -> Dict[str, Any]:
        """
        Universal URL analyzer:
        Detects platform, stream vs video, and feasibility without hardcoding separate inputs.
        """
        clean_url = url.strip()
        result = {
            "url": clean_url,
            "supported": True,
            "source_type": "unknown",
            "is_livestream": False,
            "can_process": True,
            "message": "Valid URL detected"
        }
        
        # Check standard video/stream platforms
        if re.search(r'(youtube\.com|youtu\.be)', clean_url, re.I):
            result["source_type"] = "youtube"
            if "/live" in clean_url or "live=1" in clean_url:
                result["is_livestream"] = True
                result["message"] = "YouTube Livestream detected"
            else:
                result["message"] = "YouTube Video detected"
        elif re.search(r'twitch\.tv', clean_url, re.I):
            result["source_type"] = "twitch"
            if "/videos/" in clean_url:
                result["is_livestream"] = False
                result["message"] = "Twitch VOD detected"
            else:
                result["is_livestream"] = True
                result["message"] = "Twitch Live Stream detected"
        elif re.search(r'kick\.com', clean_url, re.I):
            result["source_type"] = "kick"
            result["message"] = "Kick Stream detected"
        elif re.search(r'\.(mp4|mov|mkv|webm|m3u8)($|\?)', clean_url, re.I):
            result["source_type"] = "direct_media"
            if ".m3u8" in clean_url.lower():
                result["is_livestream"] = True
                result["message"] = "Direct HLS Stream (.m3u8) detected"
            else:
                result["message"] = "Direct Video File URL detected"
        elif re.search(r'vimeo\.com', clean_url, re.I):
            result["source_type"] = "vimeo"
            result["message"] = "Vimeo Video detected"
        elif re.search(r'twitter\.com|x\.com', clean_url, re.I):
            result["source_type"] = "x_twitter"
            result["message"] = "X / Twitter Video detected"
        elif re.search(r'tiktok\.com', clean_url, re.I):
            result["source_type"] = "tiktok"
            result["message"] = "TikTok Video detected"
        else:
            result["source_type"] = "generic_web"
            result["message"] = "Universal Web Media source"
            
        return result

    @classmethod
    async def probe_url(cls, url: str) -> Dict[str, Any]:
        """
        Quick metadata probe using yt-dlp without downloading full video.
        """
        source_info = cls.identify_source(url)
        
        ydl_opts = {
            'extract_flat': False,
            'skip_download': True,
            'quiet': True,
            'no_warnings': True,
            'socket_timeout': 15,
        }
        
        def _probe():
            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=False)
                    if not info:
                        return None
                    return {
                        "title": info.get("title", "Online Video"),
                        "duration": float(info.get("duration") or 0.0),
                        "uploader": info.get("uploader") or info.get("channel", "Unknown"),
                        "thumbnail": info.get("thumbnail"),
                        "is_live": bool(info.get("is_live")),
                        "description": info.get("description", "")[:500] if info.get("description") else "",
                        "formats_count": len(info.get("formats", [])),
                    }
            except Exception as e:
                err_msg = str(e)
                if "DRM" in err_msg or "protected" in err_msg.lower():
                    raise ValueError("This video is DRM-protected and cannot be downloaded directly. Please use the Fallback Upload option.")
                elif "Sign in" in err_msg or "Private" in err_msg:
                    raise ValueError("This video is private or requires account authentication. Please use the Fallback Upload option.")
                elif "unavailable" in err_msg.lower() or "404" in err_msg:
                    raise ValueError("Video is unavailable or removed by the platform.")
                else:
                    raise ValueError(f"Unable to access URL: {err_msg[:200]}. You can upload the video file directly.")

        try:
            loop = asyncio.get_running_loop()
            meta = await loop.run_in_executor(None, _probe)
            if meta:
                source_info.update(meta)
                if meta.get("is_live"):
                    source_info["is_livestream"] = True
            return source_info
        except Exception as e:
            source_info["supported"] = False
            source_info["can_process"] = False
            source_info["message"] = str(e)
            return source_info

    @classmethod
    async def download_video(cls, url: str, project_id: str, progress_callback=None) -> Dict[str, Any]:
        """
        Downloads video or livestream segment into backend/storage/videos/
        """
        output_dir = settings.VIDEOS_DIR / project_id
        output_dir.mkdir(parents=True, exist_ok=True)
        output_template = str(output_dir / "source.%(ext)s")
        
        def ydl_hook(d):
            if progress_callback and d.get('status') == 'downloading':
                total = d.get('total_bytes') or d.get('total_bytes_estimate') or 1
                downloaded = d.get('downloaded_bytes', 0)
                pct = min(99.0, (downloaded / total) * 100)
                progress_callback(pct, f"Downloading source video: {pct:.1f}%")

        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'outtmpl': output_template,
            'quiet': True,
            'no_warnings': True,
            'progress_hooks': [ydl_hook],
            'merge_output_format': 'mp4',
            'postprocessors': [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            }],
        }
        
        # Check if livestream, limit stream capture to max 5 minutes or buffer
        source_meta = cls.identify_source(url)
        if source_meta.get("is_livestream"):
            # For ongoing livestreams, download recent segment
            ydl_opts['hls_use_mpegts'] = True
            ydl_opts['live_from_start'] = False
        
        def _download():
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                # Find resulting mp4 file
                mp4_path = output_dir / "source.mp4"
                if not mp4_path.exists():
                    # Check for any generated media file
                    files = list(output_dir.glob("source.*"))
                    if files:
                        mp4_path = files[0]
                    else:
                        raise FileNotFoundError("Video download did not create target file.")
                
                return {
                    "file_path": str(mp4_path),
                    "title": info.get("title", "Downloaded Video"),
                    "duration": float(info.get("duration") or 0.0),
                    "uploader": info.get("uploader", "Unknown"),
                    "thumbnail": info.get("thumbnail"),
                    "width": info.get("width") or 1920,
                    "height": info.get("height") or 1080,
                    "fps": info.get("fps") or 30.0,
                    "is_livestream": bool(info.get("is_live")),
                }

        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, _download)
