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

export default function SkillRadarChart({ data = defaultRadarData, targetRole = 'Full-Stack Developer' }) {
  const chartData = data && data.length > 0 ? data : defaultRadarData;

  // Identify high-priority gaps
  const criticalGaps = chartData.filter((item) => item.market - item.student >= 25);

  return (
    <div className="flex flex-col h-full justify-between font-mono">
      <div className="h-[250px] w-full bg-[#FAF5E6] border-2 border-black p-2 shadow-[3px_3px_0px_0px_#000]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="#000000" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: '#000000', fontSize: 11, fontWeight: 700 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#000000" fontSize={9} />
            <Radar
              name="Student Proficiency"
              dataKey="student"
              stroke="#000000"
              fill="#FFE600"
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Radar
              name="Market Benchmark"
              dataKey="market"
              stroke="#000000"
              fill="#70E000"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Legend
              iconType="square"
              wrapperStyle={{ fontSize: '11px', paddingTop: '6px', fontWeight: 700 }}
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
