/**
 * @file LoginPage.jsx
 * @description Hallmark-crafted authentication login view featuring client-side validation,
 * error handling banner, architectural dark aesthetic, and seamless redirect to dashboard.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { Compass, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
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
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid email or password');
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
          <span>AUTH_GATEWAY :: SECURE_SESSION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Sign In to CareerPilot
        </h2>
        <p className="mt-1 text-xs text-slate-400 font-mono">
          Multi-Agent Career Intelligence & Knowledge Graph
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
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                Student Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="e.g. hussain@engineering.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
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
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
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
              <span className="text-slate-400">PHASE 1 TOKEN ROTATION</span>
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

          <div className="mt-6 text-center text-xs font-mono text-slate-500 border-t border-slate-800/80 pt-4">
            Need an account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Create student profile &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
