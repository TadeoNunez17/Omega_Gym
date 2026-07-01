import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { membershipsService } from '@/services/memberships.service';
import { MetricCard } from '@/components/ui/atoms/MetricCard';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { dashboardService, type DashboardKPIs } from '@/services/dashboard.service';

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

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function fmtDateShort(s: string) {
  const [y, mo, d] = s.split('-');
  return `${parseInt(d)} ${MONTHS[parseInt(mo) - 1]} ${y}`;
}

function todayStr() {
  const n = new Date();
  return `${n.getDate()} ${MONTHS[n.getMonth()]} ${n.getFullYear()}`;
}

const staggerClass = (i: number) => {
  const map = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5', 'stagger-6', 'stagger-7'];
  return map[i] || 'stagger-1';
};

export default function TrainerPanelPage() {
  const user = useAuthStore(s => s.user);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = { ignore: false };
    (async () => {
      try {
        const [kpiData, exp] = await Promise.all([
          dashboardService.getKPIs(),
          membershipsService.getExpiring(7),
        ]);

        if (ctrl.ignore) return;
        setKpis(kpiData);
        setExpiring(exp);
      } catch (err) {
        if (!ctrl.ignore) console.error('Error loading panel data:', err);
      } finally {
        if (!ctrl.ignore) setLoading(false);
      }
    })();
    return () => { ctrl.ignore = true; };
  }, []);

  return (
    <>
      <div className="noise-overlay" />
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-surface2 sticky top-0 z-9">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
          <div className="w-4 h-4 shrink-0 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full" width="16" height="16"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
          <span className="text-text-4 mx-0.5">/</span>
          <span className="font-medium text-text-1">Mi panel</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[11px] sm:text-[12px] text-text-3 font-mono bg-surface border border-border px-2.5 sm:px-3 py-1.5 rounded-sm hidden sm:inline">{todayStr()}</span>
        </div>
      </header>

      <div className="p-2.5 sm:p-4 md:p-7 flex-1 animate-slide-up stagger-1">
        <div className="relative mb-7 overflow-hidden rounded-xl bg-gradient-to-br from-surface to-surface2 border border-border p-5 sm:p-7">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ background: 'radial-gradient(600px circle at 20% 30%, var(--accent), transparent)' }} />
          <div className="relative">
            <PageHeader
              title={`Buenos días, ${user?.full_name?.split(' ')[0] || 'Entrenador'} 👋`}
              description="Resumen de tus miembros y membresías"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-[60px] text-text-3">Cargando panel…</div>
        ) : (<>
        <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-3">
          <div className={`animate-slide-up ${staggerClass(0)}`}>
            <MetricCard icon={<IconPeople />} color="blue" value={kpis?.total_members ?? 0} label="Total miembros" delta="Registrados" deltaType="up" />
          </div>
          <div className={`animate-slide-up ${staggerClass(1)}`}>
            <MetricCard icon={<IconCard />} color="green" value={kpis?.active_memberships ?? 0} label="Membresías activas" delta="Vigentes" deltaType="up" />
          </div>
          <div className={`animate-slide-up ${staggerClass(2)}`}>
            <MetricCard icon={<IconClock />} color="amber" value={kpis?.expiring_soon ?? 0} label="Vencen en 7 días" delta="Atención" deltaType="down" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 mb-5">

          <div className={`animate-slide-up ${staggerClass(3)} bg-surface border border-border rounded-lg overflow-hidden`}>
            <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-bg text-amber-text flex items-center justify-center">
                  <div className="w-3.5 h-3.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg></div>
                </div>
                <div>
                  <div className="text-[13px] font-semibold">Membresías por vencer</div>
                  <div className="text-[11px] text-text-3 mt-0.5 hidden sm:block">Próximos 7 días</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              {expiring.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-text-3">
                  <div className="w-8 h-8 rounded-full bg-green-bg text-green-text flex items-center justify-center mb-2">
                    <div className="w-4 h-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></div>
                  </div>
                  <div className="text-[12px]">Sin membresías por vencer</div>
                </div>
              ) : (
                expiring.slice(0, 5).map((e) => {
                  const av = AV_COLORS[e.member_name.length % AV_COLORS.length];
                  const inits = e.member_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
                  const ev = e.days_remaining === 0 ? 'Hoy' : e.days_remaining === 1 ? '1 día' : `${e.days_remaining} días`;
                  const isUrgent = e.days_remaining <= 1;
                  return (
                    <div key={e.id} className="row-hover flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                        style={{ background: av.bg, color: av.fg }}>
                        {inits}
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

        </div>

        </>)}
      </div>
    </>
  );
}
