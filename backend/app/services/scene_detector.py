import cv2
import numpy as np
from typing import List, Dict, Any
from scenedetect import open_video, SceneManager
from scenedetect.detectors import ContentDetector, AdaptiveDetector

class SceneDetectorService:
    @staticmethod
    def detect_scenes(video_path: str, threshold: float = 27.0, min_scene_len_sec: float = 2.0) -> List[Dict[str, float]]:
        """
        Detects video cut points and scene transition timestamps using PySceneDetect.
        """
        scenes = []
        try:
            video = open_video(video_path)
            scene_manager = SceneManager()
            scene_manager.add_detector(ContentDetector(threshold=threshold, min_scene_len=int(video.frame_rate * min_scene_len_sec)))
            scene_manager.detect_scenes(video)
            scene_list = scene_manager.get_scene_list()
            
            for scene in scene_list:
                start_sec = scene[0].get_seconds()
                end_sec = scene[1].get_seconds()
                scenes.append({
                    "start": round(start_sec, 2),
                    "end": round(end_sec, 2),
                    "duration": round(end_sec - start_sec, 2)
                })
        except Exception as e:
            # Fallback if scenedetect fails on specific codecs: uniform 15-second windows
            cap = cv2.VideoCapture(video_path)
            fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
            total_frames = cap.get(cv2.CAP_PROP_FRAME_COUNT) or (fps * 60)
            duration = total_frames / fps
            cap.release()
            
            step = 10.0
            curr = 0.0
            while curr < duration:
                scenes.append({
                    "start": round(curr, 2),
                    "end": round(min(duration, curr + step), 2),
                    "duration": round(min(duration, curr + step) - curr, 2)
                })
                curr += step
                
        return scenes

    @staticmethod
    def calculate_visual_motion_activity(video_path: str, sample_interval: float = 1.0) -> List[Dict[str, float]]:
        """
        Samples frames to calculate optical flow / motion delta score for action/excitement detection.
        """
        activity_scores = []
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return []
            
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        frame_interval = int(fps * sample_interval)
        prev_gray = None
        frame_idx = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_idx % frame_interval == 0:
                # Resize for fast processing
                small = cv2.resize(frame, (320, 180))
                gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
                
                timestamp = frame_idx / fps
                motion_score = 0.0
                if prev_gray is not None:
                    # Absolute frame difference
                    diff = cv2.absdiff(gray, prev_gray)
                    motion_score = float(np.mean(diff))
                    
                activity_scores.append({
                    "time": round(timestamp, 2),
                    "motion_score": round(motion_score, 2)
                })
                prev_gray = gray
                
            frame_idx += 1
            if frame_idx > fps * 3600:  # Safety cap at 1 hour
                break
                
        cap.release()
        return activity_scores
