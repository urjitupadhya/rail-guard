import React from 'react';

interface ConfidenceBarProps {
  label: string;
  value: number;
  max?: number;
  color?: 'accent' | 'warn' | 'danger' | 'info';
  showSim?: boolean;
  animated?: boolean;
}

const COLOR_MAP = {
  accent: 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
  warn: 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
  danger: 'bg-gradient-to-r from-red-600 to-pink-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]',
  info: 'bg-gradient-to-r from-cyan-500 to-blue-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]',
};

const TEXT_MAP = {
  accent: 'text-emerald-400',
  warn: 'text-amber-400',
  danger: 'text-red-400',
  info: 'text-cyan-400',
};

export default function ConfidenceBar({
  label,
  value,
  max = 100,
  color = 'accent',
  showSim = false,
  animated = true,
}: ConfidenceBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const resolvedColor = value >= 75 ? 'accent' : value >= 50 ? 'warn' : 'danger';
  const barClass = color === 'accent' ? COLOR_MAP[resolvedColor] : COLOR_MAP[color];
  const textColor = color === 'accent' ? TEXT_MAP[resolvedColor] : TEXT_MAP[color];

  return (
    <div className="flex items-center gap-3 font-mono">
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider w-36 flex-shrink-0">
        {label}
      </span>
      <div className="relative flex-1 h-2 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800 shadow-inner">
        <div
          className={`h-full rounded-full ${barClass} transition-all duration-700 ease-out`}
          style={{ width: `${animated ? pct : 0}%` }}
        />
        {/* Specular gloss line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20 pointer-events-none" />
      </div>
      <div className={`text-xs font-bold w-12 text-right ${textColor}`}>
        {value}%
        {showSim && <span className="text-slate-500 text-[9px] ml-0.5">[S]</span>}
      </div>
    </div>
  );
}
