'use client';

import Link from 'next/link';

/* ── Shared styles ── */
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', borderRadius: 'var(--radius-sm)',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
  background: 'transparent', color: 'var(--text-2)',
  border: '1px solid var(--border2)', fontFamily: 'inherit',
};

const cardLink: React.CSSProperties = {
  fontSize: 11, color: 'var(--text-3)', cursor: 'pointer',
  textDecoration: 'none',
};

const AV_COLORS = [
  { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  { bg: 'rgba(244,114,182,0.15)', fg: '#f472b6' },
  { bg: 'rgba(168,85,247,0.15)', fg: '#c084fc' },
  { bg: 'rgba(251,146,60,0.15)', fg: '#fb923c' },
  { bg: 'rgba(20,184,166,0.15)', fg: '#2dd4bf' },
];

/* ── Icons ── */
function IconPeople() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconCard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconDollar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
function IconPlusMember() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}
function IconCreditCard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/* ── Bar Chart ── */
const ingresos = [
  { mes: 'dic', val: 3100 },
  { mes: 'ene', val: 3800 },
  { mes: 'feb', val: 3400 },
  { mes: 'mar', val: 4200 },
  { mes: 'abr', val: 4120 },
  { mes: 'may', val: 4850, current: true },
];

const maxVal = Math.max(...ingresos.map((d) => d.val));

function BarChart() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 4px' }}>
      {ingresos.map((d) => (
        <div key={d.mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div
              style={{
                width: '100%',
                borderRadius: '4px 4px 0 0',
                background: d.current ? 'var(--accent)' : 'var(--surface2)',
                height: `${Math.round((d.val / maxVal) * 100)}%`,
                position: 'relative',
                cursor: 'default',
                transition: 'background 0.2s',
              }}
            >
              <div
                style={{
                  position: 'absolute', bottom: '105%', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--surface2)', border: '1px solid var(--border2)',
                  borderRadius: 'var(--radius-sm)', padding: '4px 8px',
                  fontSize: 11, whiteSpace: 'nowrap', color: 'var(--text)',
                }}
              >
                ${d.val.toLocaleString()}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{d.mes}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Ring Chart ── */
function RingChart() {
  const circumference = 2 * Math.PI * 46;

  const segments = [
    { label: 'Mensual', count: 4, pct: 50, color: 'var(--accent)', dash: circumference * 0.5, offset: 0 },
    { label: 'Trimestral', count: 3, pct: 37, color: 'var(--blue-text)', dash: circumference * 0.37, offset: -circumference * 0.5 },
    { label: 'Anual', count: 1, pct: 13, color: 'var(--green-text)', dash: circumference * 0.13, offset: -(circumference * 0.5 + circumference * 0.37) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {segments.map((s, i) => (
          <circle
            key={i}
            cx="60" cy="60" r="46"
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={s.offset}
            strokeLinecap="butt"
            transform="rotate(-90 60 60)"
          />
        ))}
        <text x="60" y="55" textAnchor="middle" fontSize="16" fontWeight="600" fill="#f0f0f0" fontFamily="inherit">8</text>
        <text x="60" y="70" textAnchor="middle" fontSize="9" fill="#606060" fontFamily="inherit">activas</text>
      </svg>
      <div style={{ width: '100%', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              {s.label}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
              {s.count} — {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      {/* TOPBAR */}
      <header
        style={{
          padding: '0 28px', height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 9,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
          Panel
          <span style={{ fontSize: 10 }}>›</span>
          <span style={{ color: 'var(--text-2)' }}>Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontSize: 12, color: 'var(--text-3)',
            fontFamily: 'monospace', background: 'var(--surface)',
            border: '1px solid var(--border)', padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
          }}>
            01 may 2026
          </span>
          <button style={btnGhost}>
            <IconDownload /> Exportar reporte
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div style={{ padding: 28, flex: 1 }}>
        {/* WELCOME */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Buenos días 👋</h1>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
              Aquí está el resumen de Omega Gym hoy, 1 de mayo de 2026.
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--green-bg)', border: '1px solid rgba(34,197,94,0.2)',
            color: 'var(--green-text)', fontSize: 12, padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: 'var(--green)',
              animation: 'pulse 2s infinite',
            }} />
            Sistema operando con normalidad
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { icon: <IconPeople />, color: 'blue', value: 12, label: 'Total de miembros', delta: '+2 este mes', deltaCls: 'up' as const },
            { icon: <IconCard />, color: 'green', value: 8, label: 'Membresías activas', delta: '83%', deltaCls: 'up' as const },
            { icon: <IconClock />, color: 'amber', value: 4, label: 'Vencen en 7 días', delta: 'Atención', deltaCls: 'down' as const },
            { icon: <IconDollar />, color: 'accent', value: '$4,850', label: 'Ingresos de mayo', delta: '+18%', deltaCls: 'up' as const },
          ].map((kpi) => (
            <div
              key={kpi.label}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: 20,
                position: 'relative', overflow: 'hidden', cursor: 'default',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `var(--${kpi.color})`,
              }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `var(--${kpi.color}-bg)`,
                  color: `var(--${kpi.color}-text)`,
                }}>
                  <div style={{ width: 16, height: 16 }}>{kpi.icon}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 100,
                  background: kpi.deltaCls === 'up' ? 'var(--green-bg)' : kpi.deltaCls === 'down' ? 'var(--red-bg)' : 'var(--surface2)',
                  color: kpi.deltaCls === 'up' ? 'var(--green-text)' : kpi.deltaCls === 'down' ? 'var(--red-text)' : 'var(--text-3)',
                }}>
                  {kpi.delta}
                </span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, color: `var(--${kpi.color}-text)` }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* ROW 2: Revenue + Types + Pending */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {/* Revenue chart */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Ingresos mensuales</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Últimos 6 meses</div>
              </div>
              <Link href="/reports" style={cardLink}>Ver reporte →</Link>
            </div>
            <div style={{ padding: 20 }}>
              <BarChart />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--accent)' }}>$4,850</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Mayo 2026 (mes actual)</div>
                  <div style={{ fontSize: 11, color: 'var(--green-text)', marginTop: 3 }}>↑ 18% vs mes anterior</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-2)' }}>$24,390</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Total últimos 6 meses</div>
                </div>
              </div>
            </div>
          </div>

          {/* Membership types ring */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Tipos de membresía</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Distribución actual</div>
            </div>
            <RingChart />
          </div>

          {/* Pending payments */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Pagos pendientes</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Requieren atención</div>
              </div>
              <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 100, background: 'var(--red-bg)', color: 'var(--red-text)', fontWeight: 500 }}>3</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { name: 'Luis Medina', initials: 'LM', av: 4, plan: 'Mensual · Vencida 11d', amount: '$350' },
                { name: 'Paola Rivas', initials: 'PR', av: 3, plan: 'Trimestral · Activa', amount: '$900' },
                { name: 'Brenda Vargas', initials: 'BV', av: 5, plan: 'Trimestral · Vencida 21d', amount: '$900' },
              ].map((p) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 600, flexShrink: 0,
                      background: AV_COLORS[p.av].bg, color: AV_COLORS[p.av].fg,
                    }}>
                      {p.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.plan}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber-text)' }}>
                    {p.amount}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
              <Link href="/payments" style={cardLink}>Ver todos los pagos →</Link>
            </div>
          </div>
        </div>

        {/* ROW 3: Alerts + Plans + Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 12 }}>
          {/* Expiring memberships */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Membresías por vencer</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Próximos 7 días</div>
              </div>
              <Link href="/memberships" style={cardLink}>Ver membresías →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { name: 'Valeria Cruz', initials: 'VC', av: 5, detail: 'Trimestral · vence 1 may 2026', badge: 'Hoy', badgeCls: 'ab-danger' as const },
                { name: 'Miguel Torres', initials: 'MT', av: 2, detail: 'Mensual · vence 5 may 2026', badge: '4 días', badgeCls: 'ab-warn' as const },
                { name: 'Roberto Félix', initials: 'RF', av: 0, detail: 'Mensual · vence 6 may 2026', badge: '5 días', badgeCls: 'ab-warn' as const },
                { name: 'Héctor Gómez', initials: 'HG', av: 4, detail: 'Mensual · vence 4 may 2026', badge: '3 días', badgeCls: 'ab-warn' as const },
              ].map((a) => (
                <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600, flexShrink: 0,
                    background: AV_COLORS[a.av].bg, color: AV_COLORS[a.av].fg,
                  }}>
                    {a.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{a.detail}</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 500, padding: '3px 9px', borderRadius: 100, whiteSpace: 'nowrap',
                    background: a.badgeCls === 'ab-danger' ? 'var(--red-bg)' : 'var(--amber-bg)',
                    color: a.badgeCls === 'ab-danger' ? 'var(--red-text)' : 'var(--amber-text)',
                  }}>
                    {a.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top training plans */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Planes de entrenamiento</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Más asignados</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20 }}>
              {[
                { name: 'Fuerza A', count: '3 miembros', width: '100%', color: 'var(--accent)' },
                { name: 'Cardio Plus', count: '2 miembros', width: '66%', color: 'var(--blue-text)' },
                { name: 'Fuerza B', count: '1 miembro', width: '33%', color: 'var(--purple-text)' },
                { name: 'Movilidad', count: '2 miembros', width: '66%', color: 'var(--green-text)' },
                { name: 'Sin plan asignado', count: '4 miembros', width: '100%', color: 'var(--surface2)' },
              ].map((p) => (
                <div key={p.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-2)' }}>{p.name}</span>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{p.count}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: p.color, width: p.width }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Actividad reciente</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Últimas acciones en el sistema</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { icon: <IconPlusMember />, iconCls: 'act-new', text: 'Nuevo miembro <strong>Roberto Félix</strong> registrado', time: 'hace 2 horas' },
                { icon: <IconCreditCard />, iconCls: 'act-pay', text: 'Pago registrado de <strong>Sofía López</strong> — $900', time: 'hace 4 horas' },
                { icon: <IconCheck />, iconCls: 'act-plan', text: 'Plan <strong>Fuerza A</strong> asignado a <strong>Paola Rivas</strong>', time: 'ayer a las 17:30' },
                { icon: <IconAlert />, iconCls: 'act-exp', text: 'Membresía de <strong>Luis Medina</strong> venció sin renovar', time: 'hace 11 días' },
                { icon: <IconCreditCard />, iconCls: 'act-pay', text: 'Pago de <strong>Ana Gutiérrez</strong> confirmado — $3,200', time: 'hace 16 días' },
              ].map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div
                    className={a.iconCls}
                    style={{
                      width: 30, height: 30, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 1,
                      background: a.iconCls === 'act-new' ? 'var(--green-bg)' : a.iconCls === 'act-pay' ? 'var(--blue-bg)' : a.iconCls === 'act-plan' ? 'var(--purple-bg)' : 'var(--red-bg)',
                      color: a.iconCls === 'act-new' ? 'var(--green-text)' : a.iconCls === 'act-pay' ? 'var(--blue-text)' : a.iconCls === 'act-plan' ? 'var(--purple-text)' : 'var(--red-text)',
                    }}
                  >
                    <div style={{ width: 13, height: 13 }}>{a.icon}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}
                      dangerouslySetInnerHTML={{ __html: a.text }}
                    />
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
                      {a.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
