import React, { useState } from 'react';
import { 
  Film, 
  Play, 
  Clock, 
  Flame, 
  Trash2, 
  Edit3, 
  Download, 
  Sparkles, 
  TrendingUp, 
  Sliders, 
  Check, 
  X,
  Volume2,
  Crop,
  Layers
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { clipService } from '../../services/api';
import { Clip } from '../../types';

export const ClipsGalleryView: React.FC = () => {
  const { activeProject, activeClip, setActiveClip, setActiveSection, refreshProjects } = useProjects();
  const [durationFilter, setDurationFilter] = useState<number | 'all'>('all');
  const [editingClipId, setEditingClipId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStart, setEditStart] = useState<number>(0);
  const [editEnd, setEditEnd] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'9_16' | 'raw'>('9_16');

  if (!activeProject || !activeProject.clips || activeProject.clips.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-300">No Generated Clips Available</h3>
        <p className="text-xs text-gray-500 mt-1 mb-6">
          Paste a video URL or upload a file in the dashboard to generate AI-curated clips.
        </p>
        <button
          onClick={() => setActiveSection('dashboard')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 text-white font-bold text-xs"
        >
          Create New Project
        </button>
      </div>
    );
  }

  const clips = activeProject.clips;
  const filteredClips = durationFilter === 'all'
    ? clips
    : clips.filter((c) => Math.round(c.duration) === durationFilter);

  const selectedClip = activeClip || (clips.length > 0 ? clips[0] : null);

  const startEdit = (c: Clip) => {
    setEditingClipId(c.id);
    setEditTitle(c.title);
    setEditStart(c.start_time);
    setEditEnd(c.end_time);
  };

  const cancelEdit = () => {
    setEditingClipId(null);
  };

  const saveEdit = async (clipId: string) => {
    setIsSaving(true);
    try {
      await clipService.update(clipId, {
        title: editTitle,
        start_time: editStart,
        end_time: editEnd,
      });
      await refreshProjects();
      setEditingClipId(null);
    } catch (err) {
      alert('Failed to update clip. Check duration constraints.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteClip = async (clipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this clip?')) {
      await clipService.delete(clipId);
      await refreshProjects();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Bar Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Generated Clips</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
              {clips.length} Clips
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Browse, trim timestamps, customize 9:16 vertical crop, and export platform-ready short videos.
          </p>
        </div>

        {/* Exact Duration Filter buttons */}
        <div className="flex items-center gap-1.5 bg-dark-900 p-1 rounded-xl border border-white/5 text-xs font-semibold">
          <button
            onClick={() => setDurationFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              durationFilter === 'all'
                ? 'bg-brand-500 text-dark-950 font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            All Durations
          </button>
          {[10, 15, 30, 60].map((dur) => (
            <button
              key={dur}
              onClick={() => setDurationFilter(dur)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                durationFilter === dur
                  ? 'bg-brand-500 text-dark-950 font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {dur}s
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio layout: Left Video Player & Controls, Right Gallery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Video Preview Player & Trimmer (5 cols) */}
        {selectedClip && (
          <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-white/10 space-y-5 sticky top-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-brand-400" />
                <span>Player &amp; Trim Studio</span>
              </span>
              <div className="flex items-center gap-1 bg-dark-950 p-1 rounded-lg border border-white/5 text-[11px] font-semibold">
                <button
                  onClick={() => setActiveTab('9_16')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTab === '9_16' ? 'bg-brand-500 text-dark-950 font-bold' : 'text-gray-400'
                  }`}
                >
                  9:16 Vertical
                </button>
                <button
                  onClick={() => setActiveTab('raw')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTab === 'raw' ? 'bg-brand-500 text-dark-950 font-bold' : 'text-gray-400'
                  }`}
                >
                  Original
                </button>
              </div>
            </div>

            {/* Video Player Display */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-[9/16] max-h-[480px] mx-auto shadow-2xl border border-white/10 flex items-center justify-center">
              <video
                key={selectedClip.id + activeTab}
                controls
                className="w-full h-full object-contain"
                src={activeTab === '9_16' && selectedClip.processed_9_16_path ? selectedClip.processed_9_16_path : selectedClip.clip_file_path}
              />
            </div>

            {/* Viral Badge & Title */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-extrabold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {selectedClip.viral_score}/100 Viral Index
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{selectedClip.duration}s</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSection('viral-analytics')}
                    className="text-xs font-semibold text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" /> Breakdown
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold text-white line-clamp-2">{selectedClip.title}</h3>
              {selectedClip.transcript && (
                <p className="text-xs text-gray-400 mt-2 bg-dark-950/70 p-3 rounded-lg border border-white/5 line-clamp-3 italic">
                  "{selectedClip.transcript}"
                </p>
              )}
            </div>

            {/* Start / End Timestamp Editor */}
            <div className="bg-dark-850 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                <span>Timestamp Precision Trimmer</span>
                <span className="text-gray-500">Duration: {(selectedClip.end_time - selectedClip.start_time).toFixed(1)}s</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Start Time (sec)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={editingClipId === selectedClip.id ? editStart : selectedClip.start_time}
                      onChange={(e) => {
                        if (editingClipId !== selectedClip.id) startEdit(selectedClip);
                        setEditStart(parseFloat(e.target.value) || 0);
                      }}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">End Time (sec)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={editingClipId === selectedClip.id ? editEnd : selectedClip.end_time}
                      onChange={(e) => {
                        if (editingClipId !== selectedClip.id) startEdit(selectedClip);
                        setEditEnd(parseFloat(e.target.value) || 0);
                      }}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-200"
                    />
                  </div>
                </div>
              </div>

              {editingClipId === selectedClip.id && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => saveEdit(selectedClip.id)}
                    disabled={isSaving}
                    className="flex-1 py-1.5 rounded-lg bg-brand-500 text-dark-950 font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Re-cutting...' : 'Apply & Re-cut Clip'}</span>
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1.5 rounded-lg bg-dark-800 text-gray-400 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => setActiveSection('caption-generator')}
                className="py-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/10 text-gray-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Captions &amp; Social</span>
              </button>
              <button
                onClick={() => setActiveSection('export-center')}
                className="py-2.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Clip</span>
              </button>
            </div>
          </div>
        )}

        {/* Right Side: Grid of all clips (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredClips.map((c, index) => {
              const isSelected = selectedClip?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveClip(c)}
                  className={`glass-card rounded-2xl overflow-hidden border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-500 shadow-xl shadow-brand-500/15 ring-1 ring-brand-500/50'
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  {/* Thumbnail / Header */}
                  <div className="relative aspect-video bg-dark-950 flex items-center justify-center overflow-hidden">
                    {c.thumbnail_path ? (
                      <img
                        src={c.thumbnail_path}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-dark-900 text-gray-600">
                        <Film className="w-8 h-8" />
                      </div>
                    )}

                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                        {c.duration}s
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-dark-950 text-[10px] font-extrabold flex items-center gap-0.5 shadow-md">
                        <Flame className="w-3 h-3 fill-current" /> {c.viral_score}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-brand-500/90 text-dark-950 flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Clip #{index + 1}</span>
                      <span>{c.start_time.toFixed(1)}s - {c.end_time.toFixed(1)}s</span>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-1">{c.title}</h4>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                      <span className="text-[11px] text-brand-400 font-semibold">
                        9:16 Face Tracked
                      </span>

                      <div className="flex items-center gap-1">
                        <a
                          href={c.processed_9_16_path || c.clip_file_path}
                          download={`${c.title}.mp4`}
                          onClick={(e) => e.stopPropagation()}
                          title="Direct Download"
                          className="p-1.5 rounded-md bg-dark-850 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={(e) => deleteClip(c.id, e)}
                          title="Delete Clip"
                          className="p-1.5 rounded-md bg-dark-850 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
