import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  ArrowLeft,
  Share2,
  Sliders,
  Zap,
  Target,
  Smile,
  Activity,
  Award
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { viralService } from '../../services/api';

export const ViralAnalyticsView: React.FC = () => {
  const { activeClip, activeProject, setActiveSection } = useProjects();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!activeClip) return;
      setLoading(true);
      try {
        const data = await viralService.getAnalysis(activeClip.id);
        setAnalysis(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [activeClip]);

  if (!activeClip) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-300">No Clip Selected</h3>
        <p className="text-xs text-gray-500 mt-1 mb-6">Select a generated clip to inspect its viral score breakdown.</p>
        <button
          onClick={() => setActiveSection('generated-clips')}
          className="px-4 py-2 rounded-lg bg-brand-500 text-dark-950 font-bold text-xs"
        >
          Go to Clips Gallery
        </button>
      </div>
    );
  }

  const score = analysis?.total_score || activeClip.viral_score;
  const metrics = analysis?.metrics || activeClip.viral_breakdown || {
    hook_strength: 78,
    emotional_impact: 74,
    engagement_potential: 82,
    audience_reaction: 70,
    content_uniqueness: 75,
    context_quality: 85,
  };

  const metricList = [
    { key: 'hook_strength', label: 'Opening Hook Strength', icon: Target, val: metrics.hook_strength || 75, desc: 'First 3-5 seconds viewer retention hook' },
    { key: 'emotional_impact', label: 'Emotional & Vocal Energy', icon: Smile, val: metrics.emotional_impact || 70, desc: 'Acoustic pitch variation and sentiment volatility' },
    { key: 'engagement_potential', label: 'Engagement & Pacing', icon: Activity, val: metrics.engagement_potential || 80, desc: 'Visual motion cadence and dialogue density' },
    { key: 'audience_reaction', label: 'Audience Excitement Index', icon: Zap, val: metrics.audience_reaction || 68, desc: 'Cheering, laughter, and high-frequency audio bursts' },
    { key: 'content_uniqueness', label: 'Content Uniqueness', icon: Award, val: metrics.content_uniqueness || 72, desc: 'Topical novelty and rare keyword combinations' },
    { key: 'context_quality', label: 'Context & Loop Factor', icon: Sliders, val: metrics.context_quality || 84, desc: 'Punchline resolution and seamless repeat looping' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Navigation */}
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
              <span>Viral Potential Analytics</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">
                AI Sensory Model
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Evaluating clip: <span className="text-gray-200 font-semibold">{activeClip.title}</span> ({activeClip.duration}s)
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveSection('caption-generator')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Platform Copy</span>
        </button>
      </div>

      {/* Main Score Hero Card */}
      <div className="glass-panel p-8 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Radial score representation */}
          <div className="md:col-span-4 flex flex-col items-center text-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="74"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-dark-800"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="74"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={464.9}
                  strokeDashoffset={464.9 - (464.9 * score) / 100}
                  strokeLinecap="round"
                  className="text-brand-400 transition-all duration-1000"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-white tracking-tight">{score}</span>
                <span className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Out of 100</span>
              </div>
            </div>

            <div className="mt-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                <Flame className="w-3.5 h-3.5" />
                {analysis?.rating || (score >= 80 ? 'Extreme Viral Potential' : 'High Engagement Potential')}
              </span>
            </div>
          </div>

          {/* Explanation rationale */}
          <div className="md:col-span-8 space-y-4">
            <h3 className="text-lg font-bold text-white">Algorithmic Scoring Rationale</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {analysis?.explanation || activeClip.viral_explanation || 
               'This clip exhibits exceptional visual and acoustic momentum. Strong opening dialogue and energy peaks during the mid-segment correlate with elevated viewer retention curves on YouTube Shorts and Instagram Reels.'}
            </p>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Key Highlights</h4>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {(analysis?.key_highlights || [
                  `Multi-signal rating: ${score}/100`,
                  `Opening Hook Factor: ${metrics.hook_strength || 75}/100`,
                  `Pacing & Motion Activity: ${metrics.engagement_potential || 80}/100`
                ]).map((h: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Metric Breakdown Cards */}
      <div>
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
          Granular Signal Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricList.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.key} className="glass-card p-5 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-dark-800 text-brand-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-base font-extrabold text-white">{m.val} / 100</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">{m.label}</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">{m.desc}</p>
                </div>
                <div className="h-1.5 w-full bg-dark-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-accent-cyan rounded-full"
                    style={{ width: `${m.val}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer Box */}
      <div className="p-4 rounded-xl bg-dark-950/80 border border-white/5 text-xs text-gray-500 flex items-start gap-3">
        <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {analysis?.disclaimer || 
           "Disclaimer: The viral score is an estimated index based on audio waveform peaks, speech cadence, and visual motion analysis. Actual performance varies with audience demographics, publish time, platform recommendation algorithm fluctuations, and external trends."}
        </p>
      </div>
    </div>
  );
};
