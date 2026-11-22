/**
 * @file Button.jsx
 * @description Hallmark atomic button component supporting tactile primary, secondary,
 * outline, and danger variants.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  onClick,
  className = '',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold transition-colors duration-150 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs sm:text-sm',
    lg: 'px-5 py-2.5 text-sm sm:text-base'
  };

  const variantClasses = {
    primary: 'bg-white text-slate-950 hover:bg-slate-100 shadow-sm',
    secondary: 'border border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white',
    outline: 'border border-slate-800 bg-transparent text-slate-300 hover:bg-slate-900 hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-500 shadow-sm'
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}
