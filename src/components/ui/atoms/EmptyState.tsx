import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string | ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-8 text-center gap-3">
      {icon && typeof icon === 'string' ? (
        <div className="text-4xl">{icon}</div>
      ) : icon ? (
        <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center">
          {icon}
        </div>
      ) : null}
      <div className="text-sm font-semibold text-text-2">{title}</div>
      {description && (
        <div className="text-xs text-text-3 max-w-xs leading-relaxed">{description}</div>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
