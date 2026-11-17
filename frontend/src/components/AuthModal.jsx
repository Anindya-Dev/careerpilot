/**
 * @file AuthModal.jsx
 * @description Blurred backdrop pop-up modal for student authentication and registration on the Landing Page.
 * Allows instant tab switching between Login and Register with live validation.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from './Input';
import Button from './Button';
import Alert from './Alert';
import { Compass, X, ArrowRight, UserPlus, ShieldCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'

  // Sync mode whenever initialMode changes upon modal open
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setServerError('');
      setErrors({});
    }
  }, [isOpen, initialMode]);

  // Form states
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

  // Close on Escape key press
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

  // Validation
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
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />

      <div className="min-h-screen px-4 text-center flex items-center justify-center py-8">
        {/* Modal Window Card */}
        <div
          className="relative inline-block w-full max-w-md p-6 sm:p-8 my-8 text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl border border-slate-100 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {mode === 'login' ? 'Student Sign In' : 'Create Student Profile'}
              </h3>
              <p className="text-xs text-slate-500">CareerPilot AI Intelligence Platform</p>
            </div>
          </div>

          {/* Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setServerError('');
                setErrors({});
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setServerError('');
                setErrors({});
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Registration
            </button>
          </div>

          {serverError && (
            <Alert
              type="error"
              message={serverError}
              className="mb-5"
              onClose={() => setServerError('')}
            />
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Student Email Address"
                name="email"
                type="email"
                placeholder="e.g. student@careerpilot.io"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                error={errors.email}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                error={errors.password}
                required
              />

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                  12-round bcrypt secure
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setServerError('');
                  }}
                  className="text-indigo-600 hover:text-indigo-500 font-semibold"
                >
                  Need an account?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 text-base mt-2 shadow-lg shadow-indigo-100"
                isLoading={isSubmitting}
              >
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <Input
                label="Full Name"
                name="name"
                placeholder="e.g. Md Hussain Ansari"
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                error={errors.name}
                required
              />

              <Input
                label="Student Email"
                name="email"
                type="email"
                placeholder="e.g. hussain@engineering.edu"
                value={regData.email}
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                error={errors.email}
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Discipline / Major
                </label>
                <select
                  value={regData.major}
                  onChange={(e) => setRegData({ ...regData, major: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                value={regData.password}
                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                error={errors.password}
                required
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={regData.confirmPassword}
                onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 text-base mt-2 shadow-lg shadow-indigo-100"
                isLoading={isSubmitting}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Complete Registration
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
