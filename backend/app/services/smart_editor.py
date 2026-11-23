import cv2
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple

class SmartEditorService:
    @staticmethod
    def detect_face_center_ratio(video_path: str, start_time: float, end_time: float) -> float:
        """
        Samples frames in the clip to locate the subject's face using OpenCV Haar Cascade.
        Returns horizontal ratio between 0.0 (left) and 1.0 (right), default 0.5 (center).
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return 0.5
            
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        width = cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 1920.0
        
        # Load OpenCV default Haar cascade for face detection
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_cascade = cv2.CascadeClassifier(cascade_path)
        
        start_frame = int(start_time * fps)
        end_frame = int(end_time * fps)
        step_frames = max(1, int(fps * 0.5))  # Sample every 0.5s
        
        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
        curr_frame = start_frame
        
        face_centers_x = []
        
        while curr_frame <= end_frame:
            ret, frame = cap.read()
            if not ret:
                break
                
            if (curr_frame - start_frame) % step_frames == 0:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))
                
                if len(faces) > 0:
                    # Pick largest face
                    largest_face = max(faces, key=lambda f: f[2] * f[3])
                    x, y, w, h = largest_face
                    center_x = x + (w / 2.0)
                    face_centers_x.append(center_x / width)
                    
            curr_frame += 1
            
        cap.release()
        
        if face_centers_x:
            # Median center ratio
            median_ratio = float(np.median(face_centers_x))
            return max(0.15, min(0.85, round(median_ratio, 3)))
            
        return 0.5  # Standard center if no face detected

    @staticmethod
    def generate_srt_subtitles(transcript_segments: List[Dict[str, Any]], clip_start: float, clip_end: float, output_srt: str) -> bool:
        """
        Generates SRT subtitle file for the clip timeframe.
        """
        def format_timestamp(sec: float) -> str:
            h = int(sec // 3600)
            m = int((sec % 3600) // 60)
            s = int(sec % 60)
            ms = int((sec - int(sec)) * 1000)
            return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

        lines = []
        idx = 1
        for s in transcript_segments:
            seg_start = s["start"]
            seg_end = s["end"]
            
            # Check overlap with clip
            if seg_end > clip_start and seg_start < clip_end:
                rel_start = max(0.0, seg_start - clip_start)
                rel_end = min(clip_end - clip_start, seg_end - clip_start)
                
                lines.append(f"{idx}")
                lines.append(f"{format_timestamp(rel_start)} --> {format_timestamp(rel_end)}")
                lines.append(s["text"].strip())
                lines.append("")
                idx += 1
                
        with open(output_srt, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
            
        return True
