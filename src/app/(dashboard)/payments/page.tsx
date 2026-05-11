'use client';

import { useState, useMemo } from 'react';

const TODAY = new Date('2026-05-01');
const ROWS_PER_PAGE = 8;

type PaymentMethod = 'cash' | 'card' | 'transfer';
type PaymentStatus = 'paid' | 'pending' | 'cancelled';

interface Payment {
  member: string;
  email: string;
  concept: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  av: number;
}

const PAYMENTS: Payment[] = [
  { member: 'Carlos Ramirez',  email: 'carlos@correo.com',  concept: 'Mensualidad May', amount: 450,  date: '2026-05-01', method: 'cash',     status: 'paid',     av: 0 },
  { member: 'Sofia Lopez',     email: 'sofia@correo.com',   concept: 'Trimestre Q2',   amount: 1200, date: '2026-04-30', method: 'card',     status: 'paid',     av: 1 },
  { member: 'Miguel Torres',   email: 'miguel@correo.com',  concept: 'Mensualidad May', amount: 450,  date: '2026-04-29', method: 'transfer', status: 'paid',     av: 2 },
  { member: 'Ana Gutierrez',   email: 'ana@correo.com',     concept: 'Anual 2026',     amount: 3600, date: '2026-04-28', method: 'card',     status: 'paid',     av: 3 },
  { member: 'Luis Medina',     email: 'luis@correo.com',    concept: 'Mensualidad May', amount: 450,  date: '2026-04-25', method: 'cash',     status: 'pending',  av: 4 },
  { member: 'Valeria Cruz',    email: 'val@correo.com',     concept: 'Mensualidad Abr', amount: 450,  date: '2026-04-22', method: 'transfer', status: 'paid',     av: 5 },
  { member: 'Roberto Felix',   email: 'rober@correo.com',   concept: 'Mensualidad May', amount: 450,  date: '2026-04-20', method: 'card',     status: 'paid',     av: 0 },
  { member: 'Diana Salazar',   email: 'diana@correo.com',   concept: 'Mensualidad Abr', amount: 450,  date: '2026-04-18', method: 'cash',     status: 'cancelled', av: 1 },
  { member: 'Jorge Nava',      email: 'jorge@correo.com',   concept: 'Mensualidad Abr', amount: 450,  date: '2026-04-15', method: 'card',     status: 'paid',     av: 2 },
  { member: 'Paola Rivas',     email: 'paola@correo.com',   concept: 'Trimestre Q2',   amount: 1200, date: '2026-04-14', method: 'transfer', status: 'pending',  av: 3 },
  { member: 'Hector Gomez',    email: 'hector@correo.com',  concept: 'Mensualidad May', amount: 450,  date: '2026-04-12', method: 'cash',     status: 'paid',     av: 4 },
  { member: 'Brenda Vargas',   email: 'brenda@correo.com',  concept: 'Mensualidad Abr', amount: 450,  date: '2026-04-10', method: 'card',     status: 'paid',     av: 5 },
  { member: 'Oscar Rios',      email: 'oscar@correo.com',   concept: 'Mensualidad May', amount: 450,  date: '2026-04-08', method: 'transfer', status: 'pending',  av: 0 },
  { member: 'Laura Mendez',    email: 'laura@correo.com',   concept: 'Anual 2026',     amount: 3600, date: '2026-04-05', method: 'card',     status: 'paid',     av: 1 },
  { member: 'Pablo Castillo',  email: 'pablo@correo.com',   concept: 'Mensualidad Abr', amount: 450,  date: '2026-04-03', method: 'cash',     status: 'cancelled', av: 2 },
];

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
};

const METHOD_COLORS: Record<PaymentMethod, string> = {
  cash: 'var(--green-text)',
  card: 'var(--blue-text)',
  transfer: 'var(--amber-text)',
};

function initials(n: string) {
  return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function fmtDate(s: string) {
  const [y, mo, d] = s.split('-');
  const m = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(d)} ${m[parseInt(mo) - 1]} ${y}`;
}

function fmtMoney(n: number) {
  return '$' + n.toLocaleString('es-MX');
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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

function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconReceipt() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export default function PaymentsPage() {
  const [currentFilter, setCurrentFilter] = useState<'all' | PaymentStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PAYMENTS.filter((p) => {
      if (currentFilter !== 'all' && p.status !== currentFilter) return false;
      if (q && !p.member.toLowerCase().includes(q) && !p.concept.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [currentFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * ROWS_PER_PAGE;
  const rows = filtered.slice(start, start + ROWS_PER_PAGE);

  const totalCollected = useMemo(() => PAYMENTS.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0), []);
  const totalPending = useMemo(() => PAYMENTS.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0), []);
  const totalCancelled = useMemo(() => PAYMENTS.filter((p) => p.status === 'cancelled').reduce((s, p) => s + p.amount, 0), []);
  const todayTotal = useMemo(() => PAYMENTS.filter((p) => p.date === '2026-05-01' && p.status === 'paid').reduce((s, p) => s + p.amount, 0), []);

  return (
    <>
      <header
        style={{
          padding: '0 28px', height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)', background: 'var(--bg)',
          position: 'sticky', top: 0, zIndex: 9,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
          Panel
          <span style={{ fontSize: 10 }}>›</span>
          <span style={{ color: 'var(--text-2)' }}>Pagos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border2)', fontFamily: 'inherit' }}>
            <IconDownload />
            Exportar
          </button>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#000', fontFamily: 'inherit' }}>
            <IconPlus />
            Registrar pago
          </button>
        </div>
      </header>

      <div style={{ padding: 28, flex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Pagos</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
            Registro de pagos, membresías y transacciones del gimnasio
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Recaudado', value: fmtMoney(totalCollected), color: 'green', sub: 'Total histórico' },
            { label: 'Pendiente', value: fmtMoney(totalPending), color: 'amber', sub: 'Por cobrar' },
            { label: 'Cancelado', value: fmtMoney(totalCancelled), color: 'red', sub: 'Transacciones canceladas' },
            { label: 'Hoy', value: fmtMoney(todayTotal), color: 'accent', sub: '1 de mayo 2026' },
          ].map((m) => (
            <div key={m.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `var(--${m.color})` }} />
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{m.label}</div>
              <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em', color: `var(--${m.color}-text)` }}>{m.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}>
              <IconSearch />
            </span>
            <input
              type="text"
              placeholder="Buscar miembro, concepto o email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, padding: '9px 14px 9px 38px', borderRadius: 'var(--radius-sm)', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {([
              { key: 'all', label: 'Todos' },
              { key: 'paid', label: 'Pagados' },
              { key: 'pending', label: 'Pendientes' },
              { key: 'cancelled', label: 'Cancelados' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setCurrentFilter(tab.key); setCurrentPage(1); }}
                style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', border: '1px solid var(--border)', fontFamily: 'inherit',
                  background: currentFilter === tab.key ? 'var(--accent)' : 'transparent',
                  color: currentFilter === tab.key ? '#000' : 'var(--text-2)',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 780 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Miembro</th>
                  <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Concepto</th>
                  <th style={{ padding: '11px 18px', textAlign: 'right', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Monto</th>
                  <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Fecha</th>
                  <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Método</th>
                  <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Estado</th>
                  <th style={{ padding: '11px 18px', textAlign: 'right', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>
                      No se encontraron pagos con ese criterio.
                    </td>
                  </tr>
                ) : (
                  rows.map((p) => (
                    <tr key={p.member + p.date} style={{ transition: 'background 0.12s' }}>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0,
                            background: ['rgba(59,130,246,0.15)','rgba(16,185,129,0.15)','rgba(244,114,182,0.15)','rgba(168,85,247,0.15)','rgba(251,146,60,0.15)','rgba(20,184,166,0.15)'][p.av],
                            color: ['#60a5fa','#34d399','#f472b6','#c084fc','#fb923c','#2dd4bf'][p.av],
                          }}>
                            {initials(p.member)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{p.member}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', fontSize: 12 }}>{p.concept}</td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500 }}>
                        {fmtMoney(p.amount)}
                      </td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', fontSize: 12 }}>{fmtDate(p.date)}</td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: METHOD_COLORS[p.method] }}>
                          {p.method === 'cash' && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="6" width="20" height="12" rx="2" />
                              <circle cx="12" cy="12" r="2" />
                            </svg>
                          )}
                          {p.method === 'card' && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="1" y="4" width="22" height="16" rx="2" />
                              <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                          )}
                          {p.method === 'transfer' && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="17 1 21 5 17 9" />
                              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                              <polyline points="7 23 3 19 7 15" />
                              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                            </svg>
                          )}
                          {METHOD_LABELS[p.method]}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                        {p.status === 'paid' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--green-bg)', color: 'var(--green-text)' }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />
                            Pagado
                          </span>
                        )}
                        {p.status === 'pending' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--amber-bg)', color: 'var(--amber-text)' }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)' }} />
                            Pendiente
                          </span>
                        )}
                        {p.status === 'cancelled' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--red-bg)', color: 'var(--red-text)' }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)' }} />
                            Cancelado
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="Ver recibo"
                          >
                            <IconReceipt />
                          </button>
                          <button
                            style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="Ver detalle"
                          >
                            <IconEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Mostrando {start + 1}–{Math.min(start + ROWS_PER_PAGE, filtered.length)} de {filtered.length} pago{filtered.length !== 1 ? 's' : ''}
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
                      border: '1px solid var(--border)', color: p === safePage ? '#000' : 'var(--text-2)',
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
    </>
  );
}
