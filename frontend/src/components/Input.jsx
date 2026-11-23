/**
 * @file Input.jsx
 * @description Neo-Brutalist text input component.
 * High-contrast black borders, hard drop-shadows, and bold monospace labels.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';

export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  className = '',
  disabled = false,
  ...props
}) {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
          {label} {required && <span className="text-[#FF5757]">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 text-xs font-mono bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] focus:outline-none focus:bg-[#FFFDF0] transition-colors duration-75 disabled:bg-slate-100 disabled:text-slate-500 ${
          error
            ? 'border-[#FF5757] text-[#FF5757] placeholder-[#FF5757]/60'
            : 'text-black placeholder-slate-400'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-[11px] font-mono font-bold text-[#FF5757]">{error}</p>}
      {helperText && !error && <p className="mt-1 text-[10px] font-mono text-slate-600">{helperText}</p>}
    </div>
  );
}
