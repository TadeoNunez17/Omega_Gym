'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-3)', fontSize: 14 }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 'var(--sidebar-w)', flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
