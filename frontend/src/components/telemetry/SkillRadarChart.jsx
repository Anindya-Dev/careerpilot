/**
 * @file SkillRadarChart.jsx
 * @description Neo-Brutalist Interactive Recharts radar chart mapping student skills vs. market benchmarks.
 * Designed for Member 1 Dashboard integration slot.
 * @author Sargam Banerjee (Member 4)
 */

import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { AlertTriangle, Layers } from 'lucide-react';

const defaultRadarData = [
  { skill: 'React', student: 85, market: 80, fullMark: 100 },
  { skill: 'Node.js', student: 78, market: 82, fullMark: 100 },
  { skill: 'Python', student: 70, market: 75, fullMark: 100 },
  { skill: 'PostgreSQL', student: 65, market: 72, fullMark: 100 },
  { skill: 'Docker', student: 45, market: 80, fullMark: 100 },
  { skill: 'System Design', student: 40, market: 75, fullMark: 100 },
  { skill: 'Git / CI/CD', student: 80, market: 78, fullMark: 100 }
];

export default function SkillRadarChart({ data, targetRole = 'Full-Stack Developer' }) {
  if (Array.isArray(data) && data.length === 0) {
    return (
      <div className="h-[250px] w-full bg-[#FAF5E6] border-2 border-black p-6 shadow-[3px_3px_0px_0px_#000] font-mono flex flex-col items-center justify-center text-center space-y-2">
        <Layers className="w-7 h-7 text-black stroke-[2]" />
        <p className="text-xs font-black uppercase text-black">NO_SKILL_VECTORS_CALIBRATED</p>
        <p className="text-[11px] font-bold text-slate-600 max-w-xs">
          Add skills and set a target role in Career Profile to compute your live market alignment radar.
        </p>
      </div>
    );
  }

  const chartData = data && data.length > 0 ? data : defaultRadarData;

  // Identify high-priority gaps
  const criticalGaps = chartData.filter((item) => item.market - item.student >= 25);

  return (
    <div className="flex flex-col h-full justify-between font-mono space-y-3">
      <div className="w-full bg-[#FAF5E6] border-2 border-black p-3 shadow-[3px_3px_0px_0px_#000]">
        {/* Custom High-Contrast Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 pb-2 text-[11px] font-black uppercase">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 inline-block bg-[#38B6FF] border-2 border-black shadow-[1px_1px_0px_0px_#000]" />
            <span>Market Benchmark</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 inline-block bg-[#70E000] border-2 border-black shadow-[1px_1px_0px_0px_#000]" />
            <span>Your Proficiency</span>
          </div>
        </div>

        <div className="h-[225px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid stroke="#94A3B8" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: '#000000', fontSize: 11, fontWeight: 800 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
              <Radar
                name="Market Benchmark"
                dataKey="market"
                stroke="#2563EB"
                fill="#38B6FF"
                fillOpacity={0.22}
                strokeWidth={2}
                strokeDasharray="4 3"
              />
              <Radar
                name="Your Proficiency"
                dataKey="student"
                stroke="#15803D"
                fill="#70E000"
                fillOpacity={0.55}
                strokeWidth={2.5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #000000',
                  boxShadow: '3px 3px 0px 0px #000000',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* At-a-glance Skill vs Market Pills */}
        <div className="mt-2 pt-2 border-t border-black/20 flex flex-wrap gap-1.5 justify-center">
          {chartData.map((item, idx) => {
            const isGap = item.market - item.student >= 25;
            return (
              <span
                key={idx}
                className={`px-2 py-0.5 border border-black text-[10px] font-bold ${
                  isGap ? 'bg-[#FF70A6]/30 text-black' : 'bg-[#70E000]/30 text-black'
                }`}
              >
                {item.skill}: <span className="font-black">{item.student}</span>/{item.market}
              </span>
            );
          })}
        </div>
      </div>

      {criticalGaps.length > 0 ? (
        <div className="mt-4 p-3 border-2 border-black bg-[#FF70A6] text-black shadow-[3px_3px_0px_0px_#000] flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 stroke-[2.5] mt-0.5 flex-shrink-0" />
          <div className="text-xs font-bold leading-snug">
            <span className="uppercase font-black bg-white px-1.5 py-0.2 border border-black mr-1 shadow-[1px_1px_0px_0px_#000]">
              CRITICAL_DELTA
            </span>
            {criticalGaps.map((g) => g.skill).join(', ')} require priority reinforcement to clear {targetRole} hiring filters.
          </div>
        </div>
      ) : (
        <div className="mt-4 p-2.5 border-2 border-black bg-[#70E000] text-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold text-center">
          ✓ All profile skills meet baseline market readiness thresholds.
        </div>
      )}
    </div>
  );
}
