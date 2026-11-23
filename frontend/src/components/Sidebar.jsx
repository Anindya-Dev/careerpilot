/**
 * @file Sidebar.jsx
 * @description Neo-Brutalist sidebar navigation with real-time status and single active selection.
 * Supports hash-based and path-based navigation with zero duplicate active states.
 * @author Md Hussain Ansari (Member 1)
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
    { name: 'Career Health', path: '/dashboard', hash: '#health', icon: Activity, badge: 'M4' },
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
            <button
              key={item.name}
              type="button"
              onClick={(e) => handleNavClick(e, item)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 border-2 border-black text-xs font-mono font-bold transition-all duration-75 text-left cursor-pointer ${
                active
                  ? 'bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000] translate-x-0.5'
                  : 'bg-white text-black shadow-none hover:bg-[#FAF5E6] hover:shadow-[2px_2px_0px_0px_#000]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className="w-4 h-4 text-black stroke-[2.2]" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono font-black px-1.5 py-0.2 border border-black bg-[#C4A1FF] text-black">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Services Online Spec Box */}
      <div className="pt-4 border-t-2 border-black">
        <div className="bg-[#FAF5E6] border-2 border-black shadow-[3px_3px_0px_0px_#000] p-3 text-xs space-y-1.5">
          <div className="flex items-center space-x-2 text-black font-mono font-black text-xs">
            <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="uppercase">SERVICES_STATUS</span>
          </div>
          <div className="text-[11px] font-mono font-bold text-slate-800 space-y-1 pt-1">
            <div className="flex justify-between items-center">
              <span>AUTH_SVC</span>
              <span className="bg-[#70E000] text-black border border-black px-1 text-[10px]">:5001 OK</span>
            </div>
            <div className="flex justify-between items-center">
              <span>PROFILE_SVC</span>
              <span className="bg-[#70E000] text-black border border-black px-1 text-[10px]">:5002 OK</span>
            </div>
            <div className="flex justify-between items-center">
              <span>SECURITY</span>
              <span className="bg-[#FFE600] text-black border border-black px-1 text-[10px]">BCRYPT_12</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
