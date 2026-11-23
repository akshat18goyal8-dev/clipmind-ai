import axios from 'axios';
import { Project, Clip, URLAnalysis, SystemSettings, AuthResponse, User } from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clipmind_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username_or_email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', { username_or_email, password });
    return res.data;
  },
  register: async (email: string, username: string, password: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', { email, username, password });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const projectService = {
  list: async (): Promise<Project[]> => {
    const res = await api.get('/projects');
    return res.data;
  },
  get: async (id: string): Promise<Project> => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },
  createFromUrl: async (url: string, category: string, title?: string, preferred_durations: number[] = [10, 15, 30, 60]) => {
    const res = await api.post('/projects/from-url', { url, category, title, preferred_durations });
    return res.data;
  },
  createFromUpload: async (title: string, file_path: string, category: string, description?: string) => {
    const res = await api.post('/projects/from-upload', { title, file_path, category, description });
    return res.data;
  },
  cancel: async (id: string) => {
    const res = await api.post(`/projects/${id}/cancel`);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
};

export const videoService = {
  analyzeUrl: async (url: string): Promise<URLAnalysis> => {
    const res = await api.post('/videos/analyze-url', { url });
    return res.data;
  },
  upload: async (file: File, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(pct);
        }
      },
    });
    return res.data;
  },
};

export const clipService = {
  get: async (clipId: string): Promise<Clip> => {
    const res = await api.get(`/clips/${clipId}`);
    return res.data;
  },
  update: async (clipId: string, updates: Partial<Clip>): Promise<Clip> => {
    const res = await api.patch(`/clips/${clipId}`, updates);
    return res.data;
  },
  delete: async (clipId: string) => {
    const res = await api.delete(`/clips/${clipId}`);
    return res.data;
  },
};

export const viralService = {
  getAnalysis: async (clipId: string) => {
    const res = await api.get(`/viral/${clipId}/analysis`);
    return res.data;
  },
};

export const socialService = {
  getPosts: async (clipId: string) => {
    const res = await api.get(`/social/${clipId}/posts`);
    return res.data;
  },
  updatePost: async (clipId: string, payload: { platform: string; title?: string; caption?: string; description?: string; hook?: string; hashtags?: string[] }) => {
    const res = await api.put(`/social/${clipId}/posts`, payload);
    return res.data;
  },
};

export const exportService = {
  batchExport: async (clipIds: string[], aspectRatio: string = '9:16') => {
    const res = await api.post('/export/batch', {
      clip_ids: clipIds,
      aspect_ratio: aspectRatio,
      render_subtitles: true,
      burn_subtitles: true,
    });
    return res.data;
  },
};

export const settingsService = {
  getSystem: async (): Promise<SystemSettings> => {
    const res = await api.get('/settings/system');
    return res.data;
  },
};

export default api;
