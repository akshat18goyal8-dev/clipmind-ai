import React, { useState } from 'react';
import { 
  Sparkles, 
  Link, 
  UploadCloud, 
  Sliders, 
  ArrowRight,
  Layers,
  Radio,
  FileVideo
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { projectService } from '../../services/api';

const CATEGORIES = [
  "Auto-Detect", "Gaming", "Podcasts", "Education", "Interviews", 
  "Live Streaming", "Entertainment", "Comedy", "Technology", 
  "News", "Sports", "Reactions", "Vlogs", "Business", "Music", "Other"
];

const DURATIONS = [10, 15, 30, 60];

export const CreateProjectView: React.FC = () => {
  const { setActiveSection, refreshProjects, selectProjectById } = useProjects();
  const [tab, setTab] = useState<'url' | 'upload'>('url');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Auto-Detect');
  const [selectedDurations, setSelectedDurations] = useState<number[]>([10, 15, 30, 60]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleDuration = (dur: number) => {
    if (selectedDurations.includes(dur)) {
      if (selectedDurations.length > 1) {
        setSelectedDurations(selectedDurations.filter((d) => d !== dur));
      }
    } else {
      setSelectedDurations([...selectedDurations, dur]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'url') {
      if (!url.trim()) {
        setError('Please enter a video or stream URL');
        return;
      }
      setSubmitting(true);
      setError('');
      try {
        const res = await projectService.createFromUrl(
          url.trim(),
          category,
          title.trim() || undefined,
          selectedDurations
        );
        await refreshProjects();
        await selectProjectById(res.project_id);
        setActiveSection('ai-processing');
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to create project from URL');
      } finally {
        setSubmitting(false);
      }
    } else {
      setActiveSection('upload-video');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Create New Clipping Project</h2>
        <p className="text-sm text-gray-400 mt-1">
          Select your video source and let the AI scan audio excitement, speech cadence, and visual transitions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setTab('url')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            tab === 'url'
              ? 'bg-brand-500 text-dark-950 shadow-lg shadow-brand-500/20'
              : 'bg-dark-900 text-gray-400 hover:text-gray-200 border border-white/5'
          }`}
        >
          <Link className="w-4 h-4" />
          <span>Universal URL / Livestream</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('upload-video')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            tab === 'upload'
              ? 'bg-brand-500 text-dark-950 shadow-lg shadow-brand-500/20'
              : 'bg-dark-900 text-gray-400 hover:text-gray-200 border border-white/5'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Direct Video File Upload</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 glass-panel p-6 sm:p-8 rounded-2xl border border-white/5">
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1.5">Universal Video or Stream URL</label>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="e.g., https://youtube.com/watch?v=... or https://twitch.tv/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-dark-850 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1.5">Custom Title (Optional)</label>
          <input
            type="text"
            placeholder="Auto-detected from media if left blank"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-dark-850 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Content Category Selector */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-brand-400" />
            <span>Content Category</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  category === cat
                    ? 'bg-brand-500 text-dark-950 font-bold shadow-md shadow-brand-500/20'
                    : 'bg-dark-850 text-gray-400 hover:text-gray-200 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Durations */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-2">Target Clip Durations</label>
          <div className="flex items-center gap-2">
            {DURATIONS.map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => toggleDuration(dur)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  selectedDurations.includes(dur)
                    ? 'bg-brand-500/20 text-brand-400 border-brand-500/50'
                    : 'bg-dark-850 text-gray-500 border-white/5'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-emerald-500 to-accent-cyan hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{submitting ? 'Initializing AI Pipeline...' : 'Start Video Processing'}</span>
        </button>
      </form>
    </div>
  );
};
