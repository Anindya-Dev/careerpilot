/**
 * @file Alert.jsx
 * @description Hallmark contextual alert banner for errors, warnings, and success messages.
 * High-contrast dark surfaces with crisp status accents.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export default function Alert({ type = 'error', message, title, className = '', onClose }) {
  if (!message) return null;

  const typeConfig = {
    error: {
      bg: 'bg-red-950/40 border-red-800/80 text-red-200',
      icon: <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
    },
    warning: {
      bg: 'bg-amber-950/40 border-amber-800/80 text-amber-200',
      icon: <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
    },
    success: {
      bg: 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200',
      icon: <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
    },
    info: {
      bg: 'bg-cyan-950/40 border-cyan-800/80 text-cyan-200',
      icon: <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
    }
  };

  const { bg, icon } = typeConfig[type] || typeConfig.error;

  return (
    <div className={`border rounded-lg p-3.5 flex items-start space-x-3 text-xs font-mono ${bg} ${className}`}>
      {icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold text-white mb-0.5">{title}</h4>}
        <div>{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          &times;
        </button>
      )}
    </div>
  );
}
