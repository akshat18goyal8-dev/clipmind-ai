import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  SearchCode, 
  UploadCloud, 
  Cpu, 
  Film, 
  TrendingUp, 
  Sparkles, 
  Crop, 
  DownloadCloud, 
  History, 
  Settings,
  ChevronRight,
  Flame
} from 'lucide-react';
import { useProjects, SectionType } from '../../context/ProjectContext';

interface NavItem {
  id: SectionType;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'create-project', label: 'Create New Project', icon: PlusCircle },
  { id: 'url-analyzer', label: 'URL Analyzer', icon: SearchCode },
  { id: 'upload-video', label: 'Upload Video', icon: UploadCloud },
  { id: 'ai-processing', label: 'AI Processing', icon: Cpu, badge: 'Live' },
  { id: 'generated-clips', label: 'Generated Clips', icon: Film },
  { id: 'viral-analytics', label: 'Viral Analytics', icon: TrendingUp },
  { id: 'caption-generator', label: 'Caption Generator', icon: Sparkles },
  { id: 'smart-editor', label: 'Smart Editing', icon: Crop },
  { id: 'export-center', label: 'Export Center', icon: DownloadCloud },
  { id: 'project-history', label: 'Project History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeSection, setActiveSection, activeProject } = useProjects();

  return (
    <aside className="w-64 bg-dark-900 border-r border-white/5 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              CLIPMIND <span className="text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">AI</span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Universal Video Clipper</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
          Studio Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isProcessing = item.id === 'ai-processing' && activeProject?.status === 'processing';

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-brand-400' : 'text-gray-400 group-hover:text-gray-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {isProcessing && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
              )}

              {item.badge && !isProcessing && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Project Card Indicator */}
      <div className="p-4 border-t border-white/5 bg-dark-950/60">
        <div className="text-[11px] text-gray-400 font-medium mb-1.5 flex items-center justify-between">
          <span>Active Project</span>
          <span className="text-brand-400 text-[10px] font-semibold uppercase">{activeProject?.category || 'Ready'}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-dark-850 border border-white/5 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-gray-200 truncate">
              {activeProject ? activeProject.title : 'No Project Selected'}
            </p>
            <p className="text-[10px] text-gray-500">
              {activeProject ? `${activeProject.clips?.length || 0} clips generated` : 'Create or paste a URL'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
        </div>
      </div>
    </aside>
  );
};
