/**
 * @file LandingPage.jsx
 * @description Neo-Brutalist landing page for CareerPilot.
 * Features weighted deceleration scroll reveals (IntersectionObserver),
 * hero entrance animation, live terminal telemetry pulses, and infinite neo-brutalist marquee.
 * Strictly adheres to landing-page-design B7 motion rules.
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
  GitBranch,
  Terminal,
  Activity
} from 'lucide-react';
import AuthModal from '../components/AuthModal';

/**
 * Reusable IntersectionObserver Scroll Reveal Wrapper
 * Applies B7 base curve deceleration and single-fire entrance.
 */
function Reveal({ children, className = '', delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal-init ${isVisible ? 'reveal-active' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

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

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-black flex flex-col font-sans relative selection:bg-[#FFE600] selection:text-black overflow-x-hidden">
      {/* Neo-Brutalist dot grid pattern */}
      <div className="absolute inset-0 neo-grid pointer-events-none opacity-20 -z-0" />

      {/* Main Content Layout */}
      <div className={`relative z-10 flex flex-col ${authModal.isOpen ? 'pointer-events-none select-none' : ''}`}>
        
        {/* Navigation: Full-width container */}
        <header className="sticky top-0 z-30 bg-white/95 border-b-2 border-black backdrop-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
            {/* Identity */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-bold transition-transform duration-75 group-hover:-translate-y-0.5">
                <Compass className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <span className="text-lg font-black tracking-tight text-black uppercase font-mono">
                CareerPilot
              </span>
            </Link>

            {/* Student Login Action */}
            <button
              type="button"
              onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
              className="inline-flex items-center px-5 py-2.5 border-2 border-black bg-[#FFE600] text-black text-xs font-mono font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75"
            >
              <LogIn className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              Student Login
            </button>
          </div>
        </header>

        {/* SECTION 1: HERO - Staggered entry animation */}
        <section className="relative z-10 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 pt-10 sm:pt-14 pb-16 max-w-7xl mx-auto w-full text-center">
          <div className="space-y-6 w-full flex flex-col items-center">
            
            {/* Prominent Large Headline with Key Highlight Badges */}
            <Reveal delay={0} className="max-w-5xl mx-auto">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] text-black">
                Autonomous{' '}
                <span className="inline-block bg-[#FFE600] px-3 sm:px-4 py-0.5 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] rotate-[-1deg] hover:rotate-0 transition-transform duration-200">
                  career intelligence
                </span>{' '}
                for{' '}
                <span className="inline-block bg-[#38B6FF] px-3 sm:px-4 py-0.5 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] rotate-[1deg] hover:rotate-0 transition-transform duration-200">
                  engineering students
                </span>
              </h1>
            </Reveal>

            {/* Target Role Typewriter in Prominent Neo-Brutalist Box */}
            <Reveal delay={150} className="pt-2">
              <div className="inline-block bg-[#FFE600] border-[3px] border-black px-5 sm:px-8 py-2.5 sm:py-3.5 shadow-[6px_6px_0px_0px_#000] text-black font-mono font-black text-xl sm:text-3xl md:text-4xl lg:text-5xl min-h-[1.5em] transition-all duration-75">
                <span>{displayText}</span>
                <span className="inline-block w-3 sm:w-4 h-[0.85em] ml-2 bg-black align-middle animate-pulse" />
              </div>
            </Reveal>

            {/* Action Buttons */}
            <Reveal delay={250} className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto w-full">
              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                className="w-full sm:w-auto px-9 py-4 border-[3px] border-black bg-[#70E000] hover:bg-[#85FF0A] text-black font-mono font-black text-sm sm:text-base uppercase tracking-wider shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-75 flex items-center justify-center"
              >
                <span>Start Profile Evaluation</span>
                <ArrowRight className="w-5 h-5 ml-2 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                className="w-full sm:w-auto px-8 py-4 border-[3px] border-black bg-white hover:bg-[#F4F0EA] text-black font-mono font-black text-sm sm:text-base uppercase tracking-wider shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-75"
              >
                <span>Student Login</span>
              </button>
            </Reveal>

            {/* Hero Visual: Wide Interactive Workbench Terminal Preview */}
            <Reveal delay={350} className="w-full max-w-5xl mt-6">
              <div className="w-full text-left border-[3px] border-black bg-white shadow-[10px_10px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#000] transition-all duration-150">
                <div className="bg-[#FAF5E6] border-b-2 border-black px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3.5 h-3.5 rounded-full border border-black bg-[#FF5757]" />
                    <div className="w-3.5 h-3.5 rounded-full border border-black bg-[#FFE600]" />
                    <div className="w-3.5 h-3.5 rounded-full border border-black bg-[#70E000]" />
                    <span className="text-xs sm:text-sm font-mono font-bold ml-2 text-black">
                      CAREERPILOT WORKBENCH TELEMETRY
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#70E000] animate-pulse" />
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 border-2 border-black bg-[#C4A1FF] text-black shadow-[2px_2px_0px_0px_#000]">
                      AGENT_DAG_ONLINE
                    </span>
                  </div>
                </div>
                <div className="p-5 sm:p-7 bg-white font-mono text-xs sm:text-sm space-y-3">
                  <div className="text-slate-600 font-semibold flex items-center">
                    <Terminal className="w-4 h-4 mr-2 text-black stroke-[2.5]" />
                    <span>$ agent.orchestrator --target="AI & Machine Learning Engineers"</span>
                  </div>
                  <div className="text-black font-bold flex flex-wrap items-center gap-2">
                    <span className="text-[#70E000] text-base">✓</span> Evidence Agent:
                    <span className="bg-[#70E000] px-2 py-0.5 border border-black text-black">14 repositories scanned</span>
                    <span>PyTorch & TensorFlow validated</span>
                  </div>
                  <div className="text-black font-bold flex flex-wrap items-center gap-2">
                    <span className="text-[#70E000] text-base">✓</span> Market Agent:
                    <span>Queried Neo4j graph:</span>
                    <span className="bg-[#38B6FF] px-2 py-0.5 border border-black text-black">84% role requirement match</span>
                  </div>
                  <div className="text-black font-bold flex flex-wrap items-center gap-2 pt-1 border-t-2 border-black/10">
                    <span className="text-[#38B6FF] text-base font-black">→</span>
                    <span>Career Health Score computed:</span>
                    <span className="bg-[#FFE600] px-3 py-1 border-2 border-black text-black font-black text-sm sm:text-base shadow-[2px_2px_0px_0px_#000] animate-bounce">
                      78.5 / 100
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* NEO-BRUTALIST INFINITE RUNNING MARQUEE BANNER */}
        <div className="w-full overflow-hidden bg-[#FFE600] border-y-2 border-black py-3 select-none">
          <div className="animate-marquee font-mono font-bold text-xs sm:text-sm tracking-wider uppercase text-black">
            <span className="mx-4">✦ 7 AUTONOMOUS AGENT NODES</span>
            <span className="mx-4">✦ NEO4J CYPHER GRAPH BENCHMARKING</span>
            <span className="mx-4">✦ GITHUB CODEBASE AUDITING</span>
            <span className="mx-4">✦ 12-ROUND BCRYPT AUTH</span>
            <span className="mx-4">✦ DYNAMIC CAREER HEALTH INDEX</span>
            <span className="mx-4">✦ LIVE SKILL GAP RESOLUTION</span>
            <span className="mx-4">✦ 7 AUTONOMOUS AGENT NODES</span>
            <span className="mx-4">✦ NEO4J CYPHER GRAPH BENCHMARKING</span>
            <span className="mx-4">✦ GITHUB CODEBASE AUDITING</span>
            <span className="mx-4">✦ 12-ROUND BCRYPT AUTH</span>
            <span className="mx-4">✦ DYNAMIC CAREER HEALTH INDEX</span>
            <span className="mx-4">✦ LIVE SKILL GAP RESOLUTION</span>
          </div>
        </div>

        {/* SECTION 2: PROBLEM TO SOLUTION - Scroll Reveal */}
        <section className="py-16 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full">
          <Reveal delay={0}>
            <div className="border-[3px] border-black bg-white shadow-[8px_8px_0px_0px_#000] p-6 sm:p-10 hover:shadow-[10px_10px_0px_0px_#000] transition-shadow duration-150">
              <div className="inline-block border-2 border-black bg-[#FF70A6] px-3.5 py-1 font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] mb-3">
                THE HIRING DISCONNECT
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-black leading-tight">
                Course grades do not prove hands on capability.{' '}
                <span className="bg-[#FFE600] px-2 border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                  Code evidence does.
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
                <div className="p-5 sm:p-6 bg-[#FAF5E6] border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] transition-all duration-75">
                  <div className="font-mono font-bold text-xs uppercase text-red-600 mb-2">The Common Problem</div>
                  <p>
                    Engineering students submit resumes with generic keyword lists that get filtered out by automated ATS scanners. Recruiters cannot tell who actually wrote production code versus who completed simple tutorials.
                  </p>
                </div>
                <div className="p-5 sm:p-6 bg-[#FAF5E6] border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] transition-all duration-75">
                  <div className="font-mono font-bold text-xs uppercase text-emerald-700 mb-2">The CareerPilot Solution</div>
                  <p>
                    Our Evidence Agent parses your actual repositories, extracting commit history, dependencies, and test coverage to construct a verifiable skill graph that matches real industry job requirements.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* SECTION 3: OUTCOME-DRIVEN BENEFITS - Staggered Scroll Reveal Cards */}
        <section className="py-16 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full">
          <Reveal delay={0} className="text-center mb-10">
            <div className="inline-block border-2 border-black bg-[#38B6FF] px-3.5 py-1 font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] mb-2">
              PLATFORM CAPABILITIES
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
              Engineered for genuine technical outcomes
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <Reveal delay={100}>
              <div className="bg-white border-[3px] border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-75">
                <div className="w-12 h-12 bg-[#FFE600] border-2 border-black flex items-center justify-center font-bold mb-4 shadow-[2px_2px_0px_0px_#000]">
                  <GitBranch className="w-6 h-6 text-black stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-black font-mono">
                  Code evidence verification
                </h3>
                <p className="text-sm sm:text-base font-medium text-slate-700 mt-2 leading-relaxed">
                  Agents inspect repository structures, languages, and commit history rather than self reported claims.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="bg-white border-[3px] border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-75">
                <div className="w-12 h-12 bg-[#70E000] border-2 border-black flex items-center justify-center font-bold mb-4 shadow-[2px_2px_0px_0px_#000]">
                  <Database className="w-6 h-6 text-black stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-black font-mono">
                  Neo4j graph matching
                </h3>
                <p className="text-sm sm:text-base font-medium text-slate-700 mt-2 leading-relaxed">
                  Every recorded competency connects to real market requirement nodes in real time.
                </p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="bg-white border-[3px] border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-75">
                <div className="w-12 h-12 bg-[#C4A1FF] border-2 border-black flex items-center justify-center font-bold mb-4 shadow-[2px_2px_0px_0px_#000]">
                  <Layers className="w-6 h-6 text-black stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-black font-mono">
                  Objective career index
                </h3>
                <p className="text-sm sm:text-base font-medium text-slate-700 mt-2 leading-relaxed">
                  A composite score from 0 to 100 calculated across code quality, skill breadth, and market demand.
                </p>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="bg-white border-[3px] border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-75">
                <div className="w-12 h-12 bg-[#FF70A6] border-2 border-black flex items-center justify-center font-bold mb-4 shadow-[2px_2px_0px_0px_#000]">
                  <Cpu className="w-6 h-6 text-black stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-black font-mono">
                  Targeted role roadmaps
                </h3>
                <p className="text-sm sm:text-base font-medium text-slate-700 mt-2 leading-relaxed">
                  Pinpoints exact missing dependencies needed to qualify for machine learning, cloud, or platform engineering roles.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* SECTION 4: HOW IT WORKS - Step-by-Step Staggered Scroll Reveal */}
        <section className="py-16 px-4 sm:px-8 lg:px-12 bg-white border-y-2 border-black">
          <div className="max-w-7xl mx-auto">
            <Reveal delay={0} className="text-center mb-10">
              <div className="inline-block border-2 border-black bg-[#FFE600] px-3.5 py-1 font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] mb-2">
                WORKFLOW
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
                How CareerPilot evaluates readiness in three steps
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <Reveal delay={100}>
                <div className="border-[3px] border-black bg-[#FAF5E6] p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_#000] transition-all duration-75">
                  <div className="text-2xl font-black font-mono bg-[#FFE600] border-2 border-black w-10 h-10 flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_#000]">
                    1
                  </div>
                  <h3 className="text-lg font-black text-black font-mono">
                    Register profile and role
                  </h3>
                  <p className="text-sm font-medium text-slate-700 mt-2 leading-relaxed">
                    Provide your academic major and select your target engineering domain from cloud, machine learning, or systems.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={250}>
                <div className="border-[3px] border-black bg-[#FAF5E6] p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_#000] transition-all duration-75">
                  <div className="text-2xl font-black font-mono bg-[#38B6FF] border-2 border-black w-10 h-10 flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_#000]">
                    2
                  </div>
                  <h3 className="text-lg font-black text-black font-mono">
                    Agents audit evidence
                  </h3>
                  <p className="text-sm font-medium text-slate-700 mt-2 leading-relaxed">
                    Autonomous agents parse repository code artifacts and query the Neo4j knowledge graph to verify claims.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={400}>
                <div className="border-[3px] border-black bg-[#FAF5E6] p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_#000] transition-all duration-75">
                  <div className="text-2xl font-black font-mono bg-[#70E000] border-2 border-black w-10 h-10 flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_#000]">
                    3
                  </div>
                  <h3 className="text-lg font-black text-black font-mono">
                    Review readiness index
                  </h3>
                  <p className="text-sm font-medium text-slate-700 mt-2 leading-relaxed">
                    Receive your objective Career Health score, radar alignment graph, and prioritized technical remediation roadmap.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* SECTION 5: FINAL ACTION BANNER - Scale Reveal */}
        <section className="py-16 px-4 sm:px-8 lg:px-12 bg-[#FFE600] text-center border-t-2 border-black">
          <Reveal delay={0} className="max-w-4xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-black">
              Verify your technical readiness today
            </h2>
            <p className="text-base sm:text-lg font-bold text-slate-800 max-w-xl mx-auto leading-relaxed">
              Connect your GitHub repository links to generate your Career Intelligence Index in seconds.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto w-full">
              <button
                type="button"
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                className="w-full sm:w-auto px-9 py-4 border-[3px] border-black bg-[#70E000] hover:bg-[#85FF0A] text-black font-mono font-black text-sm sm:text-base uppercase tracking-wider shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-75 flex items-center justify-center"
              >
                <span>Start Profile Evaluation</span>
                <ArrowRight className="w-5 h-5 ml-2 stroke-[2.5]" />
              </button>
            </div>
          </Reveal>
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
