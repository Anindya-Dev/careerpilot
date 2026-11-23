/**
 * @file DashboardPage.jsx
 * @description Authenticated client shell displaying user greetings, profile summary,
 * and live agent telemetry integration (Career Health Dial, Skill Radar Chart,
 * 6-Month Trajectory, Agent Status Roster, and Actionable AI Recommendations).
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
import Button from '../components/Button';
import {
  CareerHealthDial,
  SkillRadarChart,
  HealthTrendChart,
  AgentStatusList,
  RecommendationFeed,
  TelemetryStream
} from '../components/telemetry';
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
  Cpu,
  Zap,
  Radio
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { data: telemetry, isLoading: isTelemetryLoading, latencyMs } = useDashboardTelemetry();
  const { data: skillIntel } = useSkillIntelligence();

  const completeness = profile?.profile_completeness || 0;
  const skillsCount = profile?.skills?.length || 0;
  const projectsCount = profile?.projects?.length || 0;
  const targetRole = profile?.target_role || 'Role not selected';

  const healthScore = telemetry?.healthScore || profile?.career_health_score || 78.5;
  const healthGrade = telemetry?.healthGrade || 'B+';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-100 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>Phase 1 Verified Environment</span>
                {latencyMs !== null && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-[10px] text-emerald-200">
                    {latencyMs}ms telemetry
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome, {user?.name}!
              </h1>
              <p className="text-indigo-100 text-sm mt-1 max-w-xl">
                Your Career Intelligence platform is active. Connect your skills and evidence to initiate
                autonomous multi-agent evaluations.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link to="/profile">
                <Button variant="secondary" size="md" className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold">
                  Manage Profile
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-indigo-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Target Role</div>
                  <div className="text-sm font-bold text-slate-800 truncate max-w-[150px]">
                    {targetRole}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-indigo-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Profile Completeness</div>
                  <div className="text-sm font-bold text-slate-800">{completeness}%</div>
                </div>
              </div>
            </Card>

            <Card className="border-indigo-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Cataloged Skills</div>
                  <div className="text-sm font-bold text-slate-800">{skillsCount} Registered</div>
                </div>
              </div>
            </Card>

            <Card className="border-indigo-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Linked Projects</div>
                  <div className="text-sm font-bold text-slate-800">{projectsCount} Projects</div>
                </div>
              </div>
            </Card>
          </div>

          {/* ========================================================================= */}
          {/* SARGAM (MEMBER 4) COMPONENT INTEGRATION SLOTS                             */}
          {/* Live Career Health Dial & Market Skill Alignment Radar Chart              */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Slot A: Career Health Score & Dial (Member 4 - Sargam) */}
            <div className="lg:col-span-1">
              <Card
                title="Career Health Index"
                subtitle="Aggregated composite score"
                className="h-full"
              >
                <CareerHealthDial
                  score={healthScore}
                  grade={healthGrade}
                  dimensions={telemetry?.dimensions || []}
                />
              </Card>
            </div>

            {/* Slot B: Skill Coverage Radar Chart (Member 4 - Sargam) */}
            <div className="lg:col-span-2">
              <Card
                title="Market Skill Alignment Radar"
                subtitle={`Student profile skills vs. ${targetRole} market demand`}
                className="h-full"
              >
                <SkillRadarChart
                  data={skillIntel?.radarData}
                  targetRole={targetRole}
                />
              </Card>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SARGAM (MEMBER 4) EXTENDED TELEMETRY & AI ORCHESTRATOR PANELS             */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: 6-Month Trajectory & Actionable Recommendations */}
            <div className="lg:col-span-2 space-y-6">
              <Card
                title="Career Health Progression"
                subtitle="6-Month trajectory modeled across completed projects and skill additions"
              >
                <HealthTrendChart history={telemetry?.trendHistory} />
              </Card>

              <Card
                title="Actionable AI Recommendations"
                subtitle="High-leverage next steps prioritized by LangGraph reasoning"
              >
                <RecommendationFeed recommendations={telemetry?.recommendations || []} />
              </Card>
            </div>

            {/* Right 1 Col: Live Agent Microservice Status & Telemetry Activity Stream */}
            <div className="space-y-6">
              <Card
                title="Agent Orchestrator Status"
                subtitle="Live microservice telemetry"
              >
                <AgentStatusList agentStatuses={telemetry?.agentStatuses || []} />
              </Card>

              <Card
                title="Recent Telemetry Stream"
                subtitle="Chronological multi-agent events"
              >
                <TelemetryStream events={telemetry?.recentActivity || []} />
              </Card>
            </div>
          </div>

          {/* Quick Skill Ingestion Card */}
          <Card
            title="Active Registered Skills"
            subtitle="Skills synchronized with Neo4j Knowledge Graph"
            actions={
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  Add New Skill
                </Button>
              </Link>
            }
          >
            {skillsCount === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">No skills added yet.</p>
                <Link to="/profile" className="mt-2 inline-block">
                  <Button variant="primary" size="sm">
                    Setup Profile Skills
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile?.skills?.map((skill, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 space-x-1.5"
                  >
                    <span>{skill.name}</span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold uppercase">
                      {skill.level}
                    </span>
                    {skill.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" title="Verified by Evidence Agent" />
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
