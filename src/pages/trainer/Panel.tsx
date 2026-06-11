import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { membersService, type MemberListItem } from '@/services/members.service';
import { trainingService, type PlanListItem } from '@/services/training.service';
import { membershipsService } from '@/services/memberships.service';
import { MetricCard } from '@/components/ui/atoms/MetricCard';
import { Button } from '@/components/ui/atoms/Button';
import { Input, Select } from '@/components/ui/atoms/Input';
import { Modal } from '@/components/ui/molecules/Modal';
import { IconPlus, IconEdit } from '@/lib/icons';
import { dashboardService, type RecentActivityItem, type DashboardKPIs } from '@/services/dashboard.service';

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
function IconCheck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>; }
function IconPlusMember() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>; }
function IconTemplate() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>; }
function IconCreditCard() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>; }

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function fmtDateShort(s: string) {
  const [y, mo, d] = s.split('-');
  return `${parseInt(d)} ${MONTHS[parseInt(mo) - 1]} ${y}`;
}

function todayStr() {
  const n = new Date();
  return `${n.getDate()} ${MONTHS[n.getMonth()]} ${n.getFullYear()}`;
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

interface NoteItem {
  member: string;
  avC: number;
  av: string;
  text: string;
  time: string;
}

interface PanelMember {
  id: string;
  name: string;
  email: string;
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
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [members, setMembers] = useState<PanelMember[]>([]);
  const [plans, setPlans] = useState<PanelPlan[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pMemberId, setPMemberId] = useState('');
  const [nMember, setNMember] = useState('');
  const [nText, setNText] = useState('');

  useEffect(() => {
    const ctrl = { ignore: false };
    (async () => {
      try {
        const [kpiData, membersData, plansData, exp, acts] = await Promise.all([
          dashboardService.getKPIs(),
          membersService.getAll({ role: 'member', pageSize: 200 }),
          trainingService.getAll({ pageSize: 200 }),
          membershipsService.getExpiring(7),
          dashboardService.getRecentActivity(10),
        ]);

        if (ctrl.ignore) return;
        setKpis(kpiData);
        setMembers(membersData.data.map((m: MemberListItem) => ({
          id: m.id,
          name: m.full_name,
          email: m.email || '',
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
        setActivities(acts);
      } catch (err) {
        if (!ctrl.ignore) console.error('Error loading panel data:', err);
      } finally {
        if (!ctrl.ignore) setLoading(false);
      }
    })();
    return () => { ctrl.ignore = true; };
  }, []);

  const m = selectedIdx !== null ? members[selectedIdx] : null;
  const withPlanCount = members.filter(mem => mem.plan).length;
  const planCount = plans.length;
  const membersWithoutPlan = members.filter(mem => !mem.plan);

  function selectMember(i: number) {
    setSelectedIdx(prev => prev === i ? null : i);
  }

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
          ? [members.find(m => m.id === pMemberId)?.name || 'Miembro']
          : [],
        days: 5,
      }]);
      setPlanModalOpen(false);
      setPName(''); setPDesc(''); setPMemberId('');
    } catch (err) {
      console.error('Error creating plan:', err);
    }
  }

  function guardarNota() {
    if (!nText.trim()) return;
    const member = members.find(x => x.name === nMember);
    setNotes([{
      member: nMember,
      avC: member?.avC ?? 0,
      av: member?.av ?? '??',
      text: nText.trim(),
      time: 'Ahora',
    }, ...notes]);
    setNoteModalOpen(false);
    setNText('');
  }

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

  const planIcons = [
    '<path d="M9 11l3 3L22 4"/>',
    '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>',
  ];

  const iconColors: Record<string, {bg: string; fg: string}> = {
    'pi-purple': { bg: 'rgba(168,85,247,0.1)', fg: '#c084fc' },
    'pi-blue': { bg: 'rgba(59,130,246,0.1)', fg: '#60a5fa' },
    'pi-green': { bg: 'rgba(34,197,94,0.1)', fg: '#4ade80' },
    'pi-pink': { bg: 'rgba(236,72,153,0.1)', fg: '#f472b6' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-text-3 text-sm">
        Cargando panel…
      </div>
    );
  }

  return (
    <>
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-surface2 sticky top-0 z-9">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
          <div className="w-4 h-4 shrink-0 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full" width="16" height="16"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
          <span className="text-text-4 mx-0.5">/</span>
          <span className="font-medium text-text-1">Mi panel</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button variant="ghost" size="sm" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>} onClick={() => setNoteModalOpen(true)}>
            Nueva nota
          </Button>
          <Button variant="ghost" size="sm" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>} onClick={() => setPlanModalOpen(true)}>
            Nuevo plan
          </Button>
        </div>
      </header>

      <div className="p-2.5 sm:p-4 md:p-7 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[20px] sm:text-[22px] font-semibold -tracking-[0.02em]">
              Buenos días, {user?.full_name?.split(' ')[0] || 'Entrenador'} 👋
            </h1>
            <p className="text-[12px] sm:text-[13px] text-text-2 mt-1">
              Resumen de tus miembros y membresías — {todayStr()}.
            </p>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-3 mb-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={<IconPeople />} color="blue" value={kpis?.total_members ?? 0} label="Total miembros" delta="Registrados" deltaType="up" />
          <MetricCard icon={<IconCard />} color="green" value={kpis?.active_memberships ?? 0} label="Membresías activas" delta="Vigentes" deltaType="up" />
          <MetricCard icon={<IconTemplate />} color="accent" value={planCount} label="Planes activos" delta={withPlanCount > 0 ? `${members.length - withPlanCount} sin plan` : 'Sin planes'} deltaType={withPlanCount > 0 ? 'neutral' : 'down'} />
          <MetricCard icon={<IconClock />} color="amber" value={kpis?.expiring_soon ?? 0} label="Vencen en 7 días" delta="Atención" deltaType="down" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-border">
              <div>
                <div className="text-[13px] font-semibold">Miembros sin plan</div>
                <div className="text-[11px] text-text-3 mt-0.5 hidden sm:block">Requieren asignación</div>
              </div>
              <span className="text-[11px] font-medium px-[9px] py-[3px] rounded-full bg-amber-bg text-amber-text">{membersWithoutPlan.length}</span>
            </div>
            <div className="flex flex-col">
              {membersWithoutPlan.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-[12px] text-text-3">Todos los miembros tienen plan asignado</div>
              ) : (
                membersWithoutPlan.slice(0, 5).map((mem) => {
                  const c = AV_COLORS[mem.avC];
                  return (
                    <div key={mem.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                        style={{ background: c.bg, color: c.fg }}>
                        {mem.av}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate">{mem.name}</div>
                        <div className="text-[11px] text-text-3 mt-0.5 truncate">{mem.email}</div>
                      </div>
                      <span className="text-[10px] font-medium px-[9px] py-[3px] rounded-full bg-red-bg text-red-text whitespace-nowrap">Sin plan</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-border">
              <div>
                <div className="text-[13px] font-semibold">Membresías por vencer</div>
                <div className="text-[11px] text-text-3 mt-0.5">Próximos 7 días</div>
              </div>
            </div>
            <div className="flex flex-col">
              {expiring.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-[12px] text-text-3">Sin membresías por vencer</div>
              ) : (
                expiring.slice(0, 5).map((e) => {
                  const av = AV_COLORS[e.member_name.length % AV_COLORS.length];
                  const inits = e.member_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
                  const ev = e.days_remaining === 0 ? 'Hoy' : e.days_remaining === 1 ? '1 día' : `${e.days_remaining} días`;
                  const isUrgent = e.days_remaining <= 1;
                  return (
                    <div key={e.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border">
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

          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-border">
              <div className="text-[13px] font-semibold">Actividad reciente</div>
              <div className="text-[11px] text-text-3 mt-0.5 hidden sm:block">Últimos check-ins y altas</div>
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
                        <div className="text-[12px] text-text-2 leading-relaxed">
                          <span className="font-semibold text-text-1">{a.userName}</span>
                          {' '}{a.action}
                        </div>
                        <div className="text-[10px] text-text-3 mt-[3px]">{timeAgo(a.timestamp)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-5 lg:grid-cols-[1fr_340px]">
          <div className="bg-surface border border-border rounded overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div>
                <div className="text-[13px] font-semibold">Miembros</div>
                <div className="text-[11px] text-text-3 mt-0.5">Contacta al admin para hacer cambios</div>
              </div>
              <span className="text-[11px] text-text-3">{members.length} miembros</span>
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
                  {members.map((mem, i) => {
                    const isSel = selectedIdx === i;
                    const c = AV_COLORS[mem.avC];
                    return (
                      <tr key={mem.id} onClick={() => selectMember(i)}
                        className="cursor-pointer transition-colors duration-100"
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
                          <button className="w-7 h-7 flex items-center justify-center rounded border border-border text-text-3 bg-transparent cursor-pointer"
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
          </div>

          <div className="bg-surface border border-border rounded overflow-hidden">
            {!m ? (
              <div className="flex flex-col items-center justify-center text-center p-8 gap-2.5 min-h-[300px]">
                <div className="w-11 h-11 rounded-full bg-surface2 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20" style={{ color: 'var(--text-3)' }}>
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
                  <div className="text-[12px] text-text-3">{m.email}</div>
                  <div>
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
                  <button onClick={() => setNoteModalOpen(true)}
                    className="w-full py-2.5 rounded text-[12px] font-medium cursor-pointer font-inherit border border-border2 bg-transparent text-text-2 flex items-center justify-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 16.5-3.5z"/>
                    </svg>
                    Agregar nota de seguimiento
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border rounded overflow-hidden mb-5">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div>
              <div className="text-[13px] font-semibold">Planes de entrenamiento</div>
              <div className="text-[11px] text-text-3 mt-0.5">Planes registrados en el sistema</div>
            </div>
            <button onClick={() => setPlanModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium cursor-pointer font-inherit bg-accent text-black border-none">
              + Nuevo
            </button>
          </div>
          {plans.length === 0 ? (
            <div className="text-center py-10 text-text-3 text-[13px]">No hay planes registrados aún.</div>
          ) : (
            plans.map((p, i) => {
              const iconKey = ['pi-purple', 'pi-blue', 'pi-green', 'pi-pink'][i % 4];
              const ic = iconColors[iconKey] || iconColors['pi-purple'];
              return (
                <div key={p.id} className="flex items-center gap-3 px-[18px] py-3 transition-colors cursor-pointer"
                  style={{ borderBottom: i < plans.length - 1 ? '1px solid var(--border)' : undefined }}>
                  <div className="w-[34px] h-[34px] rounded flex items-center justify-center shrink-0"
                    style={{ background: ic.bg, color: ic.fg }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"
                      dangerouslySetInnerHTML={{ __html: planIcons[i % 3] }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium">{p.name}</div>
                    <div className="text-[11px] text-text-3 mt-0.5">{p.days} días/semana · {p.members.join(', ') || 'Sin asignar'}</div>
                  </div>
                  <span className="text-[11px] font-mono text-text-3">
                    {p.members.length} miembro{p.members.length !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-surface border border-border rounded overflow-hidden mb-5">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div>
              <div className="text-[13px] font-semibold">Notas de seguimiento</div>
              <div className="text-[11px] text-text-3 mt-0.5">Observaciones sobre el progreso de tus miembros</div>
            </div>
            <button onClick={() => setNoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium cursor-pointer font-inherit bg-transparent text-text-2 border border-border2">
              + Nota
            </button>
          </div>
          {notes.length === 0 ? (
            <div className="text-center py-10 text-text-3 text-[13px]">Aún no hay notas de seguimiento. Crea una para comenzar.</div>
          ) : (
            notes.map((n, i) => {
              const c = AV_COLORS[n.avC];
              return (
                <div key={i} className="flex items-start gap-2.5 px-[18px] py-3"
                  style={{ borderBottom: i < notes.length - 1 ? '1px solid var(--border)' : undefined }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5"
                    style={{ background: c.bg, color: c.fg }}>
                    {n.av}
                  </div>
                  <div className="flex-1">
                    <div className="text-[12px] font-medium">{n.member}</div>
                    <div className="text-[12px] text-text-2 mt-0.5 leading-relaxed">{n.text}</div>
                    <div className="text-[10px] text-text-3 mt-1 font-mono">{n.time}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

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

        <Modal open={noteModalOpen} onClose={() => setNoteModalOpen(false)} title="Nueva nota de seguimiento" className="max-w-[400px]" icon={<IconEdit width="16" height="16" />}>
          <Select label="Miembro" value={nMember} onChange={e => setNMember(e.target.value)}>
            <option value="">— Seleccionar —</option>
            {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </Select>
          <Input label="Nota *" value={nText} onChange={e => setNText(e.target.value)} placeholder="Ej. Mejoró técnica en sentadilla. Aumentar peso la próxima sesión." />
          <div className="flex justify-end gap-2.5 mt-2">
            <Button variant="ghost" size="sm" onClick={() => setNoteModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={guardarNota}>Guardar nota</Button>
          </div>
        </Modal>
      </div>
    </>
  );
}
