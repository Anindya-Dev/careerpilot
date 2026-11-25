/**
 * @file ProfilePage.jsx
 * @description Neo-Brutalist student Career Intelligence Profile CRUD management interface.
 * Implements full schema editing with bold borders, hard shadows, and high-contrast forms.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import integrationService from '../services/integrationService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import {
  Save,
  Plus,
  Trash2,
  CheckCircle,
  Github,
  Linkedin,
  Terminal,
  Upload,
  FileText,
  Code2,
  Star,
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();

  const [formData, setFormData] = useState({
    name: '',
    major: '',
    target_role: '',
    skills: [],
    goals: [],
    projects: [],
    certifications: [],
    linked_accounts: {
      github: '',
      linkedin: '',
      leetcode: ''
    },
    github_data: null,
    leetcode_data: null,
    dismissed_skills: []
  });

  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 'intermediate',
    category: 'Languages',
    verified: false
  });

  const [newGoal, setNewGoal] = useState('');
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    repo_url: '',
    technologies: ''
  });

  const [notification, setNotification] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isParsingLinkedin, setIsParsingLinkedin] = useState(false);
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [isFetchingLeetcode, setIsFetchingLeetcode] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);

  // Auto-dismiss toast notification after 4 seconds
  useEffect(() => {
    if (!notification.message) return;
    const timer = setTimeout(() => {
      setNotification({ type: '', message: '' });
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification.message]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user?.name || '',
        major: profile.major || user?.major || '',
        target_role: profile.target_role || '',
        skills: profile.skills || [],
        goals: profile.goals || [],
        projects: profile.projects || [],
        certifications: profile.certifications || [],
        linked_accounts: {
          github: profile.linked_accounts?.github || '',
          linkedin: profile.linked_accounts?.linkedin || '',
          leetcode: profile.linked_accounts?.leetcode || ''
        },
        github_data: profile.github_data || null,
        leetcode_data: profile.leetcode_data || null,
        dismissed_skills: profile.dismissed_skills || []
      });
    }
  }, [profile, user]);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLinkedAccountChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      linked_accounts: { ...prev.linked_accounts, [name]: value }
    }));
  };

  // Skill management (persists immediately & respects dismissed skills)
  const addSkill = async () => {
    if (!newSkill.name.trim()) return;
    const trimmedName = newSkill.name.trim();
    const updatedSkills = [...formData.skills, { ...newSkill, name: trimmedName }];
    const updatedDismissed = (formData.dismissed_skills || []).filter(
      (d) => d.toLowerCase() !== trimmedName.toLowerCase()
    );
    const updatedForm = {
      ...formData,
      skills: updatedSkills,
      dismissed_skills: updatedDismissed
    };
    setFormData(updatedForm);
    setNewSkill({
      name: '',
      level: 'intermediate',
      category: 'Languages',
      verified: false
    });
    await updateProfile(updatedForm);
  };

  const removeSkill = async (index) => {
    const removed = formData.skills[index];
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    const dismissed = new Set((formData.dismissed_skills || []).map((d) => d.toLowerCase()));
    if (removed?.name) {
      dismissed.add(removed.name.toLowerCase());
    }
    const updatedForm = {
      ...formData,
      skills: updatedSkills,
      dismissed_skills: Array.from(dismissed)
    };
    setFormData(updatedForm);
    await updateProfile(updatedForm);
  };

  // Goal management
  const addGoal = async () => {
    if (!newGoal.trim()) return;
    const updatedForm = {
      ...formData,
      goals: [...formData.goals, newGoal.trim()]
    };
    setFormData(updatedForm);
    setNewGoal('');
    await updateProfile(updatedForm);
  };

  const removeGoal = async (index) => {
    const updatedForm = {
      ...formData,
      goals: formData.goals.filter((_, i) => i !== index)
    };
    setFormData(updatedForm);
    await updateProfile(updatedForm);
  };

  // Project management
  const addProject = async () => {
    if (!newProject.title.trim()) return;
    const techs = newProject.technologies
      ? newProject.technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const updatedForm = {
      ...formData,
      projects: [
        ...formData.projects,
        {
          ...newProject,
          technologies: techs
        }
      ]
    };
    setFormData(updatedForm);
    setNewProject({
      title: '',
      description: '',
      repo_url: '',
      technologies: ''
    });
    setShowAddProject(false);
    await updateProfile(updatedForm);
  };

  const removeProject = async (index) => {
    const updatedForm = {
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index)
    };
    setFormData(updatedForm);
    await updateProfile(updatedForm);
  };

  // Production Resume Upload & Skill Extraction
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsingResume(true);
    setNotification({ type: '', message: '' });

    try {
      const parsed = await integrationService.parseResume(file);
      const extractedSkills = parsed.skills || [];

      const dismissedSet = new Set((formData.dismissed_skills || []).map((d) => d.toLowerCase()));
      const existingMap = new Map(
        (formData.skills || []).map((s) => [s.name.toLowerCase(), s])
      );
      let addedCount = 0;
      for (const sk of extractedSkills) {
        const key = sk.name.toLowerCase();
        if (!existingMap.has(key) && !dismissedSet.has(key)) {
          existingMap.set(key, sk);
          addedCount += 1;
        }
      }

      const updatedForm = {
        ...formData,
        skills: Array.from(existingMap.values()),
        target_role: formData.target_role || parsed.suggested_target_role || ''
      };
      setFormData(updatedForm);
      await updateProfile(updatedForm);

      setNotification({
        type: 'success',
        message: `Parsed "${file.name}": extracted ${extractedSkills.length} skills (${addedCount} new added to Skills & Competencies).`
      });
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Failed to parse resume.';
      setNotification({ type: 'error', message: detail });
    } finally {
      setIsParsingResume(false);
      e.target.value = '';
    }
  };

  // Production LinkedIn "Save to PDF" Certifications & Skills Extractor
  const handleLinkedinPdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsingLinkedin(true);
    setNotification({ type: '', message: '' });

    try {
      const parsed = await integrationService.parseLinkedinPdf(file);
      const extractedCerts = parsed.certifications || [];
      const extractedSkills = parsed.skills || [];

      const existingCertNames = new Set(
        (formData.certifications || []).map((c) => (typeof c === 'string' ? c : c.name).toLowerCase())
      );
      const newCerts = extractedCerts.filter(
        (c) => c.name && !existingCertNames.has(c.name.toLowerCase())
      );

      const dismissedSet = new Set((formData.dismissed_skills || []).map((d) => d.toLowerCase()));
      const existingSkillMap = new Map(
        (formData.skills || []).map((s) => [s.name.toLowerCase(), s])
      );
      let addedSkills = 0;
      for (const sk of extractedSkills) {
        const key = sk.name.toLowerCase();
        if (!existingSkillMap.has(key) && !dismissedSet.has(key)) {
          existingSkillMap.set(key, sk);
          addedSkills += 1;
        }
      }

      const updatedForm = {
        ...formData,
        certifications: [...(formData.certifications || []), ...newCerts],
        skills: Array.from(existingSkillMap.values()),
        target_role: formData.target_role || parsed.suggested_target_role || ''
      };
      setFormData(updatedForm);
      await updateProfile(updatedForm);

      setNotification({
        type: 'success',
        message: `Imported ${newCerts.length} certifications and ${addedSkills} new skills from LinkedIn PDF!`
      });
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Failed to parse LinkedIn PDF.';
      setNotification({ type: 'error', message: detail });
    } finally {
      setIsParsingLinkedin(false);
      e.target.value = '';
    }
  };

  const removeCertification = async (index) => {
    const updatedCerts = (formData.certifications || []).filter((_, i) => i !== index);
    const updatedForm = { ...formData, certifications: updatedCerts };
    setFormData(updatedForm);
    await updateProfile(updatedForm);
  };

  // Production Live GitHub Connection & Repo Ingestion
  const handleConnectGithub = async () => {
    const username = formData.linked_accounts.github?.trim();
    if (!username) {
      setNotification({ type: 'error', message: 'Enter your GitHub username first.' });
      return;
    }
    setIsFetchingGithub(true);
    setNotification({ type: '', message: '' });

    try {
      const data = await integrationService.fetchGithubProfile(username);
      const dismissedSet = new Set((formData.dismissed_skills || []).map((d) => d.toLowerCase()));
      const existingMap = new Map(
        (formData.skills || []).map((s) => [s.name.toLowerCase(), s])
      );
      for (const sk of data.detected_skills || []) {
        const key = sk.name.toLowerCase();
        if (dismissedSet.has(key)) continue;
        const prev = existingMap.get(key);
        existingMap.set(key, {
          ...(prev || sk),
          verified: true,
          source: 'github'
        });
      }

      const updatedForm = {
        ...formData,
        skills: Array.from(existingMap.values()),
        github_data: data
      };
      setFormData(updatedForm);
      await updateProfile(updatedForm);

      setNotification({
        type: 'success',
        message: `Connected GitHub @${data.profile.username}: synced ${data.repositories.length} live repositories and verified ${data.detected_skills.length} languages.`
      });
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Failed to fetch GitHub repositories.';
      setNotification({ type: 'error', message: detail });
    } finally {
      setIsFetchingGithub(false);
    }
  };

  // Import a single selected GitHub repo into Engineering Projects
  const handleImportSingleRepo = async (repo) => {
    const exists = (formData.projects || []).some(
      (p) => p.repo_url === repo.html_url || p.title?.toLowerCase() === repo.name?.toLowerCase()
    );
    if (exists) {
      setNotification({ type: 'info', message: `"${repo.name}" is already in your Projects.` });
      return;
    }

    const newProj = {
      title: repo.name,
      description: repo.description || `GitHub repository (${repo.language})`,
      repo_url: repo.html_url,
      technologies: [repo.language, ...(repo.topics || [])].filter((t) => t && t !== 'Unknown')
    };

    const updatedForm = {
      ...formData,
      projects: [...(formData.projects || []), newProj]
    };
    setFormData(updatedForm);
    await updateProfile(updatedForm);
    setNotification({
      type: 'success',
      message: `Imported "${repo.name}" into Engineering Projects!`
    });
  };

  // Import top non-fork GitHub repos into Engineering Projects
  const handleImportGithubRepos = async () => {
    const repos = formData.github_data?.repositories || [];
    const existingUrls = new Set((formData.projects || []).map((p) => p.repo_url));
    const candidates = repos
      .filter((r) => !r.is_fork && !existingUrls.has(r.html_url))
      .slice(0, 4)
      .map((r) => ({
        title: r.name,
        description: r.description || `GitHub repository (${r.language})`,
        repo_url: r.html_url,
        technologies: [r.language, ...(r.topics || [])].filter((t) => t && t !== 'Unknown')
      }));

    if (candidates.length === 0) {
      setNotification({ type: 'info', message: 'Top GitHub repositories are already in your Projects list.' });
      return;
    }

    const updatedForm = {
      ...formData,
      projects: [...formData.projects, ...candidates]
    };
    setFormData(updatedForm);
    await updateProfile(updatedForm);
    setNotification({
      type: 'success',
      message: `Imported ${candidates.length} repositories into Engineering Projects.`
    });
  };

  // Production Live LeetCode DSA Standard Analysis
  const handleConnectLeetcode = async () => {
    const username = formData.linked_accounts.leetcode?.trim();
    if (!username) {
      setNotification({ type: 'error', message: 'Enter your LeetCode username first.' });
      return;
    }
    setIsFetchingLeetcode(true);
    setNotification({ type: '', message: '' });

    try {
      const data = await integrationService.fetchLeetcodeStats(username);
      const updatedForm = {
        ...formData,
        leetcode_data: data
      };
      setFormData(updatedForm);
      await updateProfile(updatedForm);

      setNotification({
        type: 'success',
        message: `Analyzed LeetCode @${data.username}: ${data.stats.total} solved (${data.dsa_standard.tier} - ${data.dsa_standard.score}/100).`
      });
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Failed to fetch LeetCode profile.';
      setNotification({ type: 'error', message: detail });
    } finally {
      setIsFetchingLeetcode(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification({ type: '', message: '' });
    try {
      await updateProfile(formData);
      setNotification({
        type: 'success',
        message: 'Profile synchronized successfully with Neo4j Knowledge Graph schema.'
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update profile.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-black flex flex-col font-sans relative selection:bg-[#FFE600] selection:text-black">
      <div className="absolute inset-0 neo-grid pointer-events-none opacity-20 -z-0" />
      <Navbar />

      {/* Full-width responsive workspace container */}
      <div className="flex-1 flex w-full relative z-10">
        <Sidebar />

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 space-y-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 border-2 border-black bg-[#FFE600] text-[10px] font-mono font-bold text-black mb-1 shadow-[2px_2px_0px_0px_#000]">
                <Terminal className="w-3 h-3 stroke-[2.5]" />
                <span>PROFILE_SVC :: PORT_5002</span>
              </div>
              <h1 className="text-2xl font-black text-black tracking-tight font-sans">Career Intelligence Profile</h1>
              <p className="text-xs font-mono font-bold text-slate-700">
                Manage credentials, validated competencies, and target aspirations
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-5 py-2.5 border-2 border-black bg-[#70E000] hover:bg-[#85FF0A] text-black text-xs font-mono font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-75 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2 stroke-[2.5]" />
              {isSaving ? 'Synchronizing...' : 'Save Profile Changes'}
            </button>
          </div>

          {notification.message && (
            <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-full sm:w-auto">
              <Alert
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification({ type: '', message: '' })}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Primary Details (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Production Resume Upload & Auto-Skill Extractor */}
              <Card
                title="Resume Intelligence Parser"
                subtitle="Upload your PDF or TXT resume to automatically extract & populate verified skills"
                headerBg="bg-[#70E000]"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#FAF5E6] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0">
                      <FileText className="w-5 h-5 text-black stroke-[2.5]" />
                    </div>
                    <div className="font-mono">
                      <p className="text-xs font-black uppercase text-black">
                        Auto-Extract Skills & Role
                      </p>
                      <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                        Supports .PDF, .TXT, and .MD resumes. Parsed skills are added directly below.
                      </p>
                    </div>
                  </div>

                  <label className="inline-flex items-center px-4 py-2.5 border-2 border-black bg-[#FFE600] hover:bg-[#FFF04D] text-black text-xs font-mono font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0">
                    <Upload className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                    <span>{isParsingResume ? 'Parsing...' : 'Upload Resume'}</span>
                    <input
                      type="file"
                      accept=".pdf,.txt,.md"
                      onChange={handleResumeUpload}
                      disabled={isParsingResume}
                      className="hidden"
                    />
                  </label>
                </div>
              </Card>

              {/* Core Information */}
              <Card
                title="Foundational Information"
                subtitle="Academic enrollment and target aspiration vectors"
                headerBg="bg-[#38B6FF]"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleBasicChange}
                    required
                  />
                  <Input
                    label="Academic Program / Major"
                    name="major"
                    value={formData.major}
                    onChange={handleBasicChange}
                    required
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Target Professional Role"
                      name="target_role"
                      placeholder="e.g. AI & Machine Learning Engineer"
                      value={formData.target_role}
                      onChange={handleBasicChange}
                      helperText="Calibrated by Skill Intelligence Agent against market job demand graphs"
                      required
                    />
                  </div>
                </div>
              </Card>

              {/* Skills Section */}
              <Card
                title="Skills & Competencies"
                subtitle="Mapped directly into Neo4j Knowledge Graph nodes"
                headerBg="bg-[#FFE600]"
              >
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-end gap-3 p-3.5 bg-[#FAF5E6] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                    <Input
                      label="Skill Name"
                      placeholder="e.g. PyTorch, React, Docker"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      className="sm:w-1/3"
                    />
                    <div className="sm:w-1/4 w-full">
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
                        Proficiency
                      </label>
                      <select
                        value={newSkill.level}
                        onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black focus:outline-none focus:bg-[#FFFDF0]"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div className="sm:w-1/4 w-full">
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
                        Category
                      </label>
                      <select
                        value={newSkill.category}
                        onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black focus:outline-none focus:bg-[#FFFDF0]"
                      >
                        <option value="Languages">Languages</option>
                        <option value="Frameworks">Frameworks</option>
                        <option value="Databases">Databases</option>
                        <option value="DevOps & Cloud">DevOps & Cloud</option>
                        <option value="Architecture">Architecture</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="w-full sm:w-auto px-4 py-2 border-2 border-black bg-[#70E000] hover:bg-[#85FF0A] text-black text-xs font-mono font-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75 flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" /> ADD
                    </button>
                  </div>

                  <div className="max-h-[250px] overflow-y-auto pr-1 divide-y-2 divide-black">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xs font-mono font-bold text-black">{skill.name}</span>
                          <span className="text-[10px] font-mono font-black px-1.5 py-0.2 border border-black bg-[#C4A1FF] text-black uppercase">
                            {skill.level}
                          </span>
                          <span className="text-[11px] font-mono text-slate-700">({skill.category})</span>
                          {skill.verified && (
                            <span className="inline-flex items-center text-[10px] font-mono font-bold border border-black bg-[#70E000] text-black px-1.5 py-0.2">
                              <CheckCircle className="w-3 h-3 mr-1 stroke-[2.5]" /> AUDITED
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="p-1 border border-black bg-[#FF5757] text-white hover:bg-[#FF7070] shadow-[1px_1px_0px_0px_#000] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Projects Section */}
              <Card
                title="Engineering Projects"
                subtitle="Repository evidence evaluated by Career Evidence Agent"
                headerBg="bg-[#C4A1FF]"
                actions={
                  <button
                    type="button"
                    onClick={() => setShowAddProject((prev) => !prev)}
                    className="inline-flex items-center px-3 py-1 border-2 border-black bg-[#FFE600] hover:bg-[#FFF066] text-black font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    {showAddProject ? 'Cancel' : '+ Add Project'}
                  </button>
                }
              >
                <div className="space-y-4">
                  {showAddProject && (
                    <div className="p-3.5 bg-[#FAF5E6] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Project Title"
                          placeholder="e.g. CareerPilot AI"
                          value={newProject.title}
                          onChange={(e) =>
                            setNewProject({ ...newProject, title: e.target.value })
                          }
                        />
                        <Input
                          label="Repository URL"
                          placeholder="https://github.com/..."
                          value={newProject.repo_url}
                          onChange={(e) =>
                            setNewProject({ ...newProject, repo_url: e.target.value })
                          }
                        />
                      </div>
                      <Input
                        label="Technologies (comma separated)"
                        placeholder="React, Express, MongoDB, Python"
                        value={newProject.technologies}
                        onChange={(e) =>
                          setNewProject({ ...newProject, technologies: e.target.value })
                        }
                      />
                      <Input
                        label="Brief Overview"
                        placeholder="Summary of architectural contributions..."
                        value={newProject.description}
                        onChange={(e) =>
                          setNewProject({ ...newProject, description: e.target.value })
                        }
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={addProject}
                          className="px-4 py-2 border-2 border-black bg-[#FFE600] hover:bg-[#FFF066] text-black text-xs font-mono font-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75 flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" /> Save Project
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddProject(false)}
                          className="px-3 py-2 border-2 border-black bg-white hover:bg-slate-100 text-black text-xs font-mono font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {formData.projects.length === 0 && !showAddProject ? (
                    <div className="p-4 bg-[#FAF5E6] border-2 border-black text-center font-mono text-xs font-bold text-slate-600">
                      No projects added yet. Click <strong>+ Add Project</strong> above or import repositories from GitHub.
                    </div>
                  ) : (
                    <div className="space-y-3">
                    {formData.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000] flex items-start justify-between"
                      >
                        <div>
                          <h4 className="text-xs font-black text-black font-mono">{proj.title}</h4>
                          <p className="text-[11px] text-slate-700 mt-0.5">{proj.description}</p>
                          {proj.repo_url && (
                            <a
                              href={proj.repo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-mono font-bold text-black underline hover:bg-[#FFE600] mt-1 inline-block"
                            >
                              {proj.repo_url}
                            </a>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {proj.technologies?.map((tech, ti) => (
                              <span
                                key={ti}
                                className="text-[10px] font-mono font-bold border border-black bg-[#FAF5E6] text-black px-1.5 py-0.5"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProject(idx)}
                          className="p-1 border border-black bg-[#FF5757] text-white hover:bg-[#FF7070] shadow-[1px_1px_0px_0px_#000] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar Column: Evidence Links, Goals (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Live Evidence Connectors (GitHub + LeetCode + LinkedIn) */}
              <Card
                title="External Evidence Links"
                subtitle="Live GitHub Repository & LeetCode DSA Ingestion"
                headerBg="bg-[#FF70A6]"
              >
                <div className="space-y-4">
                  {/* 1. Live GitHub Connector */}
                  <div className="p-3.5 bg-[#FAF5E6] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Github className="w-4 h-4 text-black stroke-[2.5]" />
                        <span className="text-xs font-mono font-black text-black uppercase">GitHub Repositories</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {formData.github_data && (
                          <span className="text-[10px] font-mono font-black border border-black bg-[#70E000] text-black px-1.5 py-0.5 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1 stroke-[2.5]" /> {formData.github_data.repositories?.length || 0} REPOS
                          </span>
                        )}
                        <a
                          href={`https://github.com/${formData.linked_accounts.github?.trim() || ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono font-bold underline text-black hover:bg-[#FFE600] px-1 flex items-center"
                          title="Open GitHub in new tab"
                        >
                          Open GitHub <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="GitHub username (e.g. Anindya-Dev)"
                        name="github"
                        value={formData.linked_accounts.github}
                        onChange={handleLinkedAccountChange}
                      />
                      <button
                        type="button"
                        onClick={handleConnectGithub}
                        disabled={isFetchingGithub}
                        className="px-3 py-2 border-2 border-black bg-[#38B6FF] hover:bg-[#5CC5FF] text-black text-xs font-mono font-black uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isFetchingGithub ? 'Scanning...' : 'Connect'}
                      </button>
                    </div>

                    {/* Live GitHub Repos Display */}
                    {formData.github_data && (
                      <div className="mt-2 pt-2.5 border-t-2 border-black space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                          <span className="flex items-center gap-2">
                            {formData.github_data.profile?.avatar_url && (
                              <img
                                src={formData.github_data.profile.avatar_url}
                                alt="GitHub avatar"
                                className="w-5 h-5 border border-black"
                              />
                            )}
                            <span>@{formData.github_data.profile?.username}</span>
                          </span>
                          <span>
                            {formData.github_data.profile?.public_repos} repos · {formData.github_data.profile?.total_stars} ★
                          </span>
                        </div>

                        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                          {(formData.github_data.repositories || []).map((repo) => {
                            const isImported = (formData.projects || []).some(
                              (p) =>
                                p.repo_url === repo.html_url ||
                                p.title?.toLowerCase() === repo.name?.toLowerCase()
                            );
                            return (
                              <div
                                key={repo.id || repo.name}
                                className="p-2 bg-white border border-black hover:bg-[#FFFDF0] transition-colors text-xs font-mono space-y-1"
                              >
                                <div className="flex items-center justify-between gap-2 font-bold">
                                  <a
                                    href={repo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="truncate hover:underline flex items-center gap-1 text-black"
                                  >
                                    <span className="truncate">{repo.name}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                  </a>
                                  <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                                    <span className="px-1 bg-[#FAF5E6] border border-black">{repo.language}</span>
                                    <span className="flex items-center">
                                      <Star className="w-3 h-3 mr-0.5" />{repo.stars}
                                    </span>
                                    {isImported ? (
                                      <span className="px-1.5 py-0.5 border border-black bg-[#70E000] text-black font-black">
                                        ✓ ADDED
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleImportSingleRepo(repo)}
                                        className="px-1.5 py-0.5 border border-black bg-[#FFE600] hover:bg-[#FFF04D] text-black font-black cursor-pointer"
                                      >
                                        + IMPORT
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {repo.description && (
                                  <p className="text-[10px] text-slate-600 truncate">{repo.description}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={handleImportGithubRepos}
                          className="w-full py-1.5 border-2 border-black bg-[#FFE600] hover:bg-[#FFF04D] text-black text-[11px] font-mono font-black uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                        >
                          + Import Top Repos into Projects
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. Live LeetCode DSA Analyzer */}
                  <div className="p-3.5 bg-[#FAF5E6] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Code2 className="w-4 h-4 text-black stroke-[2.5]" />
                        <span className="text-xs font-mono font-black text-black uppercase">LeetCode DSA Standard</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {formData.leetcode_data && (
                          <span className="text-[10px] font-mono font-black border border-black bg-[#FFE600] text-black px-1.5 py-0.5">
                            {formData.leetcode_data.dsa_standard?.tier}
                          </span>
                        )}
                        <a
                          href={
                            formData.linked_accounts.leetcode?.trim()
                              ? `https://leetcode.com/u/${formData.linked_accounts.leetcode.trim()}/`
                              : 'https://leetcode.com/'
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono font-bold underline text-black hover:bg-[#FFE600] px-1 flex items-center"
                          title="Open LeetCode in new tab"
                        >
                          Open LeetCode <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="LeetCode username"
                        name="leetcode"
                        value={formData.linked_accounts.leetcode}
                        onChange={handleLinkedAccountChange}
                      />
                      <button
                        type="button"
                        onClick={handleConnectLeetcode}
                        disabled={isFetchingLeetcode}
                        className="px-3 py-2 border-2 border-black bg-[#70E000] hover:bg-[#85FF0A] text-black text-xs font-mono font-black uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isFetchingLeetcode ? 'Analyzing...' : 'Analyze'}
                      </button>
                    </div>

                    {/* Live LeetCode DSA Diagnostics */}
                    {formData.leetcode_data && (
                      <div className="mt-2 pt-2.5 border-t-2 border-black space-y-2.5 font-mono text-xs">
                        <div className="grid grid-cols-4 gap-1.5 text-center">
                          <div className="p-1.5 bg-white border border-black">
                            <div className="text-[9px] font-bold text-slate-500">TOTAL</div>
                            <div className="font-black text-black">{formData.leetcode_data.stats?.total}</div>
                          </div>
                          <div className="p-1.5 bg-[#70E000]/30 border border-black">
                            <div className="text-[9px] font-bold text-black">EASY</div>
                            <div className="font-black text-black">{formData.leetcode_data.stats?.easy}</div>
                          </div>
                          <div className="p-1.5 bg-[#FFE600]/60 border border-black">
                            <div className="text-[9px] font-bold text-black">MED</div>
                            <div className="font-black text-black">{formData.leetcode_data.stats?.medium}</div>
                          </div>
                          <div className="p-1.5 bg-[#FF5757]/30 border border-black">
                            <div className="text-[9px] font-bold text-black">HARD</div>
                            <div className="font-black text-black">{formData.leetcode_data.stats?.hard}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-bold bg-white border border-black px-2 py-1">
                          <span>DSA Readiness: {formData.leetcode_data.dsa_standard?.score}/100</span>
                          {formData.leetcode_data.ranking && (
                            <span className="text-slate-600">Rank #{formData.leetcode_data.ranking.toLocaleString()}</span>
                          )}
                        </div>

                        {formData.leetcode_data.suggestions?.length > 0 && (
                          <div className="space-y-1 bg-white border border-black p-2">
                            <div className="text-[10px] font-black uppercase flex items-center text-black">
                              <Sparkles className="w-3 h-3 mr-1 stroke-[2.5]" /> DSA Improvement Suggestions
                            </div>
                            <ul className="space-y-1 text-[10px] font-bold text-slate-700 list-disc pl-4">
                              {formData.leetcode_data.suggestions.map((sug, i) => (
                                <li key={i}>{sug}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. LinkedIn Profile & PDF Importer */}
                  <div className="p-3.5 bg-[#FAF5E6] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Linkedin className="w-4 h-4 text-black stroke-[2.5]" />
                        <span className="text-xs font-mono font-black text-black uppercase">LinkedIn & Certifications</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {formData.certifications?.length > 0 && (
                          <span className="text-[10px] font-mono font-black border border-black bg-[#70E000] text-black px-1.5 py-0.5 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1 stroke-[2.5]" /> {formData.certifications.length} CERTS
                          </span>
                        )}
                        <a
                          href={
                            formData.linked_accounts.linkedin?.trim()
                              ? formData.linked_accounts.linkedin.startsWith('http')
                                ? formData.linked_accounts.linkedin
                                : `https://${formData.linked_accounts.linkedin}`
                              : 'https://www.linkedin.com/in/me/'
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono font-bold underline text-black hover:bg-[#FFE600] px-1 flex items-center"
                          title="Open LinkedIn in new tab"
                        >
                          Open LinkedIn <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </a>
                      </div>
                    </div>
                    <Input
                      placeholder="e.g. linkedin.com/in/username"
                      name="linkedin"
                      value={formData.linked_accounts.linkedin}
                      onChange={handleLinkedAccountChange}
                    />

                    {/* Instructions + Official LinkedIn PDF Upload Button */}
                    <div className="p-2.5 bg-white border border-black space-y-2 font-mono">
                      <div className="text-[10px] font-black uppercase text-black">
                        How to import Certifications & Skills from LinkedIn:
                      </div>
                      <ol className="text-[10px] font-bold text-slate-700 list-decimal pl-4 space-y-0.5">
                        <li>Open your LinkedIn profile (click <strong>Open LinkedIn</strong> above).</li>
                        <li>Click <strong>More</strong> (or <strong>Resources</strong>) &rarr; <strong>Save to PDF</strong>.</li>
                        <li>Upload the downloaded <code>Profile.pdf</code> below:</li>
                      </ol>
                      <label className="w-full inline-flex items-center justify-center px-3 py-2 border-2 border-black bg-[#38B6FF] hover:bg-[#5CC5FF] text-black text-xs font-mono font-black uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer">
                        <Upload className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
                        <span>{isParsingLinkedin ? 'Extracting Certifications...' : 'Upload LinkedIn Profile PDF'}</span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleLinkedinPdfUpload}
                          disabled={isParsingLinkedin}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Career Goals */}
              <Card
                title="Aspirational Milestones"
                subtitle="Target milestones for Roadmap Agent"
                headerBg="bg-[#FFDE59]"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="e.g. Benchmark 90%+ for Cloud Architect"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addGoal}
                      className="px-3 py-2 border-2 border-black bg-[#70E000] hover:bg-[#85FF0A] text-black text-xs font-mono font-bold shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>

                  <ul className="space-y-2">
                    {formData.goals.map((goal, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-xs font-mono font-bold bg-[#FAF5E6] p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black"
                      >
                        <span>{typeof goal === 'string' ? goal : goal.title}</span>
                        <button
                          type="button"
                          onClick={() => removeGoal(idx)}
                          className="p-1 border border-black bg-[#FF5757] text-white hover:bg-[#FF7070] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Verified Certifications List */}
              <Card
                title="Licenses & Certifications"
                subtitle="Imported from LinkedIn Profile PDF or added manually"
                headerBg="bg-[#70E000]"
              >
                {(!formData.certifications || formData.certifications.length === 0) ? (
                  <div className="p-4 bg-[#FAF5E6] border-2 border-black text-center font-mono text-xs font-bold text-slate-600">
                    No certifications added yet. Upload your LinkedIn Profile PDF above to auto-import them.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {formData.certifications.map((cert, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-xs font-mono bg-[#FAF5E6] p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black"
                      >
                        <div>
                          <div className="font-black text-black">
                            {typeof cert === 'string' ? cert : cert.name}
                          </div>
                          {(cert.issuer || cert.issue_date) && (
                            <div className="text-[10px] font-bold text-slate-600 mt-0.5">
                              {[cert.issuer, cert.issue_date].filter(Boolean).join(' · ')}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCertification(idx)}
                          className="p-1 border border-black bg-[#FF5757] text-white hover:bg-[#FF7070] transition-colors shrink-0 ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
