/**
 * @file LandingPage.jsx
 * @description Neo-Brutalist landing page for CareerPilot.
 * Clean, tight vertical spacing with zero awkward top gaps.
 * Stripped of clutter (FAQ, footer bar, badge pills, yellow metric strip removed per user request).
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  LogIn,
  Cpu,
  Layers,
  Database,
  GitBranch
} from 'lucide-react';
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

  // Typewriter cadence for target roles
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

  // Tagline Reveal: Words transition from muted to full on scroll
  const taglineWords = [
    'Real', 'engineering', 'evidence', 'evaluated', 'by', 'autonomous', 'intelligence',
    'before', 'your', 'next', 'technical', 'interview.'
  ];
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const taglineRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            taglineWords.forEach((_, i) => {
              setTimeout(() => {
                setActiveWordIndex((prev) => Math.max(prev, i + 1));
              }, i * 80);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    if (taglineRef.current) {
      observer.observe(taglineRef.current);
    }
    return () => observer.disconnect();
  }, [taglineWords.length]);

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-black flex flex-col font-sans relative selection:bg-[#FFE600] selection:text-black overflow-x-hidden">
      {/* Neo-Brutalist dot grid pattern */}
      <div className="absolute inset-0 neo-grid pointer-events-none opacity-20 -z-0" />

      {/* Main Content Layout */}
      <div className={`relative z-10 flex flex-col ${authModal.isOpen ? 'pointer-events-none select-none' : ''}`}>
        
        {/* Navigation: Clean, compact navbar without v1.0 badge or nodes-active pill */}
        <header className="sticky top-0 z-30 bg-white border-b-2 border-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Identity */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-bold transition-transform duration-75 group-hover:-translate-y-0.5">
                <Compass className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <span className="text-base font-bold tracking-tight text-black uppercase font-mono">
                CareerPilot
              </span>
            </Link>

            {/* Student Login Action */}
            <button
              type="button"
              onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
              className="inline-flex items-center px-4 py-2 border-2 border-black bg-[#FFE600] text-black text-xs font-mono font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
              Student Login
            </button>
          </div>
        </header>

        {/* SECTION 1: HERO - Tight, clean vertical spacing directly below navbar */}
        <section className="relative z-10 flex flex-col justify-center items-center px-4 sm:px-6 pt-8 sm:pt-10 pb-14 max-w-5xl mx-auto w-full text-center">
          <div className="space-y-5 w-full flex flex-col items-center">
            
            {/* Headline with Left-to-Right Gradient and capped max-width 680px */}
            <div className="max-w-[680px] mx-auto pt-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12] bg-gradient-to-r from-black via-neutral-900 to-neutral-600 bg-clip-text text-transparent">
                Autonomous career intelligence for engineering students
              </h1>
            </div>

            {/* Target Role Typewriter in Neo-Brutalist Box */}
            <div className="pt-1">
              <div className="inline-block bg-[#FFE600] border-[3px] border-black px-4 py-2 shadow-[5px_5px_0px_0px_#000] text-black font-mono font-bold text-lg sm:text-2xl md:text-3xl min-h-[1.5em]">
                <span>{displayText}</span>
                <span className="inline-block w-2.5 h-[0.85em] ml-1.5 bg-black align-middle animate-pulse" />
              </div>
            </div>

            {/* Subheadline capped at 680px */}
            <p className="text-base sm:text-lg font-medium text-slate-800 max-w-[680px] mx-auto leading-relaxed pt-1">
              Seven coordinated AI agents verify code evidence from GitHub and query Neo4j knowledge graphs to calculate your market readiness.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto w-full">
              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                className="w-full sm:w-auto px-8 py-3.5 border-[3px] border-black bg-[#70E000] hover:bg-[#85FF0A] text-black font-mono font-bold text-sm uppercase tracking-wider shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-75 flex items-center justify-center"
              >
                <span>Start Profile Evaluation</span>
                <ArrowRight className="w-4 h-4 ml-2 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                className="w-full sm:w-auto px-6 py-3.5 border-[3px] border-black bg-white hover:bg-[#F4F0EA] text-black font-mono font-bold text-sm uppercase tracking-wider shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-75"
              >
                <span>Student Login</span>
              </button>
            </div>

            {/* Hero Visual: Interactive Workbench Terminal Preview */}
            <div className="w-full max-w-3xl mt-5 text-left border-[3px] border-black bg-white shadow-[8px_8px_0px_0px_#000]">
              <div className="bg-[#FAF5E6] border-b-2 border-black px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full border border-black bg-[#FF5757]" />
                  <div className="w-3 h-3 rounded-full border border-black bg-[#FFE600]" />
                  <div className="w-3 h-3 rounded-full border border-black bg-[#70E000]" />
                  <span className="text-xs font-mono font-bold ml-2">CAREERPILOT WORKBENCH TELEMETRY</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-black bg-[#C4A1FF]">
                  AGENT_DAG_ONLINE
                </span>
              </div>
              <div className="p-4 sm:p-5 bg-white font-mono text-xs space-y-2">
                <div className="text-slate-600">$ agent.orchestrator --target="AI & Machine Learning Engineers"</div>
                <div className="text-black font-bold flex items-center">
                  <span className="text-[#70E000] mr-2">✓</span> Evidence Agent: 14 repositories scanned, PyTorch & TensorFlow validated
                </div>
                <div className="text-black font-bold flex items-center">
                  <span className="text-[#70E000] mr-2">✓</span> Market Agent: Queried Neo4j graph, 84% role requirement match
                </div>
                <div className="text-black font-bold flex items-center">
                  <span className="text-[#38B6FF] mr-2">→</span> Career Health Score computed: <span className="bg-[#FFE600] px-1.5 py-0.2 border border-black ml-1.5 font-bold">78.5 / 100</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: PROBLEM TO SOLUTION */}
        <section className="py-14 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <div className="border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_#000] p-6 sm:p-8">
            <div className="inline-block border-2 border-black bg-[#FF70A6] px-3 py-1 font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] mb-3">
              THE HIRING DISCONNECT
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black leading-tight">
              Course grades do not prove hands on capability. Code evidence does.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 text-sm font-medium text-slate-800 leading-relaxed">
              <div className="p-4 bg-[#FAF5E6] border-2 border-black">
                <div className="font-mono font-bold text-xs uppercase text-red-600 mb-1.5">The Common Problem</div>
                <p>
                  Engineering students submit resumes with generic keyword lists that get filtered out by automated ATS scanners. Recruiters cannot tell who actually wrote production code versus who completed simple tutorials.
                </p>
              </div>
              <div className="p-4 bg-[#FAF5E6] border-2 border-black">
                <div className="font-mono font-bold text-xs uppercase text-emerald-700 mb-1.5">The CareerPilot Solution</div>
                <p>
                  Our Evidence Agent parses your actual repositories, extracting commit history, dependencies, and test coverage to construct a verifiable skill graph that matches real industry job requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: TAGLINE REVEAL */}
        <section ref={taglineRef} className="py-14 px-4 sm:px-6 bg-[#FAF5E6] border-y-2 border-black text-center">
          <div className="max-w-[680px] mx-auto space-y-3">
            <div className="inline-block border-2 border-black bg-[#C4A1FF] px-3 py-1 font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000]">
              CORE PROMISE
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-snug">
              {taglineWords.map((word, i) => (
                <span
                  key={i}
                  className={`inline-block mr-2.5 transition-colors duration-300 ${
                    i < activeWordIndex ? 'text-black' : 'text-neutral-400'
                  }`}
                >
                  {word}
                </span>
              ))}
            </h2>
          </div>
        </section>

        {/* SECTION 4: OUTCOME-DRIVEN BENEFITS */}
        <section className="py-14 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <div className="text-center mb-8">
            <div className="inline-block border-2 border-black bg-[#38B6FF] px-3 py-1 font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] mb-2">
              PLATFORM CAPABILITIES
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
              Engineered for genuine technical outcomes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
              <div className="w-9 h-9 bg-[#FFE600] border-2 border-black flex items-center justify-center font-bold mb-3 shadow-[2px_2px_0px_0px_#000]">
                <GitBranch className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-black font-mono">
                Code evidence verification
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1.5 leading-relaxed">
                Agents inspect repository structures, languages, and commit history rather than self reported claims.
              </p>
            </div>

            <div className="bg-white border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
              <div className="w-9 h-9 bg-[#70E000] border-2 border-black flex items-center justify-center font-bold mb-3 shadow-[2px_2px_0px_0px_#000]">
                <Database className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-black font-mono">
                Neo4j graph matching
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1.5 leading-relaxed">
                Every recorded competency connects to real market requirement nodes in real time.
              </p>
            </div>

            <div className="bg-white border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
              <div className="w-9 h-9 bg-[#C4A1FF] border-2 border-black flex items-center justify-center font-bold mb-3 shadow-[2px_2px_0px_0px_#000]">
                <Layers className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-black font-mono">
                Objective career index
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1.5 leading-relaxed">
                A composite score from 0 to 100 calculated across code quality, skill breadth, and market demand.
              </p>
            </div>

            <div className="bg-white border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
              <div className="w-9 h-9 bg-[#FF70A6] border-2 border-black flex items-center justify-center font-bold mb-3 shadow-[2px_2px_0px_0px_#000]">
                <Cpu className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-black font-mono">
                Targeted role roadmaps
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1.5 leading-relaxed">
                Pinpoints exact missing dependencies needed to qualify for machine learning, cloud, or platform engineering roles.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: HOW IT WORKS */}
        <section className="py-14 px-4 sm:px-6 bg-white border-y-2 border-black">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-block border-2 border-black bg-[#FFE600] px-3 py-1 font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] mb-2">
                WORKFLOW
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
                How CareerPilot evaluates readiness in three steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="border-[3px] border-black bg-[#FAF5E6] p-5 shadow-[4px_4px_0px_0px_#000]">
                <div className="text-xl font-bold font-mono bg-[#FFE600] border-2 border-black w-8 h-8 flex items-center justify-center mb-3">
                  1
                </div>
                <h3 className="text-sm font-bold text-black font-mono">
                  Register profile and role
                </h3>
                <p className="text-xs font-medium text-slate-700 mt-1.5 leading-relaxed">
                  Provide your academic major and select your target engineering domain from cloud, machine learning, or systems.
                </p>
              </div>

              <div className="border-[3px] border-black bg-[#FAF5E6] p-5 shadow-[4px_4px_0px_0px_#000]">
                <div className="text-xl font-bold font-mono bg-[#38B6FF] border-2 border-black w-8 h-8 flex items-center justify-center mb-3">
                  2
                </div>
                <h3 className="text-sm font-bold text-black font-mono">
                  Agents audit evidence
                </h3>
                <p className="text-xs font-medium text-slate-700 mt-1.5 leading-relaxed">
                  Autonomous agents parse repository code artifacts and query the Neo4j knowledge graph to verify claims.
                </p>
              </div>

              <div className="border-[3px] border-black bg-[#FAF5E6] p-5 shadow-[4px_4px_0px_0px_#000]">
                <div className="text-xl font-bold font-mono bg-[#70E000] border-2 border-black w-8 h-8 flex items-center justify-center mb-3">
                  3
                </div>
                <h3 className="text-sm font-bold text-black font-mono">
                  Review readiness index
                </h3>
                <p className="text-xs font-medium text-slate-700 mt-1.5 leading-relaxed">
                  Receive your objective Career Health score, radar alignment graph, and prioritized technical remediation roadmap.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: FINAL ACTION BANNER */}
        <section className="py-14 px-4 sm:px-6 bg-[#FFE600] text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-black">
              Verify your technical readiness today
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 max-w-lg mx-auto leading-relaxed">
              Connect your GitHub repository links to generate your Career Intelligence Index in seconds.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xs sm:max-w-md mx-auto w-full">
              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                className="w-full sm:w-auto px-7 py-3 border-[3px] border-black bg-[#70E000] hover:bg-[#85FF0A] text-black font-mono font-bold text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-75 flex items-center justify-center"
              >
                <span>Start Profile Evaluation</span>
                <ArrowRight className="w-4 h-4 ml-2 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Pop-up Authentication & Registration Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
