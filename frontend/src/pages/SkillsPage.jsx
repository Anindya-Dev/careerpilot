/**
 * @file SkillsPage.jsx
 * @description Dedicated Neo-Brutalist workspace for Skills & Evidence verification.
 * Includes interactive skill matrix, domain filters, audit status, and market alignment radar.
 * @author Md Hussain Ansari (Member 1) & Sargam Banerjee (Member 4)
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useSkillIntelligence } from '../hooks';
import { useLiveSkillBenchmark } from '../hooks/useLiveSkillBenchmark';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import { SkillRadarChart } from '../components/telemetry';
import {
  Target,
  CheckCircle2,
  Clock,
  Plus,
  GitBranch,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function SkillsPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { data: skillIntel } = useSkillIntelligence();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const skills = profile?.skills || [];
  const projects = profile?.projects || [];
  const targetRole = profile?.target_role || 'Target Role Unassigned';
  const { radarData: liveRadarData, isResearching } = useLiveSkillBenchmark(
    skills,
    targetRole,
    Boolean(user?.isDemoSession)
  );

  const categories = ['ALL', 'Frontend', 'Backend', 'Database', 'Cloud & DevOps', 'AI & ML'];

  const DOMAIN_MAP = {
    frontend: ['react', 'next.js', 'nextjs', 'vue', 'angular', 'tailwind', 'html', 'css', 'typescript', 'javascript', 'redux', 'vite'],
    backend: ['fastapi', 'node.js', 'nodejs', 'express', 'django', 'flask', 'spring', 'nestjs', 'graphql', 'grpc', 'python', 'java', 'go', 'golang', 'rust', 'c++', 'c#', 'php', 'ruby', 'rest'],
    database: ['postgresql', 'postgres', 'mongodb', 'mysql', 'redis', 'neo4j', 'chromadb', 'sqlite', 'elasticsearch', 'firebase', 'supabase', 'dynamodb', 'sql'],
    'cloud & devops': ['docker', 'kubernetes', 'k8s', 'aws', 'gcp', 'azure', 'terraform', 'ci/cd', 'nginx', 'linux', 'kafka', 'git', 'prometheus', 'grafana', 'devops'],
    'ai & ml': ['pytorch', 'tensorflow', 'scikit-learn', 'sklearn', 'langchain', 'langgraph', 'hugging face', 'opencv', 'pandas', 'numpy', 'rag', 'llm', 'nlp', 'computer vision', 'machine learning', 'deep learning']
  };

  const matchesDomainCategory = (skill, category) => {
    if (category === 'ALL') return true;
    const catKey = category.toLowerCase();
    const skillCat = (skill.category || '').toLowerCase();
    const skillName = (skill.name || '').toLowerCase();

    if (skillCat === catKey) return true;
    if (catKey === 'cloud & devops' && skillCat === 'devops & cloud') return true;
    if (catKey === 'database' && skillCat === 'databases') return true;

    const keywords = DOMAIN_MAP[catKey] || [];
    return keywords.some((kw) => skillName.includes(kw));
  };

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && matchesDomainCategory(skill, selectedCategory);
  });

  const verifiedCount = skills.filter((s) => s.verified).length;
  const verifiedPercentage = skills.length > 0 ? Math.round((verifiedCount / skills.length) * 100) : 0;

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
          <div className="border-2 border-black bg-[#38B6FF] shadow-[4px_4px_0px_0px_#000] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-black font-mono text-xs font-black uppercase">
                <Target className="w-4 h-4 stroke-[2.5]" />
                <span>WORKSPACE :: SKILLS_AND_EVIDENCE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-black font-sans mt-0.5 tracking-tight">
                Skills Verification & Evidence Graph
              </h1>
              <p className="text-xs font-mono font-bold text-black/80 mt-1">
                Audited technical competencies mapped against verifiable GitHub commit artifacts
              </p>
            </div>

            <Link
              to="/profile"
              className="inline-flex items-center justify-center px-4 py-2 border-2 border-black bg-[#FFE600] text-black text-xs font-mono font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75 shrink-0"
            >
              <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              Manage Skills
            </Link>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono">
            <div className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase">Total Registered</span>
              <div className="text-3xl font-black text-black">{skills.length} Skills</div>
              <p className="text-[10px] text-slate-500 font-bold">Cataloged in candidate profile</p>
            </div>

            <div className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase">Evidence Audited</span>
              <div className="text-3xl font-black text-[#70E000]">{verifiedCount} Verified</div>
              <p className="text-[10px] text-slate-500 font-bold">{verifiedPercentage}% backed by commit evidence</p>
            </div>

            <div className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase">Target Role Vector</span>
              <div className="text-lg font-black text-black truncate">{targetRole}</div>
              <p className="text-[10px] text-slate-500 font-bold">Industry benchmark calibrated</p>
            </div>
          </div>

          {/* Main Workspace Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column: Skills Matrix Table (7 Cols) */}
            <div className="xl:col-span-7 space-y-6">
              <Card
                title="Competency Matrix"
                subtitle="Search, filter, and review verified evidence states"
                headerBg="bg-[#FFE600]"
                bodyClassName="p-6 space-y-4"
              >
                {/* Search & Domain Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 stroke-[2.5]" />
                    <input
                      type="text"
                      placeholder="Filter skills by keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border-2 border-black bg-white text-xs font-mono font-bold focus:bg-[#FAF5E6] outline-none shadow-[2px_2px_0px_0px_#000]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1.5 border-2 border-black text-[10px] font-bold uppercase transition-all ${
                          selectedCategory === cat
                            ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white text-black hover:bg-[#FAF5E6]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                {filteredSkills.length === 0 ? (
                  <div className="text-center py-10 text-xs font-mono font-bold text-slate-600 bg-[#FAF5E6] border-2 border-black p-4">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-black stroke-[2]" />
                    <p>NO_SKILLS_FOUND_FOR_QUERY</p>
                    <Link to="/profile" className="mt-2 inline-block text-black underline font-black">
                      Add new skills in profile &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="max-h-[280px] overflow-y-auto overflow-x-auto border-2 border-black">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="sticky top-0 z-10">
                        <tr className="border-b-2 border-black bg-[#FAF5E6] text-black text-[11px] uppercase font-black">
                          <th className="py-2.5 px-3">Skill Node</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Proficiency</th>
                          <th className="py-2.5 px-3 text-right">Audit Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-black bg-white">
                        {filteredSkills.map((skill, idx) => (
                          <tr key={idx} className="hover:bg-[#FFFDF0] transition-colors">
                            <td className="py-3 px-3 font-bold text-black text-sm">{skill.name}</td>
                            <td className="py-3 px-3 text-slate-700">{skill.category || 'General'}</td>
                            <td className="py-3 px-3">
                              <span className="border border-black bg-[#C4A1FF] text-black px-2 py-0.5 text-[10px] font-bold uppercase shadow-[1px_1px_0px_0px_#000]">
                                {skill.level || 'Intermediate'}
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

              {/* Verified Repository Evidence Section */}
              <Card
                title="Linked Repository Evidence"
                subtitle="GitHub projects scanned by AST parser for verifiable implementations"
                headerBg="bg-[#70E000]"
                bodyClassName="p-6 space-y-3"
              >
                {projects.length === 0 ? (
                  <div className="text-center py-6 text-xs font-mono font-bold text-slate-600 bg-[#FAF5E6] border-2 border-black p-4">
                    <p>NO_EVIDENCE_REPOSITORIES_LINKED</p>
                    <Link to="/profile" className="mt-2 inline-block text-black underline font-black">
                      Link repository URLs in profile &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000] flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <GitBranch className="w-4 h-4 stroke-[2.5]" />
                            <span className="font-mono font-bold text-sm text-black">{proj.title}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-mono line-clamp-1">{proj.description}</p>
                        </div>

                        {proj.github_url && (
                          <a
                            href={proj.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2.5 py-1 border border-black bg-[#FAF5E6] hover:bg-[#FFE600] font-mono text-[11px] font-bold text-black shadow-[1px_1px_0px_0px_#000]"
                          >
                            <span>Repo</span>
                            <ExternalLink className="w-3 h-3 ml-1 stroke-[2]" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column: Market Skill Alignment Radar (5 Cols) */}
            <div className="xl:col-span-5 space-y-6">
              <Card
                title="Market Skill Alignment Radar"
                subtitle="Profile skill graph vs live industry demand vectors"
                headerBg="bg-[#C4A1FF]"
                bodyClassName="p-6"
              >
                {isResearching ? (
                  <div className="h-[250px] w-full bg-[#FAF5E6] border-2 border-black p-6 shadow-[3px_3px_0px_0px_#000] font-mono flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase text-black">
                      RESEARCHING MARKET DEMAND FOR {targetRole}...
                    </p>
                  </div>
                ) : (
                  <SkillRadarChart
                    data={user?.isDemoSession ? skillIntel?.radarData : liveRadarData}
                    targetRole={targetRole}
                  />
                )}
              </Card>

              {/* Action Insights Card */}
              <div className="p-5 border-2 border-black bg-[#FFE600] shadow-[4px_4px_0px_0px_#000] font-mono space-y-3">
                <div className="flex items-center space-x-2 text-black font-black text-xs uppercase">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>AUDIT_RECOMMENDATION</span>
                </div>
                <p className="text-xs font-bold text-black leading-relaxed">
                  To elevate your Career Health score above 90, link repositories containing test suites and architectural specifications matching your target role.
                </p>
                <Link
                  to="/profile"
                  className="inline-block px-3 py-1.5 border-2 border-black bg-white text-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-x-0.5"
                >
                  Configure Repositories &rarr;
                </Link>
              </div>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
