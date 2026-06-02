import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { IconButton } from '@/components/ui/atoms/IconButton';
import { LoadingSpinner } from '@/components/ui/atoms/LoadingSpinner';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { SearchInput } from '@/components/ui/molecules/SearchInput';
import { TabBar } from '@/components/ui/molecules/TabBar';
import { Pagination } from '@/components/ui/molecules/Pagination';
import { IconDownload, IconPlus, IconEye } from '@/lib/icons';
import { initials, fmtDate, fmtMoney, avatarIndex, AVATAR_COLORS } from '@/lib/helpers';
import { paymentsService, type PaymentListItem } from '@/services/payments.service';
import { ResponsiveTable, type Column } from '@/components/ui/molecules/ResponsiveTable';

const ROWS_PER_PAGE = 8;

type PaymentMethod = 'cash' | 'card' | 'transfer';
type PaymentStatus = 'paid' | 'pending' | 'cancelled';

interface Payment {
  id: string;
  member: string;
  email: string;
  concept: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  av: number;
}

const METHOD_LABELS: Record<PaymentMethod, string> = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' };
const METHOD_COLORS: Record<PaymentMethod, string> = { cash: 'var(--green-text)', card: 'var(--blue-text)', transfer: 'var(--amber-text)' };

type FilterKey = 'all' | PaymentStatus;

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [revenue, setRevenue] = useState({ total_collected: 0, total_pending: 0, total_cancelled: 0, today_collected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterKey>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [result, rev] = await Promise.all([
          paymentsService.getAll({ pageSize: 200 }),
          paymentsService.getRevenueSummary(),
        ]);
        setPayments(result.data.map((p): Payment => ({
          id: p.id,
          member: p.member_name,
          email: p.member_email ?? '',
          concept: p.concept,
          amount: p.amount,
          date: p.date,
          method: p.method as PaymentMethod,
          status: p.status as PaymentStatus,
          av: avatarIndex(p.id),
        })));
        setRevenue(rev);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payments.filter((p) => {
      if (currentFilter !== 'all' && p.status !== currentFilter) return false;
      if (q && !p.member.toLowerCase().includes(q) && !p.concept.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [currentFilter, search, payments]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * ROWS_PER_PAGE;
  const rows = filtered.slice(start, start + ROWS_PER_PAGE);

  const filters = [
    { key: 'all' as FilterKey, label: 'Todos' },
    { key: 'paid' as FilterKey, label: 'Pagados' },
    { key: 'pending' as FilterKey, label: 'Pendientes' },
    { key: 'cancelled' as FilterKey, label: 'Cancelados' },
  ];

  const paymentColumns: Column<Payment>[] = [
    {
      key: 'member',
      label: 'Miembro',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
            style={{ background: AVATAR_COLORS[p.av].bg, color: AVATAR_COLORS[p.av].fg }}>
            {initials(p.member)}
          </div>
          <div>
            <div className="font-medium text-[13px]">{p.member}</div>
            <div className="text-[11px] text-text-3 mt-0.5">{p.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'concept',
      label: 'Concepto',
      hide: 'lg',
      render: (p) => <span className="text-[12px]">{p.concept}</span>,
    },
    {
      key: 'amount',
      label: 'Monto',
      align: 'right',
      render: (p) => <span className="font-mono text-[13px] font-medium">{fmtMoney(p.amount)}</span>,
    },
    {
      key: 'date',
      label: 'Fecha',
      hide: 'lg',
      render: (p) => <span className="text-[12px]">{fmtDate(p.date)}</span>,
    },
    {
      key: 'method',
      label: 'Método',
      hide: 'lg',
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: METHOD_COLORS[p.method] }}>
          {p.method === 'cash' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /></svg>}
          {p.method === 'card' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>}
          {p.method === 'transfer' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>}
          {METHOD_LABELS[p.method]}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (p) => (
        <>{p.status === 'paid' ? <Badge variant="green" dot>Pagado</Badge> : p.status === 'pending' ? <Badge variant="amber" dot>Pendiente</Badge> : <Badge variant="red" dot>Cancelado</Badge>}</>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: () => (
        <div className="flex gap-1.5 justify-end">
          <IconButton title="Ver recibo">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
          </IconButton>
          <IconButton title="Ver detalle"><IconEye width="13" height="13" /></IconButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-bg sticky top-0 z-9">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
          Panel <span className="text-[10px]">›</span>
          <span className="text-text-2">Pagos</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5">

          <Button variant="primary" size="sm" icon={<IconPlus />}>Registrar pago</Button>
        </div>
      </header>

      <div className="p-4 sm:p-7 flex-1">
        <PageHeader title="Pagos" description="Registro de pagos, membresías y transacciones del gimnasio" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Recaudado', value: fmtMoney(revenue.total_collected), color: 'green', sub: 'Total histórico' },
            { label: 'Pendiente', value: fmtMoney(revenue.total_pending), color: 'amber', sub: 'Por cobrar' },
            { label: 'Cancelado', value: fmtMoney(revenue.total_cancelled), color: 'red', sub: 'Transacciones canceladas' },
            { label: 'Hoy', value: fmtMoney(revenue.today_collected), color: 'accent', sub: 'Hoy' },
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
          <TabBar tabs={filters} active={currentFilter} onChange={(k) => { setCurrentFilter(k as FilterKey); setCurrentPage(1); }} />
        </div>

        {loading && <LoadingSpinner text="Cargando pagos…" />}

        {!loading && error && (
          <div className="text-center py-[60px] text-red-text">Error: {error}</div>
        )}

        {!loading && !error && (
          <div className="bg-surface border border-border rounded overflow-hidden">
            <ResponsiveTable
              columns={paymentColumns}
              data={rows}
              keyExtractor={(p) => p.id}
              cardTitle={(p) => p.member}
              cardSubtitle={(p) => p.email}
              cardAvatar={(p) => {
                const c = AVATAR_COLORS[p.av];
                return (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0"
                    style={{ background: c.bg, color: c.fg }}>
                    {initials(p.member)}
                  </div>
                );
              }}
              cardFields={[
                { label: 'Monto', value: (p: Payment) => <span className="font-mono font-semibold">{fmtMoney(p.amount)}</span> },
                { label: 'Estado', value: (p: Payment) => (
                  p.status === 'paid' ? <Badge variant="green" dot>Pagado</Badge> : p.status === 'pending' ? <Badge variant="amber" dot>Pendiente</Badge> : <Badge variant="red" dot>Cancelado</Badge>
                )},
                { label: 'Concepto', value: (p: Payment) => p.concept },
                { label: 'Método', value: (p: Payment) => (
                  <span className="text-[11px] font-medium" style={{ color: METHOD_COLORS[p.method] }}>{METHOD_LABELS[p.method]}</span>
                )},
                { label: 'Fecha', value: (p: Payment) => fmtDate(p.date) },
              ]}
              emptyMessage="No se encontraron pagos con ese criterio."
            />

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
        )}
      </div>
    </>
  );
}
