/**
 * @file DashboardPage.jsx
 * @description Neo-Brutalist authenticated student intelligence dashboard.
 * Bold high-contrast framing, thick black borders, hard drop-shadows,
 * vibrant status panels, and dedicated integration slots for Member 4 (Sargam)'s
 * data visualizations (CareerHealthDial & SkillRadarChart).
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
  Terminal,
  Activity,
  Layers,
  CheckCircle2,
  ArrowRight,
  Target,
  FileCode2,
  Database
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const completeness = profile?.profile_completeness || 0;
  const skillsCount = profile?.skills?.length || 0;
  const projectsCount = profile?.projects?.length || 0;
  const targetRole = profile?.target_role || 'Target Role Unassigned';

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-black flex flex-col font-sans relative selection:bg-[#FFE600] selection:text-black">
      {/* Neo-brutalist dot grid */}
      <div className="absolute inset-0 neo-grid pointer-events-none opacity-20 -z-0" />

      {/* Top Navbar */}
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Dashboard Space */}
        <main className="flex-1 p-5 sm:p-7 space-y-6">
          {/* Top Telemetry Header Banner */}
          <div className="border-2 border-black bg-[#FFE600] shadow-[4px_4px_0px_0px_#000] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono font-bold">
            <div className="flex items-center space-x-2 text-black">
              <Terminal className="w-4 h-4 stroke-[2.5]" />
              <span className="bg-black text-white px-1.5 py-0.5 text-[11px] uppercase">
                STATUS: ACTIVE
              </span>
              <span className="hidden md:inline text-black">/</span>
              <span className="hidden md:inline">STUDENT_ID: {user?.id?.slice(-8) || 'ONLINE'}</span>
              <span className="hidden md:inline text-black">/</span>
              <span className="bg-[#70E000] text-black border border-black px-1.5 py-0.5 text-[10px]">
                NEO4J_SYNCED
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to="/profile"
                className="inline-flex items-center px-3.5 py-1.5 border-2 border-black bg-white hover:bg-[#F4F0EA] text-black font-mono text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75"
              >
                <span>Edit Profile</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[2.5]" />
              </Link>
            </div>
          </div>

          {/* Workbench Grid: Asymmetric 2-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Target Profile, Metrics & Skills Matrix */}
            <div className="lg:col-span-7 space-y-6">
              {/* Profile Overview Card */}
              <Card
                title="Target Role & Readiness Index"
                subtitle="Calibrated against real-time industry requirement vectors"
                headerBg="bg-[#38B6FF]"
              >
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b-2 border-black pb-3">
                    <div>
                      <div className="text-[11px] font-mono font-bold uppercase text-slate-700">Target Role</div>
                      <div className="text-xl font-black text-black font-mono mt-0.5">{targetRole}</div>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-[11px] font-mono font-bold uppercase text-slate-700">Profile Completeness</div>
                      <div className="text-xl font-black text-black font-mono mt-0.5">{completeness}%</div>
                    </div>
                  </div>

                  {/* Mechanical Neo-Brutalist Meter Bar */}
                  <div className="w-full bg-white border-2 border-black h-4 shadow-[2px_2px_0px_0px_#000] p-0.5 overflow-hidden">
                    <div
                      className="bg-[#70E000] h-full transition-all duration-150 border-r-2 border-black"
                      style={{ width: `${Math.min(completeness, 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 bg-[#FAF5E6] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                      <div className="text-black font-bold text-[10px] uppercase">Cataloged Skills</div>
                      <div className="text-base font-black text-black mt-1">{skillsCount} Registered</div>
                    </div>
                    <div className="p-3 bg-[#FAF5E6] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                      <div className="text-black font-bold text-[10px] uppercase">Evidenced Repos</div>
                      <div className="text-base font-black text-black mt-1">{projectsCount} Verified</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Skills Matrix Table */}
              <Card
                title="Active Cataloged Skills Matrix"
                subtitle="Knowledge Graph synced skill nodes with evidence audit state"
                headerBg="bg-[#FFE600]"
                actions={
                  <Link
                    to="/profile"
                    className="border-2 border-black bg-white px-2 py-0.5 text-xs font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75"
                  >
                    + ADD_SKILL
                  </Link>
                }
              >
                {skillsCount === 0 ? (
                  <div className="text-center py-6 text-xs font-mono font-bold text-slate-700">
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
                        <tr className="border-b-2 border-black bg-[#FAF5E6] text-black text-[10px] uppercase font-black">
                          <th className="py-2 px-2">Skill Name</th>
                          <th className="py-2 px-2">Domain</th>
                          <th className="py-2 px-2">Level</th>
                          <th className="py-2 px-2 text-right">Audit State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-black">
                        {profile?.skills?.map((skill, index) => (
                          <tr key={index} className="hover:bg-[#FFFDF0]">
                            <td className="py-2.5 px-2 text-black font-bold">{skill.name}</td>
                            <td className="py-2.5 px-2 text-slate-700">{skill.category || 'Core'}</td>
                            <td className="py-2.5 px-2">
                              <span className="border border-black bg-[#C4A1FF] text-black px-1.5 py-0.5 text-[10px] font-bold uppercase">
                                {skill.level}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              {skill.verified ? (
                                <span className="inline-flex items-center border border-black bg-[#70E000] text-black text-[10px] font-bold px-1.5 py-0.5">
                                  <CheckCircle2 className="w-3 h-3 mr-1 stroke-[2.5]" /> VERIFIED
                                </span>
                              ) : (
                                <span className="border border-black bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.5">
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

            {/* Right Column (5 cols): SARGAM (MEMBER 4) DATA VISUALIZATION MODULES */}
            <div className="lg:col-span-5 space-y-6">
              {/* Module A: Career Health Composite Index */}
              <Card
                title="Career Health Index"
                subtitle="Autonomous Agent DAG composite evaluation"
                headerBg="bg-[#FF70A6]"
              >
                {/* ========================================================================= */}
                {/* SARGAM (MEMBER 4) COMPONENT INTEGRATION SLOT: CareerHealthDial            */}
                {/* ========================================================================= */}
                <div className="p-6 flex flex-col items-center justify-center text-center border-2 border-black bg-[#FAF5E6] shadow-[3px_3px_0px_0px_#000] min-h-[190px]">
                  <div className="w-12 h-12 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center mb-3">
                    <Activity className="w-6 h-6 text-black stroke-[2.5]" />
                  </div>
                  <div className="text-4xl font-black font-mono text-black tracking-tight">
                    {profile?.career_health_score || '78.5'}
                    <span className="text-base font-bold text-slate-700 font-mono"> / 100</span>
                  </div>
                  <div className="mt-2 text-[10px] font-mono font-black border-2 border-black bg-[#C4A1FF] text-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000]">
                    SLOT: SARGAM_CAREER_HEALTH_DIAL
                  </div>
                  <p className="text-[11px] font-mono font-bold text-slate-700 mt-2 max-w-[220px]">
                    Evaluated by Career Health Agent. Visualized by Member 4 (Sargam).
                  </p>
                </div>
              </Card>

              {/* Module B: Market Skill Alignment Radar */}
              <Card
                title="Market Skill Alignment"
                subtitle="Profile skill graph vs live industry demand"
                headerBg="bg-[#C4A1FF]"
              >
                {/* ========================================================================= */}
                {/* SARGAM (MEMBER 4) COMPONENT INTEGRATION SLOT: SkillRadarChart             */}
                {/* ========================================================================= */}
                <div className="p-6 flex flex-col items-center justify-center text-center border-2 border-black bg-[#FAF5E6] shadow-[3px_3px_0px_0px_#000] min-h-[220px]">
                  <div className="w-12 h-12 bg-[#70E000] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center mb-3">
                    <Layers className="w-6 h-6 text-black stroke-[2.5]" />
                  </div>
                  <div className="text-xs font-mono font-black uppercase text-black">
                    Radar Chart Canvas Slot
                  </div>
                  <div className="mt-1.5 text-[10px] font-mono font-black border-2 border-black bg-[#FFE600] text-black px-2.5 py-0.5 shadow-[1px_1px_0px_0px_#000]">
                    SLOT: SARGAM_SKILL_RADAR_VIZ
                  </div>
                  <p className="text-[11px] font-mono font-bold text-slate-700 mt-2 max-w-xs leading-relaxed">
                    Container reserved for Member 4's Chart.js / Recharts radar graph.
                    Synchronized with target role skill vectors.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
