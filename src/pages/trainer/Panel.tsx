import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { membersService, type MemberListItem } from '@/services/members.service';
import { trainingService, type PlanListItem } from '@/services/training.service';
import { membershipsService } from '@/services/memberships.service';
import { checkInsService, type CheckIn } from '@/services/checkIns.service';
import { MetricCard } from '@/components/ui/atoms/MetricCard';
import { Button } from '@/components/ui/atoms/Button';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { Input, Select } from '@/components/ui/atoms/Input';
import { Modal } from '@/components/ui/molecules/Modal';
import { SearchInput } from '@/components/ui/molecules/SearchInput';
import { Pagination } from '@/components/ui/molecules/Pagination';
import { TabBar } from '@/components/ui/molecules/TabBar';
import { IconPlus } from '@/lib/icons';
import { dashboardService, type DashboardKPIs } from '@/services/dashboard.service';
import { fmtPhone } from '@/lib/helpers';

const AV_COLORS = [
  { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  { bg: 'rgba(244,114,182,0.15)', fg: '#f472b6' },
  { bg: 'rgba(168,85,247,0.15)', fg: '#c084fc' },
  { bg: 'rgba(251,146,60,0.15)', fg: '#fb923c' },
  { bg: 'rgba(20,184,166,0.15)', fg: '#2dd4bf' },
];

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
}

function IconPeople() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function IconCard() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>; }
function IconClock() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>; }
function IconTemplate() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>; }

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

interface PanelMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  av: string;
  avC: number;
  membresia: string;
  memDays: number;
  plan: string | null;
  status: string;
}

interface PanelPlan {
  id: string;
  name: string;
  members: string[];
  days: number;
}

export default function TrainerPanelPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [members, setMembers] = useState<PanelMember[]>([]);
  const [plans, setPlans] = useState<PanelPlan[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pMemberId, setPMemberId] = useState('');

  const [search, setSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [checkinStatus, setCheckinStatus] = useState<CheckIn[] | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctrl = { ignore: false };
    (async () => {
      try {
        const [kpiData, membersData, plansData, exp] = await Promise.all([
          dashboardService.getKPIs(),
          membersService.getAll({ role: 'member', pageSize: 200 }),
          trainingService.getAll({ pageSize: 200 }),
          membershipsService.getExpiring(7),
        ]);

        if (ctrl.ignore) return;
        setKpis(kpiData);
        setMembers(membersData.data.map((m: MemberListItem) => ({
          id: m.id,
          name: m.full_name,
          email: m.email || '',
          phone: m.phone || null,
          av: initials(m.full_name),
          avC: m.full_name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AV_COLORS.length,
          membresia: m.membership_type || '—',
          memDays: m.membership_end
            ? (() => {
                const [y, mo, d] = m.membership_end.split('-').map(Number);
                const endLocal = new Date(y, mo - 1, d);
                const now = new Date();
                const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                return Math.max(0, Math.round((endLocal.getTime() - todayLocal.getTime()) / 86400000));
              })()
            : 0,
          plan: m.plan_name || null,
          status: m.is_active ? 'active' : 'inactive',
        })));
        setPlans(plansData.data.map((p: PlanListItem) => ({
          id: p.id,
          name: p.name,
          members: p.member_name ? [p.member_name] : [],
          days: p.days || 5,
        })));
        setExpiring(exp);
      } catch (err) {
        if (!ctrl.ignore) console.error('Error loading panel data:', err);
      } finally {
        if (!ctrl.ignore) setLoading(false);
      }
    })();
    return () => { ctrl.ignore = true; };
  }, []);

  useEffect(() => {
    if (!selectedId) { setCheckinStatus(null); return; }
    let cancelled = false;
    checkInsService.getByMember(selectedId).then(checks => {
      if (!cancelled) setCheckinStatus(checks);
    }).catch(() => { if (!cancelled) setCheckinStatus([]); });
    return () => { cancelled = true; };
  }, [selectedId]);

  const withPlanCount = members.filter(mem => mem.plan).length;
  const planCount = plans.length;

  const filtered = useMemo(() => {
    let list = members;
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone && m.phone.includes(q))
      );
    }
    if (memberFilter === 'plan') list = list.filter(m => m.plan);
    else if (memberFilter === 'noplan') list = list.filter(m => !m.plan);
    else if (memberFilter === 'nomen') list = list.filter(m => m.memDays === 0);
    return list;
  }, [members, search, memberFilter]);

  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const m = selectedId ? members.find(mem => mem.id === selectedId) ?? null : null;

  function selectMember(id: string) {
    setSelectedId(prev => prev === id ? null : id);
  }

  function handleSearch(next: string) {
    setSearch(next);
    setCurrentPage(1);
  }

  function handleFilterChange(key: string) {
    setMemberFilter(key);
    setCurrentPage(1);
  }

  function handleEyeClick(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setSelectedId(prev => {
      const next = prev === id ? null : id;
      if (next) requestAnimationFrame(() => sidebarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
      return next;
    });
  }

  const checkedInToday = checkinStatus
    ? checkinStatus.some(c => c.check_in_time.startsWith(new Date().toISOString().split('T')[0]))
    : false;
  const lastCheckin = checkinStatus && checkinStatus.length > 0
    ? checkinStatus[0].check_in_time
    : null;

  async function guardarPlan() {
    if (!pName.trim() || !user) return;
    try {
      const plan = await trainingService.create({
        name: pName.trim(),
        description: pDesc.trim() || undefined,
        created_by: user.id,
        assigned_to: pMemberId || undefined,
      });
      setPlans(prev => [...prev, {
        id: plan.id,
        name: plan.name,
        members: pMemberId
          ? [members.find(mem => mem.id === pMemberId)?.name || 'Miembro']
          : [],
        days: 5,
      }]);
      setPlanModalOpen(false);
      setPName(''); setPDesc(''); setPMemberId('');
    } catch (err) {
      console.error('Error creating plan:', err);
    }
  }

  return (
    <>
      <div className="noise-overlay" />
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-surface2 sticky top-0 z-9">
        <div />
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
              breadcrumbs={[
                { label: 'Inicio', href: '/trainer/panel' },
                { label: 'Mi panel' },
              ]}
              title={`Buenos días, ${user?.full_name?.split(' ')[0] || 'Entrenador'} 👋`}
              description={`Resumen de tus miembros y membresías — ${todayStr()}`}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-[60px] text-text-3">Cargando panel…</div>
        ) : (<>
        <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
          <div className={`animate-slide-up ${staggerClass(0)}`}>
            <MetricCard icon={<IconPeople />} color="blue" value={kpis?.total_members ?? 0} label="Total miembros" delta="Registrados" deltaType="up" />
          </div>
          <div className={`animate-slide-up ${staggerClass(1)}`}>
            <MetricCard icon={<IconCard />} color="green" value={kpis?.active_memberships ?? 0} label="Membresías activas" delta="Vigentes" deltaType="up" />
          </div>
          <div className={`animate-slide-up ${staggerClass(2)}`}>
            <MetricCard icon={<IconTemplate />} color="accent" value={planCount} label="Planes activos" delta={withPlanCount > 0 ? `${members.length - withPlanCount} sin plan` : 'Sin planes'} deltaType={withPlanCount > 0 ? 'neutral' : 'down'} />
          </div>
          <div className={`animate-slide-up ${staggerClass(3)}`}>
            <MetricCard icon={<IconClock />} color="amber" value={kpis?.expiring_soon ?? 0} label="Vencen en 7 días" delta="Atención" deltaType="down" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 mb-5">

          <div className={`animate-slide-up ${staggerClass(4)} bg-surface border border-border rounded-lg overflow-hidden`}>
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

        <div className={`grid grid-cols-1 gap-4 mb-5 lg:grid-cols-[1fr_340px] animate-slide-up ${staggerClass(5)}`}>
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border">
              <div className="w-7 h-7 rounded-lg bg-blue-bg text-blue-text flex items-center justify-center">
                <div className="w-3.5 h-3.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
              </div>
              <div>
                <div className="text-[13px] font-semibold">Miembros</div>
                <div className="text-[11px] text-text-3 mt-0.5 hidden sm:block">Contacta al admin para hacer cambios</div>
              </div>
            </div>
            <div className="px-4 sm:px-5 py-2.5 border-b border-border flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <SearchInput value={search} onChange={handleSearch} placeholder="Buscar por nombre, email o teléfono…" />
              <TabBar tabs={[
                { key: 'all', label: 'Todos' },
                { key: 'plan', label: 'Con plan' },
                { key: 'noplan', label: 'Sin plan' },
                { key: 'nomen', label: 'Sin membresía' },
              ]} active={memberFilter} onChange={handleFilterChange} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Miembro', 'Membresía', 'Plan asignado', 'Estado', ''].map(h => (
                      <th key={h} className="text-[10px] font-medium text-text-3 uppercase tracking-wider text-left px-[18px] py-2.5 bg-surface2 border-b border-border">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center justify-center py-10 text-text-3">
                          <div className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center mb-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                          </div>
                          <div className="text-[12px]">No se encontraron miembros</div>
                        </div>
                      </td>
                    </tr>
                  ) : paginated.map((mem) => {
                    const isSel = selectedId === mem.id;
                    const c = AV_COLORS[mem.avC];
                    return (
                      <tr key={mem.id} onClick={() => selectMember(mem.id)}
                        className="cursor-pointer row-hover transition-colors duration-100"
                        style={{ background: isSel ? 'var(--accent-dim)' : undefined }}>
                        <td className="px-[18px] py-3 border-b border-border">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                              style={{ background: c.bg, color: c.fg }}>
                              {mem.av}
                            </div>
                            <div>
                              <div className="text-[13px] font-medium">{mem.name}</div>
                              <div className="text-[11px] text-text-3 mt-0.5">{mem.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-[18px] py-3 border-b border-border">
                          {mem.memDays <= 7 && mem.memDays > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-[11px] font-medium bg-amber-bg text-amber-text">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber shrink-0"></span>
                              {mem.memDays}d
                            </span>
                          ) : mem.memDays > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-[11px] font-medium bg-green-bg text-green-text">
                              <span className="w-1.5 h-1.5 rounded-full bg-green shrink-0"></span>
                              {mem.membresia}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-[11px] font-medium bg-red-bg text-red-text">
                              <span className="w-1.5 h-1.5 rounded-full bg-red shrink-0"></span>
                              Sin membresía
                            </span>
                          )}
                        </td>
                        <td className="px-[18px] py-3 border-b border-border">
                          {mem.plan ? (
                            <span className="bg-purple-bg text-purple-text rounded px-2 py-0.5 text-[11px] font-mono">{mem.plan}</span>
                          ) : (
                            <span className="bg-surface2 text-text-3 border border-dashed border-border2 rounded px-2 py-0.5 text-[11px]">Sin plan</span>
                          )}
                        </td>
                        <td className="px-[18px] py-3 border-b border-border">
                          <span className={`inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-[11px] font-medium ${mem.status === 'active' ? 'bg-green-bg text-green-text' : 'bg-red-bg text-red-text'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${mem.status === 'active' ? 'bg-green' : 'bg-red'}`}></span>
                            {mem.status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-[18px] py-3 border-b border-border text-right">
                          <button onClick={(e) => handleEyeClick(e, mem.id)}
                            className="w-7 h-7 flex items-center justify-center rounded border border-border text-text-3 bg-transparent cursor-pointer"
                            style={{ borderRadius: 'var(--radius-sm)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              current={safePage}
              total={totalPages}
              start={pageStart}
              end={Math.min(pageStart + PAGE_SIZE, filtered.length)}
              totalItems={filtered.length}
              label="miembros"
              onChange={(p) => { setCurrentPage(p); setSelectedId(null); }}
            />
          </div>

          <div ref={sidebarRef} className="bg-surface border border-border rounded-lg overflow-hidden">
            {!m ? (
              <div className="flex flex-col items-center justify-center text-center p-8 gap-2.5 min-h-[300px]">
                <div className="w-9 h-9 rounded-lg bg-surface2 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18" style={{ color: 'var(--text-3)' }}>
                    <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                  </svg>
                </div>
                <div className="text-[14px] font-semibold">Selecciona un miembro</div>
                <div className="text-[12px] text-text-3 leading-relaxed">Haz clic en cualquier fila para ver su estado, membresía y plan asignado.</div>
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-border flex flex-col items-center text-center gap-2.5">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold"
                    style={{ background: AV_COLORS[m.avC]?.bg, color: AV_COLORS[m.avC]?.fg }}>
                    {m.av}
                  </div>
                  <div className="text-[15px] font-semibold">{m.name}</div>

                  <div className="flex flex-col gap-1.5 text-[12px] w-full">
                    <div className="flex items-center justify-center gap-1.5 text-text-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" className="shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <span>{m.email}</span>
                    </div>
                    {m.phone && (
                      <div className="flex items-center justify-center gap-1.5 text-text-3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" className="shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <span>{fmtPhone(m.phone)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {checkinStatus === null ? (
                      <span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-[11px] font-medium bg-surface2 text-text-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-3 shrink-0"></span>Verificando…
                      </span>
                    ) : checkedInToday ? (
                      <span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-[11px] font-medium bg-green-bg text-green-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-green shrink-0"></span>Check-in hoy
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-[11px] font-medium bg-red-bg text-red-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-red shrink-0"></span>Sin check-in hoy
                      </span>
                    )}
                    {m.memDays > 0 && m.memDays <= 7 ? (
                      <span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-[11px] font-medium bg-amber-bg text-amber-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber shrink-0"></span>Vence en {m.memDays} días
                      </span>
                    ) : m.memDays > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-[11px] font-medium bg-green-bg text-green-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-green shrink-0"></span>{m.membresia}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-[11px] font-medium bg-red-bg text-red-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-red shrink-0"></span>Sin membresía
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-[18px] py-3.5 border-b border-border">
                  <div className="text-[10px] uppercase tracking-wider text-text-3 mb-2.5">Membresía</div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[12px] text-text-3">Tipo</span>
                    <span className="text-[12px] font-medium text-text-2">{m.membresia}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-text-3">Días restantes</span>
                    <span className={`text-[12px] font-medium ${m.memDays <= 7 && m.memDays > 0 ? 'text-amber-text' : m.memDays > 0 ? 'text-green-text' : 'text-red-text'}`}>
                      {m.memDays > 0 ? `${m.memDays} días` : '—'}
                    </span>
                  </div>
                </div>

                <div className="px-[18px] py-3.5 border-b border-border">
                  <div className="text-[10px] uppercase tracking-wider text-text-3 mb-2.5">Plan de entrenamiento</div>
                  {m.plan ? (
                    <>
                      <div className="flex justify-between mb-2">
                        <span className="text-[12px] text-text-3">Plan activo</span>
                        <span className="text-[12px] font-medium text-purple-text">{m.plan}</span>
                      </div>
                      <div className="flex gap-1 flex-wrap mt-2">
                        {['L','M','X','J','V','S','D'].map((d, i) => (
                          <span key={d} className={`px-2 py-1 rounded text-[11px] ${i < 5 ? 'bg-accent-dim text-accent border border-accent/20' : 'bg-surface2 text-text-3 border border-border'}`}>
                            {d}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-[12px] text-text-3 py-2">Este miembro aún no tiene plan asignado.</div>
                  )}
                </div>

                <div className="px-[18px] py-3.5 flex flex-col gap-2">
                  {m.plan ? (
                    <button className="w-full py-2.5 rounded text-[12px] font-medium cursor-pointer font-inherit border border-accent bg-accent text-black flex items-center justify-center gap-1.5">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Editar plan
                    </button>
                  ) : (
                    <button onClick={() => { setPlanModalOpen(true); setPMemberId(m.id); }}
                      className="w-full py-2.5 rounded text-[12px] font-medium cursor-pointer font-inherit border border-accent bg-accent text-black flex items-center justify-center gap-1.5">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Crear plan para {m.name.split(' ')[0]}
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {m.phone && (
                      <a href={`tel:${m.phone}`}
                        className="py-2 rounded text-[11px] font-medium cursor-pointer font-inherit border border-border text-text-2 bg-transparent flex items-center justify-center gap-1.5 hover:bg-surface2 transition-colors no-underline">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        Llamar
                      </a>
                    )}
                    <a href={`mailto:${m.email}`}
                      className="py-2 rounded text-[11px] font-medium cursor-pointer font-inherit border border-border text-text-2 bg-transparent flex items-center justify-center gap-1.5 hover:bg-surface2 transition-colors no-underline">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      Email
                    </a>
                  </div>

                  <button onClick={() => navigate(`/trainer/members`)}
                    className="w-full py-2 rounded text-[11px] font-medium cursor-pointer font-inherit border border-dashed border-border text-text-3 bg-transparent flex items-center justify-center gap-1.5 hover:bg-surface2 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    Ver perfil completo
                  </button>

                </div>
              </>
            )}
          </div>
        </div>

        </>)}
        <Modal open={planModalOpen} onClose={() => setPlanModalOpen(false)} title="Nuevo plan de entrenamiento" className="max-w-[400px]" icon={<IconPlus width="16" height="16" />}>
          <Input label="Nombre del plan *" value={pName} onChange={e => setPName(e.target.value)} placeholder="Ej. Fuerza C — Avanzado" />
          <Input label="Descripción" value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Objetivo, observaciones…" />
          <Select label="Asignar a miembro" value={pMemberId} onChange={e => setPMemberId(e.target.value)}>
            <option value="">— Guardar como plantilla —</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="ghost" size="sm" onClick={() => setPlanModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={guardarPlan}>Crear plan</Button>
          </div>
        </Modal>

      </div>
    </>
  );
}
