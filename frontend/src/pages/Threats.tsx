import React from 'react';
import { useSimStore } from '../store/simulationStore';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_SCENARIO } from '../simulation/scenario';
import { AlertTriangle, Eye } from 'lucide-react';

export default function Threats() {
  const { stage, threat } = useSimStore();
  const navigate = useNavigate();
  const hasActive = stage !== 'IDLE';

  const ALL_THREATS = [
    ...(hasActive ? [{
      id: DEFAULT_SCENARIO.threatId,
      location: 'Platform 3',
      device: DEFAULT_SCENARIO.robot,
      time: DEFAULT_SCENARIO.detectionTime,
      risk: 'HIGH',
      status: stage.replace(/_/g, ' '),
      confidence: threat.fusionConfidence || threat.chemicalConfidence || 82,
      active: true,
    }] : []),
    { id: 'RGX-2026-002', location: 'Platform 1', device: 'ROVER-02', time: '09:18:34', risk: 'MEDIUM', status: 'RESOLVED', confidence: 71, active: false },
    { id: 'RGX-2026-003', location: 'Platform 2', device: 'HANDHELD-A', time: '06:42:11', risk: 'LOW', status: 'RESOLVED', confidence: 58, active: false },
    { id: 'RGX-2026-004', location: 'Platform 3', device: 'ROVER-01', time: '19 Sep · 21:15', risk: 'MEDIUM', status: 'RESOLVED', confidence: 74, active: false },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-fg text-base font-bold tracking-widest uppercase">Threats</h1>
      <div className="space-y-2">
        {ALL_THREATS.map((t) => (
          <div key={t.id} className={`card flex items-center justify-between ${t.active ? 'border-danger/40 bg-danger/5 alert-flash' : ''}`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded border flex items-center justify-center ${t.active ? 'border-danger/40 bg-danger/10' : 'border-border'}`}>
                <AlertTriangle size={13} className={t.active ? 'text-danger' : 'text-fg-muted'} />
              </div>
              <div>
                <div className="text-fg font-semibold text-xs">{t.id}</div>
                <div className="text-fg-muted text-[10px]">{t.location} · {t.device} · {t.time}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={t.risk === 'HIGH' ? 'badge-danger' : t.risk === 'MEDIUM' ? 'badge-warn' : 'badge-muted'}>{t.risk}</span>
              <span className="text-fg-muted text-xs">{t.confidence}% <span className="text-[10px]">[SIM]</span></span>
              <span className={t.status === 'RESOLVED' ? 'badge-online' : 'badge-warn text-[10px]'}>{t.status}</span>
              <button onClick={() => navigate('/threat-passport')} className="btn-secondary flex items-center gap-1.5">
                <Eye size={10} /> VIEW
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
