/**
 * @file NotFoundPage.jsx
 * @description Neo-Brutalist 404 fallback page.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Terminal } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F4F0EA] text-black flex flex-col justify-center items-center px-4 text-center font-sans relative selection:bg-[#FFE600] selection:text-black">
      <div className="absolute inset-0 neo-grid pointer-events-none opacity-25" />
      <div className="relative z-10 max-w-sm space-y-4 bg-white border-[3px] border-black p-8 shadow-[6px_6px_0px_0px_#000]">
        <div className="w-12 h-12 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-bold mx-auto">
          <Compass className="w-6 h-6 text-black stroke-[2.5]" />
        </div>
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 border-2 border-black bg-[#FF70A6] text-[11px] font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000]">
          <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>ERR_404 :: UNCHARTED</span>
        </div>
        <h1 className="text-2xl font-black text-black tracking-tight">404 - Node Uncharted</h1>
        <p className="text-xs font-mono font-bold text-slate-700">
          The requested coordinate does not exist in the CareerPilot service registry.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border-2 border-black bg-[#70E000] hover:bg-[#85FF0A] text-black font-mono text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75"
          >
            <Home className="w-4 h-4 mr-2 stroke-[2.5]" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
