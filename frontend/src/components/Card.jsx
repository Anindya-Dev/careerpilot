/**
 * @file Card.jsx
 * @description Neo-Brutalist card container.
 * Thick black border, hard offset shadow, bold header banner.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';

export default function Card({
  title,
  subtitle,
  actions,
  children,
  className = '',
  bodyClassName = 'p-5',
  headerBg = 'bg-[#FAF5E6]'
}) {
  return (
    <div
      className={`bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] text-black ${className}`}
    >
      {(title || subtitle || actions) && (
        <div className={`px-4 py-3 border-b-2 border-black flex items-center justify-between ${headerBg}`}>
          <div>
            {title && (
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-black">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] font-mono text-slate-700 mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
