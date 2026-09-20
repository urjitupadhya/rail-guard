import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Map, Bot, AlertTriangle, FlaskConical,
  FileText, Lock, ClipboardList, Settings, Play, RotateCcw,
  Zap, Search, Crosshair, Camera, Shield, FileOutput, ChevronDown
} from 'lucide-react';
import { useSimStore } from '../store/simulationStore';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/map', icon: Map, label: 'Live Threat Map' },
  { to: '/units', icon: Bot, label: 'Mobile Units' },
  { to: '/threats', icon: AlertTriangle, label: 'Threats' },
  { to: '/sensors', icon: FlaskConical, label: 'Sensor Analytics' },
  { to: '/threat-passport', icon: FileText, label: 'Threat Passport' },
  { to: '/evidence', icon: Lock, label: 'Evidence Ledger' },
  { to: '/reports', icon: ClipboardList, label: 'Incident Reports' },
  { to: '/system', icon: Settings, label: 'System Health' },
];

const DEMO_BUTTONS = [
  { label: 'Start Patrol', icon: Play, action: 'startDemo', color: 'text-emerald-400' },
  { label: 'Inject Anomaly', icon: Zap, action: 'injectAnomaly', color: 'text-amber-400' },
  { label: 'Start Search', icon: Search, action: 'startSearch', color: 'text-cyan-400' },
  { label: 'Localize Source', icon: Crosshair, action: 'localizeSource', color: 'text-red-400' },
  { label: 'Verify Threat', icon: Camera, action: 'verifyThreat', color: 'text-cyan-400' },
  { label: 'Record Evidence', icon: Shield, action: 'recordEvidence', color: 'text-emerald-400' },
  { label: 'Generate Report', icon: FileOutput, action: 'generateReport', color: 'text-emerald-400' },
];

export default function Sidebar() {
  const store = useSimStore();
  const [demoExpanded, setDemoExpanded] = React.useState(false);

  const STAGE_COLORS: Record<string, string> = {
    IDLE: 'text-slate-400 border-slate-700 bg-slate-800/40',
    PATROLLING: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    ANOMALY_DETECTED: 'text-amber-400 border-amber-500/40 bg-amber-950/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    SEARCHING: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    LOCALIZING: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    SOURCE_LOCATED: 'text-red-400 border-red-500/40 bg-red-950/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    VERIFYING: 'text-amber-400 border-amber-500/40 bg-amber-950/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    VERIFIED: 'text-red-400 border-red-500/40 bg-red-950/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    ALERT_SENT: 'text-red-400 border-red-500/40 bg-red-950/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    EVIDENCE_RECORDED: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    REPORT_GENERATED: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
  };

  return (
    <aside className="w-60 flex flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-slate-950/95 backdrop-blur-xl flex-shrink-0 overflow-hidden relative shadow-[4px_0_24px_rgba(0,0,0,0.6)]">
      {/* Subtle vertical glow line */}
      <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent pointer-events-none" />

      {/* Nav list */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1">
          NAVIGATION
        </div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => store.setSidebarOpen(false)}
            className={({ isActive }) =>
              isActive ? 'nav-item-active' : 'nav-item'
            }
          >
            <Icon size={15} className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Mission State Tracker */}
      {store.stage !== 'IDLE' && (
        <div className="px-3.5 py-2.5 mx-2.5 mb-2 rounded-xl border bg-slate-900/60 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Current Phase</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className={`text-[11px] font-bold tracking-wider px-2 py-1 rounded-md border text-center font-mono ${STAGE_COLORS[store.stage] || 'text-slate-200'}`}>
            {store.stage.replace(/_/g, ' ')}
          </div>
        </div>
      )}

      {/* 3D Demo Control Panel */}
      <div className="border-t border-slate-800/80 p-3 bg-slate-950/90">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <Zap size={11} className="text-amber-400" />
            Simulation Control
          </span>
          <button
            onClick={() => setDemoExpanded(!demoExpanded)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/60 transition-colors"
          >
            <ChevronDown size={14} className={`transition-transform duration-200 ${demoExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {demoExpanded ? (
          <div className="space-y-1.5 animate-fadeIn">
            <button
              onClick={store.startDemo}
              className="w-full btn-primary flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              <Play size={12} className="fill-current" /> AUTO DEMO RUN
            </button>
            <div className="grid grid-cols-1 gap-1 pt-1 max-h-44 overflow-y-auto pr-1">
              {DEMO_BUTTONS.slice(1).map(({ label, icon: Icon, action, color }) => (
                <button
                  key={action}
                  onClick={() => (store as unknown as Record<string, () => void>)[action]?.()}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 text-xs hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/80 transition-all font-mono"
                >
                  <Icon size={12} className={color} />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={store.resetDemo}
              className="w-full btn-danger flex items-center justify-center gap-2 mt-2"
            >
              <RotateCcw size={12} /> Reset Simulation
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={store.startDemo}
              className="flex-1 btn-primary flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Play size={11} className="fill-current" /> START DEMO
            </button>
            <button
              onClick={store.resetDemo}
              className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 transition-all"
              title="Reset Demo"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        )}

        {/* Status indicator */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06B6D4] animate-pulse" />
            <span>RPF ENGINE</span>
          </span>
          <span className="font-mono text-emerald-400 font-semibold">[READY]</span>
        </div>
      </div>
    </aside>
  );
}
