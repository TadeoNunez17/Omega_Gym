'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { Modal } from '@/components/ui/molecules/Modal';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { SearchInput } from '@/components/ui/molecules/SearchInput';
import { Pagination } from '@/components/ui/molecules/Pagination';

const TODAY = new Date('2026-05-01');
const ROWS_PER_PAGE = 8;

type Role = 'admin' | 'trainer' | 'member';
type Status = 'active' | 'inactive';

interface Member {
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: Status;
  membresia: string | null;
  vence: string | null;
  plan: string | null;
  av: number;
  joinedAt: string;
}

const INITIAL_MEMBERS: Member[] = [
  { name: 'Carlos Ramirez',  email: 'carlos@correo.com',  phone: '311 234 5678', role: 'member',  status: 'active',   membresia: 'Mensual',     vence: '2026-05-25', plan: 'Fuerza A',    av: 0, joinedAt: '2026-01-10' },
  { name: 'Sofia Lopez',     email: 'sofia@correo.com',   phone: '312 456 7890', role: 'member',  status: 'active',   membresia: 'Trimestral',  vence: '2026-06-01', plan: 'Cardio Plus', av: 1, joinedAt: '2026-02-03' },
  { name: 'Miguel Torres',   email: 'miguel@correo.com',  phone: '313 567 8901', role: 'trainer', status: 'active',   membresia: null,          vence: null,         plan: null,         av: 2, joinedAt: '2025-11-15' },
  { name: 'Ana Gutierrez',   email: 'ana@correo.com',     phone: '314 678 9012', role: 'member',  status: 'active',   membresia: 'Anual',       vence: '2027-01-15', plan: 'Fuerza B',    av: 3, joinedAt: '2026-01-15' },
  { name: 'Luis Medina',     email: 'luis@correo.com',    phone: '315 789 0123', role: 'member',  status: 'inactive', membresia: 'Mensual',     vence: '2026-04-20', plan: null,         av: 4, joinedAt: '2025-09-20' },
  { name: 'Valeria Cruz',    email: 'val@correo.com',     phone: '316 890 1234', role: 'member',  status: 'active',   membresia: 'Trimestral',  vence: '2026-05-04', plan: 'Movilidad',   av: 5, joinedAt: '2026-02-01' },
  { name: 'Roberto Felix',   email: 'rober@correo.com',   phone: '317 901 2345', role: 'member',  status: 'active',   membresia: 'Mensual',     vence: '2026-05-28', plan: null,         av: 0, joinedAt: '2026-04-28' },
  { name: 'Diana Salazar',   email: 'diana@correo.com',   phone: '318 012 3456', role: 'trainer', status: 'active',   membresia: null,          vence: null,         plan: null,         av: 1, joinedAt: '2025-08-01' },
  { name: 'Jorge Nava',      email: 'jorge@correo.com',   phone: '319 123 4567', role: 'member',  status: 'inactive', membresia: 'Mensual',     vence: '2026-04-10', plan: 'Cardio Plus', av: 2, joinedAt: '2025-10-10' },
  { name: 'Paola Rivas',     email: 'paola@correo.com',   phone: '320 234 5678', role: 'member',  status: 'active',   membresia: 'Trimestral',  vence: '2026-07-15', plan: 'Fuerza A',    av: 3, joinedAt: '2026-04-15' },
  { name: 'Hector Gomez',    email: 'hector@correo.com',  phone: '321 345 6789', role: 'member',  status: 'active',   membresia: 'Mensual',     vence: '2026-05-04', plan: null,         av: 4, joinedAt: '2026-04-20' },
  { name: 'Brenda Vargas',   email: 'brenda@correo.com',  phone: '322 456 7890', role: 'member',  status: 'inactive', membresia: 'Trimestral',  vence: '2026-04-10', plan: 'Movilidad',   av: 5, joinedAt: '2025-07-05' },
];

const AV_COLORS = [
  { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  { bg: 'rgba(244,114,182,0.15)', fg: '#f472b6' },
  { bg: 'rgba(168,85,247,0.15)', fg: '#c084fc' },
  { bg: 'rgba(251,146,60,0.15)', fg: '#fb923c' },
  { bg: 'rgba(20,184,166,0.15)', fg: '#2dd4bf' },
];

function daysDiff(d: string | null): number | null {
  if (!d) return null;
  return Math.round((new Date(d).getTime() - TODAY.getTime()) / 86400000);
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

type FilterKey = 'all' | Role | 'inactive';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [currentFilter, setCurrentFilter] = useState<FilterKey>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fRole, setFRole] = useState<Role>('member');
  const [fPlan, setFPlan] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return members.filter((m) => {
      if (currentFilter === 'member') return m.role === 'member' && m.status === 'active';
      if (currentFilter === 'trainer') return m.role === 'trainer';
      if (currentFilter === 'inactive') return m.status === 'inactive';
      return true;
    }).filter(
      (m) =>
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone && m.phone.includes(q))
    );
  }, [members, currentFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * ROWS_PER_PAGE;
  const rows = filtered.slice(start, start + ROWS_PER_PAGE);

  const total = members.length;
  const active = members.filter((m) => m.status === 'active' && m.role === 'member').length;
  const trainers = members.filter((m) => m.role === 'trainer').length;
  const newThisMonth = members.filter((m) => m.joinedAt.startsWith('2026-05')).length || 2;

  const setFilter = useCallback((f: FilterKey) => {
    setCurrentFilter(f);
    setCurrentPage(1);
  }, []);

  const resetForm = useCallback(() => {
    setFName(''); setFEmail(''); setFPhone('');
    setFRole('member'); setFPlan('');
  }, []);

  const guardarMiembro = useCallback(() => {
    if (!fName.trim() || !fEmail.trim()) return;
    setMembers((prev) => [
      {
        name: fName.trim(),
        email: fEmail.trim(),
        phone: fPhone.trim() || null,
        role: fRole,
        status: 'active',
        membresia: fPlan || null,
        vence: fPlan ? '2026-06-01' : null,
        plan: null,
        av: Math.floor(Math.random() * 6),
        joinedAt: '2026-05-01',
      },
      ...prev,
    ]);
    setModalOpen(false);
    resetForm();
  }, [fName, fEmail, fPhone, fRole, fPlan, resetForm]);

  const toggleStatus = useCallback((idx: number) => {
    setMembers((prev) =>
      prev.map((m, i) =>
        i === idx ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m
      )
    );
  }, []);

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
            { label: 'Nuevos este mes', value: newThisMonth, color: 'accent', sub: 'Mayo 2026' },
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

        {/* Table */}
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
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-[60px] text-text-3">No se encontraron miembros con ese criterio.</td>
                  </tr>
                ) : (
                  rows.map((m) => {
                    const globalIdx = members.indexOf(m);
                    const diff = daysDiff(m.vence);
                    return (
                      <tr key={`${m.name}-${m.email}`} className="transition-colors duration-100 hover:bg-surface2/50">
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
                              onClick={() => toggleStatus(globalIdx)}
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
            start={start}
            end={Math.min(start + ROWS_PER_PAGE, filtered.length)}
            totalItems={filtered.length}
            label="miembros"
            onChange={setCurrentPage}
          />
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo miembro">
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
