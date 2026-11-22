/**
 * @file Navbar.jsx
 * @description Hallmark-crafted top navigation bar with architectural dark styling,
 * brand telemetry, user profile summary, and logout controls.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#07090e]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Identity */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-white text-slate-950 flex items-center justify-center font-bold shadow-sm transition-transform duration-150 group-hover:scale-105">
              <Compass className="w-5 h-5 text-slate-950 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-tight text-white">CareerPilot</span>
                <span className="font-mono text-[10px] tracking-widest text-slate-400 font-normal px-1.5 py-0.2 rounded border border-slate-800 bg-slate-900">
                  v1.0
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider hidden sm:block">
                Multi-Agent Intelligence
              </span>
            </div>
          </Link>

          {/* User profile & controls */}
          {user && (
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-mono text-xs font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]">
                    {user.major || 'Engineering Student'}
                  </div>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-red-950/40 hover:border-red-800/60 text-slate-400 hover:text-red-400 text-xs font-mono transition-colors active:scale-[0.98]"
                title="Sign out of platform"
              >
                <LogOut className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">DISCONNECT</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
