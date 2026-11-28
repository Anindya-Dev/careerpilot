/**
 * @file Button.jsx
 * @description Neo-Brutalist atomic button component with bold borders,
 * hard drop-shadows, and tactile mechanical push interactions.
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
    'inline-flex items-center justify-center font-mono font-bold border-2 border-black tracking-wide transition-all duration-75 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
    md: 'px-4 py-2 text-xs uppercase shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none',
    lg: 'px-6 py-2.5 text-sm uppercase shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none'
  };

  const variantClasses = {
    primary: 'bg-[#FFE600] text-black hover:bg-[#FFF066]',
    secondary: 'bg-white text-black hover:bg-[#F4F0EA]',
    outline: 'bg-[#C4A1FF] text-black hover:bg-[#D4B8FF]',
    accent: 'bg-[#70E000] text-black hover:bg-[#85FF0A]',
    danger: 'bg-[#FF5757] text-white hover:bg-[#FF7070]'
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant] || variantClasses.primary} ${className}`}
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
