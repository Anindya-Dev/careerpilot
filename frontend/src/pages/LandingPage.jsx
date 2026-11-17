/**
 * @file LandingPage.jsx
 * @description Dynamic, interactive public landing page for CareerPilot.
 * Features typewriter role cycling, clean platform overview, and pop-up authentication modal.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Sparkles,
  LogIn,
  ChevronRight
} from 'lucide-react';
import Button from '../components/Button';
import AuthModal from '../components/AuthModal';

export default function LandingPage() {
  const navigate = useNavigate();

  // Dynamic cycling target roles with typewriter animation
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

  // Pop-up modal state (blurred background)
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  useEffect(() => {
    const currentFullText = roles[roleIndex];
    let timer;

    if (!isDeleting) {
      // Typing forward
      if (displayText.length < currentFullText.length) {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.slice(0, displayText.length + 1));
        }, 65); // Natural typing rhythm
      } else {
        // Finished typing word, hold on screen for readability
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      // Deleting backward
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.slice(0, displayText.length - 1));
        }, 35); // Snappy delete rhythm
      } else {
        // Finished deleting, switch to next role
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, roles]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glow Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-indigo-600/25 via-purple-600/15 to-transparent blur-3xl pointer-events-none -z-0" />
      <div className="absolute -top-32 -left-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Main Content Wrapper (Smoothly blurs when AuthModal is active) */}
      <div
        className={`min-h-screen flex flex-col justify-between transition-all duration-300 ${
          authModal.isOpen ? 'filter blur-[5px] scale-[0.99] pointer-events-none select-none' : ''
        }`}
      >
        {/* Top Navigation Bar */}
        <header className="relative z-20 border-b border-slate-800/80 backdrop-blur-md bg-slate-900/60 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  CareerPilot
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    AI v1.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Multi-Agent Career Intelligence</p>
              </div>
            </Link>

            {/* Engine Status & Student Login CTA */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Multi-Agent Swarm Online</span>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 px-5 py-2.5 rounded-xl border border-indigo-400/30"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Student Login
              </Button>
            </div>
          </div>
        </header>

        {/* Centered Hero Section */}
        <main className="flex-1 relative z-10 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-4xl mx-auto w-full text-center my-auto">
          <div className="space-y-8 w-full">
            {/* Status Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Autonomous Career Guidance Architecture</span>
            </div>

            {/* Dynamic Headline with Typewriter Animation */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Autonomous AI Career Intelligence for{' '}
              <span className="block mt-3 bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent min-h-[1.3em]">
                <span>{displayText}</span>
                <span className="inline-block w-[3px] h-[0.85em] ml-1.5 bg-indigo-400 align-middle animate-pulse rounded-full" />
              </span>
            </h1>

            {/* Concise details on CareerPilot */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              CareerPilot replaces static resume checklists with an autonomous multi-agent system.
              Seven AI agents evaluate your skills, verify code evidence against market demand,
              and compute your real-time Career Intelligence Index.
            </p>

            {/* Action CTAs (Trigger Pop-up Modal) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center group"
              >
                <span>Student Login</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-semibold text-base border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Create Student Profile</span>
                <ChevronRight className="w-4 h-4 ml-1.5 text-slate-400" />
              </button>
            </div>

            {/* Key Metrics Strip */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 max-w-2xl mx-auto text-left">
              <div className="p-3">
                <div className="text-2xl font-bold text-white">7 Agents</div>
                <div className="text-xs text-slate-400 font-medium">LangGraph DAG</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-bold text-indigo-400">Neo4j</div>
                <div className="text-xs text-slate-400 font-medium">Knowledge Graph</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-bold text-purple-400">12-Round</div>
                <div className="text-xs text-slate-400 font-medium">Bcrypt Security</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-bold text-emerald-400">Live ROI</div>
                <div className="text-xs text-slate-400 font-medium">Skill Intelligence</div>
              </div>
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="relative z-10 border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
          <p>CareerPilot • Multi-Agent AI Career Intelligence Platform • B.Tech Final Year Engineering Project</p>
          <p className="mt-1 text-slate-600">Built by Md Hussain Ansari (Member 1), Anindya, Arik & Sargam</p>
        </footer>
      </div>

      {/* Pop-up Authentication & Registration Modal with Deep Blurred Background */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
