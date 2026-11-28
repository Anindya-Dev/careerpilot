/**
 * @file HealthTrendChart.jsx
 * @description Neo-Brutalist 6-Month career readiness progression area chart with gradient fill.
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
  { month: 'Oct', score: 78 },
  { month: 'Nov', score: 84.5 }
];

export default function HealthTrendChart({ history }) {
  if (Array.isArray(history) && history.length === 0) {
    return (
      <div className="h-[210px] w-full bg-[#FAF5E6] border-2 border-black p-6 shadow-[3px_3px_0px_0px_#000] font-mono flex flex-col items-center justify-center text-center space-y-2">
        <p className="text-xs font-black uppercase text-black">AWAITING_HISTORICAL_TELEMETRY</p>
        <p className="text-[11px] font-bold text-slate-600 max-w-xs">
          6-month trajectory projection activates after you initialize your profile and run the pipeline.
        </p>
      </div>
    );
  }

  const data = history && history.length > 0 ? history : defaultTrend;

  return (
    <div className="h-[210px] w-full bg-[#FAF5E6] border-2 border-black p-2 shadow-[3px_3px_0px_0px_#000] font-mono">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="careerHealthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38B6FF" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#38B6FF" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#000000" vertical={false} />
          <XAxis dataKey="month" stroke="#000000" fontSize={11} fontWeight={700} tickLine={false} />
          <YAxis stroke="#000000" fontSize={11} fontWeight={700} domain={[0, 100]} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '2px solid #000000',
              boxShadow: '3px 3px 0px 0px #000000',
              fontSize: '12px',
              fontWeight: 700
            }}
            formatter={(value) => [`${value} / 100`, 'Health Score']}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#000000"
            strokeWidth={3}
            fill="url(#careerHealthGrad)"
            dot={{ fill: '#FFE600', stroke: '#000000', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, fill: '#FF70A6', stroke: '#000000', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
