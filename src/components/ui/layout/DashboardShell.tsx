'use client';

import { type ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from './BottomNav';

interface DashboardShellProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

export function DashboardShell({ children, hideSidebar }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-bg">
      {!hideSidebar && (
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      )}
      <main
        className="flex-1 flex flex-col min-h-screen pb-16 lg:pb-0 lg:ml-[var(--sidebar-w)]"
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
