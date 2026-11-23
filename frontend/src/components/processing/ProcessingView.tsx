import React from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  Film, 
  AlertTriangle 
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { projectService } from '../../services/api';

const PIPELINE_STAGES = [
  { id: 1, label: 'Video Source Acquisition', range: [0, 20], desc: 'Downloading stream or parsing video container' },
  { id: 2, label: 'Acoustic Energy Profiling', range: [20, 40], desc: 'Extracting audio & detecting loudness and pitch excitement peaks' },
  { id: 3, label: 'AI Speech-to-Text Transcription', range: [40, 60], desc: 'Transcribing speech & capturing word-level timestamps with Whisper' },
  { id: 4, label: 'Visual Scene & Motion Detection', range: [60, 75], desc: 'Detecting cuts, transitions, and optical flow movement' },
  { id: 5, label: 'Multi-Signal Highlight Fusion', range: [75, 85], desc: 'Category-specific scoring to detect top viral moments' },
  { id: 6, label: 'Smart 9:16 Crop & Subtitles', range: [85, 100], desc: 'Centering faces with OpenCV and rendering short-form clips' },
];

export const ProcessingView: React.FC = () => {
  const { activeProject, setActiveSection, refreshProjects } = useProjects();

  if (!activeProject) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-300">No Active Project Selected</h3>
        <p className="text-xs text-gray-500 mt-1 mb-6">Select a project or paste a URL to start AI processing.</p>
        <button
          onClick={() => setActiveSection('dashboard')}
          className="px-4 py-2 rounded-lg bg-brand-500 text-dark-950 font-bold text-xs"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const isCompleted = activeProject.status === 'completed';
  const isFailed = activeProject.status === 'failed';
  const isCancelled = activeProject.status === 'cancelled';
  const progress = activeProject.progress || 0;

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel the processing job?')) {
      await projectService.cancel(activeProject.id);
      await refreshProjects();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                {activeProject.category}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">
                {activeProject.source_type.toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {activeProject.title}
            </h2>
            <p className="text-xs text-brand-400 font-medium mt-1 flex items-center gap-1.5">
              {!isCompleted && !isFailed && !isCancelled && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              )}
              {activeProject.current_stage || 'Processing video stream...'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isCompleted && (
              <button
                onClick={() => setActiveSection('generated-clips')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center gap-2"
              >
                <span>View {activeProject.clips?.length || 0} Clips</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {!isCompleted && !isFailed && !isCancelled && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 text-xs font-semibold transition-all"
              >
                Cancel Job
              </button>
            )}
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-gray-400">Total Pipeline Completion</span>
            <span className="text-brand-400 text-sm">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-3 w-full bg-dark-950 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFailed
                  ? 'bg-rose-500'
                  : isCompleted
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-brand-500 via-emerald-400 to-accent-cyan'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, progress))}%` }}
            />
          </div>
        </div>

        {isFailed && (
          <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Processing failed: {activeProject.error_message || 'Unexpected video processing error'}</span>
          </div>
        )}
      </div>

      {/* Multi-stage Checklist */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Multi-Modal Processing Pipeline
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {PIPELINE_STAGES.map((stg) => {
            const isDone = progress >= stg.range[1];
            const isInProgress = progress >= stg.range[0] && progress < stg.range[1];

            return (
              <div
                key={stg.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                  isDone
                    ? 'bg-dark-900/80 border-emerald-500/20'
                    : isInProgress
                    ? 'bg-brand-500/5 border-brand-500/40 shadow-sm'
                    : 'bg-dark-900/40 border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isInProgress
                        ? 'bg-brand-500 text-dark-950 animate-pulse'
                        : 'bg-dark-800 text-gray-500'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : stg.id}
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${isInProgress ? 'text-brand-300' : 'text-gray-200'}`}>
                      {stg.label}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">{stg.desc}</p>
                  </div>
                </div>

                <div>
                  {isDone && (
                    <span className="text-[11px] font-semibold text-emerald-400">Completed</span>
                  )}
                  {isInProgress && (
                    <span className="text-[11px] font-semibold text-brand-400 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Active
                    </span>
                  )}
                  {!isDone && !isInProgress && (
                    <span className="text-[11px] text-gray-600">Queued</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
