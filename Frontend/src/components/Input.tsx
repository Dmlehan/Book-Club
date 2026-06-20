import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-slate-900/80 border text-sm text-slate-100 rounded-lg py-2.5 px-3 transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 placeholder-slate-500 ${
              leftIcon ? 'pl-10' : ''
            } ${
              error ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30' : 'border-slate-800'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-rose-400 font-medium mt-0.5">{error}</span>}
        {!error && helperText && <span className="text-xs text-slate-500 mt-0.5">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
