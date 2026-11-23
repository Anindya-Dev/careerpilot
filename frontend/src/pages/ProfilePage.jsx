/**
 * @file ProfilePage.jsx
 * @description Neo-Brutalist student Career Intelligence Profile CRUD management interface.
 * Implements full schema editing with bold borders, hard shadows, and high-contrast forms.
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
  Github,
  Linkedin,
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

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        <Sidebar />

        <main className="flex-1 p-5 sm:p-7 space-y-6">
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
            <Alert
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification({ type: '', message: '' })}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Primary Details (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
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

                  <div className="divide-y-2 divide-black">
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
              >
                <div className="space-y-4">
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
                    <button
                      type="button"
                      onClick={addProject}
                      className="px-4 py-2 border-2 border-black bg-[#FFE600] hover:bg-[#FFF066] text-black text-xs font-mono font-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75 flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" /> Add Project
                    </button>
                  </div>

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
                </div>
              </Card>
            </div>

            {/* Sidebar Column: Evidence Links, Goals (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Linked Accounts with OAuth Stubs */}
              <Card
                title="External Evidence Links"
                subtitle="OAuth 2.0 connectors for Evidence Agent ingestion"
                headerBg="bg-[#FF70A6]"
              >
                <div className="space-y-3.5">
                  <div className="p-3 bg-[#FAF5E6] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Github className="w-4 h-4 text-black stroke-[2.5]" />
                        <span className="text-xs font-mono font-bold text-black">GitHub OAuth</span>
                      </div>
                      {formData.linked_accounts.github ? (
                        <span className="text-[10px] font-mono font-black border border-black bg-[#70E000] text-black px-1.5 py-0.5 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1 stroke-[2.5]" /> LINKED
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const handle = window.prompt('Simulating GitHub OAuth flow. Enter GitHub username:', 'hussain-ansari');
                            if (handle) {
                              setFormData((prev) => ({
                                ...prev,
                                linked_accounts: { ...prev.linked_accounts, github: handle }
                              }));
                            }
                          }}
                          className="text-xs font-mono font-bold text-black underline hover:bg-[#FFE600] px-1"
                        >
                          + Connect
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

                  <div className="p-3 bg-[#FAF5E6] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Linkedin className="w-4 h-4 text-black stroke-[2.5]" />
                        <span className="text-xs font-mono font-bold text-black">LinkedIn OAuth</span>
                      </div>
                      {formData.linked_accounts.linkedin ? (
                        <span className="text-[10px] font-mono font-black border border-black bg-[#70E000] text-black px-1.5 py-0.5 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1 stroke-[2.5]" /> LINKED
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const handle = window.prompt('Simulating LinkedIn OAuth flow. Enter LinkedIn handle:', 'hussainansari');
                            if (handle) {
                              setFormData((prev) => ({
                                ...prev,
                                linked_accounts: { ...prev.linked_accounts, linkedin: handle }
                              }));
                            }
                          }}
                          className="text-xs font-mono font-bold text-black underline hover:bg-[#FFE600] px-1"
                        >
                          + Connect
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
