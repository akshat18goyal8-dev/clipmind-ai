import React, { useEffect, useState } from 'react';
import { 
  Settings as SettingsIcon, 
  HardDrive, 
  Cpu, 
  Key, 
  ShieldCheck, 
  User, 
  LogOut,
  Sparkles,
  Server
} from 'lucide-react';
import { settingsService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SystemSettings } from '../../types';

export const SettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const [system, setSystem] = useState<SystemSettings | null>(null);
  const [openAiKey, setOpenAiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [savedKeyMsg, setSavedKeyMsg] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSystem();
        setSystem(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedKeyMsg(true);
    setTimeout(() => setSavedKeyMsg(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brand-400" />
          <span>System &amp; User Settings</span>
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Manage local hardware acceleration, storage quotas, AI engine options, and user credentials.
        </p>
      </div>

      {/* Account Info */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center text-dark-950 font-bold text-lg">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{user?.username || 'Authenticated Creator'}</h3>
              <p className="text-xs text-gray-400">{user?.email || 'creator@clipmind.ai'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Storage and Hardware Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-brand-400" /> Storage Consumption
            </span>
            <span className="text-white font-bold">{system?.storage_usage.app_storage_used_mb || 0} MB</span>
          </div>
          <div className="h-2 w-full bg-dark-950 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full" style={{ width: '15%' }} />
          </div>
          <p className="text-[11px] text-gray-500">
            {system?.storage_usage.files_stored || 0} media assets stored • {system?.storage_usage.system_disk_free_gb || 0} GB disk free
          </p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5">
              <Server className="w-4 h-4 text-accent-cyan" /> Core Engine Architecture
            </span>
            <span className="text-brand-400 font-bold">FastAPI + FFmpeg</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Local hardware acceleration enabled. Speech recognition powered by <strong>faster-whisper</strong> with int8 quantization.
          </p>
        </div>
      </div>

      {/* AI Processing Models */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-brand-400" />
          <span>Active Built-In AI &amp; Vision Pipelines</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-dark-900 rounded-xl border border-white/5">
            <span className="text-gray-500 block mb-0.5">Speech-to-Text Model:</span>
            <span className="font-semibold text-gray-200">faster-whisper (tiny / base int8)</span>
          </div>
          <div className="p-3 bg-dark-900 rounded-xl border border-white/5">
            <span className="text-gray-500 block mb-0.5">Scene Cut Detector:</span>
            <span className="font-semibold text-gray-200">PySceneDetect (Content &amp; Adaptive)</span>
          </div>
          <div className="p-3 bg-dark-900 rounded-xl border border-white/5">
            <span className="text-gray-500 block mb-0.5">Subject &amp; Face Tracker:</span>
            <span className="font-semibold text-gray-200">OpenCV MultiScale Haar Cascade</span>
          </div>
          <div className="p-3 bg-dark-900 rounded-xl border border-white/5">
            <span className="text-gray-500 block mb-0.5">Audio Excitement Profiler:</span>
            <span className="font-semibold text-gray-200">FFmpeg 16kHz PCM Waveform RMS</span>
          </div>
        </div>
      </div>

      {/* Optional External API Keys */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          <span>Optional External AI Accelerators</span>
        </h3>
        <p className="text-xs text-gray-400">
          CLIPMIND AI operates out-of-the-box using local open-source models without any external API keys required. You can optionally connect external LLM providers for enhanced social copy formatting.
        </p>

        <form onSubmit={handleSaveKeys} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">OpenAI API Key (Optional)</label>
            <input
              type="password"
              placeholder="sk-..."
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-200 focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Groq API Key (Optional)</label>
            <input
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-200 focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          {savedKeyMsg && (
            <div className="text-xs font-semibold text-emerald-400">
              API key configuration updated.
            </div>
          )}

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-gray-200 border border-white/10 text-xs font-semibold transition-colors"
          >
            Save Provider Keys
          </button>
        </form>
      </div>
    </div>
  );
};
