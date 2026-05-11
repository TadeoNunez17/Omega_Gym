'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { section: 'Principal', items: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  ]},
  { section: 'Gestion', items: [
    { label: 'Miembros', href: '/members', icon: 'members' },
    { label: 'Membresias', href: '/memberships', icon: 'memberships', badge: null },
    { label: 'Pagos', href: '/payments', icon: 'payments', badge: 3 },
    { label: 'Planes de Entrenamiento', href: '/training-plans', icon: 'plans' },
    { label: 'Registro de Huella', href: '/fingerprint', icon: 'fingerprint' },
  ]},
  { section: 'Analisis', items: [
    { label: 'Reportes', href: '/reports', icon: 'reports' },
  ]},
];

const icons: Record<string, string> = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  members: '<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M19 11l2 2 4-4"/>',
  memberships: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  payments: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  plans: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  reports: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  fingerprint: '<path d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/>',
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 10,
    }}>
      <div style={{
        padding: '22px 20px 18px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 6h1v12H6M17 6h1v12h-1M3 9h3M18 9h3M3 15h3M18 15h3M9 12h6"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>Omega Gym</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Panel</div>
          </div>
        </div>
      </div>

      <nav style={{ padding: '16px 10px', flex: 1, overflowY: 'auto' }}>
        {navItems.map((section) => (
          <div key={section.section} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 10,
              color: 'var(--text-3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '0 10px',
              marginBottom: 6,
            }}>
              {section.section}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    color: isActive ? 'var(--accent)' : 'var(--text-2)',
                    background: isActive ? 'var(--accent-dim)' : 'transparent',
                    fontWeight: isActive ? 500 : 400,
                    textDecoration: 'none',
                    transition: 'background 0.15s, color 0.15s',
                    marginBottom: 2,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    dangerouslySetInnerHTML={{ __html: icons[item.icon] || '' }}
                    style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}
                  />
                  {item.label}
                  {item.badge && (
                    <span style={{
                      marginLeft: 'auto',
                      background: 'var(--red-bg)',
                      color: 'var(--red-text)',
                      fontSize: 10,
                      fontWeight: 500,
                      padding: '2px 7px',
                      borderRadius: 100,
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{
        padding: '14px 10px',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
        }}>
          <div style={{
            width: 30, height: 30,
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: '#000',
            flexShrink: 0,
          }}>
            AD
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>Administrador</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>admin@omegagym.com</div>
          </div>
        </div>

        <button
          onClick={() => { window.location.href = '/login'; }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '9px 10px', marginTop: 4,
            borderRadius: 'var(--radius-sm)',
            background: 'transparent', border: 'none',
            color: 'var(--text-3)', fontSize: 12, fontWeight: 400,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--red-bg)';
            (e.currentTarget as HTMLElement).style.color = 'var(--red-text)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-3)';
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
  );
}
