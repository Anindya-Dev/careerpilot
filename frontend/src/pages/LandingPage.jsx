/**
 * @file LandingPage.jsx
 * @description Dynamic, interactive public landing page for CareerPilot.
 * Displays platform overview, dynamic role cycling, interactive agent capability preview,
 * and high-visibility Student Login call-to-actions.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Bot,
  Activity,
  Layers,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Cpu,
  LogIn,
  ChevronRight,
  GitBranch
} from 'lucide-react';
import Button from '../components/Button';

export default function LandingPage() {
  const navigate = useNavigate();

  // Dynamic cycling target roles
  const roles = [
    'AI & Machine Learning Engineers',
    'Full-Stack Cloud Architects',
    'Data Science Specialists',
    'DevOps & Platform Engineers',
    'Autonomous Systems Developers'
  ];

  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('skills');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glow Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-0" />
      <div className="absolute -top-32 -left-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none -z-0" />

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

            <Link to="/login">
              <Button
                variant="primary"
                size="md"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 px-5 py-2.5 rounded-xl border border-indigo-400/30"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Student Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Autonomous Career Guidance Architecture</span>
          </div>

          {/* Dynamic Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Autonomous AI Career Intelligence for{' '}
            <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent transition-all duration-300 min-h-[1.3em]">
              {roles[currentRoleIndex]}
            </span>
          </h1>

          {/* Brief details on CareerPilot */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CareerPilot replaces static resume checklists with a dynamic multi-agent system.
            Seven autonomous AI agents analyze your skills, verify code evidence, and compute
            your real-time Career Intelligence Index.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center group"
              >
                <span>Student Login</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <Link to="/register" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-semibold text-base border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center"
              >
                <span>Create Student Profile</span>
                <ChevronRight className="w-4 h-4 ml-1.5 text-slate-400" />
              </button>
            </Link>
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

        {/* Dynamic Interactive Agent Preview Panel */}
        <div className="mt-16 max-w-4xl mx-auto w-full">
          <div className="bg-slate-800/70 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-700/60 gap-4">
              <div>
                <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  Live Platform Preview
                </div>
                <h3 className="text-lg font-bold text-white">How CareerPilot Evaluates Your Profile</h3>
              </div>

              {/* Interactive Tabs */}
              <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700/70 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('skills')}
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                    activeTab === 'skills'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Skill Intelligence
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('health')}
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                    activeTab === 'health'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Career Health
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('evidence')}
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                    activeTab === 'evidence'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Code Evidence
                </button>
              </div>
            </div>

            {/* Dynamic Tab Contents */}
            <div className="pt-6">
              {activeTab === 'skills' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>PyTorch / Deep Learning</span>
                      <span className="text-emerald-400 font-bold">+94% Market ROI</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-[94%]" />
                    </div>
                    <p className="text-[11px] text-slate-400">High-demand match for target AI Engineer role.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>LangGraph / Agentic AI</span>
                      <span className="text-indigo-400 font-bold">+88% High Value</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full w-[88%]" />
                    </div>
                    <p className="text-[11px] text-slate-400">Emerging capability required in 76% of new job postings.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Docker / Microservices</span>
                      <span className="text-blue-400 font-bold">+82% Foundational</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full w-[82%]" />
                    </div>
                    <p className="text-[11px] text-slate-400">Containerization capability verified across services.</p>
                  </div>
                </div>
              )}

              {activeTab === 'health' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Activity className="w-8 h-8 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white">
                        84.5 <span className="text-sm font-medium text-slate-400">/ 100</span>
                      </div>
                      <div className="text-xs text-indigo-300 font-semibold">Career Intelligence Index</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Composite index weighted from profile completeness, skill-market fit, and evidence.
                      </p>
                    </div>
                  </div>

                  <Link to="/login">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors flex items-center"
                    >
                      <span>View Your Score</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                  </Link>
                </div>
              )}

              {activeTab === 'evidence' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-start space-x-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-white">GitHub Code Verification</div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Career Evidence Agent inspects commit frequencies, repos, and language dominance to validate self-reported skills.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-start space-x-3">
                    <GitBranch className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-white">Neo4j Graph Relationship</div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Maps claims to (:Student)&rarr;[:BUILT_PROJECT]&rarr;(:Project)&rarr;[:USES_TECH]&rarr;(:Skill) in real-time.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
  );
}
