/**
 * @file Card.jsx
 * @description Hallmark architectural card component for dashboard panels and telemetry widgets.
 * Features high-contrast dark surfaces, precision border outlines, and crisp typography.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';

export default function Card({
  title,
  subtitle,
  actions,
  children,
  className = '',
  bodyClassName = 'p-6'
}) {
  return (
    <div
      className={`bg-[#0d111a] border border-slate-800/90 rounded-xl shadow-lg overflow-hidden text-slate-100 ${className}`}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
