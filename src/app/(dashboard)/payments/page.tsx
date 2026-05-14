'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { SearchInput } from '@/components/ui/molecules/SearchInput';
import { Pagination } from '@/components/ui/molecules/Pagination';

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

const METHOD_LABELS: Record<PaymentMethod, string> = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' };
const METHOD_COLORS: Record<PaymentMethod, string> = { cash: 'var(--green-text)', card: 'var(--blue-text)', transfer: 'var(--amber-text)' };

function initials(n: string) { return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(); }

function fmtDate(s: string) {
  const [y, mo, d] = s.split('-');
  const m = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(d)} ${m[parseInt(mo) - 1]} ${y}`;
}

function fmtMoney(n: number) { return '$' + n.toLocaleString('es-MX'); }

type FilterKey = 'all' | PaymentStatus;

export default function PaymentsPage() {
  const [currentFilter, setCurrentFilter] = useState<FilterKey>('all');
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

  const filters = [
    { key: 'all' as FilterKey, label: 'Todos' },
    { key: 'paid' as FilterKey, label: 'Pagados' },
    { key: 'pending' as FilterKey, label: 'Pendientes' },
    { key: 'cancelled' as FilterKey, label: 'Cancelados' },
  ];

  const AV_COLORS = [
    { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
    { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
    { bg: 'rgba(244,114,182,0.15)', fg: '#f472b6' },
    { bg: 'rgba(168,85,247,0.15)', fg: '#c084fc' },
    { bg: 'rgba(251,146,60,0.15)', fg: '#fb923c' },
    { bg: 'rgba(20,184,166,0.15)', fg: '#2dd4bf' },
  ];

  return (
    <>
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-bg sticky top-0 z-9">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
          Panel <span className="text-[10px]">›</span>
          <span className="text-text-2">Pagos</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button variant="ghost" size="sm" icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          }>Exportar</Button>
          <Button variant="primary" size="sm" icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          }>Registrar pago</Button>
        </div>
      </header>

      <div className="p-4 sm:p-7 flex-1">
        <PageHeader title="Pagos" description="Registro de pagos, membresías y transacciones del gimnasio" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Recaudado', value: fmtMoney(totalCollected), color: 'green', sub: 'Total histórico' },
            { label: 'Pendiente', value: fmtMoney(totalPending), color: 'amber', sub: 'Por cobrar' },
            { label: 'Cancelado', value: fmtMoney(totalCancelled), color: 'red', sub: 'Transacciones canceladas' },
            { label: 'Hoy', value: fmtMoney(todayTotal), color: 'accent', sub: '1 de mayo 2026' },
          ].map((m) => (
            <div key={m.label} className="relative bg-surface border border-border rounded overflow-hidden p-[18px]">
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `var(--${m.color})` }} />
              <div className="text-[11px] text-text-3 uppercase tracking-[0.06em] mb-2.5">{m.label}</div>
              <div className="text-[32px] font-semibold leading-none -tracking-[0.03em]" style={{ color: `var(--${m.color}-text)` }}>{m.value}</div>
              <div className="text-[11px] text-text-3 mt-1.5">{m.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Buscar miembro, concepto o email..." />
          <div className="flex gap-1 overflow-x-auto">
            {filters.map((tab) => (
              <button key={tab.key} onClick={() => { setCurrentFilter(tab.key); setCurrentPage(1); }}
                className={`px-3.5 py-2 rounded-sm text-[12px] font-medium cursor-pointer whitespace-nowrap font-sans transition-all duration-150
                  ${currentFilter === tab.key ? 'bg-accent text-black' : 'bg-transparent text-text-2 border border-border'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px] min-w-[780px]">
              <thead>
                <tr className="border-b border-border">
                  {['Miembro', 'Concepto', 'Monto', 'Fecha', 'Método', 'Estado', ''].map((h) => (
                    <th key={h} className="px-[18px] py-[11px] text-left text-[10px] font-medium text-text-3 uppercase tracking-[0.07em] whitespace-nowrap bg-surface2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-[60px] text-text-3">No se encontraron pagos con ese criterio.</td></tr>
                ) : (
                  rows.map((p) => (
                    <tr key={p.member + p.date} className="transition-colors duration-100 hover:bg-surface2/50">
                      <td className="px-[18px] py-[14px] border-b border-border align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
                            style={{ background: AV_COLORS[p.av].bg, color: AV_COLORS[p.av].fg }}>
                            {initials(p.member)}
                          </div>
                          <div>
                            <div className="font-medium text-[13px]">{p.member}</div>
                            <div className="text-[11px] text-text-3 mt-0.5">{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-[18px] py-[14px] border-b border-border align-middle text-[12px]">{p.concept}</td>
                      <td className="px-[18px] py-[14px] border-b border-border align-middle text-right font-mono text-[13px] font-medium">{fmtMoney(p.amount)}</td>
                      <td className="px-[18px] py-[14px] border-b border-border align-middle text-[12px]">{fmtDate(p.date)}</td>
                      <td className="px-[18px] py-[14px] border-b border-border align-middle">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: METHOD_COLORS[p.method] }}>
                          {p.method === 'cash' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /></svg>}
                          {p.method === 'card' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>}
                          {p.method === 'transfer' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>}
                          {METHOD_LABELS[p.method]}
                        </span>
                      </td>
                      <td className="px-[18px] py-[14px] border-b border-border align-middle">
                        {p.status === 'paid' && <Badge variant="green" dot>Pagado</Badge>}
                        {p.status === 'pending' && <Badge variant="amber" dot>Pendiente</Badge>}
                        {p.status === 'cancelled' && <Badge variant="red" dot>Cancelado</Badge>}
                      </td>
                      <td className="px-[18px] py-[14px] border-b border-border align-middle">
                        <div className="flex gap-1.5 justify-end">
                          <IconBtn title="Ver recibo">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                          </IconBtn>
                          <IconBtn title="Ver detalle">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))
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
            label="pagos"
            onChange={setCurrentPage}
          />
        </div>
      </div>
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
