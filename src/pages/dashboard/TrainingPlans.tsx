import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainingService, type PlanListItem, type PlanExercise } from '@/services/training.service';
import { membersService, type MemberListItem } from '@/services/members.service';
import { membershipsService, type Membership, type MembershipType } from '@/services/memberships.service';
import { Button } from '@/components/ui/atoms/Button';
import { Chip } from '@/components/ui/atoms/Chip';
import { Badge } from '@/components/ui/atoms/Badge';
import { MetricCard } from '@/components/ui/atoms/MetricCard';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { SearchInput } from '@/components/ui/molecules/SearchInput';
import { TabBar } from '@/components/ui/molecules/TabBar';
import { RoutineBuilder, type EditPlanData } from '@/components/routine-builder/RoutineBuilder';
import { Modal } from '@/components/ui/molecules/Modal';
import { IconAlert } from '@/lib/icons';
import { toast } from 'sonner';
import { initials, fmtDate, AVATAR_COLORS } from '@/lib/helpers';

const DAY_NAMES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

function groupByDay(exercises: PlanExercise[]): Record<number, PlanExercise[] | null> {
  const grouped: Record<number, PlanExercise[]> = {};
  for (const ex of exercises) {
    const d = ex.day ?? 0;
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(ex);
  }
  const result: Record<number, PlanExercise[] | null> = {};
  for (let i = 0; i < 7; i++) {
    result[i] = grouped[i] || null;
  }
  return result;
}

interface PlanMember {
  id: string;
  name: string;
  initials: string;
}

interface Plan {
  id: string;
  name: string;
  desc: string;
  type: 'assigned' | 'draft';
  trainer: string;
  members: PlanMember[];
  avClass: string;
  days: number;
  exerciseCount: number;
  exercises: Record<number, PlanExercise[] | null>;
}

const AV_COLORS = [
  { bg: 'rgba(59,130,246,0.2)', fg: '#60a5fa' },
  { bg: 'rgba(16,185,129,0.2)', fg: '#34d399' },
  { bg: 'rgba(168,85,247,0.2)', fg: '#c084fc' },
  { bg: 'rgba(20,184,166,0.2)', fg: '#2dd4bf' },
  { bg: 'rgba(244,114,182,0.2)', fg: '#f472b6' },
  { bg: 'rgba(251,146,60,0.2)', fg: '#fb923c' },
];

function avatarIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % AV_COLORS.length;
}

function typeBadge(type: string) {
  if (type === 'assigned') return { label: 'Asignado', cls: 'bg-green-bg text-green-text' };
  return { label: 'Sin asignar', cls: 'bg-surface3 text-text-3 border border-border' };
}

const FILTER_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'assigned', label: 'Asignados' },
  { key: 'draft', label: 'Sin asignar' },
];

export default function TrainingPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderEditPlan, setBuilderEditPlan] = useState<EditPlanData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [assigneeOpen, setAssigneeOpen] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [membersList, setMembersList] = useState<MemberListItem[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [previewMember, setPreviewMember] = useState<MemberListItem | null>(null);
  const [previewMembership, setPreviewMembership] = useState<(Membership & { membership_types: MembershipType }) | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const navigate = useNavigate();

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trainingService.getAll({ pageSize: 100 });
      const mapped: Plan[] = result.data.map((p: PlanListItem) => ({
        id: p.id,
        name: p.name,
        desc: p.description ?? '',
        type: p.type,
        trainer: p.trainer_name,
        members: p.member_names.map((n: string) => {
          const initials = n.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
          return { id: '', name: n, initials };
        }),
        avClass: `av-${avatarIndex(p.id)}`,
        days: p.days || 5,
        exerciseCount: p.exercise_count,
        exercises: {},
      }));
      setPlans(mapped);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const selectedPlan = plans.find(p => p.id === selectedId) || null;

  const loadDetail = useCallback(async (planId: string) => {
    setDetailLoading(true);
    try {
      const data = await trainingService.getById(planId);
      setDetailLoading(false);
      setPlans(prev => prev.map(p => {
        if (p.id !== planId) return p;
        const exMap = groupByDay(data.exercises || []);
        const days = Object.entries(exMap).filter(([, v]) => v !== null).length;
        return {
          ...p,
          exercises: exMap,
          days,
          members: (data.assignees || []).map((a: any) => ({
            id: a.id,
            name: a.full_name,
            initials: a.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase(),
          })),
        };
      }));
    } catch {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const exercises = selectedPlan?.exercises[selectedDay] ?? null;

  const filteredPlans = plans.filter(p => {
    if (filter === 'assigned') return p.type === 'assigned';
    if (filter === 'draft') return p.type === 'draft';
    return true;
  }).filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.members.some(m => m.name.toLowerCase().includes(q));
  });

  const metrics = {
    total: plans.length,
    assigned: plans.filter(p => p.type === 'assigned').length,

  };

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await trainingService.delete(deleteTarget.id);
      setDeleteTarget(null);
      setSelectedId(null);
      fetchPlans();
      toast.success('Plan eliminado');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleDuplicate(planId: string) {
    try {
      const newId = await trainingService.duplicate(planId);
      await fetchPlans();
      setSelectedId(newId);
      setSelectedDay(0);
      toast.success('Plan duplicado');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleRemoveMember(planId: string, memberId: string) {
    try {
      await trainingService.removeAssignment(planId, memberId);
      await fetchPlans();
      if (selectedId === planId) loadDetail(planId);
      toast.success('Miembro removido del plan');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function showMemberInfo(member: PlanMember) {
    setPreviewLoading(true);
    setPreviewMember(null);
    setPreviewMembership(null);
    try {
      const [profile, activeMs] = await Promise.all([
        membersService.getById(member.id),
        membershipsService.getActiveWithType(member.id),
      ]);
      setPreviewMember(profile);
      setPreviewMembership(activeMs);
    } catch {
      toast.error('Error al cargar información del miembro');
    } finally {
      setPreviewLoading(false);
    }
  }

  async function openAssignModal() {
    if (!selectedPlan) return;
    try {
      const [result, assignees] = await Promise.all([
        membersService.getAll({ pageSize: 200, role: 'member' }),
        trainingService.getAssignees(selectedPlan.id),
      ]);
      const assignedIds = new Set(assignees.map(a => a.id));
      setMembersList(result.data.filter(m => !assignedIds.has(m.id)));
      setSelectedMemberIds([]);
      setAssignModalOpen(true);
    } catch (e: any) {
      toast.error('Error al cargar miembros: ' + e.message);
    }
  }

  function toggleMemberSelection(memberId: string) {
    setSelectedMemberIds(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  }

  async function handleAssignMultiple() {
    if (!selectedPlan || selectedMemberIds.length === 0) return;
    setAssigning(true);
    try {
      await trainingService.assignMultiple(selectedPlan.id, selectedMemberIds);
      setAssignModalOpen(false);
      await fetchPlans();
      loadDetail(selectedPlan.id);
      toast.success(`Plan asignado a ${selectedMemberIds.length} miembro${selectedMemberIds.length !== 1 ? 's' : ''}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAssigning(false);
    }
  }

  function openNewPlan() {
    setBuilderEditPlan(null);
    setBuilderOpen(true);
  }

  async function openEditPlan(planId: string) {
    try {
      const data = await trainingService.getById(planId);
      setBuilderEditPlan({
        id: data.id,
        name: data.name,
        description: data.description,
        exercises: data.exercises,
      });
      setBuilderOpen(true);
    } catch (e: any) {
      alert('Error al cargar plan: ' + e.message);
    }
  }

  async function onBuilderSave(planId?: string) {
    await fetchPlans();
    if (planId) {
      setSelectedId(planId);
      setSelectedDay(0);
    } else if (selectedId) {
      loadDetail(selectedId);
    }
  }

  return (
    <>
      <div className="noise-overlay" />
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-surface2 sticky top-0 z-9">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
          <div className="w-4 h-4 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full" width="16" height="16"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span className="text-text-4 mx-0.5">/</span>
          <span className="font-medium text-text-1">Planes de Entrenamiento</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button variant="primary" size="sm" onClick={openNewPlan}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo plan
          </Button>
        </div>
      </header>

      <div className="p-4 sm:p-7 flex-1">
        <div className="relative mb-7 overflow-hidden rounded-xl bg-gradient-to-br from-surface to-surface2 border border-border p-5 sm:p-7">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ background: 'radial-gradient(600px circle at 20% 30%, var(--accent), transparent)' }} />
          <div className="relative">
            <PageHeader title="Planes de Entrenamiento" description="Crea, edita y asigna rutinas a los miembros del gym" />
          </div>
        </div>

        {loading && <div className="text-center py-[60px] text-text-3">Cargando planes…</div>}
        {!loading && error && <div className="text-center py-[60px] text-red-text">Error: {error}</div>}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-2">
              <div className="animate-slide-up stagger-1">
                <MetricCard color="accent" label="Total de planes" value={metrics.total} sub="Creados en el sistema" />
              </div>
              <div className="animate-slide-up stagger-2">
                <MetricCard color="green" label="Planes asignados" value={metrics.assigned} sub="Con miembro activo" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
              <SearchInput value={search} onChange={setSearch} placeholder="Buscar plan o miembro…" />
              <TabBar tabs={FILTER_TABS} active={filter} onChange={setFilter} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 min-h-[500px]">
              {/* Left panel */}
              <div className="bg-surface border border-border rounded overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  {filteredPlans.length === 0 ? (
                    <div className="py-10 text-center text-[13px] text-text-3">Sin resultados</div>
                  ) : (
                    filteredPlans.map(p => {
                      const badge = typeBadge(p.type);
                      const exCount = p.exerciseCount;
                      const isSel = selectedPlan?.id === p.id;
                      return (
                        <div key={p.id} onClick={() => { setSelectedId(p.id); setSelectedDay(0); }}
                          className={`px-4 py-3.5 border-b border-border cursor-pointer transition-colors duration-100 flex flex-col gap-2 ${
                            isSel ? 'bg-accent-dim border-l-2 border-l-accent' : 'bg-transparent border-l-2 border-l-transparent hover:bg-surface2'
                          }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-[13px] font-semibold">{p.name}</div>
                              <div className="text-[11px] text-text-3 mt-0.5">
                                {p.members.length > 0
                                  ? `→ ${p.members.slice(0, 2).map(m => m.name).join(', ')}${p.members.length > 2 ? ` +${p.members.length - 2}` : ''}`
                                  : p.trainer}
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[10px] font-medium whitespace-nowrap shrink-0 ${badge.cls}`}>{badge.label}</span>
                          </div>
                          <div className="flex items-center gap-[10px]">
                            <ChipSm icon="check" text={`${exCount} ejercicios`} />
                            <ChipSm icon="calendar" text={`${p.days} días / semana`} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right detail panel */}
              <div className="bg-surface border border-border rounded overflow-hidden flex flex-col">
                {!selectedPlan ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-center p-10">
                    <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22" className="text-text-3"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    </div>
                    <div className="text-base font-semibold">Selecciona un plan</div>
                    <div className="text-[13px] text-text-3 max-w-[260px] leading-[1.5]">Haz clic en cualquier plan de la lista para ver sus ejercicios y detalles.</div>
                  </div>
                ) : detailLoading ? (
                  <div className="flex items-center justify-center h-full min-h-[300px] text-text-3 text-[13px]">Cargando detalles…</div>
                ) : (
                  <>
                    <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-lg font-semibold tracking-tight">{selectedPlan.name}</div>
                        <div className="text-xs text-text-3 mt-1">{selectedPlan.desc}</div>
                        <div className="flex gap-1.5 mt-[10px] flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[10px] font-medium ${typeBadge(selectedPlan.type).cls}`}>
                            {typeBadge(selectedPlan.type).label}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[10px] font-medium bg-surface2 text-text-3 border border-border">
                            Por {selectedPlan.trainer}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <IconBtn title="Duplicar" onClick={() => handleDuplicate(selectedPlan.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        </IconBtn>
                        <IconBtn title="Editar" onClick={() => openEditPlan(selectedPlan.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </IconBtn>
                        <IconBtn title="Eliminar" danger onClick={() => setDeleteTarget(selectedPlan)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </IconBtn>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-b border-border bg-[var(--surface2)] relative">
                      <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '120px 120px' }} />
                      <div className="relative">
                        <div className="flex items-center justify-between cursor-pointer select-none"
                          onClick={() => setAssigneeOpen(!assigneeOpen)}>
                          <div className="flex items-center gap-2">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            <span className="text-[11px] font-semibold text-text-3 uppercase tracking-[0.08em]">
                              Asignados
                            </span>
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold leading-none">
                              {selectedPlan.members.length}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="group flex items-center gap-1.5 text-[11px] font-semibold text-accent bg-accent-dim border border-accent/20 px-3 py-1.5 rounded-[var(--radius-sm)] cursor-pointer transition-all duration-200 hover:bg-accent hover:text-black hover:shadow-[0_0_20px_-4px_var(--accent)] active:scale-[0.97]"
                              onClick={e => { e.stopPropagation(); openAssignModal(); }}>
                              <svg className="transition-transform duration-200 group-hover:rotate-90" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              Asignar
                            </button>
                            <svg className={`transition-transform duration-200 ${assigneeOpen ? 'rotate-180' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"/>
                            </svg>
                          </div>
                        </div>
                        <div className={`overflow-hidden transition-all duration-200 ${assigneeOpen ? 'max-h-[600px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                          {selectedPlan.members.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {selectedPlan.members.map((m, idx) => (
                                <div key={m.id || idx}
                                  className="group flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] bg-surface border border-border transition-all duration-150 hover:border-accent/20 hover:shadow-[0_0_12px_-6px_var(--accent)]">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ring-1 ring-white/5"
                                      style={{ background: AV_COLORS[avatarIndex(m.id || String(idx))].bg, color: AV_COLORS[avatarIndex(m.id || String(idx))].fg }}>
                                      {m.initials}
                                    </div>
                                    <div className="text-[13px] font-medium text-text truncate">{m.name}</div>
                                  </div>
                                  <div className="flex items-center gap-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-150">
                                    <button
                                      className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center text-text-3 hover:text-accent hover:bg-accent-dim border border-transparent cursor-pointer transition-all duration-150"
                                      title="Ver miembro"
                                      onClick={() => showMemberInfo(m)}>
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    </button>
                                    <button
                                      className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center text-text-3 hover:text-red-text hover:bg-red-bg/20 border border-transparent cursor-pointer transition-all duration-150"
                                      title="Quitar"
                                      onClick={() => m.id && handleRemoveMember(selectedPlan.id, m.id)}>
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-7 gap-2 border border-dashed border-border rounded-[var(--radius-sm)] bg-surface/50">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                              <div className="text-[12px] text-text-4 font-medium">Aún no hay miembros asignados</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1.5 px-6 py-3.5 border-b border-border overflow-x-auto">
                      {DAY_NAMES.map((d, i) => {
                        const exs = selectedPlan.exercises[i];
                        const isRest = exs === null;
                        return (
                          <button key={d} onClick={() => setSelectedDay(i)}
                            className={`shrink-0 px-3.5 py-[7px] rounded-[var(--radius-sm)] text-xs font-medium cursor-pointer font-sans transition-all duration-150 ${
                              selectedDay === i
                                ? 'bg-accent text-black border border-accent'
                                : isRest
                                  ? 'bg-transparent text-text-3 border border-border'
                                  : 'bg-transparent text-text-2 border border-border hover:bg-surface2 hover:text-text'
                            }`}>
                            {d}{!isRest && exs ? <span className="ml-1 text-[10px] opacity-70">({exs.length})</span> : ''}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {exercises === null ? (
                        <div className="flex flex-col items-center justify-center py-[60px] gap-[10px] text-center">
                          <div className="text-3xl">🧘</div>
                          <div className="text-sm font-semibold">Día de descanso</div>
                          <div className="text-xs text-text-3">Sin ejercicios programados. El descanso es parte del entrenamiento.</div>
                        </div>
                      ) : exercises && exercises.length > 0 ? (
                        <>
                          <div className="px-6 py-3 border-b border-border bg-surface2">
                            <span className="text-[11px] text-text-3 uppercase tracking-[0.06em]">
                              {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            {exercises.map((e: PlanExercise, i: number) => (
                              <div key={e.id} className={`flex items-start gap-[14px] px-6 py-3.5 transition-colors duration-100 ${i < exercises.length - 1 ? 'border-b border-border' : ''}`}>
                                <div className="mt-1 text-text-3 flex flex-col gap-[3px] shrink-0">
                                  {[0,1,2].map(j => <span key={j} className="block w-3 h-[1.5px] bg-current rounded-sm" />)}
                                </div>
                                <div className="w-6 h-6 mt-1 rounded-full bg-surface3 border border-border2 flex items-center justify-center text-[10px] font-semibold text-text-3 shrink-0">{i + 1}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[13px] font-medium">{e.exercise_name}</div>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    {e.muscle && <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-medium bg-purple-bg text-purple-text">{e.muscle}</span>}
                                    {e.reference_link && (
                                      <a href={e.reference_link} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[10px] font-medium bg-blue-bg text-blue-text hover:underline"
                                        onClick={e => e.stopPropagation()}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                        Video
                                      </a>
                                    )}
                                  </div>
                                  {e.notes && <div className="text-[11px] text-text-3 mt-1.5 italic leading-relaxed">{e.notes}</div>}
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                  <Chip value={e.sets ?? 0} label="Series" accent />
                                  <Chip value={e.reps ?? 0} label="Reps" />
                                  <Chip value={`${e.rest_seconds ?? 0}s`} label="Descanso" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-[60px] gap-[10px] text-center">
                          <div className="text-xs text-text-3">Sin ejercicios en este día</div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Asignar plan" compact>
        <div className="flex flex-col gap-3">
          <div className="text-[12px] text-text-3">Selecciona los miembros para asignar este plan:</div>
          <div className="flex flex-col max-h-[260px] overflow-y-auto -mx-6">
            {membersList.length === 0 ? (
              <div className="px-6 text-[12px] text-text-3">No hay miembros disponibles</div>
            ) : (
              membersList.map(m => {
                const isSelected = selectedMemberIds.includes(m.id);
                return (
                  <div key={m.id} onClick={() => toggleMemberSelection(m.id)}
                    className={`flex items-center gap-3 px-6 py-2.5 cursor-pointer transition-colors border-b border-border last:border-0 ${
                      isSelected ? 'bg-accent-dim' : 'hover:bg-surface2'
                    }`}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-accent border-accent' : 'border-border2 bg-transparent'
                    }`}>
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-accent-dim text-accent flex items-center justify-center text-[10px] font-semibold shrink-0">
                      {m.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-[13px]">{m.full_name}</div>
                      {m.email && <div className="text-[11px] text-text-3">{m.email}</div>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setAssignModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleAssignMultiple} disabled={selectedMemberIds.length === 0 || assigning}>
              {assigning ? 'Asignando…' : `Asignar (${selectedMemberIds.length})`}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={previewMember !== null} onClose={() => { setPreviewMember(null); setPreviewMembership(null); }} title="Miembro" compact>
        {previewLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : previewMember ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-3.5 pb-5 border-b border-border">
              <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-[18px] font-bold shrink-0 ring-1 ring-white/[0.08]"
                style={{ background: AVATAR_COLORS[avatarIndex(previewMember.id)].bg, color: AVATAR_COLORS[avatarIndex(previewMember.id)].fg }}>
                {initials(previewMember.full_name)}
              </div>
              <div>
                <div className="text-[15px] font-semibold">{previewMember.full_name}</div>
                {previewMember.role === 'admin' ? <Badge variant="accent" dot>Admin</Badge> : previewMember.role === 'trainer' ? <Badge variant="blue" dot>Entrenador</Badge> : <Badge variant="gray" dot>Miembro</Badge>}
              </div>
            </div>

            <div className="pt-4 pb-3">
              <div className="text-[11px] font-semibold text-text-3 uppercase tracking-[0.06em] mb-3">Membresía actual</div>
              {previewMembership ? (
                <div className="flex flex-col gap-2.5">
                  <Row label="Plan" value={previewMembership.membership_types.name} />
                  <Row label="Inicio" value={fmtDate(previewMembership.start_date)} />
                  <Row label="Vencimiento" value={fmtDate(previewMembership.end_date)} />
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-text-3">Estado</span>
                    {previewMembership.status === 'active' ? <Badge variant="green" dot>Activa</Badge> : previewMembership.status === 'expired' ? <Badge variant="red" dot>Vencida</Badge> : <Badge variant="amber" dot>Cancelada</Badge>}
                  </div>
                </div>
              ) : (
                <div className="text-[12px] text-text-3">Sin membresía activa</div>
              )}
            </div>

            <div className="pt-3 border-t border-border">
              <button onClick={() => { setPreviewMember(null); setPreviewMembership(null); navigate(`/members/${previewMember.id}`); }}
                className="w-full flex items-center justify-center gap-2 text-[12px] font-semibold text-accent bg-accent-dim border border-accent/20 px-4 py-2.5 rounded-[var(--radius-sm)] cursor-pointer transition-all duration-200 hover:bg-accent hover:text-black active:scale-[0.98]">
                Ir a perfil completo
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Eliminar plan" compact icon={<IconAlert width="16" height="16" />}>
        <div className="flex flex-col gap-4">
          <div className="text-[13px] text-text-1 leading-relaxed">
            ¿Estás seguro de eliminar el plan <strong>{deleteTarget?.name}</strong>?
          </div>
          <div className="text-[12px] text-text-3 bg-red-bg/10 border border-red/20 rounded-sm p-3 leading-relaxed">
            Se eliminarán todos los ejercicios asociados. Esta acción no se puede deshacer.
          </div>
        </div>
        <div className="flex justify-end gap-2.5 mt-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
        </div>
      </Modal>

      <RoutineBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onSave={onBuilderSave}
        editPlan={builderEditPlan}
      />
    </>
  );
}

function ChipSm({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-1 text-[11px] text-text-3">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
        {icon === 'check' ? <path d="M9 11l3 3L22 4"/> : <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
      </svg>
      {text}
    </div>
  );
}

function IconBtn({ children, title, danger, onClick }: { children: React.ReactNode; title: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button title={title} onClick={onClick}
      className={`w-10 sm:w-7 h-10 sm:h-7 rounded-[var(--radius-sm)] bg-transparent border border-border flex items-center justify-center cursor-pointer transition-all duration-150 ${
        danger ? 'text-red-text hover:bg-red-bg hover:border-[rgba(239,68,68,0.3)]' : 'text-text-3 hover:bg-surface2 hover:text-text hover:border-border2'
      }`}>
      {children}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-text-3">{label}</span>
      <span className="text-[12px] font-medium text-text">{value}</span>
    </div>
  );
}
