import type { NavSection } from './sidebar-config'

export const trainerNavItems: NavSection[] = [
  { section: 'Principal', items: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  ]},
  { section: 'Gestion', items: [
    { label: 'Miembros', href: '/members', icon: 'members' },
    { label: 'Membresías', href: '/memberships', icon: 'memberships' },
    { label: 'Planes de Entrenamiento', href: '/training-plans', icon: 'plans' },
  ]},
]

export const trainerIcons: Record<string, string> = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  members: '<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M19 11l2 2 4-4"/>',
  memberships: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  plans: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
}
