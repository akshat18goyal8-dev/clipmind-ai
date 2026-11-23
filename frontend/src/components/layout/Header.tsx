import React from 'react';
import { Sparkles, Video, Bell, User, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { activeProject, projects, selectProjectById, refreshProjects, setActiveSection } = useProjects();
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-dark-900/80 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between z-10">
      {/* Left side: Project switch dropdown & status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium hidden sm:inline">Project:</span>
          <select
            value={activeProject?.id || ''}
            onChange={(e) => {
              if (e.target.value) selectProjectById(e.target.value);
            }}
            className="bg-dark-850 text-xs font-semibold text-gray-200 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500 max-w-[220px]"
          >
            {projects.length === 0 ? (
              <option value="">No Projects Yet</option>
            ) : (
              projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title.length > 25 ? `${p.title.substring(0, 25)}...` : p.title} ({p.status})
                </option>
              ))
            )}
          </select>
        </div>

        {activeProject && (
          <div className="flex items-center gap-2 text-xs">
            {activeProject.status === 'completed' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Ready ({activeProject.clips?.length || 0} clips)
              </span>
            )}
            {activeProject.status === 'processing' && (
              <button 
                onClick={() => setActiveSection('ai-processing')}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium hover:bg-brand-500/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 animate-spin" /> {activeProject.progress.toFixed(0)}% Analyzing
              </button>
            )}
            {activeProject.status === 'failed' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                <AlertCircle className="w-3 h-3" /> Failed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right side: Quick actions & User Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveSection('create-project')}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Clip Project</span>
        </button>

        <button
          onClick={() => refreshProjects()}
          title="Refresh Data"
          className="p-2 rounded-lg bg-dark-850 hover:bg-white/[0.06] text-gray-400 hover:text-gray-200 border border-white/5 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* User avatar and credentials */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
            {user?.username?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-gray-200">{user?.username || 'Creator'}</div>
            <div className="text-[10px] text-gray-500">{user?.email || 'creator@clipmind.ai'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
