import React, { useState } from 'react';
import { useSimStore } from '../store/simulationStore';
import { DEFAULT_SCENARIO } from '../simulation/scenario';
import { Shield, Radio, Cpu, Activity, Clock, Menu, X, Volume2, VolumeX, Sliders } from 'lucide-react';
import { soundEffects } from '../utils/audio';
import AudioConsoleModal from './AudioConsoleModal';

export default function TopBar() {
  const { stage, isRunning, isSidebarOpen, toggleSidebar, isMuted, toggleMute } = useSimStore();
  const [time, setTime] = React.useState(new Date());
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);

  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hasActiveIncident = [
    'ANOMALY_DETECTED', 'SEARCHING', 'LOCALIZING', 'SOURCE_LOCATED',
    'VERIFYING', 'VERIFIED', 'ALERT_SENT',
  ].includes(stage);

  return (
    <header className="relative flex items-center justify-between px-3 sm:px-5 h-16 border-b border-slate-800/90 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-slate-950/95 backdrop-blur-xl flex-shrink-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      {/* Bottom glowing accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      {/* Left: Mobile Hamburger & Logo branding */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={() => {
            soundEffects.playBlip();
            toggleSidebar();
          }}
          className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
          title="Toggle Navigation Menu"
        >
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(0,255,157,0.6)] group-hover:scale-105">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/15 pointer-events-none" />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#00FF9D" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-white font-extrabold text-sm sm:text-base tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">RAILGUARD</span>
              <span className="text-emerald-400 font-extrabold text-sm sm:text-base tracking-widest drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]">-X</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-bold">Command Center</span>
              <span className="hidden sm:inline text-slate-600 text-[9px]">|</span>
              <span className="hidden sm:inline text-cyan-400/90 text-[10px] tracking-wider uppercase font-semibold">RPF HQ</span>
            </div>
          </div>
        </div>

        <div className="hidden xl:block w-px h-8 bg-gradient-to-b from-transparent via-slate-700 to-transparent mx-2" />
        <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400 tracking-wider">
          <Shield size={13} className="text-emerald-400/80" />
          <span>AUTONOMOUS CBRN DEFENSE SUITE</span>
        </div>
      </div>

      {/* Center: Mission / Incident Banner */}
      <div className="hidden md:flex items-center">
        {hasActiveIncident ? (
          <div className="relative flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-red-500/50 bg-gradient-to-r from-red-950/70 via-red-900/40 to-red-950/70 shadow-[0_0_25px_rgba(239,68,68,0.4)] alert-flash">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-red-200 text-xs font-bold tracking-widest uppercase font-mono truncate max-w-[280px] lg:max-w-none">
              ⚠ ACTIVE CBRN ANOMALY — {DEFAULT_SCENARIO.location}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-slate-800 bg-slate-900/50 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
            <span className="text-slate-400 text-xs tracking-[0.2em] uppercase font-mono">
              Detect <span className="text-emerald-400">→</span> Locate <span className="text-cyan-400">→</span> Verify <span className="text-amber-400">→</span> Respond
            </span>
          </div>
        )}
      </div>

      {/* Right: Audio Mute + SOUND FX Modal + Telemetry + Live Clock */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sound FX Control Console Trigger */}
        <button
          onClick={() => {
            soundEffects.playBlip();
            setIsAudioModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-xs font-mono font-bold hover:bg-emerald-900/40 transition-all shadow-[0_0_12px_rgba(16,185,129,0.25)] active:scale-95"
          title="Open Tactical Sound Effects Matrix"
        >
          <Sliders size={13} className="text-emerald-400" />
          <span className="hidden sm:inline">SOUND FX</span>
        </button>

        {/* Audio Mute toggle button */}
        <button
          onClick={toggleMute}
          className={`p-2 rounded-lg border transition-all ${
            isMuted
              ? 'bg-slate-900 border-slate-700 text-slate-500'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
          }`}
          title={isMuted ? 'Unmute Tactical Audio' : 'Mute Tactical Audio'}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* System Online Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 shadow-[0_2px_10px_rgba(16,185,129,0.15)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#00FF9D]" />
          </span>
          <span className="text-emerald-300 text-[11px] font-bold tracking-wider">ONLINE</span>
        </div>

        {/* Live Clock with 3D inset */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs shadow-inner">
          <Clock size={12} className="text-slate-400 hidden sm:inline" />
          <div className="font-mono text-slate-200 text-xs font-semibold tracking-wider">
            {time.toLocaleTimeString('en-IN', { hour12: false })}
          </div>
        </div>
      </div>

      {/* Audio Console Modal */}
      <AudioConsoleModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
      />
    </header>
  );
}
