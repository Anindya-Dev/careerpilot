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

export default function App() {
  return (
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
  );
}
