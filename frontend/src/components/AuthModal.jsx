/**
 * @file AuthModal.jsx
 * @description Neo-Brutalist authentication popup modal.
 * Chunky black borders, vibrant accent headers, and hard offset shadows.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from './Alert';
import SocialAuthButtons from './SocialAuthButtons';
import { Compass, X, ArrowRight, UserPlus, Shield, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { user, login, register, verifyEmailCode, enterDemoMode } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // If already authenticated, redirect immediately to dashboard
  useEffect(() => {
    if (isOpen && user) {
      onClose();
      navigate('/dashboard');
    }
  }, [isOpen, user, onClose, navigate]);

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    if (!loginData.email.trim()) errs.email = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email.trim())) {
      errs.email = 'Invalid email address';
    }
    if (!loginData.password) errs.password = 'Password required';
    else if (loginData.password.length < 8) errs.password = 'Min. 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegister = () => {
    const errs = {};
    if (!regData.name.trim()) errs.name = 'Full name required';
    if (!regData.email.trim()) errs.email = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regData.email.trim())) {
      errs.email = 'Invalid email address';
    }
    if (!regData.password) errs.password = 'Password required';
    else if (regData.password.length < 8) errs.password = 'Min. 8 characters';
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
      const res = await register({
        name: regData.name,
        email: regData.email,
        password: regData.password,
        major: regData.major,
        enrollmentYear: parseInt(regData.enrollmentYear, 10)
      });
      if (res?.needsVerification) {
        setIsVerifying(true);
        return;
      }
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!verificationCode.trim()) {
      setServerError('Please enter the 6-digit verification code.');
      return;
    }
    setIsSubmitting(true);
    try {
      await verifyEmailCode(verificationCode.trim());
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Solid Black Dim Overlay */}
      <div
        className="fixed inset-0 bg-black/70"
        onClick={onClose}
      />

      <div className="min-h-screen px-4 text-center flex items-center justify-center py-8">
        {/* Neo-Brutalist Modal Card */}
        <div
          className="relative inline-block w-full max-w-md my-8 text-left align-middle bg-[#FFFDF9] border-[3px] border-black shadow-[8px_8px_0px_0px_#000] z-10 text-black overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="bg-[#FFE600] border-b-[3px] border-black p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-white border-2 border-black flex items-center justify-center font-bold">
                <Compass className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-mono font-black uppercase tracking-wider text-black">
                {mode === 'login' ? 'STUDENT AUTHENTICATION' : 'CREATE PROFILE'}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors duration-75 shadow-[2px_2px_0px_0px_#000]"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="p-6">
            {/* Segmented Mode Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#F4F0EA] border-2 border-black mb-5 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setServerError('');
                  setErrors({});
                }}
                className={`py-1.5 transition-all duration-75 ${
                  mode === 'login'
                    ? 'bg-[#38B6FF] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                    : 'text-black hover:bg-white'
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
                className={`py-1.5 transition-all duration-75 ${
                  mode === 'register'
                    ? 'bg-[#38B6FF] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                    : 'text-black hover:bg-white'
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

            {/* Social OAuth Providers (Clerk Headless) */}
            <SocialAuthButtons mode={mode} onError={setServerError} />

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
                    Student Email
                  </label>
                  <input
                    type="email"
                    placeholder="student@university.edu"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-black placeholder-slate-400 focus:outline-none focus:bg-[#FFFDF0]"
                    required
                  />
                  {errors.email && <p className="mt-1 text-[11px] font-mono font-bold text-[#FF5757]">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full px-3 py-2 pr-9 text-xs font-mono bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-black placeholder-slate-400 focus:outline-none focus:bg-[#FFFDF0]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-black focus:outline-none cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 stroke-[2.5]" /> : <Eye className="w-4 h-4 stroke-[2.5]" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-[11px] font-mono font-bold text-[#FF5757]">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-black font-bold pt-1">
                  <span className="flex items-center">
                    <Shield className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                    PROTECTED BY CLERK
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setServerError('');
                    }}
                    className="underline hover:bg-[#FFE600] px-1"
                  >
                    Need profile? Register &rarr;
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 mt-2 border-2 border-black bg-[#70E000] text-black hover:bg-[#85FF0A] font-mono font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-75 flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}
                  <ArrowRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
                </button>

                {/* Clear, honest option for faculty evaluation when backend is off */}
                <button
                  type="button"
                  onClick={() => {
                    enterDemoMode();
                    onClose();
                    navigate('/dashboard');
                  }}
                  className="w-full mt-3 py-2 border-2 border-black bg-[#E2E8F0] font-mono font-bold text-xs uppercase tracking-wider text-black hover:bg-slate-300 transition-colors shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                >
                  Explore Demo Sandbox (Offline Evaluation)
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && isVerifying && (
              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div className="bg-[#FFE600] border-2 border-black p-3 text-xs font-mono font-bold shadow-[2px_2px_0px_0px_#000]">
                  <p>Verification code sent to: <span className="underline">{regData.email}</span></p>
                  <p className="text-[11px] font-normal mt-1">Please enter the 6-digit confirmation code from your email.</p>
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-3 py-2 text-center text-lg font-mono tracking-widest bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] focus:outline-none focus:bg-[#FFFDF0]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 border-2 border-black bg-[#70E000] hover:bg-[#85FF0A] text-black font-mono font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  {isSubmitting ? 'Verifying...' : 'Complete Registration'}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && !isVerifying && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-black placeholder-slate-400 focus:outline-none focus:bg-[#FFFDF0]"
                    required
                  />
                  {errors.name && <p className="mt-1 text-[11px] font-mono font-bold text-[#FF5757]">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1">
                    Student Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. student@university.edu"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-black placeholder-slate-400 focus:outline-none focus:bg-[#FFFDF0]"
                    required
                  />
                  {errors.email && <p className="mt-1 text-[11px] font-mono font-bold text-[#FF5757]">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1">
                    Discipline / Major
                  </label>
                  <select
                    value={regData.major}
                    onChange={(e) => setRegData({ ...regData, major: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-black focus:outline-none focus:bg-[#FFFDF0]"
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
                    Password (Min 8 Chars)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      className="w-full px-3 py-2 pr-9 text-xs font-mono bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-black placeholder-slate-400 focus:outline-none focus:bg-[#FFFDF0]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-black focus:outline-none cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 stroke-[2.5]" /> : <Eye className="w-4 h-4 stroke-[2.5]" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-[11px] font-mono font-bold text-[#FF5757]">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={regData.confirmPassword}
                      onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-9 text-xs font-mono bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-black placeholder-slate-400 focus:outline-none focus:bg-[#FFFDF0]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-black focus:outline-none cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4 stroke-[2.5]" /> : <Eye className="w-4 h-4 stroke-[2.5]" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-[11px] font-mono font-bold text-[#FF5757]">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 mt-2 border-2 border-black bg-[#70E000] text-black hover:bg-[#85FF0A] font-mono font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-75 flex items-center justify-center disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                  {isSubmitting ? 'Registering...' : 'Initialize Student Account'}
                </button>

                {/* Clear, honest option for faculty evaluation when backend is off */}
                <button
                  type="button"
                  onClick={() => {
                    enterDemoMode();
                    onClose();
                    navigate('/dashboard');
                  }}
                  className="w-full mt-3 py-2 border-2 border-black bg-[#E2E8F0] font-mono font-bold text-xs uppercase tracking-wider text-black hover:bg-slate-300 transition-colors shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                >
                  Explore Demo Sandbox (Offline Evaluation)
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
