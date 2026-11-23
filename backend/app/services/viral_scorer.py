from typing import Dict, Any, List
import math

class ViralScorerService:
    @classmethod
    def calculate_viral_profile(
        cls,
        candidate_meta: Dict[str, Any],
        category: str,
        video_duration: float
    ) -> Dict[str, Any]:
        """
        Calculates a deterministic, rigorous multi-factor viral score (0-100)
        with granular metric breakdowns and explanatory rationale.
        """
        audio_score = float(candidate_meta.get("audio_score", 50.0))
        motion_score = float(candidate_meta.get("motion_score", 50.0))
        keyword_score = float(candidate_meta.get("keyword_score", 50.0))
        hook_strength = float(candidate_meta.get("hook_strength", 50.0))
        duration = float(candidate_meta.get("duration", 30.0))
        text = candidate_meta.get("text", "")
        
        # 1. Hook Strength (0-100): First 3 seconds impact
        hook_metric = min(99.0, max(25.0, hook_strength))
        
        # 2. Emotional Impact (0-100): Audio dynamic range and vocal inflections
        emotional_metric = min(98.0, max(30.0, (audio_score * 0.7) + (keyword_score * 0.3)))
        
        # 3. Engagement Potential (0-100): Pace, motion, and speech density
        word_count = len(text.split())
        words_per_sec = word_count / max(1.0, duration)
        pacing_factor = min(1.0, words_per_sec / 2.8) * 100.0
        engagement_metric = min(99.0, max(35.0, (motion_score * 0.5) + (pacing_factor * 0.5)))
        
        # 4. Audience Reaction / Energy (0-100): Loudness spikes and excitement clusters
        audience_reaction = min(99.0, max(20.0, audio_score * 0.95))
        
        # 5. Content Uniqueness (0-100): Lexical variety and category punchlines
        unique_words = len(set(text.lower().split()))
        uniqueness_ratio = (unique_words / max(1, word_count)) if word_count else 0.5
        uniqueness_metric = min(98.0, max(40.0, (uniqueness_ratio * 70.0) + (keyword_score * 0.3)))
        
        # 6. Context Quality (0-100): Ideal short-form duration factor (15s & 30s have highest completion rates)
        duration_penalty = 1.0
        if duration == 15:
            duration_factor = 95.0
        elif duration == 30:
            duration_factor = 92.0
        elif duration == 10:
            duration_factor = 85.0
        else:  # 60s
            duration_factor = 78.0
        context_metric = round((duration_factor * 0.6) + (keyword_score * 0.4), 1)

        # Weighted aggregate score
        weights = {
            "hook": 0.25,
            "emotional": 0.20,
            "engagement": 0.20,
            "audience": 0.15,
            "uniqueness": 0.10,
            "context": 0.10
        }
        
        composite_score = (
            hook_metric * weights["hook"] +
            emotional_metric * weights["emotional"] +
            engagement_metric * weights["engagement"] +
            audience_reaction * weights["audience"] +
            uniqueness_metric * weights["uniqueness"] +
            context_metric * weights["context"]
        )
        total_score = round(max(30.0, min(98.5, composite_score)), 1)
        
        # Rating category
        if total_score >= 88.0:
            rating = "Extreme Viral Potential"
        elif total_score >= 75.0:
            rating = "High Engagement Potential"
        elif total_score >= 60.0:
            rating = "Good Performing Candidate"
        else:
            rating = "Moderate Organic Reach"
            
        # Explanations
        explanation_points = []
        if hook_metric > 75:
            explanation_points.append("Strong opening momentum detected in the first 3 seconds, boosting initial viewer retention.")
        if emotional_metric > 75:
            explanation_points.append("High vocal energy and dynamic audio inflections keep attention levels elevated.")
        if engagement_metric > 70:
            explanation_points.append("Consistent visual motion and speech cadence prevent drop-off before the conclusion.")
        if not explanation_points:
            explanation_points.append("Balanced dialogue rhythm with clear topical flow suitable for focused audiences.")
            
        explanation_text = " ".join(explanation_points)
        
        return {
            "total_score": total_score,
            "rating": rating,
            "metrics": {
                "hook_strength": round(hook_metric, 1),
                "emotional_impact": round(emotional_metric, 1),
                "engagement_potential": round(engagement_metric, 1),
                "audience_reaction": round(audience_reaction, 1),
                "content_uniqueness": round(uniqueness_metric, 1),
                "context_quality": round(context_metric, 1)
            },
            "explanation": explanation_text,
            "key_highlights": [
                f"{rating}: {total_score}/100 based on multi-signal sensory evaluation",
                f"Opening Hook Score: {hook_metric:.1f}/100",
                f"Audience Excitement Index: {audience_reaction:.1f}/100"
            ],
            "improvement_tips": [
                "Position the punchline or core visual reveal within the first 5 seconds.",
                "Ensure contrasting captions highlight key emotional trigger words.",
                "Optimal posting window for this format is 12:00 PM - 3:00 PM or 6:00 PM - 9:00 PM local time."
            ]
        }
