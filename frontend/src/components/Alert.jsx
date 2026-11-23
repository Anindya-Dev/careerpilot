/**
 * @file Alert.jsx
 * @description Neo-Brutalist alert banner. Heavy black border, hard offset shadow, bold colors.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export default function Alert({ type = 'error', message, title, className = '', onClose }) {
  if (!message) return null;

  const typeConfig = {
    error: {
      bg: 'bg-[#FF70A6] text-black',
      icon: <XCircle className="w-4 h-4 text-black mt-0.5 flex-shrink-0 stroke-[2.5]" />
    },
    warning: {
      bg: 'bg-[#FFDE59] text-black',
      icon: <AlertCircle className="w-4 h-4 text-black mt-0.5 flex-shrink-0 stroke-[2.5]" />
    },
    success: {
      bg: 'bg-[#70E000] text-black',
      icon: <CheckCircle className="w-4 h-4 text-black mt-0.5 flex-shrink-0 stroke-[2.5]" />
    },
    info: {
      bg: 'bg-[#38B6FF] text-black',
      icon: <Info className="w-4 h-4 text-black mt-0.5 flex-shrink-0 stroke-[2.5]" />
    }
  };

  const { bg, icon } = typeConfig[type] || typeConfig.error;

  return (
    <div className={`border-2 border-black shadow-[4px_4px_0px_0px_#000] p-3 flex items-start space-x-2.5 text-xs font-mono font-bold ${bg} ${className}`}>
      {icon}
      <div className="flex-1">
        {title && <h4 className="font-black uppercase tracking-wider mb-0.5">{title}</h4>}
        <div>{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-black hover:scale-110 font-bold px-1 transition-transform"
        >
          &times;
        </button>
      )}
    </div>
  );
}
