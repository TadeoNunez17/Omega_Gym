'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const navSections = [
  { label: 'Principal', items: [
    { label: 'Mi panel', href: '/trainer/panel', icon: 'dashboard' },
    { label: 'Mis miembros', href: '/trainer/members', icon: 'members' },
  ]},
  { label: 'Planes', items: [
    { label: 'Mis planes', href: '/trainer/plans', icon: 'plans' },
    { label: 'Plantillas', href: '/trainer/templates', icon: 'templates', badge: 2 },
  ]},
];

const icons: Record<string, string> = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  members: '<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M19 11l2 2 4-4"/>',
  plans: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  templates: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
};

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, initialized } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (initialized && !loading) {
      if (!user || (user.role !== 'trainer' && user.role !== 'admin')) {
        router.push('/login');
      } else {
        setChecked(true);
      }
    }
  }, [initialized, loading, user, router]);

  if (!checked || loading || !initialized || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-3)', fontSize: 14 }}>
        Cargando...
      </div>
    );
  }

  const initials = user.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 'var(--sidebar-w)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10,
      }}>
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, background: 'var(--accent)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" width="18" height="18">
                <path d="M6 6h1v12H6M17 6h1v12h-1M3 9h3M18 9h3M3 15h3M18 15h3M9 12h6"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>Omega Gym</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Entrenador</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '16px 10px', flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 10px', margin: '0 0 4px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-dim)',
              border: '1px solid rgba(232,255,71,0.15)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}></span>
              <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500 }}>Sesión de entrenador</span>
            </div>
          </div>

          {navSections.map((section) => (
            <div key={section.label} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 10, color: 'var(--text-3)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '0 10px', marginBottom: 6,
              }}>
                {section.label}
              </div>
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.label} href={item.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 10px', borderRadius: 'var(--radius-sm)',
                      fontSize: 13, color: isActive ? 'var(--accent)' : 'var(--text-2)',
                      background: isActive ? 'var(--accent-dim)' : 'transparent',
                      fontWeight: isActive ? 500 : 400,
                      textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
                      marginBottom: 2,
                    }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                      dangerouslySetInnerHTML={{ __html: icons[item.icon] || '' }}
                      style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }} />
                    {item.label}
                    {item.badge && (
                      <span style={{
                        marginLeft: 'auto', background: 'var(--red-bg)',
                        color: 'var(--red-text)', fontSize: 10, fontWeight: 500,
                        padding: '2px 7px', borderRadius: 100,
                      }}>{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: '14px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(236,72,153,0.15)', color: '#f472b6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, flexShrink: 0,
            }}>{initials}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{user.full_name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Entrenador</div>
            </div>
          </div>
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              window.location.href = '/login';
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '9px 10px', marginTop: 4,
              borderRadius: 'var(--radius-sm)',
              background: 'transparent', border: 'none',
              color: 'var(--text-3)', fontSize: 12, fontWeight: 400,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: 'var(--sidebar-w)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
