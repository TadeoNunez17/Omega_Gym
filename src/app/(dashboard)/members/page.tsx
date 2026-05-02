'use client';

import { useState, useMemo, useCallback } from 'react';

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

/* ── Icons ── */
function IconDownload() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ── Reusable styles ── */
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', borderRadius: 'var(--radius-sm)',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
  background: 'transparent', color: 'var(--text-2)',
  border: '1px solid var(--border2)', fontFamily: 'inherit',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', borderRadius: 'var(--radius-sm)',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
  background: 'var(--accent)', color: '#000',
  border: 'none', fontFamily: 'inherit',
};

const thStyle: React.CSSProperties = {
  padding: '11px 18px', textAlign: 'left',
  fontSize: 10, fontWeight: 500, color: 'var(--text-3)',
  textTransform: 'uppercase', letterSpacing: '0.07em',
  whiteSpace: 'nowrap', background: 'var(--surface2)',
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [currentFilter, setCurrentFilter] = useState<'all' | Role | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
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

  const setFilter = useCallback((f: 'all' | Role | 'inactive') => {
    setCurrentFilter(f);
    setCurrentPage(1);
  }, []);

  const resetForm = useCallback(() => {
    setFName(''); setFEmail(''); setFPhone('');
    setFRole('member'); setFPlan('');
  }, []);

  const openModal = useCallback(() => { resetForm(); setModalOpen(true); }, [resetForm]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    resetForm();
  }, [resetForm]);

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
    closeModal();
  }, [fName, fEmail, fPhone, fRole, fPlan, closeModal]);

  const toggleStatus = useCallback((idx: number) => {
    setMembers((prev) =>
      prev.map((m, i) =>
        i === idx ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m
      )
    );
  }, []);

  return (
    <>
      {/* TOPBAR */}
      <header
        style={{
          padding: '0 28px', height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 9,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
          Panel
          <span style={{ fontSize: 10 }}>›</span>
          <span style={{ color: 'var(--text-2)' }}>Miembros</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={btnGhost}>
            <IconDownload /> Exportar
          </button>
          <button style={btnPrimary} onClick={openModal}>
            <IconPlus /> Nuevo miembro
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div style={{ padding: 28, flex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Miembros</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
            Registro completo de socios, roles y estado de membresía
          </div>
        </div>

        {/* METRICS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total miembros', value: total, color: 'blue', sub: 'Registrados en el sistema' },
            { label: 'Activos', value: active, color: 'green', sub: 'Con membresía vigente' },
            { label: 'Entrenadores', value: trainers, color: 'amber', sub: 'Staff del gym' },
            { label: 'Nuevos este mes', value: newThisMonth, color: 'accent', sub: 'Mayo 2026' },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '18px 20px',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `var(--${m.color})` }} />
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em', color: `var(--${m.color}-text)` }}>
                {m.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
                padding: '9px 14px 9px 38px', borderRadius: 'var(--radius-sm)',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {([
              { key: 'all', label: 'Todos' },
              { key: 'member', label: 'Miembros' },
              { key: 'trainer', label: 'Entrenadores' },
              { key: 'inactive', label: 'Inactivos' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  border: '1px solid var(--border)',
                  background: currentFilter === tab.key ? 'var(--accent)' : 'transparent',
                  color: currentFilter === tab.key ? '#000' : 'var(--text-2)',
                  fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 820 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ ...thStyle, width: '25%' }}>Miembro</th>
                  <th style={{ ...thStyle, width: '10%' }}>Rol</th>
                  <th style={{ ...thStyle, width: '14%' }}>Teléfono</th>
                  <th style={{ ...thStyle, width: '19%' }}>Membresía activa</th>
                  <th style={{ ...thStyle, width: '14%' }}>Plan asignado</th>
                  <th style={{ ...thStyle, width: '10%' }}>Estado</th>
                  <th style={{ ...thStyle, width: '8%', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>
                      No se encontraron miembros con ese criterio.
                    </td>
                  </tr>
                ) : (
                  rows.map((m) => {
                    const globalIdx = members.indexOf(m);
                    const diff = daysDiff(m.vence);
                    return (
                      <tr key={`${m.name}-${m.email}`} style={{ transition: 'background 0.12s' }}>
                        {/* Member cell */}
                        <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 36, height: 36, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 600, flexShrink: 0,
                                background: AV_COLORS[m.av].bg, color: AV_COLORS[m.av].fg,
                              }}
                            >
                              {initials(m.name)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, fontSize: 13 }}>{m.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{m.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                          {m.role === 'admin' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'rgba(232,255,71,0.12)', color: '#c9e020' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />Admin
                            </span>
                          )}
                          {m.role === 'trainer' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--blue-bg)', color: 'var(--blue-text)' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--blue)' }} />Entrenador
                            </span>
                          )}
                          {m.role === 'member' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--gray-bg)', color: '#909090' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#555' }} />Miembro
                            </span>
                          )}
                        </td>

                        {/* Phone */}
                        <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', fontSize: 12, color: 'var(--text-2)' }}>
                          {m.phone || <span style={{ color: 'var(--text-3)' }}>—</span>}
                        </td>

                        {/* Membership */}
                        <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                          {m.membresia ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{m.membresia}</span>
                              {diff !== null && diff < 0 && (
                                <span style={{ fontSize: 11, color: 'var(--red-text)' }}>Venció hace {Math.abs(diff)}d</span>
                              )}
                              {diff !== null && diff >= 0 && diff <= 7 && (
                                <span style={{ fontSize: 11, color: 'var(--amber-text)' }}>Vence en {diff}d</span>
                              )}
                              {diff !== null && diff > 7 && (
                                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Vence {fmtDate(m.vence)}</span>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Sin membresía</span>
                          )}
                        </td>

                        {/* Plan */}
                        <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                          {m.plan ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '3px 9px', borderRadius: 'var(--radius-sm)',
                              fontSize: 11, background: 'var(--surface2)', color: 'var(--text-2)',
                              border: '1px solid var(--border)',
                            }}>
                              {m.plan}
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '3px 9px', borderRadius: 'var(--radius-sm)',
                              fontSize: 11, color: 'var(--text-3)',
                              border: '1px dashed var(--border)',
                            }}>
                              Sin plan
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                          {m.status === 'active' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--green-bg)', color: 'var(--green-text)' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />Activo
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--red-bg)', color: 'var(--red-text)' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)' }} />Inactivo
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button style={iconBtnStyle} title="Ver detalle">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button style={iconBtnStyle} title="Editar">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              style={{ ...iconBtnStyle, ...dangerIconBtnStyle }}
                              title={m.status === 'active' ? 'Desactivar' : 'Activar'}
                              onClick={() => toggleStatus(globalIdx)}
                            >
                              {m.status === 'active' ? (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                              ) : (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Mostrando {Math.min(start + 1, filtered.length)}–{Math.min(start + ROWS_PER_PAGE, filtered.length)} de {filtered.length} miembro{filtered.length !== 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {totalPages > 1 &&
                Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                      background: p === safePage ? 'var(--accent)' : 'transparent',
                      border: '1px solid var(--border)',
                      color: p === safePage ? '#000' : 'var(--text-2)',
                      fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontWeight: p === safePage ? 600 : 400,
                    }}
                  >
                    {p}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 'var(--radius)', width: 480, maxWidth: '95vw',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Nuevo miembro</div>
              <button
                onClick={closeModal}
                style={{
                  width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-3)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <IconClose />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>Nombre completo *</label>
                  <input
                    type="text"
                    placeholder="Ej. Maria Gonzalez"
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>Telefono</label>
                  <input
                    type="text"
                    placeholder="311 234 5678"
                    value={fPhone}
                    onChange={(e) => setFPhone(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>Correo electronico *</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={fEmail}
                    onChange={(e) => setFEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>Rol</label>
                  <select
                    value={fRole}
                    onChange={(e) => setFRole(e.target.value as Role)}
                    style={{ ...inputStyle, appearance: 'auto' }}
                  >
                    <option value="member">Miembro</option>
                    <option value="trainer">Entrenador</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>Tipo de membresia</label>
                  <select
                    value={fPlan}
                    onChange={(e) => setFPlan(e.target.value)}
                    style={{ ...inputStyle, appearance: 'auto' }}
                  >
                    <option value="">Sin membresía</option>
                    <option value="Mensual">Mensual</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
              <button style={btnGhost} onClick={closeModal}>Cancelar</button>
              <button
                style={{
                  ...btnPrimary,
                  opacity: !fName.trim() || !fEmail.trim() ? 0.5 : 1,
                  cursor: !fName.trim() || !fEmail.trim() ? 'not-allowed' : 'pointer',
                }}
                onClick={guardarMiembro}
                disabled={!fName.trim() || !fEmail.trim()}
              >
                Guardar miembro
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 'var(--radius-sm)',
  background: 'transparent', border: '1px solid var(--border)',
  color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
};

const dangerIconBtnStyle: React.CSSProperties = {};

const inputStyle: React.CSSProperties = {
  background: 'var(--surface2)', border: '1px solid var(--border2)',
  color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
  padding: '9px 12px', borderRadius: 'var(--radius-sm)',
  outline: 'none', width: '100%',
};
