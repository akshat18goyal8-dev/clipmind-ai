import re
from typing import Dict, Any, List

class SocialGeneratorService:
    @classmethod
    def generate_posts(
        cls,
        title: str,
        transcript_text: str,
        category: str,
        viral_score: float
    ) -> Dict[str, Any]:
        """
        Generates platform-tailored social copy for YouTube Shorts, Instagram Reels,
        TikTok, and Hindi native audiences.
        """
        words = transcript_text.split()
        summary = " ".join(words[:15]) if words else title
        
        # Base category tags
        cat_lower = category.lower().replace(" ", "")
        base_tags = [f"#{cat_lower}", "#shorts", "#viral", "#trending", "#fyp", "#clipmind"]
        
        # 1. YouTube Shorts (High CTR Title, SEO Description, Relevant Tags, Strong Hook)
        yt_hook = f"You won't believe what happened here... 👇" if "Gaming" in category else f"The truth nobody tells you about {category}:"
        yt_title = f"{title} 🔥 #{category}" if len(title) < 55 else f"{title[:50]}... #Shorts"
        yt_desc = (
            f"{transcript_text[:200]}...\n\n"
            f"⚡ Auto-extracted and curated by CLIPMIND AI (Viral Index: {viral_score}/100).\n"
            f"Subscribe for more daily {category} clips!\n\n"
            f"{' '.join(base_tags + [f'#{category}Shorts', '#DailyClips'])}"
        )
        
        # 2. Instagram Reels (Aesthetic hook, engagement prompt, aesthetic spacing, hashtags)
        ig_hook = f"Wait till the end! 🤯" if viral_score > 80 else f"Save this for later! 📌"
        ig_caption = (
            f"{ig_hook}\n\n"
            f"{title}\n\n"
            f"What do you think about this? Drop your thoughts below 👇💭\n\n"
            f".\n.\n"
            f"{' '.join(base_tags + ['#reelsvideo', '#reelsinstagram', '#explorepage', '#instadaily'])}"
        )
        
        # 3. TikTok (Punchy, fast-paced, high curiosity, trend tags)
        tt_hook = f"POV: You witnessed this live 💀" if "Gaming" in category or "Comedy" in category else f"Part 1 | {title}"
        tt_caption = (
            f"{tt_hook} {title[:60]}... thoughts? 👀 "
            f"{' '.join(base_tags[:4] + ['#tiktoktrend', '#foryoupage', '#xyzbca'])}"
        )
        
        # 4. Hindi Native Content (हिंदी भाषा में शीर्षक, कैप्शन, हुक और हैशटैग)
        hindi_hook = "अंत तक ज़रूर देखें! 😱" if viral_score > 80 else "ये बात हर किसी को जाननी चाहिए! 🎯"
        hindi_title = f"{title} | ज़बरदस्त पल 🔥"
        hindi_caption = (
            f"{hindi_hook}\n\n"
            f"{title} - क्या आपको भी ऐसा लगता है? अपनी राय कमेंट में बताएं! 👇\n\n"
            f"{' '.join(base_tags[:3] + ['#हिंदी', '#वायरल', '#रील्स', '#न्यूट्रेंड'])}"
        )
        
        return {
            "youtube_shorts": {
                "title": yt_title,
                "description": yt_desc,
                "hook": yt_hook,
                "hashtags": base_tags + [f"#{category}Shorts", "#DailyClips"]
            },
            "instagram_reels": {
                "title": title,
                "caption": ig_caption,
                "hook": ig_hook,
                "hashtags": base_tags + ["#reelsvideo", "#reelsinstagram", "#explorepage"]
            },
            "tiktok": {
                "title": title,
                "caption": tt_caption,
                "hook": tt_hook,
                "hashtags": base_tags[:4] + ["#tiktoktrend", "#foryoupage"]
            },
            "hindi_content": {
                "title": hindi_title,
                "caption": hindi_caption,
                "hook": hindi_hook,
                "hashtags": base_tags[:3] + ["#हिंदी", "#वायरल", "#रील्स"]
            }
        }
