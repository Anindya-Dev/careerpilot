/**
 * @file DashboardPage.jsx
 * @description Neo-Brutalist authenticated student executive dashboard.
 * Perfectly balanced 2-column responsive grid layout eliminating all empty/dead space:
 * - Row 1: Target Role & Readiness (Left) + Career Health Dial (Right)
 * - Row 2: Skills Competency Matrix (Left) + Market Alignment Radar (Right)
 * - Row 3: 6-Month Trajectory Projection (Left) + AI Recommendations (Right)
 * All sections link cleanly into their dedicated full workspaces.
 * @author Md Hussain Ansari (Member 1) & Sargam Banerjee (Member 4)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useDashboardTelemetry, useSkillIntelligence } from '../hooks';
import { buildLiveRadarData } from '../utils/skillBenchmark';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import {
  CareerHealthDial,
  SkillRadarChart,
  HealthTrendChart,
  RecommendationFeed
} from '../components/telemetry';
import {
  CheckCircle2,
  ArrowRight,
  Target,
  Activity,
  TrendingUp,
  Sparkles,
  UserCheck
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

  const isFreshProfile = !user?.isDemoSession && skillsCount === 0 && !profile?.target_role;
  const healthScore = isFreshProfile ? 0 : (profile?.career_health_score || telemetry?.healthScore || 0);
  const healthGrade = isFreshProfile ? 'N/A' : (telemetry?.healthGrade || 'B+');
  const dimensions = isFreshProfile
    ? [
        { name: 'Skill Alignment', score: 0, status: 'Pending' },
        { name: 'Evidence & Code', score: 0, status: 'Pending' },
        { name: 'Market Readiness', score: 0, status: 'Pending' },
        { name: 'Goal Alignment', score: 0, status: 'Pending' },
        { name: 'Interview Prep', score: 0, status: 'Pending' }
      ]
    : (telemetry?.dimensions || []);
  const recommendations = isFreshProfile
    ? [
        {
          id: 1,
          title: 'Initialize Your Career Profile',
          description: 'Add your target role, technical skills, and GitHub projects in Career Profile to unlock live AI scoring.',
          priority: 'high'
        }
      ]
    : (telemetry?.recommendations || []);
  const trendHistory = isFreshProfile ? [] : telemetry?.trendHistory;
  const radarData = user?.isDemoSession
    ? skillIntel?.radarData
    : buildLiveRadarData(profile?.skills || [], targetRole);

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-black flex flex-col font-sans relative selection:bg-[#FFE600] selection:text-black">
      <div className="absolute inset-0 neo-grid pointer-events-none opacity-20 -z-0" />
      <Navbar />

      <div className="flex-1 flex w-full relative z-10">
        <Sidebar />

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 min-w-0 p-5 sm:p-7 lg:p-8 space-y-6"
        >
          {isFreshProfile && (
            <div className="border-2 border-black bg-[#FFE600] shadow-[4px_4px_0px_0px_#000] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="font-mono">
                <div className="text-xs font-black uppercase text-black">
                  WELCOME TO CAREERPILOT — INITIALIZE YOUR REAL PROFILE
                </div>
                <p className="text-xs font-bold text-black/80 mt-1">
                  Upload your resume to auto-extract skills, connect your GitHub to audit repositories, and link LeetCode for DSA diagnostics.
                </p>
              </div>
              <Link
                to="/profile"
                className="inline-flex items-center justify-center px-4 py-2.5 border-2 border-black bg-[#70E000] hover:bg-[#85FF0A] text-black font-mono text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 transition-all shrink-0"
              >
                <span>Setup Resume, GitHub & LeetCode</span>
                <ArrowRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
              </Link>
            </div>
          )}

          {/* 2 Independent Column Stacks: Prevents CSS Grid Row-Height Stretching */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            
            {/* ======================================================== */}
            {/* LEFT COLUMN STACK                                        */}
            {/* ======================================================== */}
            <div className="space-y-6 lg:space-y-8">
              {/* Card 1: Target Role & Readiness Index Calibration */}
              <Card
                title="Target Role & Readiness Calibration"
                subtitle="Calibrated against real-time industry requirement vectors"
                headerBg="bg-[#38B6FF]"
                bodyClassName="p-6 space-y-5"
                actions={
                  <Link
                    to="/profile"
                    className="inline-flex items-center px-3 py-1 border-2 border-black bg-white hover:bg-[#FAF5E6] text-black font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <span>PROFILE</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
                  </Link>
                }
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
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-600 uppercase">
                    <span>Readiness Calibration</span>
                    <span>{completeness}% Calibrated</span>
                  </div>
                  <div className="w-full bg-white border-2 border-black h-5 shadow-[2px_2px_0px_0px_#000] p-0.5 overflow-hidden">
                    <div
                      className="bg-[#70E000] h-full transition-all duration-300 border-r-2 border-black"
                      style={{ width: `${Math.min(completeness, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1 text-xs font-mono">
                  <div className="p-3.5 bg-[#FAF5E6] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                    <div className="text-slate-700 font-bold text-[10px] uppercase tracking-wider">Cataloged Skills</div>
                    <div className="text-xl font-black text-black mt-1">{skillsCount} Registered</div>
                  </div>
                  <div className="p-3.5 bg-[#FAF5E6] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                    <div className="text-slate-700 font-bold text-[10px] uppercase tracking-wider">Evidenced Repos</div>
                    <div className="text-xl font-black text-black mt-1">{projectsCount} Verified</div>
                  </div>
                </div>
              </Card>

              {/* Card 2: Active Skills Matrix Table Preview (Stacks directly below Card 1) */}
              <Card
                title="Active Skills Matrix"
                subtitle="Competency nodes synced with knowledge graph"
                headerBg="bg-[#FFE600]"
                bodyClassName="p-6"
                actions={
                  <Link
                    to="/skills"
                    className="inline-flex items-center px-3 py-1 border-2 border-black bg-white hover:bg-[#FAF5E6] text-black font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <span>ALL_SKILLS</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
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
                  <div className="overflow-x-auto border-2 border-black">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b-2 border-black bg-[#FAF5E6] text-black text-[11px] uppercase font-black">
                          <th className="py-2 px-3">Skill Node</th>
                          <th className="py-2 px-3">Domain</th>
                          <th className="py-2 px-3">Level</th>
                          <th className="py-2 px-3 text-right">Audit State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-black bg-white">
                        {profile?.skills?.slice(0, 5).map((skill, index) => (
                          <tr key={index} className="hover:bg-[#FFFDF0] transition-colors">
                            <td className="py-2.5 px-3 text-black font-bold text-sm">{skill.name}</td>
                            <td className="py-2.5 px-3 text-slate-700">{skill.category || 'Core'}</td>
                            <td className="py-2.5 px-3">
                              <span className="border border-black bg-[#C4A1FF] text-black px-1.5 py-0.5 text-[10px] font-bold uppercase shadow-[1px_1px_0px_0px_#000]">
                                {skill.level}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {skill.verified ? (
                                <span className="inline-flex items-center border border-black bg-[#70E000] text-black text-[10px] font-bold px-1.5 py-0.5 shadow-[1px_1px_0px_0px_#000]">
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

              {/* Card 3: 6-Month Trajectory Projection Chart */}
              <Card
                title="6-Month Career Health Trajectory"
                subtitle="Historical trend and predictive model based on commits"
                headerBg="bg-[#38B6FF]"
                bodyClassName="p-6"
                actions={
                  <Link
                    to="/health"
                    className="inline-flex items-center px-3 py-1 border-2 border-black bg-white hover:bg-[#FAF5E6] text-black font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <span>TRAJECTORY</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
                  </Link>
                }
              >
                <HealthTrendChart history={trendHistory} />
              </Card>
            </div>

            {/* ======================================================== */}
            {/* RIGHT COLUMN STACK                                       */}
            {/* ======================================================== */}
            <div className="space-y-6 lg:space-y-8">
              {/* Card 4: Career Health Dial Composite Evaluation */}
              <Card
                title="Career Health Index"
                subtitle="Composite evaluation computed across 5 audit dimensions"
                headerBg="bg-[#FF70A6]"
                bodyClassName="p-6"
                actions={
                  <Link
                    to="/health"
                    className="inline-flex items-center px-3 py-1 border-2 border-black bg-white hover:bg-[#FAF5E6] text-black font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <span>FULL_HEALTH</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
                  </Link>
                }
              >
                <CareerHealthDial
                  score={healthScore}
                  grade={healthGrade}
                  dimensions={dimensions}
                />
              </Card>

              {/* Card 5: Market Skill Alignment Radar Chart */}
              <Card
                title="Market Skill Alignment Radar"
                subtitle="Profile skill graph vs live industry demand vectors"
                headerBg="bg-[#C4A1FF]"
                bodyClassName="p-6"
                actions={
                  <Link
                    to="/skills"
                    className="inline-flex items-center px-3 py-1 border-2 border-black bg-white hover:bg-[#FAF5E6] text-black font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <span>RADAR_DETAIL</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
                  </Link>
                }
              >
                <SkillRadarChart
                  data={radarData}
                  targetRole={targetRole}
                />
              </Card>

              {/* Card 6: AI Remediation Recommendations */}
              <Card
                title="AI Remediation Recommendations"
                subtitle="High-leverage action items prioritized by LangGraph"
                headerBg="bg-[#FFE600]"
                bodyClassName="p-6"
                actions={
                  <Link
                    to="/health"
                    className="inline-flex items-center px-3 py-1 border-2 border-black bg-white hover:bg-[#FAF5E6] text-black font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <span>ACTIONS</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
                  </Link>
                }
              >
                <RecommendationFeed recommendations={recommendations} />
              </Card>
            </div>

          </div>
        </motion.main>
      </div>
    </div>
  );
}
