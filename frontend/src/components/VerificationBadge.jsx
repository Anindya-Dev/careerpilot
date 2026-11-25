/**
 * @file VerificationBadge.jsx
 * @description Neo-Brutalist skill verification badge with hover tooltip explaining
 * the exact evidence source (GitHub repository audit, Resume, LinkedIn, etc.).
 */

import React from 'react';
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

  if (skill?.verified) {
    return (
      <span className="relative inline-flex items-center group cursor-help">
        <span className="inline-flex items-center border border-black bg-[#70E000] text-black text-[10px] font-bold px-2 py-0.5 shadow-[1px_1px_0px_0px_#000]">
          <CheckCircle2 className="w-3 h-3 mr-1 stroke-[2.5]" />
          {verifiedLabel}
        </span>
        <span className="pointer-events-none hidden group-hover:block absolute bottom-full right-0 mb-1.5 w-60 p-2 bg-black text-white border-2 border-black shadow-[3px_3px_0px_0px_#FFE600] text-[10px] font-mono font-bold leading-snug text-left z-50">
          {reason}
        </span>
      </span>
    );
  }

  return (
    <span className="relative inline-flex items-center group cursor-help">
      <span className="border border-black bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5">
        UNAUDITED
      </span>
      <span className="pointer-events-none hidden group-hover:block absolute bottom-full right-0 mb-1.5 w-60 p-2 bg-black text-white border-2 border-black shadow-[3px_3px_0px_0px_#FFE600] text-[10px] font-mono font-bold leading-snug text-left z-50">
        {reason}
      </span>
    </span>
  );
}
