import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  compact?: boolean;
}

export function Modal({ open, onClose, title, children, className, icon, compact }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handler);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={ref}
        tabIndex={-1}
        className={`bg-surface border border-border2 rounded w-full mx-4 max-h-[90vh] overflow-y-auto outline-none animate-in fade-in duration-200${
          compact ? ' max-w-[380px]' : ' max-w-[480px]'
        }${className ? ` ${className}` : ''}`}
      >
        <div className={`flex items-center justify-between px-6 border-b border-border${compact ? ' py-4' : ' py-5'}`}>
          <div className={`flex items-center gap-2.5${compact ? ' text-[11px] uppercase tracking-[0.12em] text-text-2 font-semibold' : ' text-base font-semibold'}`}>
            {icon && <span className={compact ? '' : 'w-4 h-4'}>{icon}</span>}
            {title}
          </div>
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
