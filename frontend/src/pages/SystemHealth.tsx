import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const SYSTEMS = [
  { category: 'Infrastructure', items: [
    { name: 'Backend API', status: 'SIM', note: 'Simulation mode' },
    { name: 'WebSocket', status: 'CONNECTED', note: 'Real-time feed active' },
    { name: 'Database', status: 'SIM', note: 'In-memory simulation' },
    { name: 'Blockchain Ledger', status: 'SYNCED', note: 'Audit layer active' },
    { name: 'Simulation Engine', status: 'RUNNING', note: 'All scenarios loaded' },
  ]},
  { category: 'Mobile Units', items: [
    { name: 'ROVER-01', status: 'ONLINE', note: 'Platform 3 · 78% battery' },
    { name: 'ROVER-02', status: 'ONLINE', note: 'Platform 1 · 91% battery' },
    { name: 'HANDHELD-A', status: 'ONLINE', note: 'Control Room · 84% battery' },
    { name: 'HANDHELD-B', status: 'ONLINE', note: 'Platform 2 · 67% battery' },
  ]},
  { category: 'Sensor Array (ROVER-01)', items: [
    { name: 'Chemical Sensor Array', status: 'ONLINE', note: 'MOS/VOC 4-sensor array' },
    { name: 'Airflow Sensor', status: 'ONLINE', note: 'Anemometer · 1.8 m/s' },
    { name: 'RGB Camera', status: 'ONLINE', note: '1080p · 30fps' },
    { name: 'Thermal Camera', status: 'ONLINE', note: 'FLIR · 320×240' },
    { name: 'LiDAR', status: 'ONLINE', note: 'RPLiDAR A1 · 360°' },
  ]},
  { category: 'AI & Processing', items: [
    { name: 'Detection Model', status: 'LOADED', note: 'RGX-Fusion-v1.3' },
    { name: 'Source Localization', status: 'ACTIVE', note: 'Chemotaxis + Airflow algo' },
    { name: 'Sensor Fusion', status: 'ACTIVE', note: 'Multimodal inference' },
    { name: 'Edge Computer', status: 'ONLINE', note: 'Jetson Nano [SIM]' },
  ]},
];

const STATUS_COLORS: Record<string, string> = {
  ONLINE: 'accent', RUNNING: 'accent', LOADED: 'accent', ACTIVE: 'accent',
  SYNCED: 'info', CONNECTED: 'info',
  SIM: 'info',
  WARNING: 'warn',
  OFFLINE: 'danger',
};

export default function SystemHealth() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-fg text-base font-bold tracking-widest uppercase">System Health</h1>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
          <span className="text-accent text-xs font-semibold">ALL SYSTEMS NOMINAL</span>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Systems Online', value: '18/18', color: 'accent' },
          { label: 'Sensor Availability', value: '99.8%', color: 'accent' },
          { label: 'Detection Latency', value: '2.4s', color: 'info', note: '[SIM]' },
          { label: 'AI Model Version', value: 'v1.3', color: 'accent' },
        ].map(({ label, value, color, note }) => (
          <div key={label} className="card text-center">
            <div className="label">{label}</div>
            <div className={`text-${color} font-bold text-lg mt-1`}>{value}{note && <span className="text-fg-muted text-[10px] ml-1">{note}</span>}</div>
          </div>
        ))}
      </div>

      {/* System grid */}
      <div className="grid grid-cols-2 gap-4">
        {SYSTEMS.map((group) => (
          <div key={group.category} className="card space-y-3">
            <span className="label">{group.category}</span>
            <div className="space-y-2">
              {group.items.map((item) => {
                const color = STATUS_COLORS[item.status] || 'fg-muted';
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div>
                      <div className="text-fg">{item.name}</div>
                      <div className="text-fg-muted text-[10px]">{item.note}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={10} className={`text-${color}`} />
                      <span className={`text-${color} font-semibold`}>{item.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Architecture diagram */}
      <div className="card space-y-4">
        <span className="label">System Architecture</span>
        <div className="flex items-start justify-around text-xs text-center py-4 overflow-x-auto gap-2">
          {[
            { label: 'SENSORS', sub: 'Chemical · Airflow\nRGB · Thermal · LiDAR', color: 'info' },
            { label: '↓', color: 'fg-muted', arrow: true },
            { label: 'EDGE AI', sub: 'Sensor Fusion\nLocalization Engine', color: 'accent' },
            { label: '↓', color: 'fg-muted', arrow: true },
            { label: 'COMMAND CENTER', sub: 'Dashboard\nRPF Interface', color: 'accent' },
            { label: '↓', color: 'fg-muted', arrow: true },
            { label: 'RPF RESPONSE', sub: 'Alert · Verify\nResolve', color: 'danger' },
            { label: '↓', color: 'fg-muted', arrow: true },
            { label: 'EVIDENCE LEDGER', sub: 'Blockchain\nAudit Layer', color: 'warn' },
          ].map((node, i) => (
            node.arrow ? (
              <div key={i} className="text-fg-muted text-xl flex-shrink-0 mt-6">→</div>
            ) : (
              <div key={i} className={`border border-${node.color}/30 bg-${node.color}/5 rounded p-3 min-w-24 flex-shrink-0`}>
                <div className={`text-${node.color} font-bold text-[10px] tracking-wider mb-1`}>{node.label}</div>
                <div className="text-fg-muted text-[9px] whitespace-pre-line leading-relaxed">{node.sub}</div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
