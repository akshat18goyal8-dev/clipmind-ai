import React, { useState, useRef } from 'react';
import { UploadCloud, FileVideo, CheckCircle2, AlertCircle, Sparkles, Sliders } from 'lucide-react';
import { videoService, projectService } from '../../services/api';
import { useProjects } from '../../context/ProjectContext';

const CATEGORIES = [
  "Auto-Detect", "Gaming", "Podcasts", "Education", "Interviews", 
  "Live Streaming", "Entertainment", "Comedy", "Technology", 
  "News", "Sports", "Reactions", "Vlogs", "Business", "Music", "Other"
];

export const UploadView: React.FC = () => {
  const { setActiveSection, refreshProjects, selectProjectById } = useProjects();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Auto-Detect');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a video file first');
      return;
    }
    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // 1. Upload video file with progress tracking
      const uploadRes = await videoService.upload(file, (pct) => {
        setProgress(pct);
      });

      // 2. Initialize project
      const projRes = await projectService.createFromUpload(
        title.trim() || file.name,
        uploadRes.file_path,
        category
      );

      await refreshProjects();
      await selectProjectById(projRes.project_id);
      setActiveSection('ai-processing');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Ensure file is within size limits.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Direct Video File Upload</h2>
        <p className="text-sm text-gray-400 mt-1">
          Upload recorded streams, gameplay videos, podcast episodes, or conference recordings directly from your computer.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            file
              ? 'border-brand-500/60 bg-brand-500/5'
              : 'border-white/10 hover:border-brand-500/40 bg-dark-900/60 hover:bg-dark-900'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileSelected(e.target.files[0])}
            accept=".mp4,.mov,.mkv,.webm,.avi"
            className="hidden"
          />

          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
              file ? 'bg-brand-500/20 text-brand-400' : 'bg-dark-800 text-gray-400'
            }`}>
              {file ? <FileVideo className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
            </div>

            {file ? (
              <div>
                <p className="text-sm font-bold text-white">{file.name}</p>
                <p className="text-xs text-brand-400 mt-1">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB • Click or drop new file to replace
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-200">
                  Drag and drop your video file here, or <span className="text-brand-400 underline">browse</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports MP4, MOV, MKV, WEBM, AVI up to 2GB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Project Details */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">Project Title</label>
            <input
              type="text"
              placeholder="e.g., Stream Clutch Highlights #4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-dark-850 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-brand-400" />
              <span>Content Category</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-brand-500 text-dark-950 font-bold'
                      : 'bg-dark-850 text-gray-400 hover:text-gray-200 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {uploading && (
          <div className="space-y-2 bg-dark-850 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Uploading Video...</span>
              <span className="font-semibold text-brand-400">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-dark-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-accent-cyan transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-emerald-500 to-accent-cyan hover:brightness-110 text-white font-bold text-sm tracking-wide shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{uploading ? `Uploading (${progress}%)...` : 'Upload & Start AI Clipping Engine'}</span>
        </button>
      </form>
    </div>
  );
};
