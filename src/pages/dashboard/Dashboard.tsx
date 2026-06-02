import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MetricCard } from '@/components/ui/atoms/MetricCard';
import { dashboardService, type MonthlyRevenueItem, type MembershipDistributionItem, type RecentActivityItem, type PendingPaymentItem, type DashboardKPIs } from '@/services/dashboard.service';

const AV_COLORS = [
  { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  { bg: 'rgba(244,114,182,0.15)', fg: '#f472b6' },
  { bg: 'rgba(168,85,247,0.15)', fg: '#c084fc' },
  { bg: 'rgba(251,146,60,0.15)', fg: '#fb923c' },
  { bg: 'rgba(20,184,166,0.15)', fg: '#2dd4bf' },
];

function IconPeople() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function IconCard() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>; }
function IconClock() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>; }
function IconDollar() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>; }
function IconDownload() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>; }
function IconPlusMember() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>; }
function IconCreditCard() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>; }
function IconCheck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>; }
function IconAlert() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>; }

function fmtDateShort(s: string) {
  const [y, mo, d] = s.split('-');
  const m = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(d)} ${m[parseInt(mo) - 1]} ${y}`;
}

const NOW = new Date();
const TODAY_STR = `${NOW.getDate()} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][NOW.getMonth()]} ${NOW.getFullYear()}`;

function BarChart({ data }: { data: MonthlyRevenueItem[] }) {
  const maxVal = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex items-end gap-2 h-[120px] px-1">
      {data.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 h-full">
          <div className="flex-1 w-full flex items-end">
            <div
              className={`w-full rounded-t-sm relative cursor-default transition-colors duration-200 ${d.is_current ? 'bg-accent' : 'bg-surface2'}`}
              style={{ height: `${Math.round((d.amount / maxVal) * 100)}%` }}
            >
              <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 bg-surface2 border border-border2 rounded-sm px-2 py-1 text-[11px] whitespace-nowrap text-text">
                ${d.amount.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-text-3">{d.month}</div>
        </div>
      ))}
    </div>
  );
}

function RingChart({ data, total }: { data: MembershipDistributionItem[]; total: number }) {
  const circumference = 2 * Math.PI * 46;
  const segments = data.map((d, i) => {
    const colors = ['var(--accent)', 'var(--blue-text)', 'var(--green-text)', 'var(--purple-text)', 'var(--amber-text)'];
    const pct = d.percentage / 100;
    const dash = circumference * pct;
    let offset = 0;
    for (let j = 0; j < i; j++) {
      offset -= circumference * (data[j].percentage / 100);
    }
    return { ...d, color: colors[i % colors.length], dash, offset };
  });

  return (
    <div className="flex flex-col items-center p-5">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {segments.map((s, i) => (
          <circle key={i} cx="60" cy="60" r="46" fill="none" stroke={s.color} strokeWidth="14"
            strokeDasharray={`${s.dash} ${circumference - s.dash}`} strokeDashoffset={s.offset}
            strokeLinecap="butt" transform="rotate(-90 60 60)" />
        ))}
        <text x="60" y="55" textAnchor="middle" fontSize="16" fontWeight="600" fill="#f0f0f0" fontFamily="inherit">{total}</text>
        <text x="60" y="70" textAnchor="middle" fontSize="9" fill="#606060" fontFamily="inherit">activas</text>
      </svg>
      <div className="w-full mt-4 flex flex-col gap-2">
        {segments.map((s) => (
          <div key={s.name} className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2 text-text-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
              {s.name}
            </div>
            <span className="text-[12px] text-text font-medium">{s.count} — {s.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} horas`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return `ayer`;
  return `hace ${days} días`;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [revenue, setRevenue] = useState<MonthlyRevenueItem[]>([]);
  const [distribution, setDistribution] = useState<MembershipDistributionItem[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPaymentItem[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [k, r, d, pp, e, a] = await Promise.all([
          dashboardService.getKPIs(),
          dashboardService.getMonthlyRevenue(),
          dashboardService.getMembershipDistribution(),
          dashboardService.getPendingPayments(),
          dashboardService.getExpiringMemberships(7),
          dashboardService.getRecentActivity(10),
        ]);
        setKpis(k);
        setRevenue(r);
        setDistribution(d);
        setPendingPayments(pp);
        setExpiring(e);
        setActivities(a);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const last6 = revenue.slice(-6);
  const total6 = last6.reduce((s, r) => s + r.amount, 0);
  const currentMonth = revenue.find((r) => r.is_current);
  const prevMonth = revenue[revenue.length - 2];
  const vsPrev = currentMonth && prevMonth && prevMonth.amount > 0
    ? Math.round(((currentMonth.amount - prevMonth.amount) / prevMonth.amount) * 100)
    : null;

  const distTotal = distribution.reduce((s, d) => s + d.count, 0);

  const activityIcons: Record<string, { icon: React.ReactNode; cls: string }> = {
    check_in: { icon: <IconCheck />, cls: 'green' },
    new_member: { icon: <IconPlusMember />, cls: 'purple' },
    payment: { icon: <IconCreditCard />, cls: 'blue' },
  };

  const clsStyles: Record<string, string> = {
    green: 'bg-green-bg text-green-text',
    blue: 'bg-blue-bg text-blue-text',
    purple: 'bg-purple-bg text-purple-text',
    red: 'bg-red-bg text-red-text',
  };

  return (
    <>
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-bg sticky top-0 z-9">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
          Panel <span className="text-[10px]">›</span>
          <span className="text-text-2">Dashboard</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[11px] sm:text-[12px] text-text-3 font-mono bg-surface border border-border px-2.5 sm:px-3 py-1.5 rounded-sm hidden sm:inline">{TODAY_STR}</span>

        </div>
      </header>

      <div className="p-2.5 sm:p-4 md:p-7 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[20px] sm:text-[22px] font-semibold -tracking-[0.02em]">Buenos días 👋</h1>
            <p className="text-[12px] sm:text-[13px] text-text-2 mt-1">
              Aquí está el resumen de Omega Gym hoy, {TODAY_STR}.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-[60px] text-text-3">Cargando dashboard…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <MetricCard icon={<IconPeople />} color="blue" value={kpis?.total_members ?? 0} label="Total de miembros" delta="Registrados" deltaType="up" />
              <MetricCard icon={<IconCard />} color="green" value={kpis?.active_memberships ?? 0} label="Membresías activas" delta="Vigentes" deltaType="up" />
              <MetricCard icon={<IconClock />} color="amber" value={kpis?.expiring_soon ?? 0} label="Vencen en 7 días" delta="Atención" deltaType="down" />
              <MetricCard icon={<IconDollar />} color="accent" value={`$${(kpis?.monthly_revenue ?? 0).toLocaleString()}`} label="Ingresos del mes" delta={vsPrev !== null ? `${vsPrev > 0 ? '+' : ''}${vsPrev}%` : ''} deltaType={vsPrev !== null && vsPrev >= 0 ? 'up' : 'down'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border">
                  <div>
                    <div className="text-[13px] font-semibold">Ingresos mensuales</div>
                    <div className="text-[11px] text-text-3 mt-0.5">Últimos 6 meses</div>
                  </div>
                  <Link to="/reports" className="text-[11px] text-text-3 no-underline cursor-pointer">Ver reporte →</Link>
                </div>
                <div className="p-4 sm:p-5">
                  <BarChart data={last6} />
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-xl sm:text-[20px] font-semibold -tracking-[0.02em] text-accent">${(currentMonth?.amount ?? 0).toLocaleString()}</div>
                      <div className="text-[11px] text-text-3 mt-0.5">{currentMonth?.month} (mes actual)</div>
                      {vsPrev !== null && (
                        <div className={`text-[11px] mt-[3px] ${vsPrev >= 0 ? 'text-green-text' : 'text-red-text'}`}>
                          {vsPrev >= 0 ? '↑' : '↓'} {Math.abs(vsPrev)}% vs mes anterior
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm sm:text-[16px] font-semibold text-text-2">${total6.toLocaleString()}</div>
                      <div className="text-[11px] text-text-3 mt-0.5">Total últimos 6 meses</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-border">
                  <div className="text-[13px] font-semibold">Tipos de membresía</div>
                  <div className="text-[11px] text-text-3 mt-0.5">Distribución actual</div>
                </div>
                <RingChart data={distribution} total={distTotal} />
              </div>

              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border">
                  <div>
                    <div className="text-[13px] font-semibold">Pagos pendientes</div>
                    <div className="text-[11px] text-text-3 mt-0.5">Requieren atención</div>
                  </div>
                  <span className="text-[11px] font-medium px-[9px] py-[3px] rounded-full bg-red-bg text-red-text">{pendingPayments.length}</span>
                </div>
                <div className="flex flex-col">
                  {pendingPayments.length === 0 ? (
                    <div className="text-center py-8 text-[12px] text-text-3">Sin pagos pendientes</div>
                  ) : (
                    pendingPayments.slice(0, 5).map((p) => (
                      <div key={p.id} className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border">
                        <div className="flex items-center gap-2.5">
                          <div className="text-[13px] font-medium">{p.member_name}</div>
                        </div>
                        <div className="text-[13px] font-semibold text-amber-text">${p.amount.toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 sm:px-5 py-3 border-t border-border">
                  <Link to="/payments" className="text-[11px] text-text-3 no-underline cursor-pointer">Ver todos los pagos →</Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border">
                  <div>
                    <div className="text-[13px] font-semibold">Membresías por vencer</div>
                    <div className="text-[11px] text-text-3 mt-0.5">Próximos 7 días</div>
                  </div>
                  <Link to="/memberships" className="text-[11px] text-text-3 no-underline cursor-pointer">Ver membresías →</Link>
                </div>
                <div className="flex flex-col">
                  {expiring.length === 0 ? (
                    <div className="text-center py-8 text-[12px] text-text-3">Sin membresías por vencer</div>
                  ) : (
                    expiring.slice(0, 5).map((e) => {
                      const av = AV_COLORS[e.member_name.length % AV_COLORS.length];
                      const initials = e.member_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
                      const ev = e.days_remaining === 0 ? 'Hoy' : e.days_remaining === 1 ? '1 día' : `${e.days_remaining} días`;
                      const isUrgent = e.days_remaining <= 1;
                      return (
                        <div key={e.id} className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-border">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                            style={{ background: av.bg, color: av.fg }}>
                            {initials}
                          </div>
                          <div className="flex-1">
                            <div className="text-[13px] font-medium">{e.member_name}</div>
                            <div className="text-[11px] text-text-3 mt-0.5">{e.type_name} · vence {fmtDateShort(e.end_date)}</div>
                          </div>
                          <span className={`text-[10px] font-medium px-[9px] py-[3px] rounded-full whitespace-nowrap ${isUrgent ? 'bg-red-bg text-red-text' : 'bg-amber-bg text-amber-text'}`}>
                            {ev}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-border">
                  <div className="text-[13px] font-semibold">Actividad reciente</div>
                  <div className="text-[11px] text-text-3 mt-0.5">Últimas acciones en el sistema</div>
                </div>
                <div className="flex flex-col">
                  {activities.length === 0 ? (
                    <div className="text-center py-8 text-[12px] text-text-3">Sin actividad reciente</div>
                  ) : (
                    activities.map((a, i) => {
                      const act = activityIcons[a.type] || { icon: <IconCheck />, cls: 'green' };
                      return (
                        <div key={a.id || i} className="flex items-start gap-3 px-4 sm:px-5 py-3 border-b border-border">
                          <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${clsStyles[act.cls]}`}>
                            <div className="w-[13px] h-[13px]">{act.icon}</div>
                          </div>
                          <div className="flex-1">
                            <div className="text-[12px] text-text-2 leading-relaxed">{a.description}</div>
                            <div className="text-[10px] text-text-3 mt-[3px]">{timeAgo(a.timestamp)}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
