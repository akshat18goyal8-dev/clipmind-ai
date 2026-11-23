import React, { useState } from 'react';
import { 
  DownloadCloud, 
  CheckSquare, 
  Square, 
  FileArchive, 
  Layers, 
  Flame, 
  ArrowLeft,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { exportService } from '../../services/api';

export const ExportCenterView: React.FC = () => {
  const { activeProject, setActiveSection } = useProjects();
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [exporting, setExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!activeProject || !activeProject.clips || activeProject.clips.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <DownloadCloud className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-300">No Clips Available to Export</h3>
        <p className="text-xs text-gray-500 mt-1 mb-6">Create a project or generate clips first.</p>
        <button
          onClick={() => setActiveSection('dashboard')}
          className="px-4 py-2 rounded-lg bg-brand-500 text-dark-950 font-bold text-xs"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const clips = activeProject.clips;

  const toggleSelectAll = () => {
    if (selectedClipIds.length === clips.length) {
      setSelectedClipIds([]);
    } else {
      setSelectedClipIds(clips.map((c) => c.id));
    }
  };

  const toggleClip = (id: string) => {
    if (selectedClipIds.includes(id)) {
      setSelectedClipIds(selectedClipIds.filter((cid) => cid !== id));
    } else {
      setSelectedClipIds([...selectedClipIds, id]);
    }
  };

  const handleBatchExport = async () => {
    const idsToExport = selectedClipIds.length > 0 ? selectedClipIds : clips.map(c => c.id);
    setExporting(true);
    setDownloadUrl(null);
    try {
      const res = await exportService.batchExport(idsToExport, aspectRatio);
      setDownloadUrl(res.download_url);
    } catch (err) {
      alert('Failed to generate export zip package.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Export Center</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">
              Batch Packaging
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Package and download multiple clips together with embedded metadata, transcripts, and SRT subtitles.
          </p>
        </div>

        <button
          onClick={handleBatchExport}
          disabled={exporting}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
        >
          <FileArchive className="w-4 h-4" />
          <span>{exporting ? 'Packaging ZIP...' : `Export ${selectedClipIds.length || clips.length} Clips (.ZIP)`}</span>
        </button>
      </div>

      {downloadUrl && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Export bundle ready for download!</span>
          </div>
          <a
            href={downloadUrl}
            download
            className="px-4 py-1.5 rounded-lg bg-emerald-500 text-dark-950 font-bold hover:bg-emerald-400 transition-colors"
          >
            Download ZIP Now
          </a>
        </div>
      )}

      {/* Export Options */}
      <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-gray-200">Export Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: '9:16', label: '9:16 Vertical Crop', sub: 'Shorts, Reels & TikTok' },
            { id: '16:9', label: '16:9 Original Landscape', sub: 'Full YouTube Format' },
            { id: '1:1', label: '1:1 Square Feed', sub: 'Square Video Posts' },
          ].map((asp) => (
            <button
              key={asp.id}
              onClick={() => setAspectRatio(asp.id as any)}
              className={`p-3 rounded-xl border text-left transition-all ${
                aspectRatio === asp.id
                  ? 'bg-brand-500/10 border-brand-500 text-white font-bold'
                  : 'bg-dark-900 border-white/5 text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="text-xs font-bold">{asp.label}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{asp.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Select Clips List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 hover:text-gray-200"
          >
            {selectedClipIds.length === clips.length ? (
              <CheckSquare className="w-4 h-4 text-brand-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>Select All ({clips.length} Clips)</span>
          </button>
          <span>{selectedClipIds.length} Selected</span>
        </div>

        <div className="space-y-2">
          {clips.map((c) => {
            const isSelected = selectedClipIds.includes(c.id);

            return (
              <div
                key={c.id}
                onClick={() => toggleClip(c.id)}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-brand-500/10 border-brand-500/40'
                    : 'bg-dark-900 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-brand-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-600 shrink-0" />
                  )}
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{c.title}</h4>
                    <p className="text-[11px] text-gray-400">
                      Duration: {c.duration}s • {c.start_time.toFixed(1)}s to {c.end_time.toFixed(1)}s
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-extrabold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {c.viral_score}
                  </span>
                  <a
                    href={aspectRatio === '9:16' && c.processed_9_16_path ? c.processed_9_16_path : c.clip_file_path}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded bg-dark-850 hover:bg-white/10 text-gray-400 hover:text-gray-200 text-xs"
                  >
                    Direct MP4
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
