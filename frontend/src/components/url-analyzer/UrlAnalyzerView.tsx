import React, { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, Radio, Film, Clock, User, Sparkles, ArrowRight } from 'lucide-react';
import { videoService, projectService } from '../../services/api';
import { URLAnalysis } from '../../types';
import { useProjects } from '../../context/ProjectContext';

export const UrlAnalyzerView: React.FC = () => {
  const { setActiveSection, refreshProjects, selectProjectById } = useProjects();
  const [testUrl, setTestUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<URLAnalysis | null>(null);
  const [error, setError] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await videoService.analyzeUrl(testUrl.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to probe URL. Verify network connectivity or format.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromAnalyzed = async () => {
    if (!result || !result.can_process) return;
    setCreatingProject(true);
    try {
      const res = await projectService.createFromUrl(result.url, 'Auto-Detect', result.title);
      await refreshProjects();
      await selectProjectById(res.project_id);
      setActiveSection('ai-processing');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start clipping project.');
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Universal URL Analyzer</h2>
        <p className="text-sm text-gray-400 mt-1">
          Inspect any video link or ongoing livestream to examine format, stream viability, and platform details.
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="relative flex items-center shadow-lg rounded-xl overflow-hidden border border-white/10 focus-within:border-brand-500 bg-dark-900">
        <input
          type="text"
          placeholder="Enter YouTube, Twitch, Kick, Twitter/X, or direct .mp4/.m3u8 link..."
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          className="w-full bg-transparent px-5 py-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="mr-2 px-5 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shrink-0 flex items-center gap-2"
        >
          {loading ? (
            <span>Inspecting...</span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Analyze URL</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2.5">
                {result.is_livestream ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Live Stream
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Video Media
                  </span>
                )}
                <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                  {result.source_type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-2">
                {result.title || 'Target Media Stream'}
              </h3>
            </div>

            {result.can_process && (
              <button
                onClick={handleCreateFromAnalyzed}
                disabled={creatingProject}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:brightness-110 text-white font-semibold text-xs tracking-wide shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{creatingProject ? 'Initializing...' : 'Start AI Clipping Project'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-dark-850 p-4 rounded-xl border border-white/5">
              <div className="text-gray-500 text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Duration
              </div>
              <div className="text-base font-bold text-gray-200 mt-1">
                {result.duration ? `${Math.floor(result.duration / 60)}m ${Math.floor(result.duration % 60)}s` : 'Continuous Live'}
              </div>
            </div>

            <div className="bg-dark-850 p-4 rounded-xl border border-white/5">
              <div className="text-gray-500 text-xs flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Creator / Channel
              </div>
              <div className="text-base font-bold text-gray-200 mt-1 truncate">
                {result.uploader || 'Unknown Channel'}
              </div>
            </div>

            <div className="bg-dark-850 p-4 rounded-xl border border-white/5">
              <div className="text-gray-500 text-xs flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5" /> Processing Status
              </div>
              <div className="text-base font-bold text-brand-400 mt-1">
                {result.can_process ? 'Compatible' : 'Restricted'}
              </div>
            </div>
          </div>

          <div className="bg-dark-950/70 p-4 rounded-xl border border-white/5 text-xs text-gray-400">
            <span className="font-semibold text-gray-300">Analysis Message: </span>
            {result.message}
          </div>
        </div>
      )}
    </div>
  );
};
