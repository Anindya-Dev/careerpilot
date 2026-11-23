/**
 * @file Sidebar.jsx
 * @description Neo-Brutalist sidebar navigation bar providing single-selection
 * active states, smooth hash anchor scrolling, and modular telemetry links.
 * @author Md Hussain Ansari (Member 1) & Sargam Banerjee (Member 4)
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserCheck, Target, Activity, Cpu, Terminal } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentHash, setCurrentHash] = useState(window.location.hash || '');

  // Synchronize hash on hashchange or path changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '');
    };
    window.addEventListener('hashchange', handleHashChange);
    setCurrentHash(location.hash || '');
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [location]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', hash: '', icon: LayoutDashboard },
    { name: 'Career Profile', path: '/profile', hash: '', icon: UserCheck },
    { name: 'Skills & Evidence', path: '/dashboard', hash: '#skills', icon: Target },
    { name: 'Career Health', path: '/dashboard', hash: '#health', icon: Activity, badge: 'Live' },
    { name: 'Agent Pipeline', path: '/dashboard', hash: '#pipeline', icon: Cpu }
  ];

  const handleNavClick = (e, item) => {
    e.preventDefault();

    // If navigating between different paths
    if (location.pathname !== item.path) {
      navigate(`${item.path}${item.hash}`);
      setCurrentHash(item.hash);
      return;
    }

    // Same path: smoothly scroll to targeted anchor or top
    if (item.hash) {
      window.history.pushState(null, '', `${item.path}${item.hash}`);
      setCurrentHash(item.hash);
      const targetEl = document.querySelector(item.hash);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.history.pushState(null, '', item.path);
      setCurrentHash('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Deterministic Single Selection Check:
   * Exactly ONE nav item is active at any time.
   */
  const isItemActive = (item) => {
    if (location.pathname === '/profile') {
      return item.path === '/profile';
    }

    if (location.pathname === '/dashboard') {
      if (!currentHash || currentHash === '#' || currentHash === '#overview') {
        return item.path === '/dashboard' && !item.hash;
      }
      return item.path === '/dashboard' && item.hash === currentHash;
    }

    return false;
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r-2 border-black hidden md:flex flex-col justify-between min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1.5">
        <div className="px-2 py-1 text-[11px] font-mono font-black uppercase tracking-widest text-black">
          WORKSPACE_NAV
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <a
              key={item.name}
              href={`${item.path}${item.hash}`}
              onClick={(e) => handleNavClick(e, item)}
              className={`flex items-center justify-between px-3 py-2.5 border-2 transition-all font-mono text-xs font-bold ${
                active
                  ? 'border-black bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
                  : 'border-transparent text-slate-700 hover:border-black hover:bg-[#FAF5E6] hover:text-black hover:shadow-[2px_2px_0px_0px_#000]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className="w-4 h-4 stroke-[2.5]" />
                <span className="uppercase tracking-tight">{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-black bg-white text-black shadow-[1px_1px_0px_0px_#000]">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </div>

      {/* System Telemetry Metadata */}
      <div className="pt-4 border-t-2 border-black font-mono">
        <div className="border-2 border-black bg-[#FAF5E6] p-3 shadow-[3px_3px_0px_0px_#000] space-y-1.5">
          <div className="flex items-center space-x-1.5 text-black font-black text-[11px]">
            <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>SYS_ENV: PHASE_1</span>
          </div>
          <p className="text-[10px] text-slate-700 leading-tight">
            Microservices online on ports 5001 & 5002. LangGraph agent orchestrator on 8000.
          </p>
        </div>
      </div>
    </aside>
  );
}
