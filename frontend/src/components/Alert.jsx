/**
 * @file Alert.jsx
 * @description Contextual alert banner for displaying errors, warnings, and success messages.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export default function Alert({ type = 'error', message, title, className = '', onClose }) {
  if (!message) return null;

  const typeConfig = {
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
    }
  };

  const { bg, icon } = typeConfig[type] || typeConfig.error;

  return (
    <div className={`border rounded-lg p-4 flex items-start space-x-3 text-sm ${bg} ${className}`}>
      {icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold">{title}</h4>}
        <div className="text-sm">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          &times;
        </button>
      )}
    </div>
  );
}
