'use client';

import { useState, useMemo } from 'react';

const TODAY = new Date('2026-05-01');
const ROWS_PER_PAGE = 7;

type MembershipStatus = 'active' | 'warning' | 'expired';

interface Member {
  name: string;
  email: string;
  plan: string;
  inicio: string;
  vence: string;
  pago: 'Pagado' | 'Pendiente';
  av: number;
}

const MEMBERS: Member[] = [
  { name: 'Carlos Ramirez',   email: 'carlos@correo.com',  plan: 'Mensual',     inicio: '2026-04-01', vence: '2026-05-01', pago: 'Pagado',    av: 0 },
  { name: 'Sofia Lopez',      email: 'sofia@correo.com',   plan: 'Trimestral',  inicio: '2026-03-01', vence: '2026-06-01', pago: 'Pagado',    av: 1 },
  { name: 'Miguel Torres',    email: 'miguel@correo.com',  plan: 'Mensual',     inicio: '2026-04-25', vence: '2026-05-05', pago: 'Pagado',    av: 2 },
  { name: 'Ana Gutierrez',    email: 'ana@correo.com',     plan: 'Anual',       inicio: '2026-01-15', vence: '2027-01-15', pago: 'Pagado',    av: 3 },
  { name: 'Luis Medina',      email: 'luis@correo.com',    plan: 'Mensual',     inicio: '2026-03-20', vence: '2026-04-20', pago: 'Pendiente', av: 4 },
  { name: 'Valeria Cruz',     email: 'val@correo.com',     plan: 'Trimestral',  inicio: '2026-02-01', vence: '2026-05-01', pago: 'Pagado',    av: 5 },
  { name: 'Roberto Felix',    email: 'rober@correo.com',   plan: 'Mensual',     inicio: '2026-04-28', vence: '2026-05-06', pago: 'Pagado',    av: 0 },
  { name: 'Diana Salazar',    email: 'diana@correo.com',   plan: 'Anual',       inicio: '2025-12-01', vence: '2026-12-01', pago: 'Pagado',    av: 1 },
  { name: 'Jorge Nava',       email: 'jorge@correo.com',   plan: 'Mensual',     inicio: '2026-03-10', vence: '2026-04-10', pago: 'Pagado',    av: 2 },
  { name: 'Paola Rivas',      email: 'paola@correo.com',   plan: 'Trimestral',  inicio: '2026-04-15', vence: '2026-07-15', pago: 'Pendiente', av: 3 },
  { name: 'Hector Gomez',     email: 'hector@correo.com',  plan: 'Mensual',     inicio: '2026-04-20', vence: '2026-05-04', pago: 'Pagado',    av: 4 },
  { name: 'Brenda Vargas',    email: 'brenda@correo.com',  plan: 'Trimestral',  inicio: '2026-01-10', vence: '2026-04-10', pago: 'Pendiente', av: 5 },
];

function daysDiff(d: string) {
  return Math.round((new Date(d).getTime() - TODAY.getTime()) / 86400000);
}

function getStatus(m: Member): MembershipStatus {
  const d = daysDiff(m.vence);
  if (d < 0) return 'expired';
  if (d <= 7) return 'warning';
  return 'active';
}

function initials(n: string) {
  return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function fmtDate(s: string) {
  const [y, mo, d] = s.split('-');
  const m = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(d)} ${m[parseInt(mo) - 1]} ${y}`;
}

function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function MembershipsPage() {
  const [currentFilter, setCurrentFilter] = useState<'all' | MembershipStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');

  const allWithStatus = useMemo(
    () => MEMBERS.map((m) => ({ ...m, status: getStatus(m) })),
    []
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allWithStatus
      .filter((m) => currentFilter === 'all' || m.status === currentFilter)
      .filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.plan.toLowerCase().includes(q)
      );
  }, [currentFilter, search, allWithStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * ROWS_PER_PAGE;
  const rows = filtered.slice(start, start + ROWS_PER_PAGE);

  const activeCount = allWithStatus.filter((m) => m.status === 'active').length;
  const warnCount = allWithStatus.filter((m) => m.status === 'warning').length;
  const expiredCount = allWithStatus.filter((m) => m.status === 'expired').length;

  return (
    <>
      {/* TOPBAR */}
      <header
        style={{
          padding: '0 28px',
          height: 58,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
          position: 'sticky',
          top: 0,
          zIndex: 9,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
          Panel
          <span style={{ fontSize: 10 }}>›</span>
          <span style={{ color: 'var(--text-2)' }}>Membresías</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: 'transparent', color: 'var(--text-2)',
              border: '1px solid var(--border2)',
              fontFamily: 'inherit',
            }}
          >
            <IconDownload />
            Exportar
          </button>
          <button
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
              background: 'var(--accent)', color: '#000',
              fontFamily: 'inherit',
            }}
          >
            <IconPlus />
            Nueva membresía
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div style={{ padding: 28, flex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Membresías</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
            Control de membresías activas, vencidas y próximas a vencer
          </div>
        </div>

        {/* METRICS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            { label: 'Activas', value: activeCount, color: 'green', sub: 'Al corriente' },
            { label: 'Por vencer', value: warnCount, color: 'amber', sub: 'En los próximos 7 días' },
            { label: 'Vencidas', value: expiredCount, color: 'red', sub: 'Sin renovar' },
            { label: 'Ingresos del mes', value: '$4,850', color: 'accent', sub: 'Mayo 2026' },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '18px 20px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 2,
                  background: `var(--${m.color})`,
                }}
              />
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

        {/* ALERT BANNER */}
        {(warnCount > 0 || expiredCount > 0) && (
          <div
            style={{
              background: 'var(--amber-bg)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 12,
              color: 'var(--amber-text)',
              marginBottom: 16,
            }}
          >
            <IconAlert />
            <span>
              {warnCount > 0 && `${warnCount} membresía${warnCount > 1 ? 's' : ''} por vencer en los próximos 7 días`}
              {warnCount > 0 && expiredCount > 0 && ' · '}
              {expiredCount > 0 && `${expiredCount} membresía${expiredCount > 1 ? 's' : ''} vencida${expiredCount > 1 ? 's' : ''} sin renovar`}
              . Considera contactar a estos miembros.
            </span>
          </div>
        )}

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span
              style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-3)',
                pointerEvents: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar miembro, plan o email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontFamily: 'inherit',
                fontSize: 13,
                padding: '9px 14px 9px 38px',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {([
              { key: 'all', label: 'Todos' },
              { key: 'active', label: 'Activos' },
              { key: 'warning', label: 'Por vencer' },
              { key: 'expired', label: 'Vencidos' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setCurrentFilter(tab.key); setCurrentPage(1); }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  background: currentFilter === tab.key ? 'var(--accent)' : 'transparent',
                  color: currentFilter === tab.key ? '#000' : 'var(--text-2)',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 780 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Miembro</th>
                  <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Plan</th>
                  <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Inicio</th>
                  <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Vencimiento</th>
                  <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Pago</th>
                  <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Estado</th>
                  <th style={{ padding: '11px 18px', textAlign: 'right', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>
                      No se encontraron membresías con ese criterio.
                    </td>
                  </tr>
                ) : (
                  rows.map((m) => {
                    const diff = daysDiff(m.vence);
                    return (
                      <tr key={m.name} style={{ transition: 'background 0.12s' }}>
                        <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 34, height: 34, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 600, flexShrink: 0,
                                background: [
                                  'rgba(59,130,246,0.15)', 'rgba(16,185,129,0.15)', 'rgba(244,114,182,0.15)',
                                  'rgba(168,85,247,0.15)', 'rgba(251,146,60,0.15)', 'rgba(20,184,166,0.15)',
                                ][m.av],
                                color: ['#60a5fa', '#34d399', '#f472b6', '#c084fc', '#fb923c', '#2dd4bf'][m.av],
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
                        <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text-2)' }}>
                          {m.plan}
                        </td>
                        <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', fontSize: 12 }}>
                          {fmtDate(m.inicio)}
                        </td>
                        <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                          <div style={{ fontSize: 12 }}>{fmtDate(m.vence)}</div>
                          {m.status === 'active' && (
                            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{diff} días restantes</div>
                          )}
                          {m.status === 'warning' && (
                            <div style={{ fontSize: 11, color: 'var(--amber-text)', marginTop: 3 }}>Vence en {diff} día{diff === 1 ? '' : 's'}</div>
                          )}
                          {m.status === 'expired' && (
                            <div style={{ fontSize: 11, color: 'var(--red-text)', marginTop: 3 }}>Venció hace {Math.abs(diff)} días</div>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: m.pago === 'Pagado' ? '2px 8px' : '2px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 500,
                              background: m.pago === 'Pagado' ? 'var(--green-bg)' : 'var(--amber-bg)',
                              color: m.pago === 'Pagado' ? 'var(--green-text)' : 'var(--amber-text)',
                            }}
                          >
                            {m.pago}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                          {m.status === 'active' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--green-bg)', color: 'var(--green-text)' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />
                              Activa
                            </span>
                          )}
                          {m.status === 'warning' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--amber-bg)', color: 'var(--amber-text)' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)' }} />
                              Por vencer
                            </span>
                          )}
                          {m.status === 'expired' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--red-bg)', color: 'var(--red-text)' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)' }} />
                              Vencida
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              style={{
                                width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                                background: 'transparent', border: '1px solid var(--border)',
                                color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              title="Ver detalle"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button
                              style={{
                                width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                                background: 'transparent', border: '1px solid var(--border)',
                                color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              title="Editar"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
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
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 18px',
              borderTop: '1px solid var(--border)',
              background: 'var(--surface2)',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Mostrando {start + 1}–{Math.min(start + ROWS_PER_PAGE, filtered.length)} de {filtered.length} membresía{filtered.length !== 1 ? 's' : ''}
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
                      fontSize: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      fontWeight: p === safePage ? 600 : 400,
                    }}
                  >
                    {p}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
