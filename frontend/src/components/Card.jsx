/**
 * @file Card.jsx
 * @description Flexible container card component for dashboard panels and widgets.
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
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
