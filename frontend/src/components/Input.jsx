/**
 * @file Input.jsx
 * @description Hallmark architectural text input component with built-in label,
 * validation error, and helper text. High contrast dark styling with cyan focus states.
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
        <label htmlFor={inputId} className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-red-400">*</span>}
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
        className={`w-full px-3.5 py-2 text-sm bg-slate-950/80 border rounded-lg transition-colors duration-150 focus:outline-none disabled:bg-slate-900 disabled:text-slate-500 ${
          error
            ? 'border-red-500/80 text-red-200 focus:border-red-400 placeholder-red-400/50'
            : 'border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400 font-mono">{error}</p>}
      {helperText && !error && <p className="mt-1 text-[11px] font-mono text-slate-400">{helperText}</p>}
    </div>
  );
}
