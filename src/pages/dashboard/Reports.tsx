import { useState, useEffect } from 'react';
import { dashboardService, type MonthlyRevenueItem } from '@/services/dashboard.service'
import { checkInsService } from '@/services/checkIns.service'
import { membersService } from '@/services/members.service'
import { MetricCard } from '@/components/ui/atoms/MetricCard'

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface ReportCard {
  name: string
  description: string
  icon: string
  color: string
  rows: number
}

const REPORTS: ReportCard[] = [
  { name: 'Miembros por plan', description: 'Distribución de miembros según tipo de membresía contratada', icon: '📊', color: 'var(--blue)', rows: 12 },
  { name: 'Asistencia mensual', description: 'Check-ins diarios promedio por mes', icon: '📈', color: 'var(--green)', rows: 14 },
  { name: 'Ingresos por periodo', description: 'Recaudación total filtrada por rango de fechas', icon: '💰', color: 'var(--accent-text)', rows: 8 },
  { name: 'Renovaciones', description: 'Tasa de retención y membresías renovadas vs. canceladas', icon: '🔄', color: 'var(--amber)', rows: 10 },
  { name: 'Morosidad', description: 'Miembros con pagos pendientes y días de retraso', icon: '⚠️', color: 'var(--red)', rows: 6 },
  { name: 'Planes populares', description: 'Planes de entrenamiento más asignados este mes', icon: '🏋️', color: 'var(--purple, #a78bfa)', rows: 9 },
]

function IconDownload() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [kpis, setKpis] = useState<{ revenue: number; members: number; todayCheckins: number; retention: number } | null>(null)
  const [revenueData, setRevenueData] = useState<MonthlyRevenueItem[]>([])
  const [checkinData, setCheckinData] = useState<number[]>([])
  const [memberData, setMemberData] = useState<number[]>([])

  useEffect(() => {
    const year = new Date().getFullYear()
    Promise.all([
      dashboardService.getKPIs(),
      dashboardService.getMonthlyRevenue(year),
      checkInsService.getMonthlyCounts(year),
      membersService.getMonthlyGrowth(year),
      checkInsService.getToday(),
      membersService.getStats(),
    ]).then(([kpi, rev, checkins, members, todayCheckins, stats]) => {
      setKpis({
        revenue: kpi.monthly_revenue,
        members: stats.active,
        todayCheckins: todayCheckins.length,
        retention: Math.round((stats.active / Math.max(stats.total, 1)) * 100),
      })
      setRevenueData(rev)
      setCheckinData(checkins.map(c => c.count))
      setMemberData(members.map(m => m.count))
    }).catch(() => {})
  }, [])

  const currentMonth = new Date().getMonth();

  function fmtMoney(n: number) {
    return '$' + n.toLocaleString('es-MX');
  }

  const revenueTotal = revenueData.reduce((a, b) => a + b.amount, 0)
  const checkinTotal = checkinData.reduce((a, b) => a + b, 0)
  const memberTotal = memberData.reduce((a, b) => a + b, 0)

  const monthsToShow = period === 'month' ? Math.min(currentMonth + 1, 6) : period === 'quarter' ? Math.min(currentMonth + 1, 8) : 12
  const showCount = Math.min(monthsToShow, 6)

  const fmtDate = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  return (
    <>
      <header
        style={{
          padding: '0 28px', minHeight: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)', background: 'var(--bg)',
          position: 'sticky', top: 0, zIndex: 9,
        }}
        className="flex-wrap gap-2 py-2"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
          Panel
          <span style={{ fontSize: 10 }}>›</span>
          <span style={{ color: 'var(--text-2)' }}>Reportes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="flex-wrap">
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', borderRadius: 'var(--radius-sm)', padding: 2, border: '1px solid var(--border)' }}>
            {(['month', 'quarter', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '5px 12px', borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: 'none',
                  background: period === p ? 'var(--accent)' : 'transparent',
                  color: period === p ? '#000' : 'var(--text-2)',
                  fontFamily: 'inherit',
                }}
              >
                {p === 'month' ? 'Mes' : p === 'quarter' ? 'Trimestre' : 'Año'}
              </button>
            ))}
          </div>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border2)', fontFamily: 'inherit' }}>
            <IconCalendar />
            <span className="hidden sm:inline">{fmtDate}</span>
          </button>
        </div>
      </header>

      <div style={{ padding: '20px clamp(16px, 4vw, 28px)', flex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Reportes</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
            Analítica y métricas clave del gimnasio
          </div>
        </div>

        {/* KPI row */}
        <div className="flex overflow-x-auto gap-3 mb-5" style={{}}>
          <MetricCard color="green" label="Ingresos del mes" value={kpis ? fmtMoney(kpis.revenue) : '—'} sub="Mes actual" />
          <MetricCard color="blue" label="Miembros activos" value={kpis ? kpis.members.toString() : '—'} sub="Con membresía activa" />
          <MetricCard color="accent" label="Check-ins hoy" value={kpis ? kpis.todayCheckins.toString() : '—'} sub="Entradas registradas" />
          <MetricCard color="amber" label="Tasa retención" value={kpis ? `${kpis.retention}%` : '—'} sub="Miembros activos vs total" />
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 20 }} className="lg:grid-cols-2">
          {/* Revenue chart */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Ingresos mensuales</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{MONTHS[0]} – {MONTHS[currentMonth]} {new Date().getFullYear()}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--blue-text)' }}>{fmtMoney(revenueTotal)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
              {revenueData.slice(0, showCount).map((item, i) => {
                const max = Math.max(...revenueData.slice(0, showCount).map(r => r.amount), 1);
                const pct = (item.amount / max) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: 'var(--text-3)' }}>{fmtMoney(item.amount)}</div>
                    <div style={{ width: '100%', borderRadius: '3px 3px 0 0', height: `${pct}%`, background: 'var(--blue)', opacity: item.is_current ? 1 : 0.3 + (i / showCount) * 0.7, minHeight: item.amount > 0 ? 8 : 0 }} />
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{item.month}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Check-ins chart */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Check-ins mensuales</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Asistencia acumulada por mes</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--green-text)' }}>{checkinTotal.toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
              {checkinData.slice(0, showCount).map((v, i) => {
                const max = Math.max(...checkinData.slice(0, showCount), 1);
                const pct = (v / max) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: 'var(--text-3)' }}>{v}</div>
                    <div style={{ width: '100%', borderRadius: '3px 3px 0 0', height: `${pct}%`, background: 'var(--green)', opacity: 0.3 + (i / showCount) * 0.7, minHeight: v > 0 ? 8 : 0 }} />
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{MONTHS[i]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Available reports grid */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Reportes disponibles</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {REPORTS.map((r) => (
              <div
                key={r.name}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  padding: 18, cursor: 'pointer', transition: 'border-color 0.15s',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>{r.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.4 }}>{r.description}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.rows} filas</span>
                  <button
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '5px 12px', borderRadius: 'var(--radius-sm)',
                      fontSize: 11, fontWeight: 500, cursor: 'pointer',
                      background: 'transparent', color: 'var(--text-2)',
                      border: '1px solid var(--border2)', fontFamily: 'inherit',
                    }}
                  >
                    <IconDownload />
                    Exportar CSV
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
