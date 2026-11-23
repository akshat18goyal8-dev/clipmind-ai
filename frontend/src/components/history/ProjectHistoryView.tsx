import React, { useState } from 'react';
import { 
  History, 
  Film, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  AlertTriangle, 
  Clock, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { projectService } from '../../services/api';
import { Project } from '../../types';

export const ProjectHistoryView: React.FC = () => {
  const { projects, selectProjectById, setActiveSection, refreshProjects } = useProjects();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this project and all associated video clips?')) {
      setDeletingId(id);
      try {
        await projectService.delete(id);
        await refreshProjects();
      } catch (err) {
        alert('Failed to delete project');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleOpenProject = async (p: Project) => {
    await selectProjectById(p.id);
    if (p.status === 'processing') {
      setActiveSection('ai-processing');
    } else {
      setActiveSection('generated-clips');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Project History</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">
              {projects.length} Total
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Access previous processing runs, review generated clips, or resume ongoing jobs.
          </p>
        </div>

        <button
          onClick={() => setActiveSection('create-project')}
          className="px-4 py-2 rounded-xl bg-brand-500 text-dark-950 font-bold text-xs hover:bg-brand-400 transition-colors"
        >
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-dark-900/40 rounded-2xl border border-white/5">
          <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-300">No Projects in History</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">Paste a video URL or upload a file to start your first clipping project.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => {
            const isCompleted = p.status === 'completed';
            const isProcessing = p.status === 'processing';
            const isFailed = p.status === 'failed';

            return (
              <div
                key={p.id}
                onClick={() => handleOpenProject(p)}
                className="glass-card-hover p-5 rounded-2xl border border-white/5 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-4 truncate">
                  <div className="w-10 h-10 rounded-xl bg-dark-800 text-brand-400 flex items-center justify-center shrink-0">
                    <Film className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 text-[10px] font-bold">
                        {p.category}
                      </span>
                      <span className="text-[11px] text-gray-500 uppercase">{p.source_type}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">{p.title}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Created: {new Date(p.created_at).toLocaleDateString()} • {p.clips?.length || 0} Clips Generated
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div>
                    {isCompleted && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                    {isProcessing && (
                      <span className="px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-semibold flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {p.progress.toFixed(0)}% Analyzing
                      </span>
                    )}
                    {isFailed && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      title="Delete Project"
                      disabled={deletingId === p.id}
                      className="p-2 rounded-lg bg-dark-850 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
