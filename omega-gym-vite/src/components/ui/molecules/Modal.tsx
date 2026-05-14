'use client';

import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-surface border border-border2 rounded w-full mx-4 max-w-[480px] max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: '95vw' }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="text-base font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-sm bg-transparent border border-border text-text-3 cursor-pointer flex items-center justify-center text-base font-sans hover:bg-surface2 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-6 flex flex-col gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}
