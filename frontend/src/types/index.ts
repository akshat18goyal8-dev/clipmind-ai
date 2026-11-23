export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Clip {
  id: string;
  project_id: string;
  title: string;
  summary?: string;
  start_time: number;
  end_time: number;
  duration: number; // 10, 15, 30, 60
  clip_file_path?: string;
  processed_9_16_path?: string;
  thumbnail_path?: string;
  transcript?: string;
  viral_score: number;
  viral_breakdown?: {
    hook_strength?: number;
    emotional_impact?: number;
    engagement_potential?: number;
    audience_reaction?: number;
    content_uniqueness?: number;
    context_quality?: number;
  };
  viral_explanation?: string;
  aspect_ratio: string;
  face_tracking_enabled: boolean;
  subtitles_enabled: boolean;
  background_blur: boolean;
  social_content?: {
    youtube_shorts?: {
      title?: string;
      description?: string;
      hook?: string;
      hashtags?: string[];
    };
    instagram_reels?: {
      title?: string;
      caption?: string;
      hook?: string;
      hashtags?: string[];
    };
    tiktok?: {
      title?: string;
      caption?: string;
      hook?: string;
      hashtags?: string[];
    };
    hindi_content?: {
      title?: string;
      caption?: string;
      hook?: string;
      hashtags?: string[];
    };
  };
  created_at: string;
}

export interface Project {
  id: string;
  user_id: number;
  title: string;
  description?: string;
  category: string;
  detected_category?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  current_stage: string;
  error_message?: string;
  source_type: 'url' | 'livestream' | 'upload';
  original_url?: string;
  video_duration: number;
  video_width: number;
  video_height: number;
  fps: number;
  created_at: string;
  updated_at: string;
  clips: Clip[];
}

export interface URLAnalysis {
  url: string;
  supported: boolean;
  source_type: string;
  is_livestream: boolean;
  title?: string;
  duration?: number;
  uploader?: string;
  thumbnail?: string;
  message: string;
  can_process: boolean;
}

export interface SystemSettings {
  project_name: string;
  version: string;
  categories: string[];
  supported_durations: number[];
  max_clip_duration: number;
  max_upload_size_mb: number;
  allowed_extensions: string[];
  storage_usage: {
    app_storage_used_mb: number;
    files_stored: number;
    system_disk_free_gb: number;
  };
  ai_models: {
    speech_to_text: string;
    scene_detection: string;
    face_tracking: string;
    audio_energy_profiler: string;
  };
}
