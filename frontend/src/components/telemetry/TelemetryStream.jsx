/**
 * @file TelemetryStream.jsx
 * @description Chronological activity feed tracking profile events and agent runs.
 * @author Sargam Banerjee (Member 4)
 */

import React from 'react';
import { Activity, Clock, Cpu, CheckCircle } from 'lucide-react';

export default function TelemetryStream({ events = [] }) {
  return (
    <div className="space-y-2">
      {events.map((evt) => (
        <div
          key={evt.id}
          className="flex items-start space-x-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors text-xs"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-slate-700 font-medium leading-snug">{evt.message}</p>
            <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{evt.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
