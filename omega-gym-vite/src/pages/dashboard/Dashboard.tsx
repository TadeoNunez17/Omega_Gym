import { Link } from 'react-router-dom';
import { MetricCard } from '@/components/ui/atoms/MetricCard';

const AV_COLORS = [
  { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  { bg: 'rgba(244,114,182,0.15)', fg: '#f472b6' },
  { bg: 'rgba(168,85,247,0.15)', fg: '#c084fc' },
  { bg: 'rgba(251,146,60,0.15)', fg: '#fb923c' },
  { bg: 'rgba(20,184,166,0.15)', fg: '#2dd4bf' },
];

function IconPeople() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function IconCard() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>;
}
function IconClock() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
function IconDollar() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
}
function IconDownload() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
}
function IconPlusMember() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>;
}
function IconCreditCard() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>;
}
function IconCheck() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
}
function IconAlert() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
}

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
    <div className="flex items-end gap-2 h-[120px] px-1">
      {ingresos.map((d) => (
        <div key={d.mes} className="flex-1 flex flex-col items-center gap-1.5 h-full">
          <div className="flex-1 w-full flex items-end">
            <div
              className={`w-full rounded-t-sm relative cursor-default transition-colors duration-200 ${d.current ? 'bg-accent' : 'bg-surface2'}`}
              style={{ height: `${Math.round((d.val / maxVal) * 100)}%` }}
            >
              <div
                className="absolute bottom-[105%] left-1/2 -translate-x-1/2 bg-surface2 border border-border2 rounded-sm px-2 py-1 text-[11px] whitespace-nowrap text-text"
              >
                ${d.val.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-text-3">{d.mes}</div>
        </div>
      ))}
    </div>
  );
}

function RingChart() {
  const circumference = 2 * Math.PI * 46;
  const segments = [
    { label: 'Mensual', count: 4, pct: 50, color: 'var(--accent)', dash: circumference * 0.5, offset: 0 },
    { label: 'Trimestral', count: 3, pct: 37, color: 'var(--blue-text)', dash: circumference * 0.37, offset: -circumference * 0.5 },
    { label: 'Anual', count: 1, pct: 13, color: 'var(--green-text)', dash: circumference * 0.13, offset: -(circumference * 0.5 + circumference * 0.37) },
  ];

  return (
    <div className="flex flex-col items-center p-5">
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
      <div className="w-full mt-4 flex flex-col gap-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2 text-text-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
              {s.label}
            </div>
            <span className="text-[12px] text-text font-medium">
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
      {/* HEADER */}
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-bg sticky top-0 z-9">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
          Panel
          <span className="text-[10px]">›</span>
          <span className="text-text-2">Dashboard</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[11px] sm:text-[12px] text-text-3 font-mono bg-surface border border-border px-2.5 sm:px-3 py-1.5 rounded-sm hidden sm:inline">
            01 may 2026
          </span>
          <button className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-sm text-[12px] sm:text-[13px] font-medium cursor-pointer bg-transparent text-text-2 border border-border2 font-sans whitespace-nowrap">
            <IconDownload /> Exportar
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="p-2.5 sm:p-4 md:p-7 flex-1">
        {/* WELCOME */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[20px] sm:text-[22px] font-semibold -tracking-[0.02em]">Buenos días 👋</h1>
            <p className="text-[12px] sm:text-[13px] text-text-2 mt-1">
              Aquí está el resumen de Omega Gym hoy, 1 de mayo de 2026.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sm text-[12px] border border-green/20 bg-green-bg text-green-text self-start sm:self-auto">
            <div className="w-[7px] h-[7px] rounded-full bg-green animate-pulse" />
            Sistema operando con normalidad
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <MetricCard
            icon={<IconPeople />}
            color="blue"
            value={12}
            label="Total de miembros"
            delta="+2 este mes"
            deltaType="up"
          />
          <MetricCard
            icon={<IconCard />}
            color="green"
            value={8}
            label="Membresías activas"
            delta="83%"
            deltaType="up"
          />
          <MetricCard
            icon={<IconClock />}
            color="amber"
            value={4}
            label="Vencen en 7 días"
            delta="Atención"
            deltaType="down"
          />
          <MetricCard
            icon={<IconDollar />}
            color="accent"
            value="$4,850"
            label="Ingresos de mayo"
            delta="+18%"
            deltaType="up"
          />
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">

          {/* Revenue */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border">
              <div>
                <div className="text-[13px] font-semibold">Ingresos mensuales</div>
                <div className="text-[11px] text-text-3 mt-0.5">Últimos 6 meses</div>
              </div>
              <Link to="/reports" className="text-[11px] text-text-3 no-underline cursor-pointer">Ver reporte →</Link>
            </div>
            <div className="p-4 sm:p-5">
              <BarChart />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div>
                  <div className="text-xl sm:text-[20px] font-semibold -tracking-[0.02em] text-accent">$4,850</div>
                  <div className="text-[11px] text-text-3 mt-0.5">Mayo 2026 (mes actual)</div>
                  <div className="text-[11px] text-green-text mt-[3px]">↑ 18% vs mes anterior</div>
                </div>
                <div className="text-right">
                  <div className="text-sm sm:text-[16px] font-semibold text-text-2">$24,390</div>
                  <div className="text-[11px] text-text-3 mt-0.5">Total últimos 6 meses</div>
                </div>
              </div>
            </div>
          </div>

          {/* Membership types ring */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-border">
              <div className="text-[13px] font-semibold">Tipos de membresía</div>
              <div className="text-[11px] text-text-3 mt-0.5">Distribución actual</div>
            </div>
            <RingChart />
          </div>

          {/* Pending payments */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border">
              <div>
                <div className="text-[13px] font-semibold">Pagos pendientes</div>
                <div className="text-[11px] text-text-3 mt-0.5">Requieren atención</div>
              </div>
              <span className="text-[11px] font-medium px-[9px] py-[3px] rounded-full bg-red-bg text-red-text">3</span>
            </div>
            <div className="flex flex-col">
              {[
                { name: 'Luis Medina', initials: 'LM', av: 4, plan: 'Mensual · Vencida 11d', amount: '$350' },
                { name: 'Paola Rivas', initials: 'PR', av: 3, plan: 'Trimestral · Activa', amount: '$900' },
                { name: 'Brenda Vargas', initials: 'BV', av: 5, plan: 'Trimestral · Vencida 21d', amount: '$900' },
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                      style={{ background: AV_COLORS[p.av].bg, color: AV_COLORS[p.av].fg }}>
                      {p.initials}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">{p.name}</div>
                      <div className="text-[11px] text-text-3">{p.plan}</div>
                    </div>
                  </div>
                  <div className="text-[13px] font-semibold text-amber-text">{p.amount}</div>
                </div>
              ))}
            </div>
            <div className="px-4 sm:px-5 py-3 border-t border-border">
              <Link to="/payments" className="text-[11px] text-text-3 no-underline cursor-pointer">Ver todos los pagos →</Link>
            </div>
          </div>
        </div>

        {/* ROW 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

          {/* Expiring */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border">
              <div>
                <div className="text-[13px] font-semibold">Membresías por vencer</div>
                <div className="text-[11px] text-text-3 mt-0.5">Próximos 7 días</div>
              </div>
              <Link to="/memberships" className="text-[11px] text-text-3 no-underline cursor-pointer">Ver membresías →</Link>
            </div>
            <div className="flex flex-col">
              {[
                { name: 'Valeria Cruz', initials: 'VC', av: 5, detail: 'Trimestral · vence 1 may 2026', badge: 'Hoy', badgeCls: 'red' as const },
                { name: 'Miguel Torres', initials: 'MT', av: 2, detail: 'Mensual · vence 5 may 2026', badge: '4 días', badgeCls: 'amber' as const },
                { name: 'Roberto Félix', initials: 'RF', av: 0, detail: 'Mensual · vence 6 may 2026', badge: '5 días', badgeCls: 'amber' as const },
                { name: 'Héctor Gómez', initials: 'HG', av: 4, detail: 'Mensual · vence 4 may 2026', badge: '3 días', badgeCls: 'amber' as const },
              ].map((a) => (
                <div key={a.name} className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-border">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                    style={{ background: AV_COLORS[a.av].bg, color: AV_COLORS[a.av].fg }}>
                    {a.initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium">{a.name}</div>
                    <div className="text-[11px] text-text-3 mt-0.5">{a.detail}</div>
                  </div>
                  <span className={`text-[10px] font-medium px-[9px] py-[3px] rounded-full whitespace-nowrap
                    ${a.badgeCls === 'red' ? 'bg-red-bg text-red-text' : 'bg-amber-bg text-amber-text'}`}>
                    {a.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top training plans */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-border">
              <div className="text-[13px] font-semibold">Planes de entrenamiento</div>
              <div className="text-[11px] text-text-3 mt-0.5">Más asignados</div>
            </div>
            <div className="flex flex-col gap-3 p-4 sm:p-5">
              {[
                { name: 'Fuerza A', count: '3 miembros', width: '100%', color: 'var(--accent)' },
                { name: 'Cardio Plus', count: '2 miembros', width: '66%', color: 'var(--blue-text)' },
                { name: 'Fuerza B', count: '1 miembro', width: '33%', color: 'var(--purple-text)' },
                { name: 'Movilidad', count: '2 miembros', width: '66%', color: 'var(--green-text)' },
                { name: 'Sin plan asignado', count: '4 miembros', width: '100%', color: 'var(--surface2)' },
              ].map((p) => (
                <div key={p.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-text-2">{p.name}</span>
                    <span className="text-text font-medium">{p.count}</span>
                  </div>
                  <div className="h-1 bg-surface2 rounded-sm overflow-hidden">
                    <div className="h-full rounded-sm" style={{ background: p.color, width: p.width }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-border">
              <div className="text-[13px] font-semibold">Actividad reciente</div>
              <div className="text-[11px] text-text-3 mt-0.5">Últimas acciones en el sistema</div>
            </div>
            <div className="flex flex-col">
              {[
                { icon: <IconPlusMember />, iconCls: 'green', text: 'Nuevo miembro <strong>Roberto Félix</strong> registrado', time: 'hace 2 horas' },
                { icon: <IconCreditCard />, iconCls: 'blue', text: 'Pago registrado de <strong>Sofía López</strong> — $900', time: 'hace 4 horas' },
                { icon: <IconCheck />, iconCls: 'purple', text: 'Plan <strong>Fuerza A</strong> asignado a <strong>Paola Rivas</strong>', time: 'ayer a las 17:30' },
                { icon: <IconAlert />, iconCls: 'red', text: 'Membresía de <strong>Luis Medina</strong> venció sin renovar', time: 'hace 11 días' },
                { icon: <IconCreditCard />, iconCls: 'blue', text: 'Pago de <strong>Ana Gutiérrez</strong> confirmado — $3,200', time: 'hace 16 días' },
              ].map((a, i) => {
                const clsStyles: Record<string, string> = {
                  green: 'bg-green-bg text-green-text',
                  blue: 'bg-blue-bg text-blue-text',
                  purple: 'bg-purple-bg text-purple-text',
                  red: 'bg-red-bg text-red-text',
                };
                return (
                  <div key={i} className="flex items-start gap-3 px-4 sm:px-5 py-3 border-b border-border">
                    <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${clsStyles[a.iconCls]}`}>
                      <div className="w-[13px] h-[13px]">{a.icon}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-[12px] text-text-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: a.text }} />
                      <div className="text-[10px] text-text-3 mt-[3px]">{a.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
