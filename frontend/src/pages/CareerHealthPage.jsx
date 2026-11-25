/**
 * @file CareerHealthPage.jsx
 * @description Dedicated Neo-Brutalist workspace for Career Health Telemetry.
 * Features the composite CareerHealthDial, 6-month trajectory projection,
 * multi-dimensional evaluation vectors, and prioritized AI remediation recommendations.
 * @author Md Hussain Ansari (Member 1) & Sargam Banerjee (Member 4)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useDashboardTelemetry } from '../hooks';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import {
  CareerHealthDial,
  HealthTrendChart,
  RecommendationFeed
} from '../components/telemetry';
import {
  Activity,
  HeartPulse,
  TrendingUp,
  Sparkles,
  Zap,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function CareerHealthPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { data: telemetry, latencyMs } = useDashboardTelemetry();

  const isFreshProfile = !user?.isDemoSession && (profile?.skills?.length || 0) === 0 && !profile?.target_role;
  const healthScore = isFreshProfile ? 0 : (profile?.career_health_score || telemetry?.healthScore || 0);
  const healthGrade = isFreshProfile ? 'N/A' : (telemetry?.healthGrade || 'B+');
  const dimensions = isFreshProfile
    ? [
        { name: 'Technical Depth', score: 0, status: 'Pending' },
        { name: 'Git Commit Velocity', score: 0, status: 'Pending' },
        { name: 'Architecture Purity', score: 0, status: 'Pending' },
        { name: 'Testing & Coverage', score: 0, status: 'Pending' },
        { name: 'Market Vector Match', score: 0, status: 'Pending' }
      ]
    : (telemetry?.dimensions || [
        { name: 'Technical Depth', score: 88, status: 'Optimal' },
        { name: 'Git Commit Velocity', score: 82, status: 'Healthy' },
        { name: 'Architecture Purity', score: 79, status: 'Needs Review' },
        { name: 'Testing & Coverage', score: 85, status: 'Optimal' },
        { name: 'Market Vector Match', score: 91, status: 'Optimal' }
      ]);

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
          className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 space-y-8"
        >
          {/* Workspace Header Banner */}
          <div className="border-2 border-black bg-[#FF70A6] shadow-[4px_4px_0px_0px_#000] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-black font-mono text-xs font-black uppercase">
                <HeartPulse className="w-4 h-4 stroke-[2.5]" />
                <span>WORKSPACE :: CAREER_HEALTH_TELEMETRY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-black font-sans mt-0.5 tracking-tight">
                Career Health & Trajectory Engine
              </h1>
              <p className="text-xs font-mono font-bold text-black/80 mt-1">
                Autonomous LangGraph DAG composite evaluation of engineering readiness & trajectory
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 border-2 border-black bg-white font-mono text-xs font-bold text-black shadow-[2px_2px_0px_0px_#000]">
                GRADE: <span className="font-black text-[#70E000]">{healthGrade}</span>
              </span>
              <span className="px-3 py-1.5 border-2 border-black bg-[#FFE600] font-mono text-xs font-bold text-black shadow-[2px_2px_0px_0px_#000]">
                SCORE: <span className="font-black">{healthScore} / 100</span>
              </span>
            </div>
          </div>

          {/* Dimension KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono">
            {dimensions.map((dim, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1.5"
              >
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider truncate">
                  {dim.name}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-black">{dim.score}%</span>
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 border border-black ${
                      dim.score >= 85
                        ? 'bg-[#70E000] text-black'
                        : dim.score >= 75
                        ? 'bg-[#FFE600] text-black'
                        : 'bg-[#FF5757] text-white'
                    }`}
                  >
                    {dim.status || (dim.score >= 80 ? 'Optimal' : 'Review')}
                  </span>
                </div>
                {/* Micro progress meter */}
                <div className="w-full bg-slate-100 border border-black h-2 overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-300"
                    style={{ width: `${Math.min(dim.score, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Main Telemetry Workbench Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column: Composite Dial & 6-Month Trajectory (7 cols) */}
            <div className="xl:col-span-7 space-y-8">
              {/* Dial Card */}
              <Card
                title="Composite Readiness Dial"
                subtitle="Weighted aggregate computed across 5 autonomous audit dimensions"
                headerBg="bg-[#FF70A6]"
                bodyClassName="p-6 sm:p-7"
              >
                <CareerHealthDial
                  score={healthScore}
                  grade={healthGrade}
                  dimensions={dimensions}
                />
              </Card>

              {/* Trajectory Projection Card */}
              <Card
                title="6-Month Career Health Trajectory Projection"
                subtitle="Historical trend and predictive model based on repository commits and skill additions"
                headerBg="bg-[#38B6FF]"
                bodyClassName="p-6 sm:p-7"
              >
                <HealthTrendChart history={trendHistory} />
              </Card>
            </div>

            {/* Right Column: AI Actionable Remediation Feed (5 cols) */}
            <div className="xl:col-span-5 space-y-8">
              <Card
                title="AI Remediation Recommendations"
                subtitle="High-leverage action items prioritized by LangGraph reasoning nodes"
                headerBg="bg-[#FFE600]"
                bodyClassName="p-6 sm:p-7"
              >
                <RecommendationFeed recommendations={recommendations} />
              </Card>

              {/* Diagnostic Explainer Card */}
              <div className="p-5 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] space-y-3 font-mono">
                <div className="flex items-center space-x-2 text-black font-black text-xs uppercase border-b-2 border-black pb-2">
                  <Zap className="w-4 h-4 stroke-[2.5]" />
                  <span>DIAGNOSTIC_METHODOLOGY</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-bold">
                  Scores update continuously as GitHub webhooks sync commits into the AST parser. Code quality, architecture purity, and consistency scores factor into the overall percentile calibration.
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span>LAST_CALIBRATION: ACTIVE</span>
                  <span className="text-[#70E000] font-black">NEO4J_READY</span>
                </div>
              </div>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
