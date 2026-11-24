/**
 * @file RegisterPage.jsx
 * @description Neo-Brutalist student account registration view.
 * High-contrast borders, solid shadows, vibrant buttons.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { Compass, UserPlus, Shield, Terminal } from 'lucide-react';

export default function RegisterPage() {
  const { register, enterDemoMode } = useAuth();
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
    if (!formData.name.trim()) errs.name = 'Full name required';
    if (!formData.email.trim()) {
      errs.email = 'Email required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Invalid email address';
    }

    if (!formData.password) {
      errs.password = 'Password required';
    } else if (formData.password.length < 8) {
      errs.password = 'Min. 8 characters';
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
    <div className="min-h-screen bg-[#F4F0EA] text-black flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#FFE600] selection:text-black">
      <div className="absolute inset-0 neo-grid pointer-events-none opacity-25" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center justify-center space-x-2 mb-4 group">
          <div className="w-10 h-10 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-bold transition-transform duration-75 group-hover:-translate-y-0.5">
            <Compass className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
        </Link>
        <div className="inline-flex items-center space-x-2 px-3 py-1 border-2 border-black bg-white text-xs font-mono font-bold shadow-[2px_2px_0px_0px_#000] mb-3">
          <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>PROFILE_INITIALIZATION :: NODE_02</span>
        </div>
        <h2 className="text-3xl font-black text-black tracking-tight font-sans">
          Initialize Student Profile
        </h2>
        <p className="mt-1 text-xs text-slate-700 font-mono font-bold">
          Multi-Agent Career Intelligence Architecture
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-7 px-6 sm:px-8 border-[3px] border-black shadow-[6px_6px_0px_0px_#000] text-black">
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
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Rivera"
                value={formData.name}
                onChange={handleChange}
                name="name"
                className="w-full px-3 py-2 text-xs font-mono bg-[#FAF5E6] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black placeholder-slate-400 focus:outline-none focus:bg-white"
                required
              />
              {errors.name && <p className="mt-1 text-[11px] font-mono font-bold text-[#FF5757]">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1">
                Student Email Address
              </label>
              <input
                type="email"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={handleChange}
                name="email"
                className="w-full px-3 py-2 text-xs font-mono bg-[#FAF5E6] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black placeholder-slate-400 focus:outline-none focus:bg-white"
                required
              />
              {errors.email && <p className="mt-1 text-[11px] font-mono font-bold text-[#FF5757]">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1">
                Academic Major
              </label>
              <select
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FAF5E6] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black focus:outline-none focus:bg-white"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1">
                Create Password (Min 8 Chars)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                name="password"
                className="w-full px-3 py-2 text-xs font-mono bg-[#FAF5E6] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black placeholder-slate-400 focus:outline-none focus:bg-white"
                required
              />
              {errors.password && <p className="mt-1 text-[11px] font-mono font-bold text-[#FF5757]">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                name="confirmPassword"
                className="w-full px-3 py-2 text-xs font-mono bg-[#FAF5E6] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black placeholder-slate-400 focus:outline-none focus:bg-white"
                required
              />
              {errors.confirmPassword && <p className="mt-1 text-[11px] font-mono font-bold text-[#FF5757]">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 mt-2 border-2 border-black bg-[#70E000] hover:bg-[#85FF0A] text-black font-mono font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-75 flex items-center justify-center disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              {isSubmitting ? 'Registering...' : 'Initialize Student Profile'}
            </button>

            {/* Clear, honest option for faculty evaluation when backend is off */}
            <button
              type="button"
              onClick={() => {
                enterDemoMode();
                navigate('/dashboard');
              }}
              className="w-full mt-3 py-2 border-2 border-black bg-[#E2E8F0] font-mono font-bold text-xs uppercase tracking-wider text-black hover:bg-slate-300 transition-colors shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              Explore Demo Sandbox (Offline Evaluation)
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-mono font-bold text-slate-700 border-t-2 border-black pt-4">
            Already have a profile?{' '}
            <Link to="/login" className="text-black underline font-black hover:bg-[#FFE600] px-1">
              Sign in to workspace &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
