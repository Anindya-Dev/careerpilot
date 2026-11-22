/**
 * @file Sidebar.jsx
 * @description Hallmark-crafted sidebar navigation bar with dark architectural surfaces,
 * monospace telemetry tags, and dedicated slots for Member 4's visualizations.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserCheck, Target, Activity, Sparkles, Terminal } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Career Profile', to: '/profile', icon: UserCheck },
    { name: 'Skills & Evidence', to: '/profile#skills', icon: Target },
    { name: 'Career Health', to: '/dashboard#health', icon: Activity, badge: 'Sargam' },
    { name: 'AI Recommendations', to: '/dashboard#recommendations', icon: Sparkles }
  ];

  return (
    <aside className="w-64 bg-[#090d16]/80 border-r border-slate-800/80 hidden md:flex flex-col justify-between min-h-[calc(100vh-4rem)] p-4 backdrop-blur-sm">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
          SYSTEM_NAV
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold border-l-2 border-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center space-x-2.5">
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/40 text-cyan-400">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Microservice Architecture Telemetry Card */}
      <div className="pt-4 border-t border-slate-850">
        <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-3 text-xs text-slate-400 space-y-1.5">
          <div className="flex items-center space-x-2 text-slate-300 font-mono text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">SERVICES_ONLINE</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 space-y-0.5">
            <div className="flex justify-between">
              <span>AUTH_SVC</span>
              <span className="text-emerald-400">:5001 OK</span>
            </div>
            <div className="flex justify-between">
              <span>PROFILE_SVC</span>
              <span className="text-emerald-400">:5002 OK</span>
            </div>
            <div className="flex justify-between">
              <span>SECURITY</span>
              <span className="text-slate-400">12-BCRYPT</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
