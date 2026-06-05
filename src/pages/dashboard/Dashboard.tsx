import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MetricCard } from '@/components/ui/atoms/MetricCard';
import { dashboardService, type RecentActivityItem, type PendingPaymentItem, type DashboardKPIs } from '@/services/dashboard.service';

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
function IconCheck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>; }
function IconPlusMember() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>; }
function IconCreditCard() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>; }
function IconAlert() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>; }

function fmtDateShort(s: string) {
  const [y, mo, d] = s.split('-');
  const m = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(d)} ${m[parseInt(mo) - 1]} ${y}`;
}

const NOW = new Date();
const TODAY_STR = `${NOW.getDate()} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][NOW.getMonth()]} ${NOW.getFullYear()}`;

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
  const [pendingPayments, setPendingPayments] = useState<PendingPaymentItem[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [k, pp, e, a] = await Promise.all([
          dashboardService.getKPIs(),
          dashboardService.getPendingPayments(),
          dashboardService.getExpiringMemberships(7),
          dashboardService.getRecentActivity(10),
        ]);
        setKpis(k);
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
            <div className="flex overflow-x-auto gap-3 mb-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard icon={<IconPeople />} color="blue" value={kpis?.total_members ?? 0} label="Total de miembros" delta="Registrados" deltaType="up" />
              <MetricCard icon={<IconCard />} color="green" value={kpis?.active_memberships ?? 0} label="Membresías activas" delta="Vigentes" deltaType="up" />
              <MetricCard icon={<IconClock />} color="amber" value={kpis?.expiring_soon ?? 0} label="Vencen en 7 días" delta="Atención" deltaType="down" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-border">
                  <div>
                    <div className="text-[13px] font-semibold">Pagos pendientes</div>
                    <div className="text-[11px] text-text-3 mt-0.5 hidden sm:block">Requieren atención</div>
                  </div>
                  <span className="text-[11px] font-medium px-[9px] py-[3px] rounded-full bg-red-bg text-red-text">{pendingPayments.length}</span>
                </div>
                <div className="flex flex-col">
                  {pendingPayments.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-[12px] text-text-3">Sin pagos pendientes</div>
                  ) : (
                    pendingPayments.slice(0, 5).map((p) => (
                      <div key={p.id} className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border">
                        <div className="flex items-center gap-2.5">
                          <div className="text-[13px] font-medium">{p.member_name}</div>
                        </div>
                        <div className="text-[13px] font-semibold text-amber-text">${p.amount.toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-t border-border">
                  <Link to="/payments" className="text-[11px] text-text-3 no-underline cursor-pointer">Ver todos los pagos →</Link>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-border">
                  <div>
                    <div className="text-[13px] font-semibold">Membresías por vencer</div>
                    <div className="text-[11px] text-text-3 mt-0.5">Próximos 7 días</div>
                  </div>
                  <Link to="/memberships" className="text-[11px] text-text-3 no-underline cursor-pointer">Ver membresías →</Link>
                </div>
                <div className="flex flex-col">
                  {expiring.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-[12px] text-text-3">Sin membresías por vencer</div>
                  ) : (
                    expiring.slice(0, 5).map((e) => {
                      const av = AV_COLORS[e.member_name.length % AV_COLORS.length];
                      const initials = e.member_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
                      const ev = e.days_remaining === 0 ? 'Hoy' : e.days_remaining === 1 ? '1 día' : `${e.days_remaining} días`;
                      const isUrgent = e.days_remaining <= 1;
                      return (
                        <div key={e.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border">
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
                <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-border">
                  <div className="text-[13px] font-semibold">Actividad reciente</div>
                  <div className="text-[11px] text-text-3 mt-0.5 hidden sm:block">Últimas acciones en el sistema</div>
                </div>
                <div className="flex flex-col">
                  {activities.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-[12px] text-text-3">Sin actividad reciente</div>
                  ) : (
                    activities.map((a, i) => {
                      const act = activityIcons[a.type] || { icon: <IconCheck />, cls: 'green' };
                      return (
                        <div key={a.id || i} className="flex items-start gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border">
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
