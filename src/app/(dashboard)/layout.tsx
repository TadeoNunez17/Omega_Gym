'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { DashboardShell } from '@/components/ui/layout/DashboardShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, initialized } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (initialized && !loading) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
      } else {
        setChecked(true);
      }
    }
  }, [initialized, loading, user, router]);

  if (!checked || loading || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg text-text-3 text-sm">
        Cargando...
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
