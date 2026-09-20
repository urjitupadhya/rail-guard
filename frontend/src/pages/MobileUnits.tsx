import React, { useState } from 'react';
import { useSimStore } from '../store/simulationStore';
import { Bot, BatteryMedium, Wifi, ChevronRight } from 'lucide-react';

const UNITS = [
  {
    id: 'ROVER-01', type: 'Quadruped', role: 'Autonomous Detection',
    battery: 78, connectivity: 'GOOD', firmware: 'v2.1.4', model: 'RGX-Fusion-v1.3',
    location: 'Platform 3', gps: '28.6139, 77.2090',
    sensors: { chemical: true, airflow: true, rgb: true, thermal: true, lidar: true },
  },
  {
    id: 'ROVER-02', type: 'Quadruped', role: 'Autonomous Detection',
    battery: 91, connectivity: 'GOOD', firmware: 'v2.1.4', model: 'RGX-Fusion-v1.3',
    location: 'Platform 1', gps: '28.6141, 77.2088',
    sensors: { chemical: true, airflow: true, rgb: true, thermal: true, lidar: true },
  },
  {
    id: 'HANDHELD-A', type: 'Handheld', role: 'Field Verification',
    battery: 84, connectivity: 'GOOD', firmware: 'v1.8.2', model: 'RGX-HH-v1.1',
    location: 'Control Room', gps: 'N/A',
    sensors: { chemical: true, airflow: false, rgb: true, thermal: true, lidar: false },
  },
  {
    id: 'HANDHELD-B', type: 'Handheld', role: 'Field Verification',
    battery: 67, connectivity: 'FAIR', firmware: 'v1.8.2', model: 'RGX-HH-v1.1',
    location: 'Platform 2', gps: '28.6140, 77.2089',
    sensors: { chemical: true, airflow: false, rgb: true, thermal: true, lidar: false },
  },
];

export default function MobileUnits() {
  const { robots, stage } = useSimStore();
  const [selected, setSelected] = useState<string | null>('ROVER-01');

  const getMode = (id: string) => {
    if (id === 'ROVER-01') {
      if (stage === 'PATROLLING') return 'PATROL';
      if (['SEARCHING', 'LOCALIZING'].includes(stage)) return 'SEARCH';
      if (['VERIFYING', 'VERIFIED'].includes(stage)) return 'VERIFY';
      if (stage === 'IDLE') return 'IDLE';
      return 'ACTIVE';
    }
    return id === 'ROVER-02' ? 'PATROL' : 'READY';
  };

  const getModeColor = (mode: string) =>
    mode === 'PATROL' ? 'accent' : mode === 'SEARCH' ? 'info' : mode === 'VERIFY' ? 'warn' : 'fg-muted';

  const selectedUnit = UNITS.find((u) => u.id === selected);
  const selectedRobot = robots.find((r) => r.id === selected);

  const MISSION_EVENTS = [
    { time: '13:05:21', label: 'Patrol started — Platform 3' },
    { time: '13:05:27', label: 'Chemical anomaly detected' },
    { time: '13:05:29', label: 'Search mode activated' },
    { time: '13:05:31', label: 'Source direction estimated' },
    { time: '13:05:34', label: 'Source localized' },
    { time: '13:05:36', label: 'Visual verification initiated' },
    { time: '13:05:38', label: 'RPF alert generated' },
    { time: '13:05:39', label: 'Evidence hash recorded' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-fg text-base font-bold tracking-widest uppercase">Mobile Units</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Units Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[540px]">
                <thead>
                  <tr className="border-b border-border bg-surface2/50">
                    {['Unit', 'Type', 'Status', 'Mode', 'Battery', 'Location', ''].map((h) => (
                      <th key={h} className="text-left px-3 py-2.5 label">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {UNITS.map((unit) => {
                    const mode = getMode(unit.id);
                    const mColor = getModeColor(mode);
                    return (
                      <tr key={unit.id}
                        onClick={() => setSelected(unit.id)}
                        className={`border-b border-border/50 hover:bg-surface2 cursor-pointer transition-colors ${selected === unit.id ? 'bg-surface2' : ''}`}
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Bot size={13} className="text-accent" />
                            <span className="font-semibold text-fg">{unit.id}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-fg-muted">{unit.type}</td>
                        <td className="px-3 py-3"><span className="badge-online text-[10px]">● ONLINE</span></td>
                        <td className="px-3 py-3"><span className={`text-${mColor} font-semibold`}>{mode}</span></td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-surface2 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${unit.battery > 50 ? 'bg-accent' : unit.battery > 25 ? 'bg-warn' : 'bg-danger'}`}
                                style={{ width: `${unit.battery}%` }} />
                            </div>
                            <span className="text-fg-muted">{unit.battery}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-fg-muted">{unit.location}</td>
                        <td className="px-3 py-3"><ChevronRight size={12} className="text-fg-muted" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Unit Detail */}
        {selectedUnit && (
          <div className="space-y-3 animate-fade-in">
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-accent/20 border border-accent/30 flex items-center justify-center">
                    <Bot size={14} className="text-accent" />
                  </div>
                  <div>
                    <div className="text-fg font-bold text-sm">{selectedUnit.id}</div>
                    <div className="text-fg-muted text-[10px]">{selectedUnit.type} · {selectedUnit.role}</div>
                  </div>
                </div>
                <span className="badge-online">ONLINE</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {[
                  ['Mode', getMode(selectedUnit.id)],
                  ['Location', selectedUnit.location],
                  ['GPS', selectedUnit.gps],
                  ['Battery', `${selectedUnit.battery}%`],
                  ['Connectivity', selectedUnit.connectivity],
                  ['Firmware', selectedUnit.firmware],
                  ['AI Model', selectedUnit.model],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-fg-muted">{k}</span>
                    <span className="text-fg font-semibold">{v}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3">
                <div className="label mb-2">Sensors</div>
                <div className="space-y-1.5">
                  {Object.entries(selectedUnit.sensors).map(([sensor, active]) => (
                    <div key={sensor} className="flex items-center justify-between text-xs">
                      <span className="text-fg-muted capitalize">{sensor === 'lidar' ? 'LiDAR' : sensor === 'rgb' ? 'RGB Camera' : sensor.charAt(0).toUpperCase() + sensor.slice(1)}</span>
                      <span className={active ? 'text-accent' : 'text-fg-muted'}>{active ? '✓ ONLINE' : '— N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mission Timeline for ROVER-01 */}
            {selectedUnit.id === 'ROVER-01' && (
              <div className="card space-y-2">
                <span className="label">Mission Log</span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {MISSION_EVENTS.map((e, i) => (
                    <div key={i} className="text-xs flex gap-2">
                      <span className="text-fg-muted font-mono flex-shrink-0">{e.time}</span>
                      <span className="text-fg-muted">{e.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
