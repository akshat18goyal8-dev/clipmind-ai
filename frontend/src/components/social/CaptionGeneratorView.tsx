import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  ArrowLeft, 
  Save, 
  Video, 
  Camera, 
  Languages, 
  Hash, 
  Flame,
  FileText
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { socialService } from '../../services/api';

type PlatformKey = 'youtube_shorts' | 'instagram_reels' | 'tiktok' | 'hindi_content';

export const CaptionGeneratorView: React.FC = () => {
  const { activeClip, setActiveSection, refreshProjects } = useProjects();
  const [platform, setPlatform] = useState<PlatformKey>('youtube_shorts');
  const [posts, setPosts] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit states for current platform
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editHook, setEditHook] = useState('');
  const [editTags, setEditTags] = useState('');

  useEffect(() => {
    if (activeClip && activeClip.social_content) {
      setPosts(activeClip.social_content);
    }
  }, [activeClip]);

  useEffect(() => {
    if (posts && posts[platform]) {
      const p = posts[platform];
      setEditTitle(p.title || '');
      setEditCaption(p.caption || '');
      setEditDesc(p.description || '');
      setEditHook(p.hook || '');
      setEditTags((p.hashtags || []).join(' '));
    }
  }, [platform, posts]);

  if (!activeClip) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-300">No Clip Selected</h3>
        <p className="text-xs text-gray-500 mt-1 mb-6">Select a clip to review or customize AI-generated social media copy.</p>
        <button
          onClick={() => setActiveSection('generated-clips')}
          className="px-4 py-2 rounded-lg bg-brand-500 text-dark-950 font-bold text-xs"
        >
          Go to Clips Gallery
        </button>
      </div>
    );
  }

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveCopy = async () => {
    setSaving(true);
    try {
      const tagsArray = editTags.split(/\s+/).filter(t => t.startsWith('#'));
      await socialService.updatePost(activeClip.id, {
        platform,
        title: editTitle,
        caption: editCaption,
        description: editDesc,
        hook: editHook,
        hashtags: tagsArray.length > 0 ? tagsArray : editTags.split(' '),
      });
      await refreshProjects();
      alert('Updated social copy saved successfully!');
    } catch (err) {
      alert('Failed to save social copy.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
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
              <span>AI Social Content Studio</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">
                Multi-Platform &amp; Bilingual
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Optimized titles, hooks, and hashtags for <span className="text-white font-semibold">{activeClip.title}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveCopy}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-brand-500/20 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Platform Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        <button
          onClick={() => setPlatform('youtube_shorts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            platform === 'youtube_shorts'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'bg-dark-850 text-gray-400 hover:text-gray-200 border border-white/5'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>YouTube Shorts</span>
        </button>

        <button
          onClick={() => setPlatform('instagram_reels')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            platform === 'instagram_reels'
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-lg shadow-pink-600/30'
              : 'bg-dark-850 text-gray-400 hover:text-gray-200 border border-white/5'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Instagram Reels</span>
        </button>

        <button
          onClick={() => setPlatform('tiktok')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            platform === 'tiktok'
              ? 'bg-cyan-500 text-dark-950 shadow-lg shadow-cyan-500/30'
              : 'bg-dark-850 text-gray-400 hover:text-gray-200 border border-white/5'
          }`}
        >
          <span className="font-extrabold text-sm">#</span>
          <span>TikTok FYP</span>
        </button>

        <button
          onClick={() => setPlatform('hindi_content')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            platform === 'hindi_content'
              ? 'bg-amber-500 text-dark-950 shadow-lg shadow-amber-500/30 font-bold'
              : 'bg-dark-850 text-gray-400 hover:text-gray-200 border border-white/5'
          }`}
        >
          <Languages className="w-4 h-4" />
          <span>हिंदी (Hindi Regional)</span>
        </button>
      </div>

      {/* Editable Content Fields */}
      <div className="space-y-4">
        {/* Hook */}
        <div className="glass-card p-4 rounded-xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Opening Hook (First 3 Seconds)</span>
            </label>
            <button
              onClick={() => copyToClipboard(editHook, 'hook')}
              className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-semibold"
            >
              {copiedField === 'hook' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'hook' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <input
            type="text"
            value={editHook}
            onChange={(e) => setEditHook(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Title */}
        <div className="glass-card p-4 rounded-xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-400" />
              <span>Post Title</span>
            </label>
            <button
              onClick={() => copyToClipboard(editTitle, 'title')}
              className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-semibold"
            >
              {copiedField === 'title' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'title' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Caption */}
        <div className="glass-card p-4 rounded-xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-300">Description / Caption</label>
            <button
              onClick={() => copyToClipboard(editCaption || editDesc, 'caption')}
              className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-semibold"
            >
              {copiedField === 'caption' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'caption' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            rows={4}
            value={editCaption || editDesc}
            onChange={(e) => {
              setEditCaption(e.target.value);
              setEditDesc(e.target.value);
            }}
            className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-xs text-gray-200 focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        {/* Hashtags */}
        <div className="glass-card p-4 rounded-xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Optimized Hashtags</span>
            </label>
            <button
              onClick={() => copyToClipboard(editTags, 'tags')}
              className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-semibold"
            >
              {copiedField === 'tags' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'tags' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <input
            type="text"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-brand-400 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>
    </div>
  );
};
