/**
 * @file RegisterPage.jsx
 * @description Hallmark-crafted student account registration view capturing name, email,
 * password, and engineering major with architectural dark styling and high-contrast tokens.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { Compass, UserPlus, ShieldCheck, Terminal } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    major: 'Computer Science & Engineering',
    enrollmentYear: new Date().getFullYear()
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid university or personal email';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        major: formData.major,
        enrollmentYear: parseInt(formData.enrollmentYear, 10)
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute inset-0 tech-grid pointer-events-none opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-slate-800/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center justify-center space-x-2.5 mb-5 group">
          <div className="w-10 h-10 rounded-lg bg-white text-slate-950 flex items-center justify-center font-bold shadow-sm transition-transform duration-150 group-hover:scale-105">
            <Compass className="w-5 h-5 text-slate-950 stroke-[2.2]" />
          </div>
        </Link>
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/90 text-[11px] font-mono text-cyan-400 mb-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>ONBOARDING :: NEW_STUDENT_PROFILE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Create Student Account
        </h2>
        <p className="mt-1 text-xs text-slate-400 font-mono">
          Initialize your multi-agent career intelligence profile
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0d111a] py-7 px-6 sm:px-8 rounded-xl border border-slate-800 shadow-2xl text-slate-100">
          {serverError && (
            <Alert
              type="error"
              message={serverError}
              className="mb-5"
              onClose={() => setServerError('')}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Md Hussain Ansari"
                value={formData.name}
                onChange={handleChange}
                name="name"
                className="w-full px-3.5 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1">
                Student Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. hussain@engineering.edu"
                value={formData.email}
                onChange={handleChange}
                name="email"
                className="w-full px-3.5 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1">
                Engineering Discipline / Major
              </label>
              <select
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1">
                Create Password (Min. 8 characters)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                name="password"
                className="w-full px-3.5 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                name="confirmPassword"
                className="w-full px-3.5 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 mt-2 rounded-lg bg-white text-slate-950 hover:bg-slate-100 font-semibold text-sm transition-colors duration-150 flex items-center justify-center active:scale-[0.99] disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4 mr-1.5 text-slate-800" />
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-mono text-slate-500 border-t border-slate-800/80 pt-4">
            Already registered?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Sign in to dashboard &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
