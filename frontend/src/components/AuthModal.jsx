/**
 * @file AuthModal.jsx
 * @description Hallmark-styled pop-up modal for student authentication and registration.
 * High-contrast dark engineering aesthetics with blurred background, clear typography,
 * and seamless mode toggling.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from './Input';
import Button from './Button';
import Alert from './Alert';
import { Compass, X, ArrowRight, UserPlus, ShieldCheck, Terminal } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setServerError('');
      setErrors({});
    }
  }, [isOpen, initialMode]);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateLogin = () => {
    const errs = {};
    if (!loginData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!loginData.password) errs.password = 'Password is required';
    else if (loginData.password.length < 8) errs.password = 'Min. 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegister = () => {
    const errs = {};
    if (!regData.name.trim()) errs.name = 'Full name is required';
    if (!regData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!regData.password) errs.password = 'Password is required';
    else if (regData.password.length < 8) errs.password = 'Must be at least 8 characters';
    if (regData.password !== regData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateLogin()) return;

    setIsSubmitting(true);
    try {
      await login(loginData.email, loginData.password);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateRegister()) return;

    setIsSubmitting(true);
    try {
      await register({
        name: regData.name,
        email: regData.email,
        password: regData.password,
        major: regData.major,
        enrollmentYear: parseInt(regData.enrollmentYear, 10)
      });
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Blurred Deep Backdrop */}
      <div
        className="fixed inset-0 bg-[#04060a]/80 backdrop-blur-md transition-all duration-200"
        onClick={onClose}
      />

      <div className="min-h-screen px-4 text-center flex items-center justify-center py-8">
        {/* Modal Window Card */}
        <div
          className="relative inline-block w-full max-w-md p-6 sm:p-7 my-8 text-left align-middle transition-all transform bg-[#0d111a] border border-slate-800 shadow-2xl rounded-xl z-10 text-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-white text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <Compass className="w-4 h-4 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                {mode === 'login' ? 'Student Sign In' : 'Create Student Profile'}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">AUTH::ACCESS_GATEWAY</p>
            </div>
          </div>

          {/* Segmented Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-lg mb-5 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setServerError('');
                setErrors({});
              }}
              className={`py-1.5 rounded transition-colors ${
                mode === 'login'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SIGN_IN
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setServerError('');
                setErrors({});
              }}
              className={`py-1.5 rounded transition-colors ${
                mode === 'register'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              REGISTER
            </button>
          </div>

          {serverError && (
            <Alert
              type="error"
              message={serverError}
              className="mb-4"
              onClose={() => setServerError('')}
            />
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                  Student Email
                </label>
                <input
                  type="email"
                  placeholder="student@careerpilot.io"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                <span className="flex items-center text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                  12-ROUND BCRYPT
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setServerError('');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Create account &rarr;
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 mt-2 rounded-lg bg-white text-slate-950 hover:bg-slate-100 font-semibold text-sm transition-colors duration-150 flex items-center justify-center active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
                <ArrowRight className="w-4 h-4 ml-1.5 text-slate-800" />
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Md Hussain Ansari"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1">
                  Student Email
                </label>
                <input
                  type="email"
                  placeholder="hussain@engineering.edu"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1">
                  Discipline / Major
                </label>
                <select
                  value={regData.major}
                  onChange={(e) => setRegData({ ...regData, major: e.target.value })}
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
                  Password (Min 8 Chars)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
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
                  value={regData.confirmPassword}
                  onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
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
                {isSubmitting ? 'Creating Profile...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
