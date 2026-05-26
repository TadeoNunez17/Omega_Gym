import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

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
  const pathname = useLocation().pathname;
  const user = useAuthStore((s) => s.user);
  const initials = user ? user.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AD';

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 z-10 flex flex-col border-r border-border"
      style={{ width: 'var(--sidebar-w)', background: 'var(--surface)' }}
    >
      <div className="px-5 py-[18px] border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#0f0f0f', border: '1px solid rgba(255,45,45,0.35)' }}>
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <text x="12" y="18" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#ff2d2d" textAnchor="middle">Ω</text>
            </svg>
          </div>
          <div>
            <div className="text-[15px] font-semibold -tracking-[0.01em]">Omega Gym</div>
            <div className="text-[10px] text-text-3 mt-0.5 tracking-[0.08em] uppercase">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2.5">
        {navItems.map((section) => (
          <div key={section.section} className="mb-5">
            <div className="text-[10px] text-text-3 tracking-[0.1em] uppercase px-2.5 mb-1.5">
              {section.section}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-sm text-[13px] no-underline mb-0.5 transition-all duration-150
                    ${isActive ? 'text-accent bg-accent-dim font-medium' : 'text-text-2 bg-transparent hover:bg-surface2'}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    dangerouslySetInnerHTML={{ __html: icons[item.icon] || '' }}
                    className={`flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`}
                  />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto bg-red-bg text-red-text text-[10px] font-medium px-[7px] py-[2px] rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-2.5 py-[14px] border-t border-border">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-sm">
          <div className="w-[30px] h-[30px] rounded-full bg-accent flex items-center justify-center text-[11px] font-semibold text-black flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="text-[12px] font-medium">{user?.full_name || 'Administrador'}</div>
            <div className="text-[10px] text-text-3">{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</div>
          </div>
        </div>

        <button
          onClick={() => {
            useAuthStore.getState().logout();
            window.location.href = '/login';
          }}
          className="flex items-center gap-2 w-full px-2.5 py-[9px] mt-1 rounded-sm bg-transparent border-none text-text-3 text-[12px] cursor-pointer font-sans transition-all duration-150 hover:bg-red-bg hover:text-red-text"
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
