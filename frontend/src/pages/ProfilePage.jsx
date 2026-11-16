/**
 * @file ProfilePage.jsx
 * @description Student Career Intelligence Profile CRUD management interface.
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
  RefreshCw
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
      skills: [...prev.skills, { ...newSkill, name: newSkill.name.trim() }]
    }));
    setNewSkill({ name: '', level: 'intermediate', category: 'Languages', verified: false });
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
    const techArray = newProject.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: newProject.title.trim(),
          description: newProject.description.trim(),
          repo_url: newProject.repo_url.trim(),
          technologies: techArray
        }
      ]
    }));
    setNewProject({ title: '', description: '', repo_url: '', technologies: '' });
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Career Intelligence Profile</h1>
              <p className="text-sm text-slate-500">
                Manage your credentials, validated competencies, and target aspirations
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
              className="shadow-md shadow-indigo-100"
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
              <Card title="Foundational Information">
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
                      placeholder="e.g. AI Research Engineer / Full-Stack Architect"
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
                subtitle="Mapped to Neo4j Knowledge Graph nodes"
              >
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <Input
                      label="Skill Name"
                      placeholder="e.g. PyTorch, React, Docker"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      className="sm:w-1/3"
                    />
                    <div className="sm:w-1/4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Proficiency
                      </label>
                      <select
                        value={newSkill.level}
                        onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div className="sm:w-1/4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        value={newSkill.category}
                        onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm"
                      >
                        <option value="Languages">Languages</option>
                        <option value="Frameworks">Frameworks</option>
                        <option value="Databases">Databases</option>
                        <option value="DevOps & Cloud">DevOps & Cloud</option>
                        <option value="Architecture">Architecture</option>
                      </select>
                    </div>
                    <Button variant="secondary" onClick={addSkill} className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-slate-800">{skill.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold uppercase">
                            {skill.level}
                          </span>
                          <span className="text-xs text-slate-400">({skill.category})</span>
                          {skill.verified && (
                            <span className="inline-flex items-center text-xs text-emerald-600">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verified
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
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
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
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
                    <Button variant="secondary" size="sm" onClick={addProject}>
                      <Plus className="w-4 h-4 mr-1" /> Add Project
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formData.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 border border-slate-200 rounded-lg flex items-start justify-between bg-white"
                      >
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800">{proj.title}</h4>
                          <p className="text-xs text-slate-600 mt-0.5">{proj.description}</p>
                          {proj.repo_url && (
                            <a
                              href={proj.repo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                            >
                              {proj.repo_url}
                            </a>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {proj.technologies?.map((tech, ti) => (
                              <span
                                key={ti}
                                className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProject(idx)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar Column: Goals, Linked Accounts, Completeness */}
            <div className="space-y-6">
              {/* Linked Accounts with OAuth Stubs */}
              <Card
                title="External Evidence Links"
                subtitle="OAuth 2.0 integrations for Career Evidence Agent"
              >
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Github className="w-5 h-5 text-slate-800" />
                        <span className="text-sm font-medium text-slate-800">GitHub</span>
                      </div>
                      {formData.linked_accounts.github ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" /> Connected
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
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          + Connect OAuth
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

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Linkedin className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-slate-800">LinkedIn</span>
                      </div>
                      {formData.linked_accounts.linkedin ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" /> Connected
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
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          + Connect OAuth
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
              <Card title="Career Aspirations & Goals">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="e.g. Land FAANG ML Internship"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                    />
                    <Button variant="secondary" size="sm" onClick={addGoal}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <ul className="space-y-2">
                    {formData.goals.map((goal, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200"
                      >
                        <span className="text-slate-700">{typeof goal === 'string' ? goal : goal.title}</span>
                        <button
                          type="button"
                          onClick={() => removeGoal(idx)}
                          className="text-slate-400 hover:text-red-500"
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
