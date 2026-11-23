import React, { useState } from 'react';
import { 
  Sparkles, 
  Link, 
  Upload, 
  Play, 
  Flame, 
  TrendingUp, 
  Clock, 
  Layers, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Radio,
  Sliders,
  Film
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { projectService, videoService } from '../../services/api';

const CATEGORIES = [
  "Auto-Detect",
  "Gaming",
  "Podcasts",
  "Education",
  "Interviews",
  "Live Streaming",
  "Entertainment",
  "Comedy",
  "Technology",
  "News",
  "Sports",
  "Reactions",
  "Vlogs",
  "Business",
  "Music",
  "Other"
];

const DURATIONS = [10, 15, 30, 60];

export const DashboardView: React.FC = () => {
  const { setActiveSection, refreshProjects, selectProjectById, projects, activeProject } = useProjects();
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Auto-Detect');
  const [selectedDurations, setSelectedDurations] = useState<number[]>([10, 15, 30, 60]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleDuration = (dur: number) => {
    if (selectedDurations.includes(dur)) {
      if (selectedDurations.length > 1) {
        setSelectedDurations(selectedDurations.filter((d) => d !== dur));
      }
    } else {
      setSelectedDurations([...selectedDurations, dur]);
    }
  };

  const handleStartProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMessage('Please paste a video or livestream URL');
      return;
    }
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await projectService.createFromUrl(
        url.trim(),
        category,
        undefined,
        selectedDurations
      );
      await refreshProjects();
      await selectProjectById(res.project_id);
      setActiveSection('ai-processing');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to initiate processing. Please try fallback upload.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalClips = projects.reduce((acc, p) => acc + (p.clips?.length || 0), 0);
  const highViralClips = projects.flatMap(p => p.clips || []).filter(c => c.viral_score >= 80).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Universal URL Section */}
      <div className="relative rounded-2xl overflow-hidden p-8 sm:p-10 border border-brand-500/20 bg-gradient-to-b from-dark-850 to-dark-900 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Next-Gen Multi-Signal AI Video Clipping Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Turn Any Stream or Video into <br />
            <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-accent-cyan bg-clip-text text-transparent">
              Viral Short-Form Clips in Seconds
            </span>
          </h1>
          <p className="mt-3 text-gray-400 text-sm sm:text-base leading-relaxed">
            One universal input for YouTube, Twitch, kick, live streams, podcasts, and direct video links. AI analyzes scene cuts, speech cadence, and audio peaks to crop 9:16 vertical videos with face tracking.
          </p>

          {/* Prominent Universal URL Input Form */}
          <form onSubmit={handleStartProcess} className="mt-7 space-y-4">
            <div className="relative flex items-center shadow-2xl rounded-xl overflow-hidden border border-white/10 focus-within:border-brand-500/70 transition-all bg-dark-950/80">
              <div className="pl-4 text-gray-500">
                <Link className="w-5 h-5 text-brand-400" />
              </div>
              <input
                type="text"
                placeholder="Paste any YouTube, Twitch, Livestream, Podcast or Video URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-transparent px-4 py-4 text-sm text-gray-100 placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="mr-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-brand-600 via-emerald-500 to-accent-cyan hover:brightness-110 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-brand-500/25 disabled:opacity-50 shrink-0"
              >
                {submitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Auto Clip AI</span>
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setActiveSection('upload-video')}
                  className="underline font-semibold ml-2 hover:text-white"
                >
                  Try Fallback Upload
                </button>
              </div>
            )}

            {/* Category Selector Pills */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-gray-300 block mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-brand-400" />
                <span>Content Category (Guides AI contextual understanding):</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      category === cat
                        ? 'bg-brand-500 text-dark-950 font-bold shadow-md shadow-brand-500/30 scale-105'
                        : 'bg-dark-800 text-gray-400 hover:text-gray-200 hover:bg-dark-850 border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Exact Duration Checkboxes */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
              <span className="font-semibold text-gray-400">Target Durations:</span>
              <div className="flex items-center gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDuration(d)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
                      selectedDurations.includes(d)
                        ? 'bg-brand-500/20 text-brand-400 border-brand-500/50'
                        : 'bg-dark-800 text-gray-500 border-white/5'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
              <span className="text-gray-500 text-[11px]">(Snaps to natural sentence boundaries)</span>
            </div>
          </form>
        </div>
      </div>

      {/* Metrics & Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Total Clips Produced</span>
            <Film className="w-4 h-4 text-brand-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">{totalClips}</div>
          <div className="mt-1 text-[11px] text-gray-500">Across {projects.length} projects</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>High Viral Score (&gt;80)</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">{highViralClips}</div>
          <div className="mt-1 text-[11px] text-gray-500">Top-tier engagement potential</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Avg AI Processing Speed</span>
            <Clock className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">4.2x</div>
          <div className="mt-1 text-[11px] text-gray-500">Real-time FFmpeg & int8 Whisper</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Smart 9:16 Aspect Presets</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">100%</div>
          <div className="mt-1 text-[11px] text-gray-500">Auto face-tracking & blur frame</div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveSection('url-analyzer')}
          className="glass-card-hover p-6 rounded-xl border border-white/5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Link className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-brand-400 transition-colors">
            Universal URL Inspector
          </h3>
          <p className="mt-2 text-xs text-gray-400 leading-relaxed">
            Test and inspect any YouTube video, Twitch livestream, or direct media stream before clipping.
          </p>
        </div>

        <div 
          onClick={() => setActiveSection('upload-video')}
          className="glass-card-hover p-6 rounded-xl border border-white/5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-brand-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-brand-400 transition-colors">
            Direct Video File Upload
          </h3>
          <p className="mt-2 text-xs text-gray-400 leading-relaxed">
            Upload local MP4, MOV, or MKV files up to 2GB with drag-and-drop ease and fast chunking.
          </p>
        </div>

        <div 
          onClick={() => setActiveSection('generated-clips')}
          className="glass-card-hover p-6 rounded-xl border border-white/5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-brand-400 transition-colors">
            Clips Studio &amp; Export
          </h3>
          <p className="mt-2 text-xs text-gray-400 leading-relaxed">
            Preview generated 9:16 vertical clips, fine-tune timestamps, view viral scores, and batch download.
          </p>
        </div>
      </div>
    </div>
  );
};
