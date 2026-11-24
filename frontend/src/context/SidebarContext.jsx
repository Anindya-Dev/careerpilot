/**
 * @file SidebarContext.jsx
 * @description Centralized React Context for sidebar collapse and mobile drawer state.
 * Enables both Navbar and Sidebar to coordinate sidebar toggles seamlessly.
 * @author Md Hussain Ansari (Member 1)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  // Desktop collapse state: true = hidden at starting (only hamburger visible), false = expanded menus
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem('careerpilot_sidebar_collapsed');
      if (stored !== null) {
        return stored === 'true';
      }
      return true; // Hidden by default at starting
    } catch {
      return true;
    }
  });

  // Mobile drawer overlay state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Persist desktop preference
  useEffect(() => {
    try {
      localStorage.setItem('careerpilot_sidebar_collapsed', isCollapsed);
    } catch {
      // Ignore localStorage errors
    }
  }, [isCollapsed]);

  // Close mobile drawer on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapsed = () => setIsCollapsed((prev) => !prev);
  const toggleMobileOpen = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapsed,
        isMobileOpen,
        toggleMobileOpen,
        closeMobile
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    // Return safe fallback defaults if rendered outside provider
    return {
      isCollapsed: false,
      toggleCollapsed: () => {},
      isMobileOpen: false,
      toggleMobileOpen: () => {},
      closeMobile: () => {}
    };
  }
  return context;
}
