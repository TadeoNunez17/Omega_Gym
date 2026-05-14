import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { Modal } from '@/components/ui/molecules/Modal';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { SearchInput } from '@/components/ui/molecules/SearchInput';
import { Pagination } from '@/components/ui/molecules/Pagination';
import { membersService, type MemberListItem } from '@/services/members.service';

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

const AV_COLORS = [
  { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  { bg: 'rgba(244,114,182,0.15)', fg: '#f472b6' },
  { bg: 'rgba(168,85,247,0.15)', fg: '#c084fc' },
  { bg: 'rgba(251,146,60,0.15)', fg: '#fb923c' },
  { bg: 'rgba(20,184,166,0.15)', fg: '#2dd4bf' },
];

function avatarIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % AV_COLORS.length;
}

function initials(n: string) {
  return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function fmtDate(s: string | null) {
  if (!s) return '—';
  const [y, mo, d] = s.split('-');
  const m = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(d)} ${m[parseInt(mo) - 1]} ${y}`;
}

function daysDiff(d: string | null): number | null {
  if (!d) return null;
  return Math.round((new Date(d).getTime() - Date.now()) / 86400000);
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

  const setFilter = useCallback((f: FilterKey) => {
    setCurrentFilter(f);
    setCurrentPage(1);
  }, []);

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

  return (
    <>
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-bg sticky top-0 z-9">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
          Panel <span className="text-[10px]">›</span>
          <span className="text-text-2">Miembros</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button variant="ghost" size="sm" icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          }>Exportar</Button>
          <Button variant="primary" size="sm" onClick={() => { resetForm(); setModalOpen(true); }} icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          }>Nuevo miembro</Button>
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
          <div className="flex gap-1 overflow-x-auto">
            {filters.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-2 rounded-sm text-[12px] font-medium cursor-pointer whitespace-nowrap font-sans transition-all duration-150
                  ${currentFilter === tab.key ? 'bg-accent text-black' : 'bg-transparent text-text-2 border border-border'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-[60px] text-text-3">Cargando miembros…</div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-[60px] text-red-text">Error: {error}</div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="bg-surface border border-border rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px] min-w-[780px]">
                <thead>
                  <tr className="border-b border-border">
                    {['Miembro', 'Rol', 'Teléfono', 'Membresía activa', 'Plan asignado', 'Estado', ''].map((h) => (
                      <th key={h} className="px-[18px] py-[11px] text-left text-[10px] font-medium text-text-3 uppercase tracking-[0.07em] whitespace-nowrap bg-surface2">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-[60px] text-text-3">No se encontraron miembros con ese criterio.</td>
                    </tr>
                  ) : (
                    members.map((m) => {
                      const diff = daysDiff(m.vence);
                      return (
                        <tr key={m.id} className="transition-colors duration-100 hover:bg-surface2/50">
                          <td className="px-[18px] py-[14px] border-b border-border align-middle">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
                                style={{ background: AV_COLORS[m.av].bg, color: AV_COLORS[m.av].fg }}>
                                {initials(m.name)}
                              </div>
                              <div>
                                <div className="font-medium text-[13px]">{m.name}</div>
                                <div className="text-[11px] text-text-3 mt-0.5">{m.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-[18px] py-[14px] border-b border-border align-middle">
                            {m.role === 'admin' && <Badge variant="accent" dot>Admin</Badge>}
                            {m.role === 'trainer' && <Badge variant="blue" dot>Entrenador</Badge>}
                            {m.role === 'member' && <Badge variant="gray" dot>Miembro</Badge>}
                          </td>
                          <td className="px-[18px] py-[14px] border-b border-border align-middle text-[12px] text-text-2">
                            {m.phone || <span className="text-text-3">—</span>}
                          </td>
                          <td className="px-[18px] py-[14px] border-b border-border align-middle">
                            {m.membresia ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[12px] text-text-2">{m.membresia}</span>
                                {diff !== null && diff < 0 && <span className="text-[11px] text-red-text">Venció hace {Math.abs(diff)}d</span>}
                                {diff !== null && diff >= 0 && diff <= 7 && <span className="text-[11px] text-amber-text">Vence en {diff}d</span>}
                                {diff !== null && diff > 7 && <span className="text-[11px] text-text-3">Vence {fmtDate(m.vence)}</span>}
                              </div>
                            ) : <span className="text-[12px] text-text-3">Sin membresía</span>}
                          </td>
                          <td className="px-[18px] py-[14px] border-b border-border align-middle">
                            {m.plan ? (
                              <span className="inline-flex items-center gap-1 px-[9px] py-[3px] rounded-sm text-[11px] bg-surface2 text-text-2 border border-border">{m.plan}</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-[9px] py-[3px] rounded-sm text-[11px] text-text-3 border border-dashed border-border">Sin plan</span>
                            )}
                          </td>
                          <td className="px-[18px] py-[14px] border-b border-border align-middle">
                            {m.status === 'active'
                              ? <Badge variant="green" dot>Activo</Badge>
                              : <Badge variant="red" dot>Inactivo</Badge>}
                          </td>
                          <td className="px-[18px] py-[14px] border-b border-border align-middle">
                            <div className="flex gap-1.5 justify-end">
                              <IconBtn title="Ver detalle">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                              </IconBtn>
                              <IconBtn title="Editar">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                              </IconBtn>
                              <IconBtn title={m.status === 'active' ? 'Desactivar' : 'Activar'} danger
                                onClick={() => toggleStatus(m)}
                              >
                                {m.status === 'active' ? (
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                ) : (
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>
                                )}
                              </IconBtn>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

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

function IconBtn({ children, title, danger, onClick }: { children: React.ReactNode; title: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button title={title} onClick={onClick}
      className={`w-7 h-7 rounded-sm bg-transparent border border-border flex items-center justify-center cursor-pointer transition-colors duration-150
        ${danger ? 'text-red-text' : 'text-text-3'} hover:bg-surface2`}>
      {children}
    </button>
  );
}
