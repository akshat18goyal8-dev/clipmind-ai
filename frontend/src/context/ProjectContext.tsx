import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, Clip } from '../types';
import { projectService } from '../services/api';

export type SectionType = 
  | 'dashboard'
  | 'create-project'
  | 'url-analyzer'
  | 'upload-video'
  | 'ai-processing'
  | 'generated-clips'
  | 'viral-analytics'
  | 'caption-generator'
  | 'smart-editor'
  | 'export-center'
  | 'project-history'
  | 'settings';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  activeClip: Clip | null;
  activeSection: SectionType;
  loading: boolean;
  setActiveSection: (sec: SectionType) => void;
  setActiveProject: (p: Project | null) => void;
  setActiveClip: (c: Clip | null) => void;
  refreshProjects: () => Promise<void>;
  selectProjectById: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeClip, setActiveClip] = useState<Clip | null>(null);
  const [activeSection, setActiveSection] = useState<SectionType>('dashboard');
  const [loading, setLoading] = useState(false);

  const refreshProjects = useCallback(async () => {
    try {
      const data = await projectService.list();
      setProjects(data);
      if (activeProject) {
        const updated = data.find((p) => p.id === activeProject.id);
        if (updated) {
          setActiveProject(updated);
          if (activeClip) {
            const updatedClip = updated.clips.find((c) => c.id === activeClip.id);
            if (updatedClip) setActiveClip(updatedClip);
          } else if (updated.clips.length > 0) {
            setActiveClip(updated.clips[0]);
          }
        }
      } else if (data.length > 0 && !activeProject) {
        setActiveProject(data[0]);
        if (data[0].clips.length > 0) {
          setActiveClip(data[0].clips[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  }, [activeProject, activeClip]);

  const selectProjectById = async (id: string) => {
    setLoading(true);
    try {
      const p = await projectService.get(id);
      setActiveProject(p);
      if (p.clips && p.clips.length > 0) {
        setActiveClip(p.clips[0]);
      } else {
        setActiveClip(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  // Live polling for processing state
  useEffect(() => {
    let interval: any = null;
    if (activeProject && (activeProject.status === 'processing' || activeProject.status === 'pending')) {
      interval = setInterval(async () => {
        try {
          const fresh = await projectService.get(activeProject.id);
          setActiveProject(fresh);
          if (fresh.status === 'completed' && fresh.clips.length > 0 && !activeClip) {
            setActiveClip(fresh.clips[0]);
          }
        } catch (e) {
          // Ignore transient poll error
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeProject, activeClip]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeClip,
        activeSection,
        loading,
        setActiveSection,
        setActiveProject,
        setActiveClip,
        refreshProjects,
        selectProjectById,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
