/**
 * @file LoginPage.jsx
 * @description Neo-Brutalist authentication login view.
 * High-contrast borders, solid shadows, vibrant buttons.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import SocialAuthButtons from '../components/SocialAuthButtons';
import { Compass, ArrowRight, Shield, Terminal, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { user, login, enterDemoMode, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-redirect to dashboard if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      const rawTarget = location.state?.from?.pathname;
      const destination = rawTarget && rawTarget !== '/login' && rawTarget !== '/register'
        ? rawTarget
        : '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [user, isLoading, navigate, location]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Invalid email address';
    }

    if (!password) {
      errs.password = 'Password required';
    } else if (password.length < 8) {
      errs.password = 'Min. 8 characters';
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
      await login(email, password);
      const rawTarget = location.state?.from?.pathname;
      const destination = rawTarget && rawTarget !== '/login' && rawTarget !== '/register'
        ? rawTarget
        : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid email or password');
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
          <span>AUTH_GATEWAY :: NODE_01</span>
        </div>
        <h2 className="text-3xl font-black text-black tracking-tight font-sans">
          Sign In to Workspace
        </h2>
        <p className="mt-1 text-xs text-slate-700 font-mono font-bold">
          Multi-Agent Career Intelligence Platform
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

          {/* Social OAuth Providers (Clerk Headless) */}
          <SocialAuthButtons mode="login" onError={setServerError} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
                Student Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FAF5E6] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black placeholder-slate-400 focus:outline-none focus:bg-white"
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  className="w-full px-3 py-2 pr-9 text-xs font-mono bg-[#FAF5E6] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black placeholder-slate-400 focus:outline-none focus:bg-white"
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

            <div className="flex items-center justify-between text-[11px] font-mono font-bold pt-1">
              <span className="flex items-center">
                <Shield className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                PROTECTED BY CLERK
              </span>
              <span className="bg-[#FFE600] border border-black px-1 text-[10px]">ENTERPRISE SSO</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 mt-2 border-2 border-black bg-[#70E000] hover:bg-[#85FF0A] text-black font-mono font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-75 flex items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
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
            Need an account?{' '}
            <Link to="/register" className="text-black underline font-black hover:bg-[#FFE600] px-1">
              Create student profile &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
