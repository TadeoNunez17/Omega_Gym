'use client';

import { useState, useMemo } from 'react';

const TODAY = new Date('2026-05-01');
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const MONTHLY_REVENUE = [3200, 4100, 3800, 4500, 4850, 0, 0, 0, 0, 0, 0, 0];
const MONTHLY_MEMBERS = [58, 62, 60, 68, 72, 0, 0, 0, 0, 0, 0, 0];
const MONTHLY_CHECKINS = [210, 245, 228, 267, 289, 0, 0, 0, 0, 0, 0, 0];

interface Report {
  name: string;
  description: string;
  icon: string;
  color: string;
  rows: number;
}

const REPORTS: Report[] = [
  { name: 'Miembros por plan', description: 'Distribución de miembros según tipo de membresía contratada', icon: '📊', color: 'var(--blue)', rows: 12 },
  { name: 'Asistencia mensual', description: 'Check-ins diarios promedio por mes', icon: '📈', color: 'var(--green)', rows: 14 },
  { name: 'Ingresos por periodo', description: 'Recaudación total filtrada por rango de fechas', icon: '💰', color: 'var(--accent-text)', rows: 8 },
  { name: 'Renovaciones', description: 'Tasa de retención y membresías renovadas vs. canceladas', icon: '🔄', color: 'var(--amber)', rows: 10 },
  { name: 'Morosidad', description: 'Miembros con pagos pendientes y días de retraso', icon: '⚠️', color: 'var(--red)', rows: 6 },
  { name: 'Planes populares', description: 'Planes de entrenamiento más asignados este mes', icon: '🏋️', color: 'var(--purple, #a78bfa)', rows: 9 },
];

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

function IconRefresh() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function MiniBar({ values, color, height = 40 }: { values: number[]; color: string; height?: number }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {values.slice(0, 6).map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1, borderRadius: '2px 2px 0 0',
            height: `${(v / max) * 100}%`,
            background: color,
            opacity: v === 0 ? 0.15 : 0.4 + (i / values.length) * 0.6,
            transition: 'height 0.4s',
          }}
        />
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const currentMonth = TODAY.getMonth();
  const revenueThisMonth = MONTHLY_REVENUE[currentMonth];
  const revenueLastMonth = MONTHLY_REVENUE[currentMonth - 1] || 0;
  const revenueChange = revenueLastMonth > 0 ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(0) : '0';

  const membersThisMonth = MONTHLY_MEMBERS[currentMonth];
  const checkinsThisMonth = MONTHLY_CHECKINS[currentMonth];

  function fmtMoney(n: number) {
    return '$' + n.toLocaleString('es-MX');
  }

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
          <span style={{ color: 'var(--text-2)' }}>Reportes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border2)', fontFamily: 'inherit' }}>
            <IconCalendar />
            May 2026
          </button>
        </div>
      </header>

      <div style={{ padding: 28, flex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Reportes</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
            Analítica y métricas clave del gimnasio
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Ingresos del mes', value: fmtMoney(revenueThisMonth), change: `${revenueChange}%`, up: Number(revenueChange) >= 0, color: 'green', sub: 'vs. mes anterior' },
            { label: 'Miembros activos', value: membersThisMonth.toString(), change: '+4', up: true, color: 'blue', sub: 'Nuevos este mes' },
            { label: 'Check-ins hoy', value: '47', change: '+12%', up: true, color: 'accent', sub: 'vs. ayer' },
            { label: 'Tasa retención', value: '89%', change: '-2%', up: false, color: 'amber', sub: 'Últimos 30 días' },
          ].map((m) => (
            <div key={m.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `var(--${m.color})` }} />
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{m.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em', color: `var(--${m.color}-text)` }}>{m.value}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: m.up ? 'var(--green-text)' : 'var(--red-text)' }}>
                  {m.up ? '↑' : '↓'} {m.change}
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {/* Revenue chart */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Ingresos mensuales</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Enero – Mayo 2026</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--blue-text)' }}>{fmtMoney(MONTHLY_REVENUE.slice(0, 5).reduce((a, b) => a + b, 0))}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
              {MONTHLY_REVENUE.slice(0, 5).map((v, i) => {
                const max = Math.max(...MONTHLY_REVENUE.slice(0, 5), 1);
                const pct = (v / max) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: 'var(--text-3)' }}>{fmtMoney(v)}</div>
                    <div style={{ width: '100%', borderRadius: '3px 3px 0 0', height: `${pct}%`, background: 'var(--blue)', opacity: 0.5 + (i / 5) * 0.5, minHeight: v > 0 ? 8 : 0 }} />
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{MONTHS[i].slice(0, 3)}</div>
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
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Asistencia acumulada</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--green-text)' }}>{MONTHLY_CHECKINS.slice(0, 5).reduce((a, b) => a + b, 0).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
              {MONTHLY_CHECKINS.slice(0, 5).map((v, i) => {
                const max = Math.max(...MONTHLY_CHECKINS.slice(0, 5), 1);
                const pct = (v / max) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: 'var(--text-3)' }}>{v}</div>
                    <div style={{ width: '100%', borderRadius: '3px 3px 0 0', height: `${pct}%`, background: 'var(--green)', opacity: 0.5 + (i / 5) * 0.5, minHeight: v > 0 ? 8 : 0 }} />
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{MONTHS[i].slice(0, 3)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Available reports grid */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Reportes disponibles</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
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
