/**
 * @file AgentStatusList.jsx
 * @description Real-time operational monitoring roster for the 7 agent microservices.
 * @author Sargam Banerjee (Member 4)
 */

import React from 'react';
import { Cpu, CheckCircle2, Clock } from 'lucide-react';

export default function AgentStatusList({ agentStatuses = [] }) {
  return (
    <div className="space-y-2.5">
      {agentStatuses.map((agent) => (
        <div
          key={agent.agentId}
          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
        >
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-2 h-2 rounded-full ${
                agent.status === 'live'
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span className="font-medium text-slate-700">{agent.name}</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-500">
            {agent.latencyMs && (
              <span className="font-mono text-[10px] text-slate-400">
                {agent.latencyMs}ms
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                agent.status === 'live'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {agent.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
