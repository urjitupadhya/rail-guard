import React, { useRef, useEffect, useState } from 'react';
import { useSimStore } from '../store/simulationStore';
import { PATROL_WAYPOINTS, SEARCH_WAYPOINTS, SOURCE_LOCATION } from '../simulation/scenario';
import { Play, RotateCcw, Wind, Target, Crosshair, Zap, Layers, Compass, ShieldAlert, Cpu, Box } from 'lucide-react';
import ConfidenceBar from '../components/ConfidenceBar';
import MissionTimeline from '../components/MissionTimeline';
import ThreeDStationScene from '../components/ThreeDStationScene';

const GRID_COLS = 12;
const GRID_ROWS = 8;

function getPpmColor(ppm: number): string {
  if (ppm <= 0) return 'transparent';
  if (ppm < 15) return `rgba(16, 185, 129, ${(ppm / 15) * 0.3})`;
  if (ppm < 30) return `rgba(245, 158, 11, ${0.25 + ((ppm - 15) / 15) * 0.25})`;
  if (ppm < 55) return `rgba(249, 115, 22, ${0.35 + ((ppm - 30) / 25) * 0.3})`;
  if (ppm < 75) return `rgba(239, 68, 68, ${0.55 + ((ppm - 55) / 20) * 0.25})`;
  return `rgba(255, 51, 102, ${0.75 + ((ppm - 75) / 25) * 0.25})`;
}

export default function LiveThreatMap() {
  const {
    stage, robots, heatmap, showAirflow, showSourceMarker, threat,
    startDemo, resetDemo, injectAnomaly, startSearch, localizeSource,
    verifyThreat, recordEvidence, generateReport, timeline,
  } = useSimStore();

  const rover = robots.find((r) => r.id === 'ROVER-01') || { x: 15, y: 55, battery: 94, connectivity: '5G' };
  const [robotTrail, setRobotTrail] = useState<{ x: number; y: number }[]>([]);
  const [viewEngine, setViewEngine] = useState<'3D_WEBGL' | 'ISOMETRIC' | 'SCHEMATIC'>('3D_WEBGL');

  useEffect(() => {
    setRobotTrail((prev) => {
      const next = [...prev, { x: rover.x, y: rover.y }].slice(-10);
      return next;
    });
  }, [rover.x, rover.y]);

  // Coordinate mapping for Platform 3 (620 x 340)
  const toMapX = (pct: number) => 40 + (pct / 100) * 540;
  const toMapY = (pct: number) => 35 + (pct / 100) * 260;

  const stageLabel: Record<string, { text: string; color: string; badge: string }> = {
    IDLE: { text: 'STANDBY — CLICK START DEMO', color: 'text-slate-400', badge: 'bg-slate-800 text-slate-300' },
    PATROLLING: { text: 'ROUTINE PATROL PATTERN ACTIVE', color: 'text-emerald-400', badge: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' },
    ANOMALY_DETECTED: { text: 'ATMOSPHERIC ANOMALY DETECTED', color: 'text-amber-400', badge: 'bg-amber-950/80 text-amber-400 border border-amber-500/40 animate-pulse' },
    SEARCHING: { text: 'GRADIENT TRACKING IN PROGRESS', color: 'text-cyan-400', badge: 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40' },
    LOCALIZING: { text: 'PINPOINTING PLUME SOURCE...', color: 'text-cyan-400', badge: 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40' },
    SOURCE_LOCATED: { text: 'PLUME SOURCE LOCKED (COLUMN C4)', color: 'text-red-400', badge: 'bg-red-950/80 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]' },
    VERIFYING: { text: 'MULTIMODAL SENSOR CONFIRMATION', color: 'text-amber-400', badge: 'bg-amber-950/80 text-amber-400 border border-amber-500/40' },
    VERIFIED: { text: 'HIGH-CONFIDENCE THREAT VERIFIED', color: 'text-red-400', badge: 'bg-red-950/80 text-red-400 border border-red-500/50' },
    ALERT_SENT: { text: 'RPF INCIDENT ALERT DISPATCHED', color: 'text-red-400', badge: 'bg-red-950/80 text-red-400 border border-red-500/50' },
    EVIDENCE_RECORDED: { text: 'EVIDENCE HASH COMMITTED TO LEDGER', color: 'text-emerald-400', badge: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' },
    REPORT_GENERATED: { text: 'INCIDENT DOSSIER READY FOR RPF', color: 'text-emerald-400', badge: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' },
  };

  const sl = stageLabel[stage] ?? stageLabel.IDLE;

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto pb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-white text-base lg:text-lg font-bold tracking-widest uppercase font-mono">
              3D TACTICAL THREAT ENVIRONMENT
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider ${sl.badge}`}>
              {sl.text}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1 font-mono">
            Platform 3 · Real-Time Multi-Robot Telemetry · Atmospheric Chemical Mapping
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={startDemo} className="btn-primary flex items-center gap-2 text-xs py-2 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <Play size={12} className="fill-current" />
            <span>EXECUTE AUTO DEMO</span>
          </button>
          <button onClick={resetDemo} className="btn-secondary flex items-center gap-2 text-xs py-2">
            <RotateCcw size={12} />
            <span>RESET</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* ── Main Map Canvas (Col 3) ─────────────────────────── */}
        <div className="xl:col-span-3 card p-0 overflow-hidden border border-slate-700/80 shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex flex-col">
          {/* Map Sub-Header Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#00FF9D] animate-ping" />
              <span className="text-white font-mono text-xs font-bold tracking-wider">
                CENTRAL TERMINAL · PLATFORM 3 SPATIAL DIGITAL TWIN
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
                  <Box size={13} />
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
                  <Layers size={13} />
                  <span>3D ISOMETRIC</span>
                </button>

                <button
                  onClick={() => setViewEngine('SCHEMATIC')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                    viewEngine === 'SCHEMATIC'
                      ? 'bg-slate-800 text-slate-200 border border-slate-600'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>2D PLAN</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-mono ml-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
                  ROVER-01
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06B6D4]" />
                  ROVER-02
                </span>
                {showSourceMarker && (
                  <span className="flex items-center gap-1.5 text-red-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
                    SOURCE PIN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3D WebGL Simulator Engine OR SVG Viewport */}
          {viewEngine === '3D_WEBGL' ? (
            <div className="relative p-3 bg-[#02050e]">
              <ThreeDStationScene height="520px" showControls={true} />
            </div>
          ) : (
            <div className="relative bg-[#02050e] overflow-hidden flex items-center justify-center p-4 min-h-[460px] lg:min-h-[500px]">
              {/* Holographic background cyber elements */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
              <div className="scan-line" />

              {/* 3D Perspective Transformation Wrapper */}
              <div
                className={`w-full h-full transition-all duration-700 ease-out ${
                  viewEngine === 'ISOMETRIC' ? 'isometric-view' : 'flat-view'
                }`}
              >
              <svg width="100%" height="100%" viewBox="0 0 620 340" preserveAspectRatio="xMidYMid meet">
                <defs>
                  {/* Glowing 3D gradients */}
                  <linearGradient id="deckGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d1b33" />
                    <stop offset="100%" stopColor="#060c1a" />
                  </linearGradient>
                  <linearGradient id="lidarBeamGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id="sourceGlowGrad">
                    <stop offset="0%" stopColor="#FF3366" stopOpacity="0.9" />
                    <stop offset="40%" stopColor="#EF4444" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                  </radialGradient>
                  <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Ground plane shadow under platform */}
                <polygon points="38,302 582,302 596,316 24,316" fill="#010307" opacity="0.95" />

                {/* Platform Front 3D Face (Safety Hazard Stripes) */}
                <polygon points="40,295 580,295 580,305 40,305" fill="#f59e0b" opacity="0.85" />
                {Array.from({ length: 30 }).map((_, i) => (
                  <polygon
                    key={i}
                    points={`${46 + i * 18},295 ${54 + i * 18},295 ${46 + i * 18},305 ${38 + i * 18},305`}
                    fill="#0a0e17"
                  />
                ))}

                {/* Platform Deck (Top Surface) */}
                <rect
                  x="40"
                  y="35"
                  width="540"
                  height="260"
                  rx="8"
                  fill="url(#deckGrad)"
                  stroke="#1e293b"
                  strokeWidth="2"
                />

                {/* Section lines & markings */}
                <line x1="40" y1="90" x2="580" y2="90" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="40" y1="235" x2="580" y2="235" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />

                {/* North Train Tracks */}
                <rect x="40" y="55" width="540" height="24" fill="#070d1a" stroke="#1e293b" strokeWidth="1" />
                <line x1="40" y1="59" x2="580" y2="59" stroke="#475569" strokeWidth="2.5" />
                <line x1="40" y1="75" x2="580" y2="75" stroke="#475569" strokeWidth="2.5" />
                {Array.from({ length: 27 }).map((_, i) => (
                  <rect key={`track-n-${i}`} x={45 + i * 20} y="57" width="4" height="20" fill="#1e293b" />
                ))}

                {/* South Train Tracks */}
                <rect x="40" y="245" width="540" height="24" fill="#070d1a" stroke="#1e293b" strokeWidth="1" />
                <line x1="40" y1="249" x2="580" y2="249" stroke="#475569" strokeWidth="2.5" />
                <line x1="40" y1="265" x2="580" y2="265" stroke="#475569" strokeWidth="2.5" />
                {Array.from({ length: 27 }).map((_, i) => (
                  <rect key={`track-s-${i}`} x={45 + i * 20} y="247" width="4" height="20" fill="#1e293b" />
                ))}

                {/* Platform Zones A, B, C */}
                <rect x="40" y="100" width="170" height="120" fill="rgba(16,185,129,0.02)" stroke="#1e293b" strokeWidth="1" strokeDasharray="6,4" />
                <text x="125" y="165" textAnchor="middle" fill="#334155" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono">
                  ZONE A · CONCOURSE
                </text>

                <rect x="210" y="100" width="180" height="120" fill="rgba(6,182,212,0.02)" stroke="#1e293b" strokeWidth="1" strokeDasharray="6,4" />
                <text x="300" y="165" textAnchor="middle" fill="#334155" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono">
                  ZONE B · WAITING HALL
                </text>

                <rect x="390" y="100" width="190" height="120" fill="rgba(239,68,68,0.03)" stroke="#1e293b" strokeWidth="1" strokeDasharray="6,4" />
                <text x="485" y="165" textAnchor="middle" fill="#334155" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono">
                  ZONE C · BAGGAGE SECTOR
                </text>

                {/* Restricted Locker Zone (Zone C4) */}
                <rect
                  x="460"
                  y="40"
                  width="110"
                  height="50"
                  rx="4"
                  fill="rgba(239, 68, 68, 0.12)"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  strokeDasharray="5,3"
                />
                <text x="515" y="62" textAnchor="middle" fill="#EF4444" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono">
                  ⚠ RESTRICTED
                </text>
                <text x="515" y="76" textAnchor="middle" fill="#f87171" fontSize="7" fontFamily="JetBrains Mono">
                  COLUMN C4 LOCKERS
                </text>

                {/* 3D Structural Support Pillars */}
                {[
                  { x: 120, y: 120, label: 'C1' },
                  { x: 260, y: 120, label: 'C2' },
                  { x: 400, y: 120, label: 'C3' },
                  { x: 500, y: 120, label: 'C4' },
                ].map((col) => (
                  <g key={col.label}>
                    <ellipse cx={col.x + 4} cy={col.y + 6} rx="9" ry="5" fill="#000" opacity="0.6" />
                    <rect x={col.x - 7} y={col.y - 18} width="14" height="20" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                    <ellipse cx={col.x} cy={col.y - 18} rx="7" ry="3.5" fill="#475569" stroke="#64748b" strokeWidth="0.5" />
                    <text x={col.x} y={col.y - 22} textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold" fontFamily="JetBrains Mono">
                      {col.label}
                    </text>
                  </g>
                ))}

                {/* Volumetric Chemical Heatmap Clouds */}
                {heatmap.visible && (
                  <g filter="url(#glowFilter)">
                    {heatmap.cells.map((cell, i) => {
                      const cellW = 540 / GRID_COLS;
                      const cellH = 260 / GRID_ROWS;
                      const cx = 40 + cell.col * cellW + cellW / 2;
                      const cy = 35 + cell.row * cellH + cellH / 2;
                      const r = Math.max(cellW, cellH) * 0.75;
                      return (
                        <circle
                          key={i}
                          cx={cx}
                          cy={cy}
                          r={r}
                          fill={getPpmColor(cell.ppm)}
                          style={{ transition: 'all 0.5s ease-out' }}
                        />
                      );
                    })}
                  </g>
                )}

                {/* 3D Elevated Airflow Vectors */}
                {showAirflow && (
                  <g>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <g key={i} className="airflow-arrow" style={{ animationDelay: `${(i - 1) * 0.25}s` }}>
                        {/* Shadow on ground */}
                        <line
                          x1={120 + i * 80}
                          y1={162}
                          x2={148 + i * 80}
                          y2={148}
                          stroke="#000"
                          strokeWidth="2"
                          opacity="0.4"
                        />
                        {/* Elevated floating 3D arrow */}
                        <line
                          x1={120 + i * 80}
                          y1={155}
                          x2={148 + i * 80}
                          y2={141}
                          stroke="#38BDF8"
                          strokeWidth="2"
                          strokeLinecap="round"
                          markerEnd="url(#arrowhead3d)"
                        />
                      </g>
                    ))}
                    <defs>
                      <marker id="arrowhead3d" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <polygon points="0 0, 6 3, 0 6" fill="#38BDF8" />
                      </marker>
                    </defs>
                    <rect x="235" y="195" width="150" height="18" rx="4" fill="#041226" stroke="#0284c7" strokeWidth="1" />
                    <text x="310" y="207" textAnchor="middle" fill="#38BDF8" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono">
                      VENTILATION VECTOR: 1.8 m/s @ 74° NE
                    </text>
                  </g>
                )}

                {/* Autonomous Robot Trail */}
                {robotTrail.length > 1 &&
                  robotTrail.map((pt, i) => {
                    if (i === 0) return null;
                    return (
                      <line
                        key={i}
                        x1={toMapX(robotTrail[i - 1].x)}
                        y1={toMapY(robotTrail[i - 1].y)}
                        x2={toMapX(pt.x)}
                        y2={toMapY(pt.y)}
                        stroke="#10B981"
                        strokeWidth="1.5"
                        opacity={(i / robotTrail.length) * 0.6}
                        strokeDasharray="3,3"
                      />
                    );
                  })}

                {/* ROVER-02 Unit (Secondary Patrol) */}
                <g>
                  <ellipse cx={toMapX(20)} cy={toMapY(55) + 6} rx="10" ry="4.5" fill="#000" opacity="0.6" />
                  <circle cx={toMapX(20)} cy={toMapY(55)} r="8" fill="#08203e" stroke="#06B6D4" strokeWidth="1.5" />
                  <circle cx={toMapX(20)} cy={toMapY(55)} r="3" fill="#38BDF8" />
                  <text x={toMapX(20)} y={toMapY(55) - 14} textAnchor="middle" fill="#38BDF8" fontSize="7" fontWeight="bold" fontFamily="JetBrains Mono">
                    ROVER-02
                  </text>
                </g>

                {/* ROVER-01 (Primary Autonomous Unit) */}
                <g
                  style={{ transition: 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  transform={`translate(${toMapX(rover.x)}, ${toMapY(rover.y)})`}
                >
                  {/* LiDAR Forward Cone */}
                  <polygon
                    points="0,0 50,-24 50,24"
                    fill="url(#lidarBeamGrad)"
                    className="lidar-pulse"
                  />

                  {/* Robot Cast Shadow */}
                  <ellipse cx="0" cy="8" rx="16" ry="6" fill="#000" opacity="0.8" />

                  {/* Pulsing Beacon Wave */}
                  <circle r="22" fill="none" stroke="#10B981" strokeWidth="1" className="holo-beacon" />

                  {/* Rover Chassis */}
                  <rect x="-12" y="-9" width="24" height="18" rx="5" fill="#072217" stroke="#10B981" strokeWidth="2" />
                  <rect x="-14" y="-8" width="3" height="16" rx="1.5" fill="#02150e" stroke="#10B981" strokeWidth="1" />
                  <rect x="11" y="-8" width="3" height="16" rx="1.5" fill="#02150e" stroke="#10B981" strokeWidth="1" />

                  {/* Rotating Radar Core */}
                  <circle r="5" fill="#00FF9D" />
                  <line x1="0" y1="0" x2="0" y2="-6" stroke="#02150e" strokeWidth="1.5" className="radar-sweep" />

                  {/* Floating Hologram Stem & Tag */}
                  <line x1="0" y1="-9" x2="0" y2="-26" stroke="#00FF9D" strokeWidth="1" strokeDasharray="2,2" />
                  <rect
                    x="-35"
                    y="-38"
                    width="70"
                    height="14"
                    rx="4"
                    fill="#020914"
                    stroke="#10B981"
                    strokeWidth="1.2"
                    className="float-3d"
                  />
                  <text
                    x="0"
                    y="-28"
                    textAnchor="middle"
                    fill="#00FF9D"
                    fontSize="7"
                    fontWeight="bold"
                    fontFamily="JetBrains Mono"
                  >
                    ROVER-01 · {stage.replace(/_/g, ' ').slice(0, 10)}
                  </text>
                </g>

                {/* 3D Localized Target Ping */}
                {showSourceMarker && (
                  <g transform={`translate(${toMapX(SOURCE_LOCATION.x)}, ${toMapY(SOURCE_LOCATION.y)})`}>
                    {/* Shadow on platform */}
                    <ellipse cx="0" cy="0" rx="14" ry="6" fill="#000" opacity="0.8" />
                    {/* Vertical laser target beam */}
                    <line x1="0" y1="0" x2="0" y2="-45" stroke="#FF3366" strokeWidth="2" strokeDasharray="3,2" />
                    <circle r="26" fill="none" stroke="#FF3366" strokeWidth="1.5" className="holo-beacon" />
                    <circle r="14" fill="none" stroke="#EF4444" strokeWidth="2" className="holo-beacon" style={{ animationDelay: '0.4s' }} />
                    <circle r="6" fill="#FF3366" stroke="#fff" strokeWidth="2" />

                    {/* Floating Tactical Callout Banner */}
                    <rect x="-45" y="-58" width="90" height="18" rx="4" fill="#38040e" stroke="#FF3366" strokeWidth="1.5" />
                    <text x="0" y="-46" textAnchor="middle" fill="#FF3366" fontSize="8" fontWeight="bold" fontFamily="JetBrains Mono">
                      🎯 SOURCE LOCKED
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>
          )}

          {/* Map Telemetry Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 border-t border-slate-800 bg-slate-950/90 text-xs font-mono">
            <div className="flex items-center gap-5 text-slate-300">
              <span>BATTERY: <strong className="text-emerald-400">{rover.battery}%</strong></span>
              <span>UPLINK: <strong className="text-emerald-400">{rover.connectivity} ULTRA-LOW LATENCY</strong></span>
              {showAirflow && <span>AIRFLOW: <strong className="text-cyan-400">1.8 m/s @ 74° NE</strong></span>}
            </div>
            {showSourceMarker && (
              <span className="text-red-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                ESTIMATED ERROR: ~1.8m [SIMULATED]
              </span>
            )}
          </div>
        </div>

        {/* ── Right Panel (Col 1) ─────────────────────────────── */}
        <div className="space-y-4">
          {/* Source Pinpoint Diagnostics */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Crosshair size={15} className={showSourceMarker ? 'text-red-400' : 'text-slate-400'} />
              <span className="label text-slate-300">SOURCE LOCALIZATION</span>
            </div>

            {showSourceMarker ? (
              <div className="space-y-3">
                <div className="text-center py-2 bg-red-950/40 rounded-xl border border-red-500/40 card-glow-danger">
                  <div className="text-red-400 text-3xl font-bold animate-pulse">🎯</div>
                  <div className="text-red-300 font-extrabold text-sm mt-1 tracking-widest font-mono">
                    TARGET ISOLATED
                  </div>
                  <div className="text-slate-300 text-xs mt-1 font-mono">{SOURCE_LOCATION.label}</div>
                </div>
                <ConfidenceBar label="Localization Accuracy" value={threat.localizationConfidence} showSim color="danger" />
                <div className="text-[11px] text-slate-400 text-center font-mono">
                  Coordinate: [X: 80%, Y: 22%] · Platform 3 Column C4
                </div>
              </div>
            ) : showAirflow ? (
              <div className="space-y-2.5">
                <div className="space-y-1.5 text-xs font-mono bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Airflow Vector</span>
                    <span className="text-cyan-400 font-bold">74° NE ↗</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Velocity</span>
                    <span className="text-cyan-400 font-bold">1.8 m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Source Est.</span>
                    <span className="text-amber-400 font-bold">68° NE (Column C4)</span>
                  </div>
                </div>
                <ConfidenceBar label="Search Confidence" value={threat.localizationConfidence || 55} showSim color="info" />
              </div>
            ) : (
              <div className="text-slate-500 text-xs text-center py-4 font-mono">
                Awaiting mission trigger...
              </div>
            )}
          </div>

          {/* Sensor Confidence Array */}
          {threat.chemicalConfidence > 0 && (
            <div className="card p-4 space-y-2.5">
              <span className="label flex items-center gap-1.5 text-slate-300">
                <Zap size={12} className="text-amber-400" /> Multi-Modal Confidence
              </span>
              <ConfidenceBar label="PID / MOX Array" value={threat.chemicalConfidence} showSim />
              <ConfidenceBar label="Optical AI Analysis" value={threat.visualConfidence} showSim />
              <ConfidenceBar label="Thermal Gradient" value={threat.thermalConfidence} showSim />
              {threat.fusionConfidence > 0 && (
                <div className="border-t border-slate-800 pt-2">
                  <ConfidenceBar label="Fused Threat Confidence" value={threat.fusionConfidence} showSim color="danger" />
                </div>
              )}
            </div>
          )}

          {/* Airflow 3D Compass */}
          {showAirflow && (
            <div className="card p-4 space-y-3">
              <span className="label flex items-center gap-1.5 text-slate-300">
                <Wind size={12} className="text-cyan-400" /> Atmospheric Plume Dynamics
              </span>
              <div className="flex items-center justify-center py-2">
                <div className="relative w-20 h-20 rounded-full border-2 border-slate-700 bg-slate-900/60 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <div
                    className="text-cyan-400 text-2xl font-bold transition-transform duration-500"
                    style={{ transform: 'rotate(-45deg)' }}
                  >
                    ➔
                  </div>
                  <span className="absolute -top-1.5 text-[9px] text-slate-400 font-bold">N</span>
                  <span className="absolute -bottom-1.5 text-[9px] text-slate-400 font-bold">S</span>
                  <span className="absolute -right-2 text-[9px] text-slate-400 font-bold">E</span>
                  <span className="absolute -left-2 text-[9px] text-slate-400 font-bold">W</span>
                </div>
              </div>
              <div className="text-xs font-mono space-y-1 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Direction</span>
                  <span className="text-cyan-300 font-bold">74° NE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plume Speed</span>
                  <span className="text-cyan-300 font-bold">1.8 m/s</span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card p-3">
            <span className="label block mb-2 text-slate-300">Mission Event Feed</span>
            <MissionTimeline />
          </div>
        </div>
      </div>
    </div>
  );
}
