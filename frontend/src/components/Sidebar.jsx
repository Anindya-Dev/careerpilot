/**
 * @file Sidebar.jsx
 * @description Neo-Brutalist sidebar navigation bar providing single-selection
 * active states, smooth hash anchor scrolling, and a smooth sliding motion animation
 * driven exclusively by the sidebar hamburger toggle.
 * @author Md Hussain Ansari (Member 1) & Sargam Banerjee (Member 4)
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Target,
  Activity,
  Cpu,
  Terminal,
  Menu,
  X
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import CareerPilotLogo from './CareerPilotLogo';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentHash, setCurrentHash] = useState(window.location.hash || '');
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useSidebar();

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
    closeMobile();

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
    <>
      {/* ======================================================== */}
      {/* MOBILE DRAWER OVERLAY (< 768px)                           */}
      {/* ======================================================== */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-xs transition-opacity duration-200"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Over Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r-2 border-black flex flex-col justify-between p-4 md:hidden transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobileOpen ? 'translate-x-0 shadow-[8px_0px_0px_0px_#000]' : '-translate-x-full'
        }`}
      >
        <div className="space-y-4">
          {/* Mobile Drawer Header with Close Action */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <CareerPilotLogo className="h-8 w-auto" />
            <button
              type="button"
              onClick={closeMobile}
              className="p-1.5 border-2 border-black bg-white hover:bg-[#FF5757] hover:text-white shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Navigation Items (Mobile) */}
          <div className="space-y-2">
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
        </div>

        {/* Mobile Telemetry Footer */}
        <div className="pt-4 border-t-2 border-black font-mono">
          <div className="border-2 border-black bg-[#FAF5E6] p-3 shadow-[3px_3px_0px_0px_#000] space-y-1.5">
            <div className="flex items-center space-x-1.5 text-black font-black text-[11px]">
              <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>SYS_ENV: PHASE_1</span>
            </div>
            <p className="text-[10px] text-slate-700 leading-tight">
              Microservices online on ports 5001 & 5002.
            </p>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR WITH SMOOTH SLIDING MOTION               */}
      {/* ======================================================== */}
      <aside
        className={`shrink-0 bg-white border-r-2 border-black hidden md:flex flex-col justify-between min-h-[calc(100vh-4rem)] select-none overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCollapsed ? 'w-16 p-2.5' : 'w-64 p-4'
        }`}
      >
        <div className="space-y-3">
          {/* Top Header: Hamburger Toggle Button */}
          <div
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between'
            } pb-2.5 border-b border-black/10 transition-all duration-300`}
          >
            <button
              type="button"
              onClick={toggleCollapsed}
              className="p-2 border-2 border-black bg-white hover:bg-[#FFE600] shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75 flex items-center justify-center cursor-pointer shrink-0"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle sidebar menu"
            >
              <Menu className="w-4 h-4 stroke-[2.5] text-black" />
            </button>

            {!isCollapsed && (
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-500 transition-opacity duration-300 truncate">
                WORKSPACE
              </span>
            )}
          </div>

          {/* Navigation Items (Desktop) */}
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);

              return (
                <a
                  key={item.name}
                  href={`${item.path}${item.hash}`}
                  onClick={(e) => handleNavClick(e, item)}
                  title={isCollapsed ? item.name : undefined}
                  className={`group relative flex items-center ${
                    isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3 py-2.5'
                  } border-2 transition-all duration-200 font-mono text-xs font-bold ${
                    active
                      ? 'border-black bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
                      : 'border-transparent text-slate-700 hover:border-black hover:bg-[#FAF5E6] hover:text-black hover:shadow-[2px_2px_0px_0px_#000]'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 stroke-[2.5]" />
                    <span
                      className={`uppercase tracking-tight truncate whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isCollapsed
                          ? 'opacity-0 max-w-0 -translate-x-3 pointer-events-none'
                          : 'opacity-100 max-w-[160px] translate-x-0'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>

                  {!isCollapsed && item.badge && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-black bg-white text-black shadow-[1px_1px_0px_0px_#000] shrink-0 transition-opacity duration-200">
                      {item.badge}
                    </span>
                  )}

                  {isCollapsed && item.badge && (
                    <span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#70E000] border border-black"
                      title={item.badge}
                    />
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* System Telemetry Metadata (Desktop) */}
        {isCollapsed ? (
          <div className="pt-4 border-t-2 border-black flex justify-center font-mono transition-all duration-300">
            <div
              className="w-10 h-10 border-2 border-black bg-[#FAF5E6] shadow-[2px_2px_0px_0px_#000] flex items-center justify-center cursor-pointer hover:bg-[#FFE600] transition-colors"
              title="SYS_ENV: PHASE_1 :: Microservices online on ports 5001 & 5002. LangGraph agent orchestrator on 8000."
            >
              <Terminal className="w-4 h-4 stroke-[2.5] text-black" />
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t-2 border-black font-mono transition-opacity duration-300">
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
        )}
      </aside>
    </>
  );
}
