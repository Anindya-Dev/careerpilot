/**
 * @file HealthTrendChart.jsx
 * @description 6-Month career readiness progression area chart with gradient fill.
 * @author Sargam Banerjee (Member 4)
 */

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const defaultTrend = [
  { month: 'Jun', score: 52 },
  { month: 'Jul', score: 58 },
  { month: 'Aug', score: 64 },
  { month: 'Sep', score: 71 },
  { month: 'Oct', score: 75 },
  { month: 'Nov', score: 78.5 }
];

export default function HealthTrendChart({ history = defaultTrend }) {
  const data = history && history.length > 0 ? history : defaultTrend;

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="careerHealthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value) => [`${value} / 100`, 'Health Score']}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#careerHealthGrad)"
            dot={{ fill: '#6366f1', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
