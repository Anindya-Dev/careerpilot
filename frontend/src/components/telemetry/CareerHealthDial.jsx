/**
 * @file CareerHealthDial.jsx
 * @description Neo-Brutalist Radial Career Health dial and dimension breakdown visualization.
 * Designed for Member 1 Dashboard integration slot.
 * @author Sargam Banerjee (Member 4)
 */

import React, { useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import { computeHealthGrade, GRADING_TIERS } from '../../config/gradingSystem';

export { computeHealthGrade, GRADING_TIERS };

export default function CareerHealthDial({ score = 0, grade, dimensions = [] }) {
  const [showRubric, setShowRubric] = useState(false);
  const numericScore = typeof score === 'number' ? score : parseFloat(score) || 0;
  const resolvedGrade = grade && grade !== 'N/A' && numericScore > 0
    ? computeHealthGrade(numericScore)
    : computeHealthGrade(numericScore);
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
            GRADE {resolvedGrade}
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[11px] font-mono font-black uppercase text-black bg-[#C4A1FF] border border-black px-2.5 py-0.5 shadow-[2px_2px_0px_0px_#000]">
          AUTONOMOUS MULTI-AGENT INDEX
        </span>
        <button
          type="button"
          onClick={() => setShowRubric(!showRubric)}
          className="inline-flex items-center text-[10px] font-mono font-bold text-black bg-white hover:bg-[#FFE600] border border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-colors"
        >
          <HelpCircle className="w-3 h-3 mr-1 stroke-[2.5]" />
          {showRubric ? 'Hide Scale' : 'How Grading Works'}
        </button>
      </div>

      {showRubric && (
        <div className="w-full mt-3 p-3 bg-[#FAF5E6] border-2 border-black shadow-[3px_3px_0px_0px_#000] text-[10px] font-mono space-y-2 text-left">
          <div className="font-black uppercase text-black border-b border-black pb-1">
            Grading Scale & Score Formula
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center font-bold">
            {GRADING_TIERS.map((tier) => (
              <span
                key={tier.grade}
                className={`${tier.badgeBg} border border-black px-1 py-0.5 text-black`}
              >
                {tier.grade}: {tier.minScore}+
              </span>
            ))}
          </div>
          <p className="text-slate-700 font-bold leading-snug">
            Computed from Skill-Market Fit (30%), Goal Alignment (25%), Profile Completeness (20%), GitHub Evidence (15%), and Recent Activity (10%).
          </p>
        </div>
      )}

      {/* Sub-dimensions in Neo-Brutalist Tiles */}
      <div className="w-full mt-5 space-y-2 pt-3 border-t-2 border-black font-mono">
        {activeDims.map((dim, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 bg-white border border-black text-xs shadow-[2px_2px_0px_0px_#000]"
          >
            <span className="font-bold text-black truncate max-w-[150px]">{dim.dimension || dim.name}</span>
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
