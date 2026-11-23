import re
from typing import List, Dict, Any, Optional

CATEGORY_KEYWORDS = {
    "Gaming": [
        "clutch", "kill", "eliminated", "headshot", "no way", "insane", "gg", "died",
        "win", "lost", "boss", "epic", "rage", "god", "unbelievable", "streak", "ace"
    ],
    "Podcasts": [
        "truth", "controversial", "opinion", "agree", "disagree", "secret", "never told",
        "experience", "reality", "mindset", "money", "power", "relationship", "crazy story"
    ],
    "Education": [
        "concept", "remember", "formula", "important", "fact", "definition", "technique",
        "example", "principle", "mistake", "step by step", "how to", "solution", "method"
    ],
    "Interviews": [
        "question", "answer", "tell us", "honestly", "regret", "career", "advice",
        "biggest", "turning point", "challenge", "future", "dream", "lesson"
    ],
    "Comedy": [
        "haha", "laugh", "joke", "funny", "bro", "ridiculous", "wild", "awkward",
        "punchline", "comedy", "hilarious", "prank", "silly", "what happened"
    ],
    "Sports": [
        "goal", "wicket", "six", "touchdown", "score", "champion", "defense", "strike",
        "tackle", "celebration", "penalty", "match point", "dramatic", "historic"
    ],
    "Technology": [
        "feature", "performance", "benchmark", "ai", "hardware", "speed", "test",
        "breakthrough", "architecture", "upgrade", "specs", "review", "comparison"
    ],
    "Reactions": [
        "oh my god", "what", "bro", "look at that", "unreal", "wait what", "shocked",
        "speechless", "reaction", "check this out", "insanity"
    ],
    "Business": [
        "revenue", "profit", "strategy", "investment", "growth", "scale", "market",
        "customer", "startup", "founder", "valuation", "success", "failure"
    ]
}

class HighlightDetectorService:
    @classmethod
    def auto_detect_category(cls, title: str, transcript_text: str) -> str:
        """
        Determines the most accurate category if user selected Auto-Detect.
        """
        combined = (title + " " + transcript_text).lower()
        best_cat = "Entertainment"
        best_count = 0
        
        for cat, keywords in CATEGORY_KEYWORDS.items():
            count = sum(len(re.findall(r'\b' + re.escape(kw) + r'\b', combined)) for kw in keywords)
            if count > best_count:
                best_count = count
                best_cat = cat
                
        return best_cat

    @classmethod
    def score_window(
        cls,
        start_sec: float,
        end_sec: float,
        audio_energy_peaks: List[Dict[str, float]],
        visual_motion: List[Dict[str, float]],
        transcript_segments: List[Dict[str, Any]],
        category: str
    ) -> Dict[str, Any]:
        """
        Scores a time window based on fused multi-modal signals.
        """
        # 1. Audio peaks count and intensity
        in_window_audio = [
            p for p in audio_energy_peaks if start_sec <= p["time"] <= end_sec
        ]
        audio_score = min(100.0, len(in_window_audio) * 15.0 + (sum(p.get("energy", 0) for p in in_window_audio) * 20.0))
        
        # 2. Visual motion activity
        in_window_motion = [
            m for m in visual_motion if start_sec <= m["time"] <= end_sec
        ]
        avg_motion = (sum(m["motion_score"] for m in in_window_motion) / len(in_window_motion)) if in_window_motion else 10.0
        motion_score = min(100.0, avg_motion * 3.5)
        
        # 3. Speech and category keyword density
        window_text = " ".join([
            s["text"] for s in transcript_segments
            if (s["start"] >= start_sec and s["start"] <= end_sec) or (s["end"] >= start_sec and s["end"] <= end_sec)
        ])
        
        keywords = CATEGORY_KEYWORDS.get(category, CATEGORY_KEYWORDS["Entertainment"] if "Entertainment" in CATEGORY_KEYWORDS else [])
        text_lower = window_text.lower()
        keyword_hits = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', text_lower))
        keyword_score = min(100.0, keyword_hits * 22.0 + (len(window_text.split()) * 0.8))
        
        # 4. First 3 seconds Hook Strength (Opening question, exclamation, sudden energy peak)
        first_3s_audio = [p for p in in_window_audio if p["time"] <= start_sec + 3.5]
        hook_strength = min(100.0, 45.0 + (len(first_3s_audio) * 20.0) + (15.0 if any(char in window_text[:40] for char in ['?', '!', 'why', 'how', 'wait', 'look']) else 0.0))
        
        # 5. Composite viral score (0-100)
        composite = (
            audio_score * 0.30 +
            motion_score * 0.25 +
            keyword_score * 0.25 +
            hook_strength * 0.20
        )
        composite = max(35.0, min(98.5, round(composite, 1)))
        
        return {
            "score": composite,
            "hook_strength": round(hook_strength, 1),
            "audio_score": round(audio_score, 1),
            "motion_score": round(motion_score, 1),
            "keyword_score": round(keyword_score, 1),
            "text": window_text.strip(),
            "keyword_hits": keyword_hits
        }

    @classmethod
    def generate_candidate_highlights(
        cls,
        video_duration: float,
        audio_data: Dict[str, Any],
        motion_data: List[Dict[str, float]],
        transcript_data: Dict[str, Any],
        category: str,
        target_durations: Optional[List[int]] = None
    ) -> List[Dict[str, Any]]:
        """
        Generates distinct candidate clips for exact durations: 10s, 15s, 30s, 60s.
        Ensures clips snap to natural sentence pauses to avoid mid-sentence cuts.
        """
        if not target_durations:
            target_durations = [10, 15, 30, 60]
            
        durations = [d for d in target_durations if d in [10, 15, 30, 60] and d <= video_duration]
        if not durations:
            durations = [min(10, int(video_duration))]
            
        audio_peaks = audio_data.get("peaks", [])
        silences = audio_data.get("silences", [])
        transcript_segments = transcript_data.get("segments", [])
        
        candidates = []
        
        # Identify focal points: audio peaks and speech segment starts
        focal_times = sorted(list(set(
            [p["time"] for p in audio_peaks] + 
            [s["start"] for s in transcript_segments] +
            [m["time"] for m in motion_data if m.get("motion_score", 0) > 20.0]
        )))
        
        if not focal_times:
            # Fallback uniform steps
            focal_times = [i * 15.0 for i in range(max(1, int(video_duration // 15)))]
            
        for dur in durations:
            dur_candidates = []
            for f_time in focal_times:
                # Snap start time slightly before focal peak
                target_start = max(0.0, f_time - 1.5)
                # Snap to sentence or silence pause
                snapped_start = target_start
                for s in transcript_segments:
                    if abs(s["start"] - target_start) < 2.5:
                        snapped_start = s["start"]
                        break
                        
                target_end = min(video_duration, snapped_start + dur)
                # Snap end time to sentence completion
                snapped_end = target_end
                for s in transcript_segments:
                    if abs(s["end"] - target_end) < 2.5:
                        snapped_end = s["end"]
                        break
                        
                clip_actual_dur = round(snapped_end - snapped_start, 2)
                if clip_actual_dur < dur * 0.7 or clip_actual_dur > dur * 1.3:
                    continue
                    
                score_meta = cls.score_window(
                    snapped_start,
                    snapped_end,
                    audio_peaks,
                    motion_data,
                    transcript_segments,
                    category
                )
                
                dur_candidates.append({
                    "start": round(snapped_start, 2),
                    "end": round(snapped_end, 2),
                    "duration": dur,
                    "actual_duration": clip_actual_dur,
                    "score": score_meta["score"],
                    "hook_strength": score_meta["hook_strength"],
                    "audio_score": score_meta["audio_score"],
                    "motion_score": score_meta["motion_score"],
                    "keyword_score": score_meta["keyword_score"],
                    "text": score_meta["text"]
                })
                
            # Sort by score descending and deduplicate overlapping intervals (> 60% overlap)
            dur_candidates.sort(key=lambda x: x["score"], reverse=True)
            non_overlapping = []
            for c in dur_candidates:
                overlap = False
                for sel in non_overlapping:
                    # Check overlap
                    overlap_start = max(c["start"], sel["start"])
                    overlap_end = min(c["end"], sel["end"])
                    if overlap_end > overlap_start:
                        overlap_dur = overlap_end - overlap_start
                        if overlap_dur > 0.5 * min(c["duration"], sel["duration"]):
                            overlap = True
                            break
                if not overlap:
                    non_overlapping.append(c)
                    if len(non_overlapping) >= 4:  # Top 4 per duration tier
                        break
                        
            candidates.extend(non_overlapping)
            
        # Global sort by score
        candidates.sort(key=lambda x: x["score"], reverse=True)
        return candidates[:12]  # Return top 12 best candidate highlights
