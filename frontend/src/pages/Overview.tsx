import React, { useState } from 'react';
import { useSimStore } from '../store/simulationStore';
import { useNavigate } from 'react-router-dom';
import {
  Bot, AlertTriangle, ShieldCheck, Wifi, Timer, Target,
  Play, TrendingUp, Activity, Layers, Maximize2, ShieldAlert,
  Zap, Compass, ChevronRight, Box
} from 'lucide-react';
import MissionTimeline from '../components/MissionTimeline';
import ThreeDStationScene from '../components/ThreeDStationScene';

function KpiCard3D({
  icon: Icon,
  label,
  value,
  sub,
  color = 'accent',
  alert = false,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: 'accent' | 'warn' | 'danger' | 'info' | 'slate';
  alert?: boolean;
  trend?: string;
}) {
  const colorStyles = {
    accent: {
      border: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      glow: 'rgba(16,185,129,0.12)',
      textAccent: 'text-emerald-400',
    },
    warn: {
      border: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-950/60 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      glow: 'rgba(245,158,11,0.12)',
      textAccent: 'text-amber-400',
    },
    danger: {
      border: 'border-red-500/50 hover:border-red-500/80',
      iconBg: 'bg-red-950/70 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]',
      glow: 'rgba(239,68,68,0.2)',
      textAccent: 'text-red-400',
    },
    info: {
      border: 'hover:border-cyan-500/50',
      iconBg: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
      glow: 'rgba(6,182,212,0.12)',
      textAccent: 'text-cyan-400',
    },
    slate: {
      border: 'hover:border-slate-600',
      iconBg: 'bg-slate-900 border-slate-700 text-slate-400',
      glow: 'transparent',
      textAccent: 'text-slate-300',
    },
  }[color];

  return (
    <div
      className={`card group cursor-default relative overflow-hidden transition-all duration-300 ${colorStyles.border} ${
        alert ? 'alert-flash card-glow-danger' : ''
      }`}
      style={{
        background: `radial-gradient(circle at 80% 20%, ${colorStyles.glow} 0%, rgba(11, 19, 41, 0.85) 70%)`,
      }}
    >
      {/* Corner HUD accent */}
      <div className="hud-corner-tl opacity-40 group-hover:opacity-100 transition-opacity" />
      <div className="hud-corner-br opacity-40 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between mb-2">
        <span className="label tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 ${colorStyles.iconBg}`}>
          <Icon size={14} />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="value-lg font-mono">{value}</div>
        {trend && (
          <span className={`text-[10px] font-mono font-bold ${colorStyles.textAccent}`}>
            {trend}
          </span>
        )}
      </div>

      {sub && (
        <div className="text-slate-400 text-[11px] mt-1 flex items-center justify-between">
          <span>{sub}</span>
        </div>
      )}

      {/* Decorative bottom micro-glow bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent group-hover:via-emerald-500/60 transition-all duration-300" />
    </div>
  );
}

export default function Overview() {
  const {
    stage, threat, timeline, startDemo, isRunning,
    robots, heatmap, showSourceMarker,
  } = useSimStore();
  const navigate = useNavigate();
  const [viewEngine, setViewEngine] = useState<'3D_WEBGL' | 'ISOMETRIC' | 'SCHEMATIC'>('3D_WEBGL');

  const hasIncident = stage !== 'IDLE' && stage !== 'PATROLLING';
  const activeThreats = hasIncident ? 1 : 0;
  const rover = robots[0] || { x: 15, y: 55, battery: 94 };

  // Map coordinate helpers
  const toSvgX = (pct: number) => 30 + (pct / 100) * 440;
  const toSvgY = (pct: number) => 25 + (pct / 100) * 150;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-6">
      {/* Top Header with 3D start demo button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800/80 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-slate-950/90 shadow-[0_8px_25px_rgba(0,0,0,0.6)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00FF9D] animate-ping" />
            <h1 className="text-white text-base lg:text-lg font-bold tracking-widest uppercase font-mono">
              COMMAND OVERVIEW & TELEMETRY
            </h1>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            Platform 3 · CBRN Atmospheric Multi-Sensor Matrix · Autonomous Threat Surveillance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isRunning ? (
            <button
              onClick={startDemo}
              className="btn-primary flex items-center gap-2 text-xs py-2 px-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              <Play size={13} className="fill-current" />
              <span>LAUNCH FULL DEMO</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Activity size={13} className="animate-spin" />
              <span>SIMULATION IN PROGRESS</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid with 3D Depth */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard3D
          icon={Bot}
          label="Active Fleet"
          value={12}
          sub="10 Autonomous · 2 RPF"
          color="accent"
          trend="100% ONLINE"
        />
        <KpiCard3D
          icon={AlertTriangle}
          label="Active Threats"
          value={activeThreats}
          sub={hasIncident ? 'Platform 3 — CHEMICAL' : 'All sectors secure'}
          color={hasIncident ? 'danger' : 'slate'}
          alert={hasIncident}
          trend={hasIncident ? 'LEVEL 4' : 'DEFCON 5'}
        />
        <KpiCard3D
          icon={ShieldCheck}
          label="Threats Today"
          value={4}
          sub="3 Cleared · 1 Active"
          color="warn"
          trend="AUDITED"
        />
        <KpiCard3D
          icon={Wifi}
          label="Sensor Mesh"
          value="99.8%"
          sub="PID + MOX + IR Grid"
          color="accent"
          trend="L1 SYNC"
        />
        <KpiCard3D
          icon={Timer}
          label="Edge Latency"
          value="2.4s"
          sub="[SIM] Neural Inference"
          color="info"
          trend="LOW LATENCY"
        />
        <KpiCard3D
          icon={Target}
          label="Localization"
          value={`${threat.localizationConfidence || 0}%`}
          sub={threat.localizationConfidence > 0 ? 'Column C4 Pinpointed' : 'Standby Mode'}
          color={threat.localizationConfidence > 75 ? 'danger' : threat.localizationConfidence > 0 ? 'warn' : 'slate'}
          trend={threat.localizationConfidence > 0 ? 'SOURCE LOCK' : 'SCANNING'}
        />
      </div>

      {/* Main 2-Col 3D Command Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left 2 Cols: 3D Holographic Threat Map Preview */}
        <div className="xl:col-span-2 card p-0 overflow-hidden border border-slate-700/80 shadow-[0_15px_35px_rgba(0,0,0,0.8)] flex flex-col">
          {/* Header Bar with 3D View Toggle */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 to-slate-950/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span className="text-white text-xs font-bold font-mono tracking-widest uppercase">
                3D TACTICAL PROJECTION · PLATFORM 3
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                ZONE A-B-C
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* 3D WebGL / Isometric / 2D Engine Toggle */}
              <div className="flex items-center p-1 rounded-lg bg-slate-950/80 border border-slate-700">
                <button
                  onClick={() => setViewEngine('3D_WEBGL')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                    viewEngine === '3D_WEBGL'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box size={12} />
                  <span>3D SIMULATOR</span>
                </button>

                <button
                  onClick={() => setViewEngine('ISOMETRIC')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                    viewEngine === 'ISOMETRIC'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers size={12} />
                  <span>ISOMETRIC</span>
                </button>

                <button
                  onClick={() => setViewEngine('SCHEMATIC')}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                    viewEngine === 'SCHEMATIC'
                      ? 'bg-slate-800 text-slate-200 border border-slate-600'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>2D</span>
                </button>
              </div>

              <button
                onClick={() => navigate('/map')}
                className="flex items-center gap-1 text-emerald-400 text-xs hover:text-emerald-300 font-mono font-bold px-2 py-1 rounded hover:bg-emerald-950/40 border border-emerald-500/30 transition-all"
              >
                <Maximize2 size={11} />
                <span>EXPAND</span>
              </button>
            </div>
          </div>

          {/* 3D WebGL Simulator Engine OR SVG Viewport */}
          {viewEngine === '3D_WEBGL' ? (
            <div className="relative p-2.5 bg-[#020510]">
              <ThreeDStationScene height="330px" showControls={true} />
            </div>
          ) : (
            <div className="relative h-64 sm:h-72 bg-[#020510] overflow-hidden flex items-center justify-center p-3">
              {/* Holographic floor grid & scanner */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
              <div className="scan-line" />

              {/* Perspective wrapper */}
              <div
                className={`w-full h-full transition-all duration-700 ease-out ${
                  viewEngine === 'ISOMETRIC' ? 'isometric-view' : 'flat-view'
                }`}
              >
              <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
                <defs>
                  {/* Glowing 3D Gradients */}
                  <linearGradient id="platformDeckGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f1d38" />
                    <stop offset="100%" stopColor="#080e1c" />
                  </linearGradient>
                  <linearGradient id="platformExtrusion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#060a14" />
                    <stop offset="100%" stopColor="#020408" />
                  </linearGradient>
                  <linearGradient id="roverLidarGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id="plumeVolumetric">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                  </radialGradient>
                  <filter id="holoGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* 3D Platform Extrusion Base Shadow */}
                <polygon points="18,178 482,178 492,188 8,188" fill="#010307" opacity="0.9" />

                {/* 3D Platform Front Thickness Edge (Yellow/Black Hazard Stripes) */}
                <polygon points="20,175 480,175 480,182 20,182" fill="#eab308" opacity="0.8" />
                {Array.from({ length: 23 }).map((_, i) => (
                  <polygon
                    key={i}
                    points={`${25 + i * 20},175 ${33 + i * 20},175 ${25 + i * 20},182 ${17 + i * 20},182`}
                    fill="#0a0a0a"
                  />
                ))}

                {/* Platform Deck (Top Surface) */}
                <rect
                  x="20"
                  y="25"
                  width="460"
                  height="150"
                  rx="6"
                  fill="url(#platformDeckGrad)"
                  stroke="#1e293b"
                  strokeWidth="2"
                />

                {/* Platform Interior Grid Markings */}
                <line x1="20" y1="65" x2="480" y2="65" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="20" y1="135" x2="480" y2="135" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />

                {/* Train Tracks 1 (Top edge) */}
                <line x1="20" y1="40" x2="480" y2="40" stroke="#334155" strokeWidth="3" />
                <line x1="20" y1="46" x2="480" y2="46" stroke="#475569" strokeWidth="2" />
                {Array.from({ length: 23 }).map((_, i) => (
                  <rect key={`track-t-${i}`} x={25 + i * 20} y="38" width="3" height="10" fill="#1e293b" />
                ))}

                {/* Train Tracks 2 (Bottom edge) */}
                <line x1="20" y1="155" x2="480" y2="155" stroke="#334155" strokeWidth="3" />
                <line x1="20" y1="161" x2="480" y2="161" stroke="#475569" strokeWidth="2" />
                {Array.from({ length: 23 }).map((_, i) => (
                  <rect key={`track-b-${i}`} x={25 + i * 20} y="153" width="3" height="10" fill="#1e293b" />
                ))}

                {/* Station Columns with 3D Elevation */}
                {[
                  { x: 100, y: 100, label: 'C1' },
                  { x: 220, y: 100, label: 'C2' },
                  { x: 340, y: 100, label: 'C3' },
                  { x: 440, y: 100, label: 'C4' },
                ].map((col) => (
                  <g key={col.label}>
                    {/* Column shadow */}
                    <ellipse cx={col.x + 3} cy={col.y + 4} rx="7" ry="4" fill="#000" opacity="0.6" />
                    {/* Column pillar 3D height */}
                    <rect x={col.x - 5} y={col.y - 12} width="10" height="14" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                    <ellipse cx={col.x} cy={col.y - 12} rx="5" ry="2.5" fill="#475569" />
                    <text x={col.x} y={col.y - 15} textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="JetBrains Mono">
                      {col.label}
                    </text>
                  </g>
                ))}

                {/* Restricted Locker Zone (Platform right) */}
                <rect
                  x="390"
                  y="30"
                  width="85"
                  height="45"
                  rx="4"
                  fill="rgba(239, 68, 68, 0.12)"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  strokeDasharray="5,3"
                />
                <text x="432" y="55" textAnchor="middle" fill="#FF3366" fontSize="7" fontWeight="bold" fontFamily="JetBrains Mono">
                  ZONE C4 (LOCKERS)
                </text>

                {/* Volumetric Heatmap Plume */}
                {heatmap.visible && (
                  <g filter="url(#holoGlow)">
                    {/* Outer heat dispersion ring */}
                    <ellipse cx={toSvgX(80)} cy={toSvgY(22)} rx="55" ry="32" fill="url(#plumeVolumetric)" opacity="0.65" />
                    <ellipse cx={toSvgX(80)} cy={toSvgY(22)} rx="30" ry="18" fill="#EF4444" opacity="0.5" />
                    <circle cx={toSvgX(80)} cy={toSvgY(22)} r="12" fill="#FF3366" opacity="0.8" />
                  </g>
                )}

                {/* ROVER-01 (Animated Autonomous Unit) */}
                <g style={{ transition: 'all 1.2s cubic-bezier(0.16,1,0.3,1)' }}>
                  {/* LiDAR scan cone projecting forward */}
                  <polygon
                    points={`${toSvgX(rover.x)},${toSvgY(rover.y)} ${toSvgX(rover.x) + 35},${toSvgY(rover.y) - 15} ${toSvgX(rover.x) + 35},${toSvgY(rover.y) + 15}`}
                    fill="url(#roverLidarGrad)"
                    className="lidar-pulse"
                  />

                  {/* Robot shadow */}
                  <ellipse cx={toSvgX(rover.x)} cy={toSvgY(rover.y) + 5} rx="12" ry="5" fill="#000" opacity="0.7" />

                  {/* Robot 3D Body */}
                  <rect
                    x={toSvgX(rover.x) - 9}
                    y={toSvgY(rover.y) - 7}
                    width="18"
                    height="14"
                    rx="4"
                    fill="#0f291e"
                    stroke="#10B981"
                    strokeWidth="1.5"
                  />
                  {/* Radar sensor dome */}
                  <circle cx={toSvgX(rover.x)} cy={toSvgY(rover.y)} r="4" fill="#00FF9D" />
                  {/* Holographic pulse ring */}
                  <circle
                    cx={toSvgX(rover.x)}
                    cy={toSvgY(rover.y)}
                    r="16"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1"
                    className="holo-beacon"
                  />

                  {/* Floating 3D HUD Tag */}
                  <line
                    x1={toSvgX(rover.x)}
                    y1={toSvgY(rover.y) - 7}
                    x2={toSvgX(rover.x)}
                    y2={toSvgY(rover.y) - 20}
                    stroke="#10B981"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <rect
                    x={toSvgX(rover.x) - 28}
                    y={toSvgY(rover.y) - 30}
                    width="56"
                    height="11"
                    rx="3"
                    fill="#030b14"
                    stroke="#10B981"
                    strokeWidth="1"
                    className="float-3d"
                  />
                  <text
                    x={toSvgX(rover.x)}
                    y={toSvgY(rover.y) - 22}
                    textAnchor="middle"
                    fill="#00FF9D"
                    fontSize="6"
                    fontWeight="bold"
                    fontFamily="JetBrains Mono"
                  >
                    ROVER-01 [{stage === 'IDLE' ? 'PATROL' : stage.slice(0, 8)}]
                  </text>
                </g>

                {/* ROVER-02 Unit */}
                <g>
                  <ellipse cx={toSvgX(22)} cy={toSvgY(55) + 4} rx="8" ry="3.5" fill="#000" opacity="0.6" />
                  <circle cx={toSvgX(22)} cy={toSvgY(55)} r="6" fill="#0b2440" stroke="#06B6D4" strokeWidth="1.5" />
                  <circle cx={toSvgX(22)} cy={toSvgY(55)} r="2.5" fill="#38BDF8" />
                  <text x={toSvgX(22)} y={toSvgY(55) - 10} textAnchor="middle" fill="#38BDF8" fontSize="6" fontFamily="JetBrains Mono">
                    ROVER-02
                  </text>
                </g>

                {/* Localized Source 3D Marker */}
                {showSourceMarker && (
                  <g transform={`translate(${toSvgX(80)}, ${toSvgY(22)})`}>
                    <line x1="0" y1="0" x2="0" y2="-28" stroke="#EF4444" strokeWidth="1.5" />
                    <circle r="18" fill="none" stroke="#FF3366" strokeWidth="1.5" className="holo-beacon" />
                    <circle r="6" fill="#EF4444" stroke="#fff" strokeWidth="1.5" />
                    <rect x="-30" y="-38" width="60" height="12" rx="3" fill="#3b0712" stroke="#EF4444" strokeWidth="1" />
                    <text x="0" y="-29" textAnchor="middle" fill="#FF3366" fontSize="6.5" fontWeight="bold" fontFamily="JetBrains Mono">
                      🎯 TARGET PIN
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>
          )}

          {/* Map Footer Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
                ROVER-01 [ACTIVE]
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06B6D4]" />
                ROVER-02 [STANDBY]
              </span>
              {showSourceMarker && (
                <span className="flex items-center gap-1.5 text-red-400 font-mono text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444] animate-ping" />
                  ANOMALY SOURCE PINNED
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="badge-muted text-[10px]">BATTERY {rover.battery}%</span>
              <span className="badge-online text-[10px]">MESH LOCKED</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Tactical Dossier & Incident Center */}
        <div className="space-y-4">
          {/* Active Threat Card */}
          {hasIncident ? (
            <div className="card border-red-500/50 bg-gradient-to-br from-red-950/80 via-slate-900/90 to-slate-950 p-4 space-y-3 card-glow-danger">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs tracking-wider uppercase font-mono">
                  <ShieldAlert size={15} />
                  <span>TACTICAL THREAT ALERT</span>
                </div>
                <span className="badge-danger text-[10px] uppercase tracking-wider font-bold">
                  PRIORITY 1
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono bg-slate-950/60 p-3 rounded-lg border border-red-500/20">
                <div className="flex justify-between">
                  <span className="text-slate-400">INCIDENT ID</span>
                  <span className="text-white font-bold">RGX-2026-001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">LOCATION</span>
                  <span className="text-emerald-300">PLATFORM 3 · ZONE C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MISSION PHASE</span>
                  <span className="text-amber-400 font-bold">{stage.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SOURCE CONFIDENCE</span>
                  <span className="text-red-400 font-bold">
                    {threat.localizationConfidence}% <span className="text-slate-500 text-[10px]">[SIM]</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/threat-passport')}
                className="w-full btn-danger flex items-center justify-center gap-2 text-xs py-2 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                <span>OPEN THREAT PASSPORT</span>
                <ChevronRight size={13} />
              </button>
            </div>
          ) : (
            <div className="card p-4 space-y-3 border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900/80 to-slate-950">
              <span className="label">SECTOR SECURITY STATUS</span>
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 shadow-[0_0_10px_#00FF9D]" />
                </span>
                <span className="text-emerald-400 font-extrabold text-sm font-mono tracking-widest">
                  ALL SECTORS SECURE
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                Zero CBRN anomalies detected in Platform 3 envelope. Robot fleet running routine atmospheric sweeps.
              </p>
              <button
                onClick={startDemo}
                className="w-full btn-primary flex items-center justify-center gap-2 text-xs py-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <Play size={12} className="fill-current" />
                <span>START SIMULATED ATTACK</span>
              </button>
            </div>
          )}

          {/* Subsystem Readiness Matrix */}
          <div className="card p-4 space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="label">SUBSYSTEM READINESS</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">100% OPERATIONAL</span>
            </div>

            {[
              { name: 'CBRN Sensor Matrix', status: 'ACTIVE', color: 'text-emerald-400' },
              { name: 'Anemometer Array (Airflow)', status: 'LOCKED (1.8m/s)', color: 'text-cyan-400' },
              { name: 'Localization Solver (MHE)', status: 'READY', color: 'text-emerald-400' },
              { name: 'Cryptographic Ledger', status: 'SYNCED', color: 'text-emerald-400' },
              { name: 'RPF Tactical Dispatcher', status: 'STANDBY', color: 'text-amber-400' },
            ].map(({ name, status, color }) => (
              <div key={name} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0 font-mono">
                <span className="text-slate-400">{name}</span>
                <span className={`font-semibold ${color}`}>{status}</span>
              </div>
            ))}
          </div>

          {/* Fast Navigation Grid */}
          <div className="card p-3 space-y-2">
            <span className="label">COMMAND HUBS</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Threat Map', to: '/map', icon: Layers },
                { label: 'Sensor Lab', to: '/sensors', icon: Activity },
                { label: 'Blockchain', to: '/evidence', icon: ShieldCheck },
                { label: 'Robot Fleet', to: '/units', icon: Bot },
              ].map(({ label, to, icon: NavIcon }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-xs font-mono transition-all duration-150"
                >
                  <NavIcon size={13} className="text-slate-400 group-hover:text-emerald-400" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission Timeline Card with 3D Bevel */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
          <span className="text-white text-xs font-bold tracking-wider uppercase flex items-center gap-2 font-mono">
            <TrendingUp size={14} className="text-emerald-400" />
            OPERATIONAL LOG & MISSION TIMELINE
          </span>
          {timeline.length === 0 && (
            <button
              onClick={startDemo}
              className="flex items-center gap-1.5 text-emerald-400 text-xs hover:text-emerald-300 font-mono font-bold"
            >
              <Play size={10} /> Launch demo to record events
            </button>
          )}
        </div>
        <MissionTimeline />
      </div>
    </div>
  );
}
