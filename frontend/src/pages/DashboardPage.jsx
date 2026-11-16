/**
 * @file DashboardPage.jsx
 * @description Authenticated client shell displaying user greetings, profile summary,
 * and modular integration slots specifically structured for Member 4 (Sargam)'s
 * Chart.js / Recharts radar graphs, career health dials, and roadmap widgets.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import {
  Sparkles,
  TrendingUp,
  Target,
  Award,
  BookOpen,
  ArrowRight,
  Activity,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();

  const completeness = profile?.profile_completeness || 0;
  const skillsCount = profile?.skills?.length || 0;
  const projectsCount = profile?.projects?.length || 0;
  const targetRole = profile?.target_role || 'Role not selected';

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
          {/* The grid below is explicitly partitioned for Member 4's data viz widgets.  */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Slot A: Career Health Score & Dial (Owned by Sargam) */}
            <div className="lg:col-span-1">
              <Card
                title="Career Health Index"
                subtitle="Aggregated composite score"
                className="h-full"
              >
                {/* [SARGAM SLOT: <CareerHealthDial score={profile.career_health_score} />] */}
                <div className="p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 min-h-[220px]">
                  <Activity className="w-10 h-10 text-indigo-400 mb-2 animate-pulse" />
                  <div className="text-2xl font-black text-slate-800">
                    {profile?.career_health_score || '78.5'}
                    <span className="text-sm font-normal text-slate-500"> / 100</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                    Calculated by Career Health Agent. Visualized by Member 4 (Sargam).
                  </p>
                </div>
              </Card>
            </div>

            {/* Slot B: Skill Coverage Radar Chart (Owned by Sargam) */}
            <div className="lg:col-span-2">
              <Card
                title="Market Skill Alignment Radar"
                subtitle="Student profile skills vs. market job postings"
                className="h-full"
              >
                {/* [SARGAM SLOT: <SkillRadarChart skills={profile.skills} targetRole={profile.target_role} />] */}
                <div className="p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 min-h-[220px]">
                  <Layers className="w-10 h-10 text-indigo-400 mb-2" />
                  <div className="text-sm font-semibold text-slate-700">
                    Interactive Radar Chart Slot
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Container ready for Chart.js / Recharts integration. Displays Skill Intelligence
                    matching against target role demand.
                  </p>
                </div>
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
