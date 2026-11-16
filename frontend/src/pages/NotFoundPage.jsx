/**
 * @file NotFoundPage.jsx
 * @description Clean 404 fallback page providing redirection back to safety.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import Button from '../components/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404 - Route Uncharted</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        The destination you navigated to does not exist in the CareerPilot route map.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="primary">
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
