/**
 * @file ProfilePage.jsx
 * @description Hallmark-crafted student Career Intelligence Profile CRUD management interface.
 * Implements full schema editing for target roles, skills, goals, projects, certifications,
 * and external portfolio accounts aligned with the Neo4j Knowledge Graph.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
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
  FolderGit2,
  Award,
  Target,
  Github,
  Linkedin,
  RefreshCw,
  Terminal
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
      linkedin: ''
    }
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
          linkedin: profile.linked_accounts?.linkedin || ''
        }
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

  // Skill management
  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, { ...newSkill }]
    }));
    setNewSkill({
      name: '',
      level: 'intermediate',
      category: 'Languages',
      verified: false
    });
  };

  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Goal management
  const addGoal = () => {
    if (!newGoal.trim()) return;
    setFormData((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal.trim()]
    }));
    setNewGoal('');
  };

  const removeGoal = (index) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  // Project management
  const addProject = () => {
    if (!newProject.title.trim()) return;
    const techs = newProject.technologies
      ? newProject.technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          ...newProject,
          technologies: techs
        }
      ]
    }));

    setNewProject({
      title: '',
      description: '',
      repo_url: '',
      technologies: ''
    });
  };

  const removeProject = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification({ type: '', message: '' });
    try {
      await updateProfile(formData);
      setNotification({
        type: 'success',
        message: 'Profile synchronized successfully with Neo4j Knowledge Graph schema!'
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col relative overflow-hidden font-sans">
      <div className="absolute inset-0 tech-grid pointer-events-none opacity-40 -z-0" />
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-md border border-slate-800 bg-slate-900 text-[10px] font-mono text-cyan-400 mb-1">
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>PROFILE_SVC :: PORT_5002</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Career Intelligence Profile</h1>
              <p className="text-xs font-mono text-slate-400">
                Manage credentials, validated competencies, and target aspirations
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
              className="shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Profile Changes
            </Button>
          </div>

          {notification.message && (
            <Alert
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification({ type: '', message: '' })}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Core Information */}
              <Card title="Foundational Information" subtitle="Basic enrollment and aspirational role identifiers">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleBasicChange}
                    required
                  />
                  <Input
                    label="Engineering Major / Program"
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
                      helperText="Used by Skill Intelligence Agent to benchmark skill-market fit"
                      required
                    />
                  </div>
                </div>
              </Card>

              {/* Skills Section */}
              <Card
                title="Skills & Competencies"
                subtitle="Synchronized with Neo4j Knowledge Graph skill nodes"
              >
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                    <Input
                      label="Skill Name"
                      placeholder="e.g. PyTorch, React, Docker"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      className="sm:w-1/3"
                    />
                    <div className="sm:w-1/4 w-full">
                      <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                        Proficiency
                      </label>
                      <select
                        value={newSkill.level}
                        onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div className="sm:w-1/4 w-full">
                      <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                        Category
                      </label>
                      <select
                        value={newSkill.category}
                        onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
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
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-semibold transition-colors flex items-center justify-center active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4 mr-1" /> ADD
                    </button>
                  </div>

                  <div className="divide-y divide-slate-800/80">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-sm font-medium text-slate-200">{skill.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/40 text-cyan-400 uppercase">
                            {skill.level}
                          </span>
                          <span className="text-xs font-mono text-slate-500">({skill.category})</span>
                          {skill.verified && (
                            <span className="inline-flex items-center text-xs font-mono text-emerald-400">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> VERIFIED
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Projects Section */}
              <Card
                title="Engineering Projects"
                subtitle="Used by Career Evidence Agent for commit & code verification"
              >
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
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
                      label="Short Description"
                      placeholder="Brief overview of architectural contribution..."
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({ ...newProject, description: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={addProject}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-semibold transition-colors flex items-center justify-center active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4 mr-1" /> ADD PROJECT
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 border border-slate-800 rounded-lg flex items-start justify-between bg-slate-950/70"
                      >
                        <div>
                          <h4 className="text-sm font-semibold text-white">{proj.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{proj.description}</p>
                          {proj.repo_url && (
                            <a
                              href={proj.repo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-mono text-cyan-400 hover:underline mt-1 inline-block"
                            >
                              {proj.repo_url}
                            </a>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {proj.technologies?.map((tech, ti) => (
                              <span
                                key={ti}
                                className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProject(idx)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar Column: Goals, Linked Accounts */}
            <div className="space-y-6">
              {/* Linked Accounts with OAuth Stubs */}
              <Card
                title="External Evidence Links"
                subtitle="OAuth 2.0 integrations for Career Evidence Agent"
              >
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Github className="w-4 h-4 text-white" />
                        <span className="text-xs font-mono text-slate-200">GitHub OAuth</span>
                      </div>
                      {formData.linked_accounts.github ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/40 text-emerald-400 font-semibold flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" /> LINKED
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const handle = window.prompt('Simulating GitHub OAuth 2.0 flow. Enter your GitHub username:', 'hussain-ansari');
                            if (handle) {
                              setFormData((prev) => ({
                                ...prev,
                                linked_accounts: { ...prev.linked_accounts, github: handle }
                              }));
                            }
                          }}
                          className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
                        >
                          + CONNECT
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder="e.g. hussain-ansari"
                      name="github"
                      value={formData.linked_accounts.github}
                      onChange={handleLinkedAccountChange}
                    />
                  </div>

                  <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Linkedin className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-mono text-slate-200">LinkedIn OAuth</span>
                      </div>
                      {formData.linked_accounts.linkedin ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/40 text-emerald-400 font-semibold flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" /> LINKED
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const handle = window.prompt('Simulating LinkedIn OAuth flow. Enter your LinkedIn handle:', 'hussainansari');
                            if (handle) {
                              setFormData((prev) => ({
                                ...prev,
                                linked_accounts: { ...prev.linked_accounts, linkedin: handle }
                              }));
                            }
                          }}
                          className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
                        >
                          + CONNECT
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder="e.g. linkedin.com/in/hussainansari"
                      name="linkedin"
                      value={formData.linked_accounts.linkedin}
                      onChange={handleLinkedAccountChange}
                    />
                  </div>
                </div>
              </Card>

              {/* Career Goals */}
              <Card title="Career Aspirations & Goals" subtitle="Target milestones for Roadmap Agent">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="e.g. Land FAANG ML Role"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addGoal}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono transition-colors active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <ul className="space-y-2">
                    {formData.goals.map((goal, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-xs font-mono bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-slate-300"
                      >
                        <span>{typeof goal === 'string' ? goal : goal.title}</span>
                        <button
                          type="button"
                          onClick={() => removeGoal(idx)}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
