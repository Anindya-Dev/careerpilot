/**
 * @file LandingPage.jsx
 * @description Neo-Brutalist public landing page for CareerPilot.
 * Bold high-contrast typography, thick black outlines, hard offset drop-shadows,
 * vibrant color blocks, and dynamic typewriter target role hero.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, LogIn, Terminal, Shield, Cpu, Network, Check } from 'lucide-react';
import AuthModal from '../components/AuthModal';

export default function LandingPage() {
  const roles = [
    'AI & Machine Learning Engineers',
    'Full-Stack Cloud Architects',
    'Data Science Specialists',
    'DevOps & Platform Engineers',
    'Autonomous Systems Developers'
  ];

  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  useEffect(() => {
    const currentFullText = roles[roleIndex];
    let timer;

    if (!isDeleting) {
      if (displayText.length < currentFullText.length) {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.slice(0, displayText.length + 1));
        }, 50);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.slice(0, displayText.length - 1));
        }, 25);
      } else {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, roles]);

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-black flex flex-col font-sans relative selection:bg-[#FFE600] selection:text-black">
      {/* Neo-Brutalist dot grid pattern */}
      <div className="absolute inset-0 neo-grid pointer-events-none opacity-25 -z-0" />

      {/* Main Content Layout */}
      <div className={`min-h-screen flex flex-col justify-between relative z-10 ${authModal.isOpen ? 'pointer-events-none select-none' : ''}`}>
        {/* Bold Top Navigation */}
        <header className="bg-white border-b-2 border-black sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Identity */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-bold transition-transform duration-75 group-hover:-translate-y-0.5">
                <Compass className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-base font-black tracking-tight text-black uppercase font-mono">
                  CareerPilot
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 border-2 border-black bg-[#C4A1FF] text-black uppercase shadow-[1px_1px_0px_0px_#000]">
                  v1.0
                </span>
              </div>
            </Link>

            {/* Telemetry pill & Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 border-2 border-black bg-[#70E000] text-black text-xs font-mono font-bold shadow-[3px_3px_0px_0px_#000]">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                <span>SWARM: 7_NODES_ONLINE</span>
              </div>

              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                className="inline-flex items-center px-4 py-2 border-2 border-black bg-[#FFE600] text-black text-xs font-mono font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-75"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
                Student Login
              </button>
            </div>
          </div>
        </header>

        {/* Central Hero Terminal Section */}
        <main className="flex-1 relative z-10 flex flex-col justify-center items-center px-4 sm:px-6 py-12 sm:py-20 max-w-4xl mx-auto w-full text-center my-auto">
          <div className="space-y-6 w-full">
            {/* System Status Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 border-2 border-black bg-white text-black text-xs font-mono font-bold shadow-[3px_3px_0px_0px_#000]">
              <Terminal className="w-4 h-4 stroke-[2.5]" />
              <span>DAG_EXECUTION :: 7 AGENT NODES CONNECTED</span>
            </div>

            {/* Editorial Headline with Neo-Brutalist Highlight Box */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black leading-[1.15]">
              Autonomous AI Career Intelligence for
              <span className="block mt-4">
                <span className="inline-block bg-[#FFE600] border-[3px] border-black px-4 py-2 shadow-[5px_5px_0px_0px_#000] text-black font-mono font-black text-2xl sm:text-4xl lg:text-5xl min-h-[1.4em]">
                  <span>{displayText}</span>
                  <span className="inline-block w-2.5 h-[0.8em] ml-2 bg-black align-middle animate-pulse" />
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base font-semibold text-slate-800 max-w-xl mx-auto leading-relaxed pt-1">
              Seven autonomous AI agents coordinate over a Neo4j knowledge graph to audit repository
              evidence, benchmark market demand, and compute your readiness index in real time.
            </p>

            {/* Tactile Push-Down Actions */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xs sm:max-w-md mx-auto w-full">
              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                className="w-full sm:w-auto px-7 py-3 border-[3px] border-black bg-[#70E000] hover:bg-[#85FF0A] text-black font-mono font-black text-xs uppercase tracking-wider shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-75 flex items-center justify-center"
              >
                <span>Student Login</span>
                <ArrowRight className="w-4 h-4 ml-2 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                className="w-full sm:w-auto px-6 py-3 border-[3px] border-black bg-white hover:bg-[#F4F0EA] text-black font-mono font-black text-xs uppercase tracking-wider shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-75"
              >
                <span>Create Profile</span>
              </button>
            </div>

            {/* Chunky Spec Chips (Neo-Brutalist Architecture Bar) */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto">
              <div className="border-2 border-black bg-[#C4A1FF] text-black px-3 py-1 font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#000]">
                LangGraph State DAG
              </div>
              <div className="border-2 border-black bg-[#38B6FF] text-black px-3 py-1 font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#000]">
                Neo4j Property Graph
              </div>
              <div className="border-2 border-black bg-[#FFDE59] text-black px-3 py-1 font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#000]">
                12-Round Bcrypt Auth
              </div>
              <div className="border-2 border-black bg-[#FF70A6] text-black px-3 py-1 font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#000]">
                Token Rotation
              </div>
            </div>
          </div>
        </main>

        {/* Minimal Engineering Footer */}
        <footer className="relative z-10 border-t-2 border-black py-4 bg-white text-center text-xs font-mono font-bold text-black">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>CAREERPILOT // FINAL YEAR ENGINEERING PROJECT</span>
            <span className="text-slate-700">
              Built by Hussain Ansari (M1), Anindya (M2), Arik (M3) & Sargam (M4)
            </span>
          </div>
        </footer>
      </div>

      {/* Neo-Brutalist Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
