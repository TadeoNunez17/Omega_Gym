export interface NavItem {
  label: string
  href: string
  icon: string
  badgeKey?: 'pendingPayments'
}

export interface NavSection {
  section: string
  items: NavItem[]
}

export const baseNavItems: NavSection[] = [
  { section: 'Principal', items: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  ]},
  { section: 'Gestion', items: [
    { label: 'Miembros', href: '/members', icon: 'members' },
    { label: 'Membresias', href: '/memberships', icon: 'memberships' },
    { label: 'Pagos', href: '/payments', icon: 'payments', badgeKey: 'pendingPayments' },
    { label: 'Planes de Entrenamiento', href: '/training-plans', icon: 'plans' },
    ...(import.meta.env.DEV ? [{ label: 'Registro de Huella', href: '/fingerprint', icon: 'fingerprint' }] : []),
  ]},

]

export const icons: Record<string, string> = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  members: '<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M19 11l2 2 4-4"/>',
  memberships: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  payments: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  plans: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  fingerprint: '<path d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/>',
}
