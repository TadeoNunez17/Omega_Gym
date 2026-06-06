import { useState, useMemo, useEffect } from 'react';
import { paymentsService, type PaymentListItem } from '@/services/payments.service';
import { Badge } from '@/components/ui/atoms/Badge';
import { SearchInput } from '@/components/ui/molecules/SearchInput';
import { TabBar } from '@/components/ui/molecules/TabBar';
import { Pagination } from '@/components/ui/molecules/Pagination';
import { initials, fmtDate, fmtMoney, avatarIndex, AVATAR_COLORS } from '@/lib/helpers';

type PaymentMethod = 'cash' | 'card' | 'transfer';
type PaymentStatus = 'paid' | 'pending' | 'cancelled';
type FilterKey = 'all' | PaymentStatus;

interface PaymentRow {
  id: string
  member_id: string
  member: string
  email: string
  concept: string
  amount: number
  date: string
  method: PaymentMethod
  status: PaymentStatus
  av: number
}

const ROWS_PER_PAGE = 10;

const METHOD_LABELS: Record<PaymentMethod, string> = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' };
const METHOD_COLORS: Record<PaymentMethod, string> = { cash: 'var(--green-text)', card: 'var(--blue-text)', transfer: 'var(--amber-text)' };

const FILTERS = [
  { key: 'all' as FilterKey, label: 'Todos' },
  { key: 'paid' as FilterKey, label: 'Pagados' },
  { key: 'pending' as FilterKey, label: 'Pendientes' },
  { key: 'cancelled' as FilterKey, label: 'Cancelados' },
];

function toRow(p: PaymentListItem): PaymentRow {
  return {
    id: p.id,
    member_id: p.member_id,
    member: p.member_name,
    email: p.member_email ?? '',
    concept: p.concept,
    amount: p.amount,
    date: p.date,
    method: p.method as PaymentMethod,
    status: p.status as PaymentStatus,
    av: avatarIndex(p.id),
  };
}

export default function TrainerPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthRange = useMemo(() => {
    const start = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`;
    const endDate = new Date(viewYear, viewMonth + 1, 0);
    const end = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    return { monthStart: start, monthEnd: end };
  }, [viewYear, viewMonth]);

  const monthLabel = useMemo(
    () => new Date(viewYear, viewMonth).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
    [viewYear, viewMonth],
  );

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await paymentsService.getAll({
          pageSize: 200,
          dateFrom: monthRange.monthStart,
          dateTo: monthRange.monthEnd,
        });
        if (ignore) return;
        setPayments(result.data.map(toRow));
      } catch (e: any) {
        if (!ignore) setError(e.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true };
  }, [monthRange]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payments.filter((p) => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (q && !p.member.toLowerCase().includes(q) && !p.concept.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, search, payments]);

  const revenue = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      total_collected: payments.reduce((s, p) => p.status === 'paid' ? s + p.amount : s, 0),
      total_pending: payments.reduce((s, p) => p.status === 'pending' ? s + p.amount : s, 0),
      total_cancelled: payments.reduce((s, p) => p.status === 'cancelled' ? s + p.amount : s, 0),
      today_collected: payments.reduce((s, p) => p.status === 'paid' && p.date === todayStr ? s + p.amount : s, 0),
    };
  }, [payments]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ROWS_PER_PAGE;
  const rows = filtered.slice(start, start + ROWS_PER_PAGE);

  return (
    <div style={{ padding: '20px clamp(16px, 4vw, 28px)', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
          Omega Gym <span style={{ color: 'var(--text-2)' }}>›</span> <span style={{ color: 'var(--text-2)' }}>Pagos</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{payments.length} pagos en {monthLabel}</div>
      </header>

      <div className="flex overflow-x-auto gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Recaudado', value: fmtMoney(revenue.total_collected), color: 'green', sub: `Recaudado en ${monthLabel}` },
          { label: 'Pendiente', value: fmtMoney(revenue.total_pending), color: 'amber', sub: `Pendiente en ${monthLabel}` },
          { label: 'Cancelado', value: fmtMoney(revenue.total_cancelled), color: 'red', sub: `Cancelado en ${monthLabel}` },
          { label: 'Hoy', value: fmtMoney(revenue.today_collected), color: 'accent', sub: 'Hoy' },
        ].map((m) => (
          <div key={m.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            padding: '14px 16px', position: 'relative', overflow: 'hidden', flex: 1, minWidth: 140,
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `var(--${m.color})` }} />
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em', color: `var(--${m.color}-text)` }}>{m.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => {
          if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
          else setViewMonth(viewMonth - 1);
          setPage(1);
        }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface2 transition-colors text-text-3 hover:text-text-1" title="Mes anterior">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span className="text-[13px] font-medium text-text-1 capitalize min-w-[140px] text-center">{monthLabel}</span>
        <button onClick={() => {
          if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
          else setViewMonth(viewMonth + 1);
          setPage(1);
        }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface2 transition-colors text-text-3 hover:text-text-1" title="Mes siguiente">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div style={{ flex: 1 }}>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Buscar miembro, concepto o email..." />
        </div>
        <div className="overflow-x-auto pb-1">
          <TabBar tabs={FILTERS} active={filter} onChange={(k) => { setFilter(k as FilterKey); setPage(1); }} />
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)', fontSize: 14 }}>Cargando pagos…</div>}
      {!loading && error && <div style={{ textAlign: 'center', padding: 60, color: 'var(--red-text)', fontSize: 14 }}>Error: {error}</div>}

      {!loading && !error && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Miembro', 'Concepto', 'Monto', 'Fecha', 'Método', 'Estado'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500,
                      color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em',
                      background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                      No se encontraron pagos con ese criterio.
                    </td>
                  </tr>
                ) : rows.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.12s' }}>
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: AVATAR_COLORS[p.av].bg, color: AVATAR_COLORS[p.av].fg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 600, flexShrink: 0,
                        }}>{initials(p.member)}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{p.member}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 18px', fontSize: 12 }}>{p.concept}</td>
                    <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                      <span className="font-mono" style={{ fontSize: 13, fontWeight: 500 }}>{fmtMoney(p.amount)}</span>
                    </td>
                    <td style={{ padding: '13px 18px', fontSize: 12 }}>{fmtDate(p.date)}</td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: METHOD_COLORS[p.method] }}>{METHOD_LABELS[p.method]}</span>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      {p.status === 'paid' ? <Badge variant="green" dot>Pagado</Badge>
                      : p.status === 'pending' ? <Badge variant="amber" dot>Pendiente</Badge>
                      : <Badge variant="red" dot>Cancelado</Badge>}
                    </td>
                  </tr>
                ))}
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
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
