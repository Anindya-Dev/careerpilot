/**
 * @file DashboardPage.jsx
 * @description Neo-Brutalist authenticated student intelligence dashboard.
 * Generous full-width layout, balanced spacing, clear section anchors (#overview, #skills, #health, #pipeline),
 * and dedicated integration slots for Member 4 (Sargam)'s data visualizations (CareerHealthDial & SkillRadarChart).
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import {
  Terminal,
  Activity,
  Layers,
  CheckCircle2,
  ArrowRight,
  Target,
  FileCode2,
  Database,
  Cpu
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();

  const completeness = profile?.profile_completeness || 0;
  const skillsCount = profile?.skills?.length || 0;
  const projectsCount = profile?.projects?.length || 0;
  const targetRole = profile?.target_role || 'Target Role Unassigned';

  // Scroll to hash element if navigated with hash
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    }
  }, [location.hash, location.pathname]);

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-black flex flex-col font-sans relative selection:bg-[#FFE600] selection:text-black">
      {/* Neo-brutalist dot grid */}
      <div className="absolute inset-0 neo-grid pointer-events-none opacity-20 -z-0" />

      {/* Top Navbar */}
      <Navbar />

      {/* Full-width responsive workspace container */}
      <div className="flex-1 flex w-full relative z-10">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Dashboard Workspace */}
        <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 space-y-8">
          {/* Top Telemetry Header Banner */}
          <div
            id="overview"
            className="scroll-mt-24 border-2 border-black bg-[#FFE600] shadow-[4px_4px_0px_0px_#000] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono font-bold"
          >
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

          {/* Workbench Grid: Spacious Asymmetric 2-column layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column (7 cols): Target Profile, Metrics & Skills Matrix */}
            <div className="xl:col-span-7 space-y-8">
              {/* Profile Overview Card */}
              <Card
                title="Target Role & Readiness Index"
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

              {/* Skills Matrix Table Anchor */}
              <div id="skills" className="scroll-mt-24">
                <Card
                  title="Active Cataloged Skills Matrix"
                  subtitle="Knowledge Graph synced skill nodes with evidence audit state"
                  headerBg="bg-[#FFE600]"
                  bodyClassName="p-6 sm:p-7"
                  actions={
                    <Link
                      to="/profile"
                      className="border-2 border-black bg-white px-3 py-1 text-xs font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75"
                    >
                      + ADD_SKILL
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
                            <th className="py-3 px-3">Skill Name</th>
                            <th className="py-3 px-3">Domain</th>
                            <th className="py-3 px-3">Level</th>
                            <th className="py-3 px-3 text-right">Audit State</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black">
                          {profile?.skills?.map((skill, index) => (
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
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Right Column (5 cols): SARGAM (MEMBER 4) DATA VISUALIZATION MODULES & AGENT PIPELINE */}
            <div className="xl:col-span-5 space-y-8">
              {/* Module A: Career Health Composite Index */}
              <div id="health" className="scroll-mt-24">
                <Card
                  title="Career Health Index"
                  subtitle="Autonomous Agent DAG composite evaluation"
                  headerBg="bg-[#FF70A6]"
                  bodyClassName="p-6 sm:p-7"
                >
                  {/* ========================================================================= */}
                  {/* SARGAM (MEMBER 4) COMPONENT INTEGRATION SLOT: CareerHealthDial            */}
                  {/* ========================================================================= */}
                  <div className="p-8 flex flex-col items-center justify-center text-center border-2 border-black bg-[#FAF5E6] shadow-[4px_4px_0px_0px_#000] min-h-[220px]">
                    <div className="w-14 h-14 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center mb-4">
                      <Activity className="w-7 h-7 text-black stroke-[2.5]" />
                    </div>
                    <div className="text-5xl font-black font-mono text-black tracking-tight">
                      {profile?.career_health_score || '84.5'}
                      <span className="text-lg font-bold text-slate-700 font-mono"> / 100</span>
                    </div>
                    <div className="mt-3 text-[11px] font-mono font-black border-2 border-black bg-[#C4A1FF] text-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
                      SLOT: SARGAM_CAREER_HEALTH_DIAL
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-700 mt-3 max-w-xs leading-relaxed">
                      Evaluated by Career Health Agent. Visualized by Member 4 (Sargam).
                    </p>
                  </div>
                </Card>
              </div>

              {/* Module B: Market Skill Alignment Radar */}
              <div id="radar" className="scroll-mt-24">
                <Card
                  title="Market Skill Alignment"
                  subtitle="Profile skill graph vs live industry demand"
                  headerBg="bg-[#C4A1FF]"
                  bodyClassName="p-6 sm:p-7"
                >
                  {/* ========================================================================= */}
                  {/* SARGAM (MEMBER 4) COMPONENT INTEGRATION SLOT: SkillRadarChart             */}
                  {/* ========================================================================= */}
                  <div className="p-8 flex flex-col items-center justify-center text-center border-2 border-black bg-[#FAF5E6] shadow-[4px_4px_0px_0px_#000] min-h-[240px]">
                    <div className="w-14 h-14 bg-[#70E000] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center mb-4">
                      <Layers className="w-7 h-7 text-black stroke-[2.5]" />
                    </div>
                    <div className="text-sm font-mono font-black uppercase text-black">
                      Radar Chart Canvas Slot
                    </div>
                    <div className="mt-2 text-[11px] font-mono font-black border-2 border-black bg-[#FFE600] text-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
                      SLOT: SARGAM_SKILL_RADAR_VIZ
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-700 mt-3 max-w-sm leading-relaxed">
                      Container reserved for Member 4's Chart.js / Recharts radar graph. Synchronized with target role skill vectors.
                    </p>
                  </div>
                </Card>
              </div>

              {/* Module C: Agent Pipeline DAG Telemetry */}
              <div id="pipeline" className="scroll-mt-24">
                <Card
                  title="Agent Pipeline Execution Status"
                  subtitle="LangGraph DAG telemetry across 7 autonomous agent nodes"
                  headerBg="bg-[#70E000]"
                  bodyClassName="p-6 sm:p-7"
                >
                  <div className="bg-[#FAF5E6] border-2 border-black shadow-[3px_3px_0px_0px_#000] p-4 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-black text-black">
                      <span className="font-bold flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 stroke-[2.5]" />
                        <span>LANGGRAPH_DAG_STATE</span>
                      </span>
                      <span className="bg-[#70E000] border border-black text-black px-2 py-0.5 text-[10px] font-black shadow-[1px_1px_0px_0px_#000]">
                        7 NODES ACTIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {[
                        { node: '01. Ingestion Agent', desc: 'GitHub Repository Parser', status: 'COMPLETED', color: 'bg-[#70E000]' },
                        { node: '02. Evidence Agent', desc: 'Codebase AST & Test Coverage', status: 'VERIFIED', color: 'bg-[#70E000]' },
                        { node: '03. Market Agent', desc: 'Neo4j Cypher Skill Vectors', status: 'SYNCED', color: 'bg-[#38B6FF]' },
                        { node: '04. Skill Gap Agent', desc: 'Missing Vector Delta Engine', status: 'ACTIVE', color: 'bg-[#FFE600]' },
                        { node: '05. Health Agent', desc: 'Readiness Index Calculator', status: 'COMPUTED', color: 'bg-[#FF70A6]' },
                        { node: '06. Roadmap Agent', desc: 'Target Role Remediation Plan', status: 'ONLINE', color: 'bg-[#C4A1FF]' },
                        { node: '07. Reporting Agent', desc: 'Student Telemetry Digest', status: 'READY', color: 'bg-[#70E000]' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-black text-[11px] shadow-[1px_1px_0px_0px_#000]">
                          <div>
                            <span className="font-black text-black">{item.node}</span>
                            <span className="text-slate-600 ml-2 hidden sm:inline text-[10px]">({item.desc})</span>
                          </div>
                          <span className={`px-2 py-0.5 border border-black text-[9px] font-black ${item.color} text-black`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
