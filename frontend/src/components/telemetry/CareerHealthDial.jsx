/**
 * @file CareerHealthDial.jsx
 * @description Neo-Brutalist Radial Career Health dial and dimension breakdown visualization.
 * Designed for Member 1 Dashboard integration slot.
 * @author Sargam Banerjee (Member 4)
 */

import React from 'react';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function CareerHealthDial({ score = 84.5, grade = 'A-', dimensions = [] }) {
  const numericScore = typeof score === 'number' ? score : parseFloat(score) || 84.5;
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (numericScore / 100) * circumference;

  const getDialColor = (s) => {
    if (s >= 80) return '#70E000'; // Lime green
    if (s >= 65) return '#38B6FF'; // Bright blue
    if (s >= 50) return '#FFE600'; // Yellow
    return '#FF70A6'; // Pink/Red
  };

  const trendIcon = {
    up: <TrendingUp className="w-3.5 h-3.5 text-black stroke-[2.5]" />,
    down: <TrendingDown className="w-3.5 h-3.5 text-black stroke-[2.5]" />,
    stable: <Minus className="w-3.5 h-3.5 text-black stroke-[2.5]" />
  };

  const defaultDims = [
    { dimension: 'Skill Alignment', score: 86, trend: 'up' },
    { dimension: 'Evidence & AST', score: 82, trend: 'up' },
    { dimension: 'Market Demand', score: 78, trend: 'stable' },
    { dimension: 'Interview Ready', score: 72, trend: 'down' }
  ];

  const activeDims = dimensions && dimensions.length > 0 ? dimensions : defaultDims;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Radial Dial with Neo-Brutalist Frame */}
      <div className="relative my-2" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="#FAF5E6"
            stroke="#000000"
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
            strokeLinecap="butt"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Activity className="w-5 h-5 text-black stroke-[2.5] mb-0.5" />
          <div className="text-3xl font-black font-mono text-black leading-none">
            {numericScore}
          </div>
          <div className="text-[10px] font-mono font-black border border-black bg-[#FFE600] text-black px-2 py-0.5 mt-1.5 shadow-[1px_1px_0px_0px_#000]">
            GRADE {grade}
          </div>
        </div>
      </div>

      <div className="mt-2 text-center">
        <span className="text-[11px] font-mono font-black uppercase text-black bg-[#C4A1FF] border border-black px-2.5 py-0.5 shadow-[2px_2px_0px_0px_#000]">
          AUTONOMOUS MULTI-AGENT INDEX
        </span>
      </div>

      {/* Sub-dimensions in Neo-Brutalist Tiles */}
      <div className="w-full mt-5 space-y-2 pt-3 border-t-2 border-black font-mono">
        {activeDims.map((dim, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 bg-white border border-black text-xs shadow-[2px_2px_0px_0px_#000]"
          >
            <span className="font-bold text-black truncate max-w-[150px]">{dim.dimension}</span>
            <div className="flex items-center space-x-2">
              <span className="font-black text-black bg-[#FAF5E6] border border-black px-1.5 py-0.2">
                {dim.score}%
              </span>
              <span className="p-0.5 border border-black bg-[#FFE600]">
                {trendIcon[dim.trend] || trendIcon.stable}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
