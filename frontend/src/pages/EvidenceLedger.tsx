import React, { useState } from 'react';
import { useSimStore } from '../store/simulationStore';
import { DEFAULT_SCENARIO, EVIDENCE_HASH_FULL } from '../simulation/scenario';
import { Lock, CheckCircle, ChevronRight, Shield } from 'lucide-react';

const MOCK_RECORDS = [
  {
    id: DEFAULT_SCENARIO.threatId,
    timestamp: DEFAULT_SCENARIO.evidenceTime,
    device: DEFAULT_SCENARIO.robot,
    model: 'RGX-Fusion-v1.3',
    location: 'Platform 3',
    hash: EVIDENCE_HASH_FULL,
    status: 'VERIFIED',
    chemConf: 82,
    locConf: 87,
  },
  {
    id: 'RGX-2026-002',
    timestamp: '09:18:34',
    device: 'ROVER-02',
    model: 'RGX-Fusion-v1.3',
    location: 'Platform 1',
    hash: '9bf1a2d43e5c...72dfab91c',
    status: 'VERIFIED',
    chemConf: 71,
    locConf: 79,
  },
  {
    id: 'RGX-2026-003',
    timestamp: '06:42:11',
    device: 'HANDHELD-A',
    model: 'RGX-Fusion-v1.3',
    location: 'Platform 2',
    hash: 'c7e3f91a4b2d...18abc63e1',
    status: 'RECORDED',
    chemConf: 58,
    locConf: 64,
  },
];

export default function EvidenceLedger() {
  const { evidenceHash, stage } = useSimStore();
  const [selected, setSelected] = useState<typeof MOCK_RECORDS[0] | null>(null);

  const records = evidenceHash
    ? MOCK_RECORDS
    : MOCK_RECORDS.slice(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-fg text-base font-bold tracking-widest uppercase flex items-center gap-2">
            <Lock size={16} className="text-accent" /> Evidence Ledger
          </h1>
          <p className="text-fg-muted text-xs mt-0.5">Tamper-evident audit trail — all incident records</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="badge-online">
            <CheckCircle size={10} /> {records.length} Records
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Records Table */}
        <div className="lg:col-span-2 space-y-3">
          {/* Why Blockchain card */}
          <div className="card border-info/20 bg-info/5 space-y-2">
            <div className="flex items-center gap-2">
              <Shield size={13} className="text-info" />
              <span className="text-info text-xs font-bold tracking-wider">WHY BLOCKCHAIN?</span>
            </div>
            <p className="text-fg-muted text-xs leading-relaxed">
              Detection happens at the edge (on the robot). Evidence integrity is maintained through a tamper-evident audit layer.
              Each incident record includes timestamp, device identity, model version, location, and a SHA-256 hash of all sensor data.
              This prevents retroactive tampering with incident records.
            </p>
            <div className="flex flex-wrap gap-2">
              {['✓ Timestamp', '✓ Device Identity', '✓ Model Version', '✓ Location Hash', '✓ SHA-256 Evidence'].map((t) => (
                <span key={t} className="badge-info text-[10px]">{t}</span>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-border bg-surface2/50">
                    {['Threat ID', 'Timestamp', 'Device', 'Model', 'Evidence Hash', 'Status', ''].map((h) => (
                      <th key={h} className="text-left px-3 py-2.5 label">{h}</th>
                    ))}
                  </tr>
                </thead>
              <tbody>
                {records.map((rec, i) => (
                  <tr key={rec.id}
                    onClick={() => setSelected(rec)}
                    className={`border-b border-border/50 hover:bg-surface2 cursor-pointer transition-colors ${selected?.id === rec.id ? 'bg-surface2' : ''} ${i === 0 && evidenceHash ? 'animate-fade-in' : ''}`}
                  >
                    <td className="px-3 py-2.5 text-accent font-mono font-semibold">{rec.id}</td>
                    <td className="px-3 py-2.5 text-fg-muted">{rec.timestamp}</td>
                    <td className="px-3 py-2.5 text-fg">{rec.device}</td>
                    <td className="px-3 py-2.5 text-fg-muted">{rec.model}</td>
                    <td className="px-3 py-2.5 text-fg font-mono">{rec.hash.slice(0, 12)}...</td>
                    <td className="px-3 py-2.5">
                      <span className={rec.status === 'VERIFIED' ? 'badge-online text-[10px]' : 'badge-info text-[10px]'}>
                        ✓ {rec.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <ChevronRight size={12} className="text-fg-muted" />
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>

          {/* Chain of Events visualization */}
          <div className="card space-y-3">
            <span className="label">Automated Chain of Events</span>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {[
                { label: 'Detection', color: 'accent' },
                { label: 'Localization', color: 'info' },
                { label: 'Verification', color: 'warn' },
                { label: 'Evidence Created', color: 'danger' },
                { label: 'Hash Recorded', color: 'accent' },
                { label: 'Officer Notified', color: 'fg-muted' },
              ].map(({ label, color }, i, arr) => (
                <React.Fragment key={label}>
                  <div className={`px-2 py-1 rounded border border-${color}/30 bg-${color}/10 text-${color} text-[10px]`}>
                    {label}
                  </div>
                  {i < arr.length - 1 && <span className="text-fg-muted">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div>
          {selected ? (
            <div className="card space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-fg font-bold text-xs tracking-wider">EVIDENCE RECORD</span>
                <button onClick={() => setSelected(null)} className="text-fg-muted hover:text-fg text-sm">✕</button>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  ['Threat ID', selected.id],
                  ['Device', selected.device],
                  ['Timestamp', selected.timestamp],
                  ['Model Version', selected.model],
                  ['Location', selected.location],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5">
                    <span className="text-fg-muted">{k}</span>
                    <span className="text-fg font-semibold">{v}</span>
                  </div>
                ))}
              </div>

              <div className="border border-border rounded p-3">
                <div className="label mb-2">Evidence Hash (SHA-256)</div>
                <div className="text-accent font-mono text-[10px] break-all leading-relaxed">{selected.hash}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle size={12} className="text-accent" />
                  <span className="text-accent">Recorded in Ledger</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle size={12} className="text-accent" />
                  <span className="text-accent">Integrity Verified</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle size={12} className="text-accent" />
                  <span className="text-accent">Tamper-Evident Seal</span>
                </div>
              </div>

              {/* Confidence summary */}
              <div className="border-t border-border pt-3 space-y-1.5">
                <div className="label">Detection Confidence <span className="sim-badge">[SIM]</span></div>
                <div className="flex justify-between text-xs"><span className="text-fg-muted">Chemical Signal</span><span className="text-accent">{selected.chemConf}%</span></div>
                <div className="flex justify-between text-xs"><span className="text-fg-muted">Source Localization</span><span className="text-accent">{selected.locConf}%</span></div>
              </div>
            </div>
          ) : (
            <div className="card border-dashed text-center py-8">
              <Lock size={24} className="mx-auto text-fg-muted opacity-30 mb-2" />
              <p className="text-fg-muted text-xs">Select a record to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
