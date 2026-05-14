'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

export function Input({ label, icon, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-2">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={`w-full bg-surface2 border border-border2 text-text font-sans text-sm
            px-3 py-2 rounded-sm outline-none transition-colors duration-150
            focus:border-accent
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red' : ''}
            ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-text">{error}</span>}
    </div>
  );
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export function Select({ label, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-2">{label}</label>
      )}
      <select
        className={`w-full bg-surface2 border border-border2 text-text font-sans text-sm
          px-3 py-2 rounded-sm outline-none cursor-pointer
          ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-2">{label}</label>
      )}
      <textarea
        className={`w-full bg-surface2 border border-border2 text-text font-sans text-sm
          px-3 py-2 rounded-sm outline-none resize-vertical min-h-[72px]
          ${className}`}
        {...props}
      />
    </div>
  );
}
