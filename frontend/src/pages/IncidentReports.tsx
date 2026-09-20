import React, { useState } from 'react';
import { useSimStore } from '../store/simulationStore';
import { DEFAULT_SCENARIO, EVIDENCE_HASH_FULL } from '../simulation/scenario';
import { FileText, Download, Eye } from 'lucide-react';
import ConfidenceBar from '../components/ConfidenceBar';

const REPORTS = [
  {
    id: DEFAULT_SCENARIO.threatId,
    location: 'Platform 3',
    date: '20 Sep 2026',
    risk: 'HIGH',
    status: 'VERIFIED',
    active: true,
  },
  { id: 'RGX-2026-002', location: 'Platform 1', date: '20 Sep 2026', risk: 'MEDIUM', status: 'RESOLVED', active: false },
  { id: 'RGX-2026-003', location: 'Platform 2', date: '20 Sep 2026', risk: 'LOW', status: 'RESOLVED', active: false },
  { id: 'RGX-2026-004', location: 'Platform 3', date: '19 Sep 2026', risk: 'MEDIUM', status: 'RESOLVED', active: false },
];

export default function IncidentReports() {
  const { threat, generateReport, reportReady } = useSimStore();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-fg text-base font-bold tracking-widest uppercase">Incident Reports</h1>
        <button onClick={() => { generateReport(); setShowModal(true); }}
          className="btn-primary flex items-center gap-2">
          <FileText size={12} /> GENERATE INCIDENT REPORT
        </button>
      </div>

      <div className="space-y-2">
        {REPORTS.map((r) => (
          <div key={r.id} className={`card flex items-center justify-between ${r.active ? 'border-danger/30 bg-danger/5' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded border border-border flex items-center justify-center">
                <FileText size={14} className="text-fg-muted" />
              </div>
              <div>
                <div className="text-fg font-semibold text-xs">{r.id}</div>
                <div className="text-fg-muted text-[10px]">{r.location} · {r.date}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={r.risk === 'HIGH' ? 'badge-danger' : r.risk === 'MEDIUM' ? 'badge-warn' : 'badge-muted'}>
                {r.risk}
              </span>
              <span className={r.status === 'VERIFIED' ? 'badge-online' : 'badge-muted'}>{r.status}</span>
              <div className="flex gap-2">
                <button onClick={() => setShowModal(true)} className="btn-secondary flex items-center gap-1.5">
                  <Eye size={10} /> VIEW
                </button>
                <button className="btn-secondary flex items-center gap-1.5">
                  <Download size={10} /> EXPORT
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-bg/90 flex items-center justify-center p-6">
          <div className="card w-full max-w-lg border-accent/30 animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-accent text-xs tracking-[0.3em] uppercase font-bold mb-1">RAILGUARD-X</div>
              <div className="text-fg font-bold text-lg tracking-widest">INCIDENT DOSSIER</div>
              <div className="text-fg-muted text-[10px] mt-1">Classification: RESTRICTED · Generated: {DEFAULT_SCENARIO.reportTime}</div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent mb-5" />

            <div className="grid grid-cols-2 gap-3 text-xs mb-5">
              {[
                ['Threat ID', DEFAULT_SCENARIO.threatId],
                ['Location', 'Platform 3'],
                ['Detected', DEFAULT_SCENARIO.detectionTime],
                ['Source Localized', DEFAULT_SCENARIO.sourceLocalizedTime],
                ['Verification', DEFAULT_SCENARIO.verificationTime],
                ['Alert Sent', DEFAULT_SCENARIO.alertTime],
                ['Evidence Recorded', DEFAULT_SCENARIO.evidenceTime],
                ['Report Generated', DEFAULT_SCENARIO.reportTime],
                ['Risk Level', 'HIGH'],
                ['Detected By', DEFAULT_SCENARIO.robot],
                ['Model Version', 'RGX-Fusion-v1.3'],
                ['System Status', 'OPERATIONAL'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-fg-muted text-[10px]">{k}</div>
                  <div className="text-fg font-semibold">{v}</div>
                </div>
              ))}
            </div>

            <div className="border border-border rounded p-3 mb-4 space-y-2">
              <div className="label">Confidence Summary <span className="sim-badge">[SIMULATION DATA]</span></div>
              <ConfidenceBar label="Chemical Signal" value={82} showSim />
              <ConfidenceBar label="Source Localization" value={87} showSim />
              <ConfidenceBar label="Visual Analysis" value={87} showSim />
              <ConfidenceBar label="Thermal Analysis" value={81} showSim />
              <ConfidenceBar label="Detection Confidence" value={89} showSim color="danger" />
            </div>

            <div className="border border-border rounded p-3 mb-4">
              <div className="label mb-2">Evidence Hash (SHA-256)</div>
              <div className="text-accent font-mono text-[10px] break-all">{EVIDENCE_HASH_FULL}</div>
              <div className="flex items-center gap-1.5 mt-2 text-accent text-[10px]">
                <span>✓</span><span>Evidence Integrity: VERIFIED</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">CLOSE</button>
              <button className="flex-1 btn-primary flex items-center justify-center gap-1.5">
                <Download size={11} /> EXPORT PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
