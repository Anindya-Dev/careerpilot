/**
 * @file App.jsx
 * @description Root client application routing tree configuring BrowserRouter,
 * guarded routes, public auth entry points, Clerk SSO callback, and dedicated workspace handlers.
 * @author Md Hussain Ansari (Member 1) & Anindya Bhattacharya (Member 2)
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClerkProviderWrapper from './context/ClerkProviderWrapper';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { SidebarProvider } from './context/SidebarContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SkillsPage from './pages/SkillsPage';
import CareerHealthPage from './pages/CareerHealthPage';
import AgentPipelinePage from './pages/AgentPipelinePage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center p-6 font-mono">
          <div className="max-w-lg w-full bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-6 space-y-4">
            <h1 className="text-lg font-black uppercase bg-[#FF5757] text-white px-3 py-1.5 border-2 border-black inline-block">
              APPLICATION RECOVERY
            </h1>
            <p className="text-xs font-bold text-slate-800">
              {this.state.error?.message || 'An unexpected UI state error occurred.'}
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              className="px-4 py-2 border-2 border-black bg-[#FFE600] font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] cursor-pointer"
            >
              Reset Local Session & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
      <ClerkProviderWrapper>
        <AuthProvider>
          <ProfileProvider>
            <SidebarProvider>
              <Routes>
                {/* Public dynamic landing page */}
                <Route path="/" element={<LandingPage />} />

                {/* Public authentication flows */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Clerk SSO Redirect Handler */}
                <Route
                  path="/sso-callback"
                  element={
                    <AuthenticateWithRedirectCallback
                      signInForceRedirectUrl="/dashboard"
                      signUpForceRedirectUrl="/dashboard"
                    />
                  }
                />

                {/* Guarded dedicated workspaces */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/skills"
                  element={
                    <ProtectedRoute>
                      <SkillsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/health"
                  element={
                    <ProtectedRoute>
                      <CareerHealthPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pipeline"
                  element={
                    <ProtectedRoute>
                      <AgentPipelinePage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </SidebarProvider>
          </ProfileProvider>
        </AuthProvider>
      </ClerkProviderWrapper>
    </BrowserRouter>
    </AppErrorBoundary>
  );
}
