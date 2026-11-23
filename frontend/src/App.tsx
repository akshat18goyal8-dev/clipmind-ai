import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { DashboardView } from './components/dashboard/DashboardView';
import { CreateProjectView } from './components/projects/CreateProjectView';
import { UrlAnalyzerView } from './components/url-analyzer/UrlAnalyzerView';
import { UploadView } from './components/upload/UploadView';
import { ProcessingView } from './components/processing/ProcessingView';
import { ClipsGalleryView } from './components/clips/ClipsGalleryView';
import { ViralAnalyticsView } from './components/viral/ViralAnalyticsView';
import { CaptionGeneratorView } from './components/social/CaptionGeneratorView';
import { SmartEditorView } from './components/editor/SmartEditorView';
import { ExportCenterView } from './components/export/ExportCenterView';
import { ProjectHistoryView } from './components/history/ProjectHistoryView';
import { SettingsView } from './components/settings/SettingsView';

const MainContent: React.FC = () => {
  const { activeSection } = useProjects();

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardView />;
      case 'create-project':
        return <CreateProjectView />;
      case 'url-analyzer':
        return <UrlAnalyzerView />;
      case 'upload-video':
        return <UploadView />;
      case 'ai-processing':
        return <ProcessingView />;
      case 'generated-clips':
        return <ClipsGalleryView />;
      case 'viral-analytics':
        return <ViralAnalyticsView />;
      case 'caption-generator':
        return <CaptionGeneratorView />;
      case 'smart-editor':
        return <SmartEditorView />;
      case 'export-center':
        return <ExportCenterView />;
      case 'project-history':
        return <ProjectHistoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-dark-950">
      {renderSection()}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <div className="flex h-screen bg-dark-950 text-gray-100 font-sans antialiased overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <MainContent />
          </div>
        </div>
      </ProjectProvider>
    </AuthProvider>
  );
};

export default App;
