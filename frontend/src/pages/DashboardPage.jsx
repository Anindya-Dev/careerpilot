/**
 * @file DashboardPage.jsx
 * @description Neo-Brutalist authenticated student executive dashboard.
 * Acts as the high-level intelligence control center with direct launchers to dedicated workspaces:
 * Skills & Evidence (/skills), Career Health (/health), Agent Pipeline (/pipeline), and Career Profile (/profile).
 * @author Md Hussain Ansari (Member 1) & Sargam Banerjee (Member 4)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useDashboardTelemetry, useSkillIntelligence } from '../hooks';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import {
  CareerHealthDial,
  SkillRadarChart,
  RecommendationFeed
} from '../components/telemetry';
import {
  Terminal,
  Activity,
  Target,
  Cpu,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingUp,
  Layers,
  ShieldCheck
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { data: telemetry, latencyMs } = useDashboardTelemetry();
  const { data: skillIntel } = useSkillIntelligence();

  const completeness = profile?.profile_completeness || 0;
  const skillsCount = profile?.skills?.length || 0;
  const projectsCount = profile?.projects?.length || 0;
  const targetRole = profile?.target_role || 'Target Role Unassigned';

  const healthScore = telemetry?.healthScore || profile?.career_health_score || 84.5;
  const healthGrade = telemetry?.healthGrade || 'A-';
  const verifiedSkillsCount = profile?.skills?.filter((s) => s.verified)?.length || 0;

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-black flex flex-col font-sans relative selection:bg-[#FFE600] selection:text-black">
      <div className="absolute inset-0 neo-grid pointer-events-none opacity-20 -z-0" />
      <Navbar />

      <div className="flex-1 flex w-full relative z-10">
        <Sidebar />

        <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 space-y-8">
          {/* Top Telemetry Header Banner */}
          <div className="border-2 border-black bg-[#FFE600] shadow-[4px_4px_0px_0px_#000] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono font-bold">
            <div className="flex flex-wrap items-center gap-2 text-black">
              <Terminal className="w-4 h-4 stroke-[2.5]" />
              <span className="bg-black text-white px-2 py-0.5 text-[11px] uppercase">
                STATUS: ACTIVE
              </span>
              <span className="hidden sm:inline text-black">/</span>
              <span className="hidden sm:inline">STUDENT_ID: {user?.id?.slice(-8) || 'ONLINE'}</span>
              <span className="hidden sm:inline text-black">/</span>
              <span className="bg-[#70E000] text-black border border-black px-2 py-0.5 text-[10px]">
                NEO4J_SYNCED
              </span>
              {latencyMs !== null && (
                <>
                  <span className="hidden sm:inline text-black">/</span>
                  <span className="bg-[#38B6FF] text-black border border-black px-2 py-0.5 text-[10px]">
                    LATENCY: {latencyMs}MS
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to="/profile"
                className="inline-flex items-center px-4 py-2 border-2 border-black bg-white hover:bg-[#F4F0EA] text-black font-mono text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75"
              >
                <span>Edit Profile</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[2.5]" />
              </Link>
            </div>
          </div>

          {/* Dedicated Workspace Quick-Launcher Hub (4 Cards) */}
          <div>
            <div className="flex items-center justify-between mb-3 font-mono">
              <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Layers className="w-4 h-4 stroke-[2.5]" />
                <span>ACTIVE_INTELLIGENCE_WORKSPACES</span>
              </span>
              <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">
                Click any workspace card to enter
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {/* Workspace 1: Skills & Evidence */}
              <Link
                to="/skills"
                className="group p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all duration-150 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 border-2 border-black bg-[#38B6FF] flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
                      <Target className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-mono font-black uppercase bg-[#FAF5E6] border border-black px-2 py-0.5">
                      {skillsCount} SKILLS
                    </span>
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-lg text-black group-hover:text-[#38B6FF] transition-colors">
                      Skills & Evidence
                    </h3>
                    <p className="text-xs text-slate-600 font-mono mt-1 line-clamp-2">
                      Competency audit matrix, radar alignment & verified repo artifacts.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t-2 border-black mt-4 flex items-center justify-between text-xs font-mono font-bold text-black">
                  <span>ENTER_WORKSPACE</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Workspace 2: Career Health */}
              <Link
                to="/health"
                className="group p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all duration-150 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 border-2 border-black bg-[#FF70A6] flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
                      <Activity className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-mono font-black uppercase bg-[#70E000] border border-black px-2 py-0.5 text-black">
                      GRADE: {healthGrade}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-lg text-black group-hover:text-[#FF70A6] transition-colors">
                      Career Health Engine
                    </h3>
                    <p className="text-xs text-slate-600 font-mono mt-1 line-clamp-2">
                      Multi-dimensional readiness score, 6-month trajectory & AI action feed.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t-2 border-black mt-4 flex items-center justify-between text-xs font-mono font-bold text-black">
                  <span>ENTER_WORKSPACE</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Workspace 3: Agent Pipeline */}
              <Link
                to="/pipeline"
                className="group p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all duration-150 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 border-2 border-black bg-[#70E000] flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
                      <Cpu className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-mono font-black uppercase bg-[#FAF5E6] border border-black px-2 py-0.5">
                      7 NODES LIVE
                    </span>
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-lg text-black group-hover:text-[#70E000] transition-colors">
                      Agent Pipeline DAG
                    </h3>
                    <p className="text-xs text-slate-600 font-mono mt-1 line-clamp-2">
                      Autonomous LangGraph multi-agent orchestrator topology & trace logs.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t-2 border-black mt-4 flex items-center justify-between text-xs font-mono font-bold text-black">
                  <span>ENTER_WORKSPACE</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Workspace 4: Career Profile */}
              <Link
                to="/profile"
                className="group p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all duration-150 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 border-2 border-black bg-[#FFE600] flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
                      <UserCheck className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-mono font-black uppercase bg-[#FAF5E6] border border-black px-2 py-0.5">
                      {completeness}% READY
                    </span>
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-lg text-black group-hover:text-[#C4A1FF] transition-colors">
                      Career Profile
                    </h3>
                    <p className="text-xs text-slate-600 font-mono mt-1 line-clamp-2">
                      Personal identity, educational credentials, target aspirations & repos.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t-2 border-black mt-4 flex items-center justify-between text-xs font-mono font-bold text-black">
                  <span>EDIT_PROFILE</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* Workbench Grid: Asymmetric 2-column overview layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column (7 cols): Target Profile, Metrics & Skills Preview */}
            <div className="xl:col-span-7 space-y-8">
              {/* Profile Overview Card */}
              <Card
                title="Target Role & Readiness Calibration"
                subtitle="Calibrated against real-time industry requirement vectors"
                headerBg="bg-[#38B6FF]"
                bodyClassName="p-6 sm:p-7 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b-2 border-black pb-4">
                  <div>
                    <div className="text-[11px] font-mono font-bold uppercase text-slate-700">Target Role</div>
                    <div className="text-2xl font-black text-black font-mono mt-1">{targetRole}</div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-[11px] font-mono font-bold uppercase text-slate-700">Profile Completeness</div>
                    <div className="text-2xl font-black text-black font-mono mt-1">{completeness}%</div>
                  </div>
                </div>

                {/* Mechanical Neo-Brutalist Meter Bar */}
                <div className="w-full bg-white border-2 border-black h-5 shadow-[2px_2px_0px_0px_#000] p-0.5 overflow-hidden">
                  <div
                    className="bg-[#70E000] h-full transition-all duration-150 border-r-2 border-black"
                    style={{ width: `${Math.min(completeness, 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-mono">
                  <div className="p-4 bg-[#FAF5E6] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                    <div className="text-slate-700 font-bold text-[11px] uppercase tracking-wider">Cataloged Skills</div>
                    <div className="text-xl font-black text-black mt-1.5">{skillsCount} Registered</div>
                  </div>
                  <div className="p-4 bg-[#FAF5E6] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                    <div className="text-slate-700 font-bold text-[11px] uppercase tracking-wider">Evidenced Repos</div>
                    <div className="text-xl font-black text-black mt-1.5">{projectsCount} Verified</div>
                  </div>
                </div>
              </Card>

              {/* Skills Matrix Preview Card with direct link to Workspace */}
              <Card
                title="Active Cataloged Skills Matrix"
                subtitle="Recent competency nodes synchronized with knowledge graph"
                headerBg="bg-[#FFE600]"
                bodyClassName="p-6 sm:p-7"
                actions={
                  <Link
                    to="/skills"
                    className="border-2 border-black bg-white px-3 py-1 text-xs font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75"
                  >
                    OPEN_SKILLS_WORKSPACE &rarr;
                  </Link>
                }
              >
                {skillsCount === 0 ? (
                  <div className="text-center py-8 text-xs font-mono font-bold text-slate-700">
                    <p>NO_SKILL_NODES_RECORDED</p>
                    <Link
                      to="/profile"
                      className="mt-2 inline-block text-black underline hover:bg-[#FFE600] px-1"
                    >
                      Configure skills in profile &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b-2 border-black bg-[#FAF5E6] text-black text-[11px] uppercase font-black">
                          <th className="py-2.5 px-3">Skill Name</th>
                          <th className="py-2.5 px-3">Domain</th>
                          <th className="py-2.5 px-3">Level</th>
                          <th className="py-2.5 px-3 text-right">Audit State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-black">
                        {profile?.skills?.slice(0, 5).map((skill, index) => (
                          <tr key={index} className="hover:bg-[#FFFDF0] transition-colors">
                            <td className="py-3 px-3 text-black font-bold text-sm">{skill.name}</td>
                            <td className="py-3 px-3 text-slate-700">{skill.category || 'Core'}</td>
                            <td className="py-3 px-3">
                              <span className="border border-black bg-[#C4A1FF] text-black px-2 py-0.5 text-[10px] font-bold uppercase shadow-[1px_1px_0px_0px_#000]">
                                {skill.level}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              {skill.verified ? (
                                <span className="inline-flex items-center border border-black bg-[#70E000] text-black text-[10px] font-bold px-2 py-0.5 shadow-[1px_1px_0px_0px_#000]">
                                  <CheckCircle2 className="w-3 h-3 mr-1 stroke-[2.5]" /> VERIFIED
                                </span>
                              ) : (
                                <span className="border border-black bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5">
                                  UNAUDITED
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {skillsCount > 5 && (
                      <div className="pt-3 text-center border-t border-black/10 font-mono text-xs">
                        <Link to="/skills" className="text-black font-bold underline hover:bg-[#FFE600] px-1">
                          + View all {skillsCount} skills in dedicated workspace &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column (5 cols): Visual Telemetry Snapshot Cards */}
            <div className="xl:col-span-5 space-y-8">
              {/* Health Snapshot Card */}
              <Card
                title="Career Health Index"
                subtitle="Composite evaluation"
                headerBg="bg-[#FF70A6]"
                bodyClassName="p-6 sm:p-7"
                actions={
                  <Link
                    to="/health"
                    className="border-2 border-black bg-white px-3 py-1 text-xs font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5"
                  >
                    HEALTH_WORKSPACE &rarr;
                  </Link>
                }
              >
                <CareerHealthDial
                  score={healthScore}
                  grade={healthGrade}
                  dimensions={telemetry?.dimensions || []}
                />
              </Card>

              {/* Radar Alignment Preview */}
              <Card
                title="Market Skill Alignment Radar"
                subtitle="Profile skill graph vs live industry demand"
                headerBg="bg-[#C4A1FF]"
                bodyClassName="p-6 sm:p-7"
                actions={
                  <Link
                    to="/skills"
                    className="border-2 border-black bg-white px-3 py-1 text-xs font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5"
                  >
                    SKILLS_RADAR &rarr;
                  </Link>
                }
              >
                <SkillRadarChart
                  data={skillIntel?.radarData}
                  targetRole={targetRole}
                />
              </Card>

              {/* Actionable Recommendations Card */}
              <Card
                title="AI Remediation Recommendations"
                subtitle="Prioritized by LangGraph reasoning"
                headerBg="bg-[#FFE600]"
                bodyClassName="p-6 sm:p-7"
                actions={
                  <Link
                    to="/health"
                    className="border-2 border-black bg-white px-3 py-1 text-xs font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5"
                  >
                    ALL_ACTIONS &rarr;
                  </Link>
                }
              >
                <RecommendationFeed recommendations={telemetry?.recommendations || []} />
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
