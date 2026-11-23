/**
 * @file CareerHealthDial.jsx
 * @description Radial Career Health dial and dimension breakdown visualization.
 * Designed for Member 1 Dashboard integration slot.
 * @author Sargam Banerjee (Member 4)
 */

import React from 'react';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function CareerHealthDial({ score = 78.5, grade = 'B+', dimensions = [] }) {
  const numericScore = typeof score === 'number' ? score : parseFloat(score) || 75;
  const size = 150;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (numericScore / 100) * circumference;

  const getDialColor = (s) => {
    if (s >= 80) return '#10b981'; // Emerald
    if (s >= 65) return '#6366f1'; // Indigo
    if (s >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const trendIcon = {
    up: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />,
    down: <TrendingDown className="w-3.5 h-3.5 text-red-500" />,
    stable: <Minus className="w-3.5 h-3.5 text-slate-400" />
  };

  return (
    <div className="flex flex-col items-center">
      {/* Radial Dial */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getDialColor(numericScore)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Activity className="w-4 h-4 text-indigo-500 mb-0.5" />
          <div className="text-2xl font-black text-slate-800 leading-none">
            {numericScore}
          </div>
          <div className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1">
            Grade {grade}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-2 text-center font-medium">
        Composite Multi-Agent Index
      </p>

      {/* Sub-dimensions */}
      {dimensions.length > 0 && (
        <div className="w-full mt-4 space-y-2 pt-3 border-t border-slate-100">
          {dimensions.map((dim, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-slate-600 truncate max-w-[130px]">{dim.dimension}</span>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-slate-800">{dim.score}</span>
                {trendIcon[dim.trend] || trendIcon.stable}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
