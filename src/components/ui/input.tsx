'use client';

import { InputHTMLAttributes, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  helperText?: string;
}

export function Input({
  label,
  error,
  icon,
  helperText,
  type = 'text',
  placeholder,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 ${icon ? 'pl-12' : ''} rounded-full
            bg-white dark:bg-slate-800 
            border-2 border-slate-200 dark:border-slate-700
            placeholder-slate-400 dark:placeholder-slate-500
            text-slate-900 dark:text-white
            transition-all duration-200
            focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
            disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      {helperText && !error && (
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
