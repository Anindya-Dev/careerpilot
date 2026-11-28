/**
 * @file VerificationBadge.jsx
 * @description Neo-Brutalist skill verification badge with hover tooltip.
 * Uses React portal (createPortal) to render the tooltip directly on <body>
 * so it is never clipped by any overflow:hidden/auto ancestor (e.g., the
 * scrollable skill table container).
 */

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2 } from 'lucide-react';

export function getVerificationReason(skill) {
  if (!skill) return 'Self-reported competency';
  const source = (skill.source || '').toLowerCase();

  if (skill.verified) {
    if (skill.evidence_detail) return skill.evidence_detail;
    if (source === 'github') {
      return 'Verified via live GitHub repository code & language audit';
    }
    if (source === 'leetcode' || source === 'assessment') {
      return 'Verified via live LeetCode / technical assessment';
    }
    return 'Verified against linked repository evidence';
  }

  if (source === 'resume') {
    return 'Extracted from Resume PDF (Unaudited) — connect a GitHub repo using this skill to verify';
  }
  if (source === 'linkedin') {
    return 'Imported from LinkedIn PDF (Unaudited) — connect a GitHub repo using this skill to verify';
  }
  return 'Self-reported (Unaudited) — connect GitHub repositories to verify';
}

export default function VerificationBadge({ skill, verifiedLabel = 'VERIFIED' }) {
  const reason = getVerificationReason(skill);
  const [tooltip, setTooltip] = useState(null);
  const badgeRef = useRef(null);

  const showTooltip = () => {
    if (!badgeRef.current) return;
    const rect = badgeRef.current.getBoundingClientRect();
    const tooltipWidth = 264;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    // Clamp to viewport edges with 8px padding
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));
    setTooltip({ top: rect.top - 6, left });
  };

  const hideTooltip = () => setTooltip(null);

  const tooltipEl = tooltip && (
    <div
      style={{
        position: 'fixed',
        top: tooltip.top,
        left: tooltip.left,
        width: 264,
        transform: 'translateY(-100%)',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
      className={`p-2.5 border-2 shadow-[3px_3px_0px_0px_#FFE600] text-[10px] font-mono font-bold leading-snug text-left ${
        skill?.verified
          ? 'bg-black text-white border-[#FFE600]'
          : 'bg-black text-white border-black'
      }`}
    >
      <span
        className={`block font-black uppercase text-[9px] mb-1 tracking-widest ${
          skill?.verified ? 'text-[#70E000]' : 'text-slate-400'
        }`}
      >
        {skill?.verified ? '✓ HOW THIS WAS VERIFIED' : '⚠ AUDIT STATUS'}
      </span>
      {reason}
    </div>
  );

  if (skill?.verified) {
    return (
      <>
        <span
          ref={badgeRef}
          className="inline-flex items-center cursor-help"
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          <span className="inline-flex items-center border border-black bg-[#70E000] text-black text-[10px] font-bold px-2 py-0.5 shadow-[1px_1px_0px_0px_#000]">
            <CheckCircle2 className="w-3 h-3 mr-1 stroke-[2.5]" />
            {verifiedLabel}
          </span>
        </span>
        {tooltip && createPortal(tooltipEl, document.body)}
      </>
    );
  }

  return (
    <>
      <span
        ref={badgeRef}
        className="inline-flex items-center cursor-help"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        <span className="border border-black bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5">
          UNAUDITED
        </span>
      </span>
      {tooltip && createPortal(tooltipEl, document.body)}
    </>
  );
}
