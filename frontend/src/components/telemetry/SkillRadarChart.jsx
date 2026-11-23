/**
 * @file SkillRadarChart.jsx
 * @description Interactive Recharts radar chart mapping student skills vs. market benchmarks.
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
import { AlertCircle } from 'lucide-react';

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
    <div className="flex flex-col h-full justify-between">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={9} />
            <Radar
              name="Student Proficiency"
              dataKey="student"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Market Requirement"
              dataKey="market"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {criticalGaps.length > 0 && (
        <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <span className="font-semibold">Critical Gaps Detected: </span>
            {criticalGaps.map((g) => g.skill).join(', ')} require reinforcement to reach{' '}
            {targetRole} market demand thresholds.
          </div>
        </div>
      )}
    </div>
  );
}
