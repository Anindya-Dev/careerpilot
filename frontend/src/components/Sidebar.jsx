/**
 * @file Sidebar.jsx
 * @description Sidebar navigation bar providing quick links to platform modules.
 * Designed with modular slots for Sargam's dashboard visualizations.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserCheck, Target, Activity, Sparkles, BookOpen } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Career Profile', to: '/profile', icon: UserCheck },
    { name: 'Skills & Evidence', to: '/profile#skills', icon: Target },
    { name: 'Career Health', to: '/dashboard#health', icon: Activity, badge: 'Live' },
    { name: 'AI Recommendations', to: '/dashboard#recommendations', icon: Sparkles, badge: 'Agent' }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:block min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-3.5 text-xs text-slate-600">
          <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-1">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Phase 1 Architecture</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Auth & Profile foundation active. Connected to Node microservices on ports 5001 & 5002.
          </p>
        </div>
      </div>
    </aside>
  );
}
