/**
 * @file Sidebar.jsx
 * @description Neo-Brutalist sidebar navigation bar.
 * Routes directly to dedicated workspaces (/dashboard, /profile, /skills, /health, /pipeline).
 * Features smooth Framer Motion spring indicator gliding between selected menus.
 * @author Md Hussain Ansari (Member 1) & Sargam Banerjee (Member 4)
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  UserCheck,
  Target,
  Activity,
  Cpu,
  Briefcase,
  Menu,
  X
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import CareerPilotLogo from './CareerPilotLogo';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useSidebar();
  const [activePath, setActivePath] = useState(location.pathname);

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'A';

  // Synchronize active path on route changes
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Career Profile', path: '/profile', icon: UserCheck },
    { name: 'Skills & Evidence', path: '/skills', icon: Target },
    { name: 'Auto JobFinder', path: '/jobs', icon: Briefcase, badge: 'Live' },
    { name: 'Career Health', path: '/health', icon: Activity, badge: 'Live' },
    { name: 'Agent Pipeline', path: '/pipeline', icon: Cpu }
  ];

  const handleNavClick = (e, item) => {
    e.preventDefault();
    closeMobile();
    if (location.pathname !== item.path) {
      setActivePath(item.path);
      navigate(item.path);
    }
  };

  const isItemActive = (item) => {
    return (activePath || location.pathname) === item.path;
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
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r-2 border-black flex flex-col p-4 md:hidden transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobileOpen ? 'translate-x-0 shadow-[8px_0px_0px_0px_#000]' : '-translate-x-full'
        }`}
      >
        <div className="space-y-4 flex-1">
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

          {/* Navigation Items (Mobile) with Framer Motion spring pill */}
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);

              return (
                <motion.a
                  key={item.name}
                  href={item.path}
                  onClick={(e) => handleNavClick(e, item)}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center justify-between px-3 py-2.5 border-2 font-mono text-xs font-bold transition-colors ${
                    active
                      ? 'border-black text-black'
                      : 'border-transparent text-slate-700 hover:border-black hover:bg-[#FAF5E6] hover:text-black'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNavMobilePill"
                      className="absolute inset-0 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] -z-0"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 32
                      }}
                    />
                  )}

                  <div className="relative z-10 flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                    <span className="uppercase tracking-tight">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="relative z-10 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-red-600 text-red-600 bg-transparent shadow-[1px_1px_0px_0px_#000]">
                      {item.badge}
                    </span>
                  )}
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Mobile Drawer Bottom User Profile */}
        {user && (
          <div className="mt-auto pt-4 border-t-2 border-black">
            <Link
              to="/profile"
              onClick={closeMobile}
              className="flex items-center space-x-2.5 px-3 py-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] hover:bg-[#FAF5E6] transition-all"
            >
              <div className="w-6 h-6 shrink-0 border-2 border-black bg-[#70E000] flex items-center justify-center text-black font-mono text-xs font-black">
                {initial}
              </div>
              <div className="min-w-0 flex-1 text-left text-xs font-mono font-bold text-black truncate leading-tight">
                {user.name}
              </div>
            </Link>
          </div>
        )}
      </aside>

      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR WITH FRAMER MOTION GLIDING SELECTION     */}
      {/* Both Collapsed (Icon Rail) & Expanded (Full Menu) support */}
      {/* Locked to side (sticky) so it never scrolls away with page */}
      {/* ======================================================== */}
      <aside
        className={`sticky top-16 self-start h-[calc(100vh-4rem)] shrink-0 bg-white border-r-2 border-black hidden md:flex flex-col justify-between z-30 select-none overflow-y-auto overflow-x-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCollapsed ? 'w-16 p-2.5' : 'w-64 p-4'
        }`}
      >
        <div className="space-y-3">
          {/* Top Header: Hamburger Toggle Button */}
          <div
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-start'
            } pb-2.5 border-b border-black/10 transition-all duration-300`}
          >
            <button
              type="button"
              onClick={toggleCollapsed}
              className="p-2 border-2 border-black bg-white hover:bg-[#FFE600] shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75 flex items-center justify-center cursor-pointer shrink-0"
              title={isCollapsed ? 'Expand navigation workspaces' : 'Collapse navigation workspaces'}
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-4 h-4 stroke-[2.5] text-black" />
            </button>
          </div>

          {/* Navigation Items: Smooth Framer Motion selection glide in both collapsed and expanded modes */}
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);

              return (
                <motion.a
                  key={item.name}
                  href={item.path}
                  onClick={(e) => handleNavClick(e, item)}
                  whileHover={isCollapsed ? { scale: 1.08 } : { x: active ? 0 : 2 }}
                  whileTap={{ scale: 0.96 }}
                  title={isCollapsed ? item.name : undefined}
                  className={`group relative flex items-center ${
                    isCollapsed
                      ? 'justify-center w-11 h-11 mx-auto'
                      : 'justify-between px-3 py-2.5 w-full'
                  } border-2 font-mono text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? 'border-transparent text-black'
                      : 'border-transparent text-slate-700 hover:border-black hover:bg-[#FAF5E6] hover:text-black hover:shadow-[2px_2px_0px_0px_#000]'
                  }`}
                >
                  {/* Framer Motion Active Indicator Pill */}
                  {active && (
                    <motion.div
                      layoutId="activeNavDesktopPill"
                      className="absolute inset-0 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] -z-0"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 32,
                        mass: 0.8
                      }}
                    />
                  )}

                  <div
                    className={`relative z-10 flex items-center ${
                      isCollapsed ? 'justify-center' : 'space-x-3 min-w-0'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 stroke-[2.5]" />
                    {!isCollapsed && (
                      <span className="uppercase tracking-tight truncate whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span className="relative z-10 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-red-600 text-red-600 bg-transparent shadow-[1px_1px_0px_0px_#000] shrink-0">
                      {item.badge}
                    </span>
                  )}

                  {isCollapsed && item.badge && (
                    <span
                      className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-600 border border-black z-20"
                      title={item.badge}
                    />
                  )}
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM USER PROFILE BADGE                                */}
        {/* Minimized: only shows the initial box ('A')              */}
        {/* Expanded: shows initial box + full user name             */}
        {/* ======================================================== */}
        {user && (
          <div className="mt-auto pt-3 border-t-2 border-black/10">
            <Link
              to="/profile"
              title={user.name || 'Career Profile'}
              className={`flex items-center border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] hover:bg-[#FAF5E6] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75 cursor-pointer ${
                isCollapsed
                  ? 'justify-center w-11 h-11 mx-auto'
                  : 'space-x-2.5 px-3 py-2 w-full'
              }`}
            >
              <div className="w-6 h-6 shrink-0 border-2 border-black bg-[#70E000] flex items-center justify-center text-black font-mono text-xs font-black">
                {initial}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs font-mono font-bold text-black truncate leading-tight">
                    {user.name}
                  </div>
                </div>
              )}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
