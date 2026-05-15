import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { IconButton } from '@/components/ui/atoms/IconButton';
import { LoadingSpinner } from '@/components/ui/atoms/LoadingSpinner';
import { Modal } from '@/components/ui/molecules/Modal';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { SearchInput } from '@/components/ui/molecules/SearchInput';
import { TabBar } from '@/components/ui/molecules/TabBar';
import { Pagination } from '@/components/ui/molecules/Pagination';
import { IconDownload, IconPlus, IconEye, IconEdit, IconClose } from '@/lib/icons';
import { initials, avatarIndex, fmtDate, daysDiff, AVATAR_COLORS } from '@/lib/helpers';
import { membersService, type MemberListItem } from '@/services/members.service';
import { ResponsiveTable, type Column } from '@/components/ui/molecules/ResponsiveTable';

const ROWS_PER_PAGE = 8;
type Role = 'admin' | 'trainer' | 'member';
type FilterKey = 'all' | Role | 'inactive';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: 'active' | 'inactive';
  membresia: string | null;
  vence: string | null;
  plan: string | null;
  av: number;
  joinedAt: string;
}

function toMember(item: MemberListItem): Member {
  return {
    id: item.id,
    name: item.full_name,
    email: item.email ?? '',
    phone: item.phone,
    role: item.role,
    status: item.is_active ? 'active' : 'inactive',
    membresia: item.membership_type,
    vence: item.membership_end,
    plan: item.plan_name,
    av: avatarIndex(item.id),
    joinedAt: item.created_at,
  };
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterKey>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fRole, setFRole] = useState<Role>('member');
  const [fPlan, setFPlan] = useState('');

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filterRole = currentFilter === 'member' ? 'member'
        : currentFilter === 'trainer' ? 'trainer'
        : undefined;
      const filterStatus = currentFilter === 'inactive' ? 'inactive' : undefined;

      const result = await membersService.getAll({
        search: search || undefined,
        role: filterRole,
        status: filterStatus,
        page: currentPage,
        pageSize: ROWS_PER_PAGE,
      });

      setMembers(result.data.map(toMember));
      setTotal(result.count);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [currentFilter, search, currentPage]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const totalPages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const active = members.filter((m) => m.status === 'active' && m.role === 'member').length;
  const trainers = members.filter((m) => m.role === 'trainer').length;
  const newThisMonth = members.filter((m) => {
    const joined = new Date(m.joinedAt);
    const now = new Date();
    return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
  }).length;

  const resetForm = useCallback(() => {
    setFName(''); setFEmail(''); setFPhone('');
    setFRole('member'); setFPlan('');
  }, []);

  const guardarMiembro = useCallback(async () => {
    if (!fName.trim() || !fEmail.trim()) return;
    try {
      await membersService.create({
        full_name: fName.trim(),
        email: fEmail.trim(),
        phone: fPhone.trim() || undefined,
        role: fRole,
      });
      setModalOpen(false);
      resetForm();
      fetchMembers();
    } catch (e: any) {
      alert('Error al crear miembro: ' + e.message);
    }
  }, [fName, fEmail, fPhone, fRole, resetForm, fetchMembers]);

  const toggleStatus = useCallback(async (member: Member) => {
    try {
      const newStatus = member.status === 'active' ? false : true;
      await membersService.toggleActive(member.id, newStatus);
      fetchMembers();
    } catch (e: any) {
      alert('Error al cambiar estado: ' + e.message);
    }
  }, [fetchMembers]);

  const filters = [
    { key: 'all' as FilterKey, label: 'Todos' },
    { key: 'member' as FilterKey, label: 'Miembros' },
    { key: 'trainer' as FilterKey, label: 'Entrenadores' },
    { key: 'inactive' as FilterKey, label: 'Inactivos' },
  ];

  function renderMembership(m: Member) {
    const diff = daysDiff(m.vence);
    if (!m.membresia) return <span className="text-[12px] text-text-3">Sin membresía</span>;
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[12px] text-text-2">{m.membresia}</span>
        {diff !== null && diff < 0 && <span className="text-[11px] text-red-text">Venció hace {Math.abs(diff)}d</span>}
        {diff !== null && diff >= 0 && diff <= 7 && <span className="text-[11px] text-amber-text">Vence en {diff}d</span>}
        {diff !== null && diff > 7 && <span className="text-[11px] text-text-3">Vence {fmtDate(m.vence)}</span>}
      </div>
    );
  }

  const memberColumns: Column<Member>[] = [
    {
      key: 'name',
      label: 'Miembro',
      render: (m) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
            style={{ background: AVATAR_COLORS[m.av].bg, color: AVATAR_COLORS[m.av].fg }}>
            {initials(m.name)}
          </div>
          <div>
            <div className="font-medium text-[13px]">{m.name}</div>
            <div className="text-[11px] text-text-3 mt-0.5">{m.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rol',
      hide: 'lg',
      render: (m) => (
        <>{m.role === 'admin' ? <Badge variant="accent" dot>Admin</Badge> : m.role === 'trainer' ? <Badge variant="blue" dot>Entrenador</Badge> : <Badge variant="gray" dot>Miembro</Badge>}</>
      ),
    },
    {
      key: 'phone',
      label: 'Teléfono',
      hide: 'lg',
      render: (m) => <span className="text-[12px] text-text-2">{m.phone || <span className="text-text-3">—</span>}</span>,
    },
    {
      key: 'membership',
      label: 'Membresía activa',
      render: (m) => renderMembership(m),
    },
    {
      key: 'plan',
      label: 'Plan asignado',
      hide: 'lg',
      render: (m) => (
        m.plan ? (
          <span className="inline-flex items-center gap-1 px-[9px] py-[3px] rounded-sm text-[11px] bg-surface2 text-text-2 border border-border">{m.plan}</span>
        ) : (
          <span className="inline-flex items-center gap-1 px-[9px] py-[3px] rounded-sm text-[11px] text-text-3 border border-dashed border-border">Sin plan</span>
        )
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (m) => (
        m.status === 'active'
          ? <Badge variant="green" dot>Activo</Badge>
          : <Badge variant="red" dot>Inactivo</Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (m) => (
        <div className="flex gap-1.5 justify-end">
          <IconButton title="Ver detalle"><IconEye width="13" height="13" /></IconButton>
          <IconButton title="Editar"><IconEdit width="13" height="13" /></IconButton>
          <IconButton title={m.status === 'active' ? 'Desactivar' : 'Activar'} danger
            onClick={() => toggleStatus(m)}
          >
            {m.status === 'active' ? (
              <IconClose width="13" height="13" />
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>
            )}
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-bg sticky top-0 z-9">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
          Panel <span className="text-[10px]">›</span>
          <span className="text-text-2">Miembros</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button variant="ghost" size="sm" icon={<IconDownload />}>Exportar</Button>
          <Button variant="primary" size="sm" onClick={() => { resetForm(); setModalOpen(true); }} icon={<IconPlus />}>Nuevo miembro</Button>
        </div>
      </header>

      <div className="p-4 sm:p-7 flex-1">
        <PageHeader title="Miembros" description="Registro completo de socios, roles y estado de membresía" />

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total miembros', value: total, color: 'blue', sub: 'Registrados en el sistema' },
            { label: 'Activos', value: active, color: 'green', sub: 'Con membresía vigente' },
            { label: 'Entrenadores', value: trainers, color: 'amber', sub: 'Staff del gym' },
            { label: 'Nuevos este mes', value: newThisMonth, color: 'accent', sub: 'Este mes' },
          ].map((m) => (
            <div key={m.label} className="relative bg-surface border border-border rounded overflow-hidden p-[18px]">
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `var(--${m.color})` }} />
              <div className="text-[11px] text-text-3 uppercase tracking-[0.06em] mb-2.5">{m.label}</div>
              <div className="text-[32px] font-semibold leading-none -tracking-[0.03em]" style={{ color: `var(--${m.color}-text)` }}>{m.value}</div>
              <div className="text-[11px] text-text-3 mt-1.5">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Buscar por nombre, email o teléfono..." />
          <TabBar tabs={filters} active={currentFilter} onChange={(k) => { setCurrentFilter(k as FilterKey); setCurrentPage(1); }} />
        </div>

        {/* Loading */}
        {loading && <LoadingSpinner text="Cargando miembros…" />}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-[60px] text-red-text">Error: {error}</div>
        )}

        {/* Table / Cards */}
        {!loading && !error && (
          <div className="bg-surface border border-border rounded overflow-hidden">
            <ResponsiveTable
              columns={memberColumns}
              data={members}
              keyExtractor={(m) => m.id}
              cardTitle={(m) => m.name}
              cardSubtitle={(m) => m.email}
              cardAvatar={(m) => {
                const c = AVATAR_COLORS[m.av];
                return (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0"
                    style={{ background: c.bg, color: c.fg }}>
                    {initials(m.name)}
                  </div>
                );
              }}
              cardFields={[
                { label: 'Rol', value: (m: Member) => (
                  <>{m.role === 'admin' ? <Badge variant="accent" dot>Admin</Badge> : m.role === 'trainer' ? <Badge variant="blue" dot>Entrenador</Badge> : <Badge variant="gray" dot>Miembro</Badge>}</>
                )},
                { label: 'Estado', value: (m: Member) => (
                  m.status === 'active' ? <Badge variant="green" dot>Activo</Badge> : <Badge variant="red" dot>Inactivo</Badge>
                )},
                { label: 'Teléfono', value: (m: Member) => m.phone || <span className="text-text-3">—</span> },
                { label: 'Membresía', value: (m: Member) => renderMembership(m) },
                { label: 'Plan', value: (m: Member) => (
                  m.plan ? (
                    <span className="inline-flex items-center gap-1 px-[9px] py-[3px] rounded-sm text-[11px] bg-surface2 text-text-2 border border-border">{m.plan}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-[9px] py-[3px] rounded-sm text-[11px] text-text-3 border border-dashed border-border">Sin plan</span>
                  )
                )},
              ]}
              emptyMessage="No se encontraron miembros con ese criterio."
            />

            <Pagination
              current={safePage}
              total={totalPages}
              start={(safePage - 1) * ROWS_PER_PAGE}
              end={Math.min(safePage * ROWS_PER_PAGE, total)}
              totalItems={total}
              label="miembros"
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo miembro" className="max-w-[400px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-2 font-medium">Nombre completo *</label>
            <input type="text" placeholder="Ej. Maria Gonzalez" value={fName} onChange={(e) => setFName(e.target.value)}
              className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-2 font-medium">Teléfono</label>
            <input type="text" placeholder="311 234 5678" value={fPhone} onChange={(e) => setFPhone(e.target.value)}
              className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans" />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-[12px] text-text-2 font-medium">Correo electrónico *</label>
            <input type="email" placeholder="correo@ejemplo.com" value={fEmail} onChange={(e) => setFEmail(e.target.value)}
              className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-2 font-medium">Rol</label>
            <select value={fRole} onChange={(e) => setFRole(e.target.value as Role)}
              className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans">
              <option value="member">Miembro</option>
              <option value="trainer">Entrenador</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-2 font-medium">Tipo de membresía</label>
            <select value={fPlan} onChange={(e) => setFPlan(e.target.value)}
              className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans">
              <option value="">Sin membresía</option>
              <option value="Mensual">Mensual</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Anual">Anual</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2.5 mt-2">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button variant="primary" onClick={guardarMiembro}
            disabled={!fName.trim() || !fEmail.trim()}>
            Guardar miembro
          </Button>
        </div>
      </Modal>
    </>
  );
}


