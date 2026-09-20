import React, { useState } from 'react';
import {
  Volume2, VolumeX, X, AlertTriangle, Shield, Camera, Radio,
  Lock, Disc, FileText, Activity, Play, Sliders
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface AudioConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AudioConsoleModal({ isOpen, onClose }: AudioConsoleModalProps) {
  const [vol, setVol] = useState(Math.round(soundEffects.getVolume() * 100));
  const [isMuted, setIsMuted] = useState(soundEffects.getIsMuted());
  const [ambientActive, setAmbientActive] = useState(soundEffects.getIsAmbientPlaying());
  const [lastTested, setLastTested] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVol(val);
    soundEffects.setVolume(val / 100);
  };

  const handleToggleMute = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleAmbient = () => {
    const active = soundEffects.toggleAmbientHum();
    setAmbientActive(active);
  };

  const playEffect = (name: string, fn: () => void) => {
    fn();
    setLastTested(name);
    setTimeout(() => setLastTested(null), 1200);
  };

  const SOUND_DEMOS = [
    {
      name: 'Tactical CBRN Siren',
      desc: 'Dual-tone military klaxon when anomaly is confirmed',
      icon: AlertTriangle,
      color: 'text-red-400 border-red-500/40 bg-red-950/40',
      action: () => soundEffects.playAlertSiren(),
    },
    {
      name: 'CBRN Geiger Sniffer',
      desc: 'Atmospheric chemical discharge clicking near plume',
      icon: Activity,
      color: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
      action: () => {
        soundEffects.playGeigerClick();
        setTimeout(() => soundEffects.playGeigerClick(), 60);
        setTimeout(() => soundEffects.playGeigerClick(), 110);
      },
    },
    {
      name: 'Target Lock Chime',
      desc: '4-note harmonized cyber arpeggio at Column C4',
      icon: Disc,
      color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
      action: () => soundEffects.playLockChime(),
    },
    {
      name: 'Camera Shutter Click',
      desc: 'Mechanical dual-click during optical verification',
      icon: Camera,
      color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
      action: () => soundEffects.playCameraShutter(),
    },
    {
      name: 'RPF Radio Squelch',
      desc: 'Tactical radio handshake & squelch burst for dispatch',
      icon: Radio,
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
      action: () => soundEffects.playRadioSquelch(),
    },
    {
      name: 'Blockchain Ledger Seal',
      desc: 'Sub-bass impact & crystal chime committing SHA-256 hash',
      icon: Lock,
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
      action: () => soundEffects.playBlockchainSeal(),
    },
    {
      name: '3D Floor Sonar Ping',
      desc: 'Resonant sonar ping when dropping waypoints on deck',
      icon: Shield,
      color: 'text-purple-400 border-purple-500/40 bg-purple-950/40',
      action: () => soundEffects.playSonarPing(),
    },
    {
      name: 'Rover Stepper Motor',
      desc: 'Short electric motor hum during 3D movement',
      icon: Activity,
      color: 'text-blue-400 border-blue-500/40 bg-blue-950/40',
      action: () => soundEffects.playRoverMotor(),
    },
    {
      name: 'Incident Dossier Ready',
      desc: 'Tactical notification chime when report is finalized',
      icon: FileText,
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
      action: () => soundEffects.playReportChime(),
    },
    {
      name: 'UI Micro-Blip',
      desc: 'High-frequency holographic button touch sound',
      icon: Sliders,
      color: 'text-slate-300 border-slate-700 bg-slate-900',
      action: () => soundEffects.playBlip(),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="card w-full max-w-xl border-emerald-500/40 shadow-[0_0_50px_rgba(0,0,0,0.9)] p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Volume2 size={16} />
            </div>
            <div>
              <h2 className="text-white text-sm font-bold font-mono tracking-widest uppercase">
                TACTICAL SOUND FX CONSOLE
              </h2>
              <p className="text-slate-400 text-[10px] font-mono">
                Real-Time Web Audio Synthesizer (0 External Assets)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800"
          >
            <X size={15} />
          </button>
        </div>

        {/* Master Controls: Volume & Ambient */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          {/* Volume Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Sliders size={12} className="text-emerald-400" /> MASTER VOLUME
              </span>
              <span className="text-emerald-400 font-bold">{isMuted ? 'MUTED' : `${vol}%`}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : vol}
                onChange={handleVolumeChange}
                disabled={isMuted}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <button
                onClick={handleToggleMute}
                className={`p-1.5 rounded-lg border text-xs font-mono transition-all ${
                  isMuted
                    ? 'bg-red-950/60 border-red-500/40 text-red-400'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          </div>

          {/* Ambient Sub-Hum Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">CONTROL ROOM AMBIENCE</span>
              <span className={`text-[10px] font-bold ${ambientActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                {ambientActive ? 'ACTIVE (58Hz)' : 'STANDBY'}
              </span>
            </div>
            <button
              onClick={handleToggleAmbient}
              className={`w-full py-1.5 px-3 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                ambientActive
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Activity size={13} className={ambientActive ? 'animate-pulse' : ''} />
              <span>{ambientActive ? 'STOP AMBIENT DRONE' : 'START AMBIENT DRONE'}</span>
            </button>
          </div>
        </div>

        {/* Individual Sound Effects Test Pad */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="label text-slate-300">INTERACTIVE SOUND EFFECT TEST MATRIX</span>
            {lastTested && (
              <span className="text-[10px] font-mono text-emerald-400 animate-pulse">
                ▶ PLAYING: {lastTested}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {SOUND_DEMOS.map(({ name, desc, icon: Icon, color, action }) => (
              <button
                key={name}
                onClick={() => playEffect(name, action)}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95 group ${color}`}
              >
                <div className="p-1.5 rounded-lg bg-black/40 mt-0.5 group-hover:text-white transition-colors">
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs font-bold font-mono truncate">{name}</span>
                    <Play size={10} className="text-slate-400 group-hover:text-emerald-400 opacity-60 group-hover:opacity-100" />
                  </div>
                  <p className="text-slate-400 text-[10px] truncate mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
          <span>All audio synthesized live via Web Audio API oscillators & noise buffers</span>
          <button onClick={onClose} className="btn-secondary py-1 px-3 text-xs">
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
