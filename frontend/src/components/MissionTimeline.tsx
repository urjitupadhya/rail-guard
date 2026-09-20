import React from 'react';
import { useSimStore, TimelineEvent } from '../store/simulationStore';

const COLOR_MAP: Record<string, string> = {
  accent: 'bg-accent border-accent text-accent',
  warn: 'bg-warn border-warn text-warn',
  danger: 'bg-danger border-danger text-danger',
  info: 'bg-info border-info text-info',
};
const DOT_MAP: Record<string, string> = {
  accent: 'bg-accent',
  warn: 'bg-warn',
  danger: 'bg-danger',
  info: 'bg-info',
};

export default function MissionTimeline({ events }: { events?: TimelineEvent[] }) {
  const storeTimeline = useSimStore((s) => s.timeline);
  const items = events ?? storeTimeline;

  if (items.length === 0) {
    return (
      <div className="text-fg-muted text-xs text-center py-6">
        Timeline will populate when demo starts
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {items.map((event, i) => (
        <div key={i} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          {/* Line + dot */}
          <div className="flex flex-col items-center w-5 flex-shrink-0">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${DOT_MAP[event.color] || 'bg-fg-muted'}`} />
            {i < items.length - 1 && (
              <div className="w-px flex-1 bg-border mt-1 mb-0 min-h-[20px]" />
            )}
          </div>
          {/* Content */}
          <div className="pb-4 flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-fg-muted font-mono flex-shrink-0">{event.time}</span>
              <span className="text-xs text-fg leading-tight">{event.icon} {event.label}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
