/**
 * @file Navbar.jsx
 * @description Neo-Brutalist top navigation bar with full-viewport spanning width.
 * Bold high-contrast aesthetic with thick borders and tactile actions.
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
    <header className="sticky top-0 z-40 bg-white border-b-2 border-black w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Identity */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-bold transition-transform duration-75 group-hover:-translate-y-0.5">
              <Compass className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-base font-black tracking-tight text-black uppercase font-mono">
                CareerPilot
              </span>
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 border-2 border-black bg-[#C4A1FF] text-black uppercase shadow-[1px_1px_0px_0px_#000]">
                V1.0
              </span>
            </div>
          </Link>

          {/* User Profile & Logout */}
          {user && (
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center space-x-2.5 px-3 py-1.5 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75"
              >
                <div className="w-6 h-6 border-2 border-black bg-[#70E000] flex items-center justify-center text-black font-mono text-xs font-black">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3 stroke-[2.5]" />}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-mono font-bold text-black leading-none">
                    {user.name}
                  </div>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border-2 border-black bg-[#FF5757] hover:bg-[#FF7070] text-white text-xs font-mono font-bold shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75"
                title="Disconnect session"
              >
                <LogOut className="w-3.5 h-3.5 sm:mr-1.5 stroke-[2.5]" />
                <span className="hidden sm:inline">DISCONNECT</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
