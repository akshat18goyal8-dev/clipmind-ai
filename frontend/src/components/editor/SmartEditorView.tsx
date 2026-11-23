import React, { useState } from 'react';
import { 
  Crop, 
  Layers, 
  Smile, 
  Type, 
  ArrowLeft, 
  Check, 
  Play, 
  Sliders, 
  Sparkles,
  Download
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { clipService } from '../../services/api';

export const SmartEditorView: React.FC = () => {
  const { activeClip, setActiveSection, refreshProjects } = useProjects();
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [faceTracking, setFaceTracking] = useState(true);
  const [backgroundBlur, setBackgroundBlur] = useState(true);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [subtitleColor, setSubtitleColor] = useState('#facc15'); // vibrant yellow
  const [isApplying, setIsApplying] = useState(false);

  if (!activeClip) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Crop className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-300">No Clip Selected</h3>
        <p className="text-xs text-gray-500 mt-1 mb-6">Select a clip to open the smart video editor.</p>
        <button
          onClick={() => setActiveSection('generated-clips')}
          className="px-4 py-2 rounded-lg bg-brand-500 text-dark-950 font-bold text-xs"
        >
          Go to Clips Gallery
        </button>
      </div>
    );
  }

  const handleApplySettings = async () => {
    setIsApplying(true);
    try {
      await clipService.update(activeClip.id, {
        aspect_ratio: aspectRatio,
        face_tracking_enabled: faceTracking,
        background_blur: backgroundBlur,
        subtitles_enabled: subtitlesEnabled,
      });
      await refreshProjects();
      alert('Smart editing preferences updated!');
    } catch (err) {
      alert('Failed to update editing settings.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSection('generated-clips')}
            className="p-2 rounded-lg bg-dark-850 hover:bg-dark-800 text-gray-400 hover:text-gray-200 border border-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Smart Video Editor</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">
                AI Vision &amp; Framing
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Subject tracking, aspect ratio conversion, and dynamic subtitle presets for <span className="text-white font-semibold">{activeClip.title}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleApplySettings}
          disabled={isApplying}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{isApplying ? 'Re-rendering...' : 'Save & Re-render'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Video Preview (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
            <span>Visual Framing Preview</span>
            <span className="text-brand-400">{aspectRatio}</span>
          </div>

          <div className="relative bg-black rounded-xl overflow-hidden aspect-[9/16] max-h-[460px] mx-auto shadow-2xl border border-white/10 flex items-center justify-center">
            <video
              key={activeClip.id + aspectRatio}
              controls
              className="w-full h-full object-contain"
              src={aspectRatio === '9:16' && activeClip.processed_9_16_path ? activeClip.processed_9_16_path : activeClip.clip_file_path}
            />

            {subtitlesEnabled && activeClip.transcript && (
              <div className="absolute bottom-12 left-4 right-4 pointer-events-none text-center">
                <span 
                  className="inline-block px-3 py-1 rounded bg-black/80 font-extrabold text-sm shadow-xl border border-white/10"
                  style={{ color: subtitleColor }}
                >
                  {activeClip.transcript.substring(0, 45)}...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Smart Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Aspect Ratio Switcher */}
          <div className="glass-card p-5 rounded-xl border border-white/5 space-y-3">
            <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
              <Crop className="w-4 h-4 text-brand-400" />
              <span>Target Aspect Ratio</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: '9:16', label: '9:16 Vertical', sub: 'Shorts, Reels, TikTok' },
                { id: '16:9', label: '16:9 Landscape', sub: 'Standard YouTube' },
                { id: '1:1', label: '1:1 Square', sub: 'Feed Posts & LinkedIn' },
              ].map((asp) => (
                <button
                  key={asp.id}
                  type="button"
                  onClick={() => setAspectRatio(asp.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    aspectRatio === asp.id
                      ? 'bg-brand-500/10 border-brand-500 text-white font-bold'
                      : 'bg-dark-900 border-white/5 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="text-sm font-bold">{asp.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{asp.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Face & Subject Centering */}
          <div className="glass-card p-5 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-dark-800 text-brand-400 flex items-center justify-center">
                  <Smile className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">AI Face &amp; Subject Tracking</h4>
                  <p className="text-[11px] text-gray-500">Automatically centers the speaker's face in the vertical frame</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={faceTracking}
                onChange={(e) => setFaceTracking(e.target.checked)}
                className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-dark-800 text-accent-cyan flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Ambient Background Blur</h4>
                  <p className="text-[11px] text-gray-500">Fills letterbox bars with a dual-layer Gaussian blurred background</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={backgroundBlur}
                onChange={(e) => setBackgroundBlur(e.target.checked)}
                className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Automatic Animated Subtitles */}
          <div className="glass-card p-5 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-dark-800 text-amber-400 flex items-center justify-center">
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Automatic Dynamic Subtitles</h4>
                  <p className="text-[11px] text-gray-500">Burn synchronized subtitles with high-contrast keyword highlighting</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={subtitlesEnabled}
                onChange={(e) => setSubtitlesEnabled(e.target.checked)}
                className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
              />
            </div>

            {subtitlesEnabled && (
              <div className="pt-2 flex items-center gap-3 text-xs">
                <span className="text-gray-400">Highlight Keyword Color:</span>
                <div className="flex items-center gap-2">
                  {['#facc15', '#4ade80', '#06b6d4', '#f43f5e', '#ffffff'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSubtitleColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        subtitleColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
