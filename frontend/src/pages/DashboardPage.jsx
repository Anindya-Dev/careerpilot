/**
 * @file DashboardPage.jsx
 * @description Hallmark-crafted authenticated client shell displaying student greetings,
 * profile metrics summary, and modular integration slots specifically structured for
 * Member 4 (Sargam)'s Chart.js / Recharts radar graphs, career health dials, and roadmap widgets.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import {
  Sparkles,
  TrendingUp,
  Target,
  Award,
  BookOpen,
  ArrowRight,
  Activity,
  Layers,
  CheckCircle2,
  Terminal,
  Cpu
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();

  const completeness = profile?.profile_completeness || 0;
  const skillsCount = profile?.skills?.length || 0;
  const projectsCount = profile?.projects?.length || 0;
  const targetRole = profile?.target_role || 'Target Role Pending';

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Precision architectural coordinate grid */}
      <div className="absolute inset-0 tech-grid pointer-events-none opacity-40 -z-0" />

      {/* Top Navigation */}
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Dashboard Space */}
        <main className="flex-1 p-6 sm:p-8 space-y-6">
          {/* Welcome Architectural Hero Card */}
          <div className="relative rounded-xl border border-slate-800 bg-[#0d111a] p-6 sm:p-7 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-950/20 blur-[100px] pointer-events-none rounded-full" />
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/90 text-[11px] font-mono text-cyan-400">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SYS_ACTIVE :: PHASE 1 PLATFORM ONLINE</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Welcome back, {user?.name || 'Engineer'}
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Seven autonomous AI agents coordinate over a Neo4j knowledge graph to analyze your
                  technical readiness and skill market demand in real time.
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <Link
                  to="/profile"
                  className="inline-flex items-center px-4 py-2.5 rounded-lg bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs transition-colors duration-150 active:scale-[0.98] shadow-sm"
                >
                  Manage Profile
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[2.2]" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Target Role */}
            <Card className="hover:border-slate-700 transition-colors">
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center">
                  <Target className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Target Role</div>
                  <div className="text-sm font-semibold text-white truncate max-w-[150px] mt-0.5">
                    {targetRole}
                  </div>
                </div>
              </div>
            </Card>

            {/* Metric 2: Profile Completeness */}
            <Card className="hover:border-slate-700 transition-colors">
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Completeness</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{completeness}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 border border-slate-800 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(completeness, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Metric 3: Cataloged Skills */}
            <Card className="hover:border-slate-700 transition-colors">
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center">
                  <Award className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Cataloged Skills</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {skillsCount} <span className="text-xs font-normal text-slate-400 font-sans">Registered</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Metric 4: Linked Projects */}
            <Card className="hover:border-slate-700 transition-colors">
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Linked Projects</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {projectsCount} <span className="text-xs font-normal text-slate-400 font-sans">Evidenced</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* ========================================================================= */}
          {/* SARGAM (MEMBER 4) COMPONENT INTEGRATION SLOTS                             */}
          {/* The grid below is explicitly partitioned for Member 4's data viz widgets.  */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Slot A: Career Health Score & Dial (Owned by Sargam) */}
            <div className="lg:col-span-1">
              <Card
                title="Career Health Index"
                subtitle="Aggregated composite score :: Health Agent"
                className="h-full flex flex-col justify-between"
              >
                {/* [SARGAM SLOT: <CareerHealthDial score={profile.career_health_score} />] */}
                <div className="p-6 flex flex-col items-center justify-center text-center border border-dashed border-slate-800 rounded-lg bg-slate-950/60 min-h-[220px]">
                  <div className="relative mb-3">
                    <Activity className="w-9 h-9 text-cyan-400 animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                    {profile?.career_health_score || '78.5'}
                    <span className="text-sm font-normal text-slate-500 font-sans"> / 100</span>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                    SLOT: SARGAM_HEALTH_DIAL
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 max-w-[200px] leading-relaxed">
                    Evaluated by Career Health Agent. Visualized by Member 4 (Sargam).
                  </p>
                </div>
              </Card>
            </div>

            {/* Slot B: Skill Coverage Radar Chart (Owned by Sargam) */}
            <div className="lg:col-span-2">
              <Card
                title="Market Skill Alignment Radar"
                subtitle="Student profile skills vs. real-time market demand"
                className="h-full flex flex-col justify-between"
              >
                {/* [SARGAM SLOT: <SkillRadarChart skills={profile.skills} targetRole={profile.target_role} />] */}
                <div className="p-8 flex flex-col items-center justify-center text-center border border-dashed border-slate-800 rounded-lg bg-slate-950/60 min-h-[220px]">
                  <Layers className="w-10 h-10 text-cyan-400 mb-3" />
                  <div className="text-sm font-semibold text-slate-200">
                    Interactive Radar Chart Slot
                  </div>
                  <div className="mt-1.5 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-0.5 rounded">
                    SLOT: SARGAM_RADAR_VIZ
                  </div>
                  <p className="text-xs text-slate-400 mt-2.5 max-w-md leading-relaxed">
                    Container ready for Chart.js / Recharts integration. Displays multi-agent skill intelligence
                    matching against live market role requirements.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Quick Skill Ingestion Card */}
          <Card
            title="Active Cataloged Skills"
            subtitle="Synchronized with Neo4j Knowledge Graph & Evidence Pipeline"
            actions={
              <Link
                to="/profile"
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors active:scale-[0.98]"
              >
                + ADD_SKILL
              </Link>
            }
          >
            {skillsCount === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs font-mono text-slate-400">NO_SKILLS_RECORDED_IN_PROFILE</p>
                <Link
                  to="/profile"
                  className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs transition-colors"
                >
                  Configure Profile Skills
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile?.skills?.map((skill, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 space-x-2"
                  >
                    <span>{skill.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded uppercase">
                      {skill.level}
                    </span>
                    {skill.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" title="Verified by Evidence Agent" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
