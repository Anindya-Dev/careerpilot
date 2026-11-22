/**
 * @file LandingPage.jsx
 * @description Hallmark-crafted public landing page for CareerPilot.
 * Follows anti-AI-slop design principles: authentic technical typography,
 * high-contrast architectural canvas, tactile interaction tokens, and dynamic modal auth.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  LogIn,
  ChevronRight,
  Terminal,
  Cpu,
  Layers,
  ShieldCheck,
  Check
} from 'lucide-react';
import Button from '../components/Button';
import AuthModal from '../components/AuthModal';

export default function LandingPage() {
  const navigate = useNavigate();

  // Dynamic cycling target roles with typewriter cadence
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

  // Pop-up modal state
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  useEffect(() => {
    const currentFullText = roles[roleIndex];
    let timer;

    if (!isDeleting) {
      if (displayText.length < currentFullText.length) {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.slice(0, displayText.length + 1));
        }, 55);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.slice(0, displayText.length - 1));
        }, 30);
      } else {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, roles]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Hallmark Architectural Canvas: Precision grid + Soft top illumination */}
      <div className="absolute inset-0 tech-grid pointer-events-none opacity-80" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-slate-800/20 blur-[130px] rounded-full pointer-events-none -z-0" />

      {/* Main Content Wrapper (Blurs when AuthModal opens) */}
      <div
        className={`min-h-screen flex flex-col justify-between transition-all duration-200 ${
          authModal.isOpen ? 'filter blur-[5px] scale-[0.99] pointer-events-none select-none' : ''
        }`}
      >
        {/* Architectural Header */}
        <header className="relative z-20 border-b border-slate-800/80 backdrop-blur-md bg-[#07090e]/80 sticky top-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 py-3 flex items-center justify-between">
            {/* Brand Identity */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-lg bg-white text-slate-950 flex items-center justify-center font-bold shadow-sm transition-transform duration-150 group-hover:scale-105">
                <Compass className="w-5 h-5 text-slate-950 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
                  CareerPilot
                  <span className="font-mono text-[10px] tracking-widest text-slate-400 font-normal px-1.5 py-0.5 rounded border border-slate-800 bg-slate-900">
                    v1.0
                  </span>
                </span>
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  Multi-Agent Intelligence
                </span>
              </div>
            </Link>

            {/* Telemetry pill & Login Action */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-md border border-slate-800 bg-slate-900/90 text-[11px] font-mono text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>SWARM_STATUS: ACTIVE</span>
              </div>

              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-100 hover:bg-white text-slate-950 text-xs font-semibold tracking-tight shadow-sm transition-colors duration-150 active:scale-[0.98]"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5 text-slate-800 stroke-[2.2]" />
                Student Login
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 relative z-10 flex flex-col justify-center items-center px-4 sm:px-6 py-16 sm:py-24 max-w-4xl mx-auto w-full text-center my-auto">
          <div className="space-y-7 w-full">
            {/* System Status Breadcrumb */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-md border border-slate-800 bg-slate-900/70 text-slate-400 text-xs font-mono tracking-wide">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>AGENT_DAG :: 7 AUTONOMOUS NODES READY</span>
            </div>

            {/* Dynamic Headline with Typewriter Animation */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
              Autonomous AI Career Intelligence for
              <span className="block mt-3 text-cyan-400 font-mono tracking-normal min-h-[1.3em]">
                <span>{displayText}</span>
                <span className="inline-block w-[2.5px] h-[0.85em] ml-1 bg-cyan-400 align-middle animate-pulse" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              Seven autonomous AI agents coordinate over a Neo4j knowledge graph to verify code claims,
              benchmark skill-market demand, and compute your Career Intelligence Index in real time.
            </p>

            {/* Job-Driven Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-sm mx-auto w-full">
              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                className="w-full sm:w-auto px-7 py-3 rounded-lg bg-white text-slate-950 hover:bg-slate-100 font-semibold text-sm shadow-md transition-colors duration-150 flex items-center justify-center group active:scale-[0.98]"
              >
                <span>Student Login</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                className="w-full sm:w-auto px-6 py-3 rounded-lg border border-slate-750 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-sm transition-colors duration-150 active:scale-[0.98]"
              >
                <span>Create Profile</span>
              </button>
            </div>

            {/* Technical Specification Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                LangGraph State DAG
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                Neo4j Property Graph
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                12-Round Bcrypt Auth
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                Token Rotation
              </span>
            </div>
          </div>
        </main>

        {/* Minimal Engineering Footer */}
        <footer className="relative z-10 border-t border-slate-850 py-6 text-center text-xs font-mono text-slate-500">
          <p>CAREERPILOT • MULTI-AGENT AI PLATFORM • B.TECH FINAL YEAR PROJECT</p>
          <p className="mt-1 text-[11px] text-slate-600">
            Engineered by Md Hussain Ansari (Member 1), Anindya, Arik & Sargam
          </p>
        </footer>
      </div>

      {/* Pop-up Authentication & Registration Modal with Deep Blurred Backdrop */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
