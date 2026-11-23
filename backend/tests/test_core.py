import pytest
from app.services.video_downloader import VideoDownloaderService
from app.services.highlight_detector import HighlightDetectorService
from app.services.viral_scorer import ViralScorerService
from app.services.social_generator import SocialGeneratorService

def test_universal_url_identification():
    # YouTube video
    yt = VideoDownloaderService.identify_source("https://www.youtube.com/watch?v=sample101")
    assert yt["source_type"] == "youtube"
    assert yt["is_livestream"] is False

    # YouTube live
    yt_live = VideoDownloaderService.identify_source("https://www.youtube.com/live/stream101")
    assert yt_live["source_type"] == "youtube"
    assert yt_live["is_livestream"] is True

    # Twitch live
    twitch_live = VideoDownloaderService.identify_source("https://www.twitch.tv/livechannel")
    assert twitch_live["source_type"] == "twitch"
    assert twitch_live["is_livestream"] is True

    # Direct media
    direct = VideoDownloaderService.identify_source("https://cdn.example.com/videos/media_sample.mp4")
    assert direct["source_type"] == "direct_media"
    assert direct["is_livestream"] is False

def test_category_auto_detection():
    # Gaming keywords
    cat1 = HighlightDetectorService.auto_detect_category("Insane clutch 1v5 ace", "He got the headshot and won the round")
    assert cat1 == "Gaming"

    # Podcast keywords
    cat2 = HighlightDetectorService.auto_detect_category("The Untold Truth About Success", "In this podcast we share a controversial opinion and secret mindset")
    assert cat2 == "Podcasts"

def test_viral_scorer_metrics():
    candidate_meta = {
        "audio_score": 85.0,
        "motion_score": 80.0,
        "keyword_score": 75.0,
        "hook_strength": 90.0,
        "duration": 30.0,
        "text": "Wait what did he just do? This is completely insane and hilarious!"
    }
    profile = ViralScorerService.calculate_viral_profile(candidate_meta, "Gaming", 120.0)
    assert 0 <= profile["total_score"] <= 100
    assert "metrics" in profile
    assert profile["metrics"]["hook_strength"] >= 70
    assert profile["rating"] in ["Extreme Viral Potential", "High Engagement Potential", "Good Performing Candidate"]

def test_social_generator_content():
    posts = SocialGeneratorService.generate_posts(
        "Insane 1v4 Clutch",
        "Watch this unbelievable gameplay moment where the team makes a clutch comeback",
        "Gaming",
        92.0
    )
    assert "youtube_shorts" in posts
    assert "instagram_reels" in posts
    assert "tiktok" in posts
    assert "hindi_content" in posts
    assert len(posts["hindi_content"]["title"]) > 0
    assert len(posts["tiktok"]["caption"]) > 0
