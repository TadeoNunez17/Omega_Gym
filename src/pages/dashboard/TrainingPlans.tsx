import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainingService, type PlanListItem, type PlanExercise } from '@/services/training.service';
import { membersService, type MemberListItem } from '@/services/members.service';
import { membershipsService, type Membership, type MembershipType } from '@/services/memberships.service';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { RoutineBuilder, type EditPlanData } from '@/components/routine-builder/RoutineBuilder';
import { Modal } from '@/components/ui/molecules/Modal';
import { IconAlert } from '@/lib/icons';
import { toast } from 'sonner';
import { initials, fmtDate, AVATAR_COLORS } from '@/lib/helpers';
import '@/styles/training-plans.css';

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

const AVATAR_CSS = ['tp-avatar-blue','tp-avatar-green','tp-avatar-purple','tp-avatar-pink','tp-avatar-amber','tp-avatar-teal'];

function avatarClass(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_CSS[hash % AVATAR_CSS.length];
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
          const ini = n.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
          return { id: '', name: n, initials: ini };
        }),
        avClass: avatarClass(p.id),
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

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

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
    } catch { setDetailLoading(false); }
  }, []);

  useEffect(() => { if (selectedId) loadDetail(selectedId); }, [selectedId, loadDetail]);

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

  const metrics = { total: plans.length, assigned: plans.filter(p => p.type === 'assigned').length };

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await trainingService.delete(deleteTarget.id);
      setDeleteTarget(null);
      setSelectedId(null);
      fetchPlans();
      toast.success('Plan eliminado');
    } catch (e: any) { toast.error(e.message); }
  }

  async function handleDuplicate(planId: string) {
    try {
      const newId = await trainingService.duplicate(planId);
      await fetchPlans();
      setSelectedId(newId);
      setSelectedDay(0);
      toast.success('Plan duplicado');
    } catch (e: any) { toast.error(e.message); }
  }

  async function handleRemoveMember(planId: string, memberId: string) {
    try {
      await trainingService.removeAssignment(planId, memberId);
      await fetchPlans();
      if (selectedId === planId) loadDetail(planId);
      toast.success('Miembro removido del plan');
    } catch (e: any) { toast.error(e.message); }
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
    } finally { setPreviewLoading(false); }
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
    } catch (e: any) { toast.error('Error al cargar miembros: ' + e.message); }
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
    } catch (e: any) { toast.error(e.message); } finally { setAssigning(false); }
  }

  function openNewPlan() { setBuilderEditPlan(null); setBuilderOpen(true); }

  async function openEditPlan(planId: string) {
    try {
      const data = await trainingService.getById(planId);
      setBuilderEditPlan({ id: data.id, name: data.name, description: data.description, exercises: data.exercises });
      setBuilderOpen(true);
    } catch (e: any) { alert('Error al cargar plan: ' + e.message); }
  }

  async function onBuilderSave(planId?: string) {
    await fetchPlans();
    if (planId) { setSelectedId(planId); setSelectedDay(0); }
    else if (selectedId) loadDetail(selectedId);
  }

  function weekBar(days: number, exMap: Record<number, PlanExercise[] | null>) {
    const heights = [8, 11, 6, 9, 7, 5, 4];
    return (
      <div className="tp-week-bar">
        {[0,1,2,3,4,5,6].map(d => (
          <span key={d} className={exMap[d] ? 'on' : ''} style={{ height: heights[d] }} />
        ))}
      </div>
    );
  }

  return (
    <>
      <header className="tp-header">
        <div className="tp-breadcrumb">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="tp-breadcrumb-sep">/</span>
          <span className="tp-breadcrumb-current">Planes de Entrenamiento</span>
        </div>
        <button className="tp-btn tp-btn-primary" onClick={openNewPlan}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo plan
        </button>
      </header>

      <div className="tp-page">
        {/* Hero */}
        <div className="tp-hero">
          <div>
            <div className="tp-hero-title">Planes de Entrenamiento</div>
            <div className="tp-hero-desc">Crea, edita y asigna rutinas a los miembros del gym</div>
          </div>
          <div className="tp-hero-stats">
            <div className="tp-hero-stat">
              <div className="tp-hero-stat-value">{metrics.total}</div>
              <div className="tp-hero-stat-label">Planes totales</div>
            </div>
            <div className="tp-hero-stat">
              <div className="tp-hero-stat-value tp-accent">{metrics.assigned}</div>
              <div className="tp-hero-stat-label">Asignados</div>
            </div>
          </div>
        </div>

        {loading && <div className="tp-loading">Cargando planes...</div>}
        {!loading && error && <div className="tp-loading" style={{ color: '#f28a8a' }}>Error: {error}</div>}
        {!loading && !error && (
          <>
            {/* Toolbar */}
            <div className="tp-toolbar">
              <input className="tp-search" type="text" placeholder="Buscar plan o miembro..." value={search} onChange={e => setSearch(e.target.value)} />
              <div className="tp-tabs">
                {FILTER_TABS.map(t => (
                  <button key={t.key} className={`tp-tab ${filter === t.key ? 'active' : ''}`} onClick={() => setFilter(t.key)}>{t.label}</button>
                ))}
              </div>
            </div>

            {/* Main grid */}
            <div className="tp-main-grid">
              {/* Left: Plan list */}
              <div className="tp-panel" style={{ overflowY: 'auto', maxHeight: 600 }}>
                {filteredPlans.length === 0 ? (
                  <div className="tp-empty"><div className="tp-empty-title">Sin resultados</div></div>
                ) : filteredPlans.map(p => {
                  const isSel = selectedPlan?.id === p.id;
                  const badgeCls = p.type === 'assigned' ? 'tp-badge-green' : 'tp-badge-gray';
                  const badgeLabel = p.type === 'assigned' ? 'Asignado' : 'Sin asignar';
                  return (
                    <div key={p.id} className={`tp-plan-item ${isSel ? 'selected' : ''}`}
                      onClick={() => { setSelectedId(p.id); setSelectedDay(0); }}>
                      <div className="tp-plan-top">
                        <div>
                          <div className="tp-plan-name">{p.name}</div>
                          <div className="tp-plan-meta">
                            {p.members.length > 0
                              ? `\u2192 ${p.members.slice(0, 2).map(m => m.name).join(', ')}${p.members.length > 2 ? ` +${p.members.length - 2}` : ''}`
                              : p.trainer}
                          </div>
                        </div>
                        <span className={`tp-badge ${badgeCls}`}>{badgeLabel}</span>
                      </div>
                      <div className="tp-plan-chips">
                        <div className="tp-chip-sm">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><path d="M9 11l3 3L22 4"/></svg>
                          {p.exerciseCount} ejercicios
                        </div>
                        <div className="tp-chip-sm">
                          {weekBar(p.days, p.exercises)}
                          {p.days} días
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right: Detail */}
              <div className="tp-panel">
                {!selectedPlan ? (
                  <div className="tp-empty" style={{ minHeight: 300 }}>
                    <div className="tp-empty-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    </div>
                    <div className="tp-empty-title">Selecciona un plan</div>
                    <div className="tp-empty-desc">Haz clic en cualquier plan de la lista para ver sus ejercicios y detalles.</div>
                  </div>
                ) : detailLoading ? (
                  <div className="tp-loading" style={{ minHeight: 300 }}>Cargando detalles...</div>
                ) : (
                  <>
                    {/* Detail header */}
                    <div className="tp-detail-header">
                      <div style={{ flex: 1 }}>
                        <div className="tp-detail-title">{selectedPlan.name}</div>
                        <div className="tp-detail-desc">{selectedPlan.desc}</div>
                        <div className="tp-detail-badges">
                          <span className={`tp-badge ${selectedPlan.type === 'assigned' ? 'tp-badge-green' : 'tp-badge-gray'}`}>
                            {selectedPlan.type === 'assigned' ? 'Asignado' : 'Sin asignar'}
                          </span>
                          <span className="tp-badge tp-badge-gray">Por {selectedPlan.trainer}</span>
                        </div>
                      </div>
                      <div className="tp-detail-actions">
                        <button className="tp-icon-btn" title="Duplicar" onClick={() => handleDuplicate(selectedPlan.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        </button>
                        <button className="tp-icon-btn" title="Editar" onClick={() => openEditPlan(selectedPlan.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="tp-icon-btn danger" title="Eliminar" onClick={() => setDeleteTarget(selectedPlan)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    </div>

                    {/* Assignees */}
                    <div className="tp-assignees">
                      <div className="tp-assignees-header" onClick={() => setAssigneeOpen(!assigneeOpen)}>
                        <div className="tp-assignees-label">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#e85d5d' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          Asignados
                          <span className="tp-assignees-count">{selectedPlan.members.length}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button className="tp-assign-btn" onClick={e => { e.stopPropagation(); openAssignModal(); }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Asignar
                          </button>
                          <svg className={`tp-collapse-arrow ${assigneeOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                      </div>
                      <div style={{ overflow: 'hidden', maxHeight: assigneeOpen ? 600 : 0, opacity: assigneeOpen ? 1 : 0, transition: 'all 0.2s', marginTop: assigneeOpen ? 12 : 0 }}>
                        {selectedPlan.members.length > 0 ? (
                          <div className="tp-assignee-list">
                            {selectedPlan.members.map((m, idx) => (
                              <div key={m.id || idx} className="tp-assignee-row">
                                <div className="tp-assignee-left">
                                  <div className={`tp-avatar ${avatarClass(m.id || String(idx))}`}>{m.initials}</div>
                                  <div className="tp-assignee-name">{m.name}</div>
                                </div>
                                <div className="tp-assignee-actions">
                                  <button className="tp-assignee-action" title="Ver miembro" onClick={() => showMemberInfo(m)}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                  </button>
                                  <button className="tp-assignee-action remove" title="Quitar" onClick={() => m.id && handleRemoveMember(selectedPlan.id, m.id)}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="tp-assignees-empty">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#5f5f6a' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            <div className="tp-assignees-empty-text">Aún no hay miembros asignados</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Day tabs */}
                    <div className="tp-day-tabs">
                      {DAY_NAMES.map((d, i) => {
                        const exs = selectedPlan.exercises[i];
                        const hasExs = exs !== null && exs !== undefined;
                        return (
                          <button key={d} className={`tp-day-tab ${selectedDay === i ? 'active' : ''} ${hasExs ? 'has-exs' : ''}`}
                            onClick={() => setSelectedDay(i)}>
                            <span className="tp-day-dot" />
                            {d}
                            {hasExs && exs && <span className="tp-day-count">{exs.length}</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Exercise list */}
                    <div className="tp-detail-panel">
                      {exercises === null ? (
                        <div className="tp-empty" style={{ minHeight: 200 }}>
                          <div style={{ fontSize: 28 }}>🧘</div>
                          <div className="tp-empty-title">Día de descanso</div>
                          <div className="tp-empty-desc">Sin ejercicios programados. El descanso es parte del entrenamiento.</div>
                        </div>
                      ) : exercises && exercises.length > 0 ? (
                        <>
                          <div className="tp-ex-count-bar">
                            <span className="tp-ex-count-text">{exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''} · {DAY_NAMES[selectedDay]}</span>
                          </div>
                          {exercises.map((e: PlanExercise, i: number) => {
                            return (
                              <div key={e.id} className="tp-ex-row">
                                <div className="tp-ex-top">
                                  <div className="tp-ex-grip">
                                    <span className="tp-grip-line" /><span className="tp-grip-line" /><span className="tp-grip-line" />
                                  </div>
                                  <div className="tp-ex-idx">{i + 1}</div>
                                  <div className="tp-ex-body">
                                    <div className="tp-ex-name">{e.exercise_name}</div>
                                  </div>
                                  <div className="tp-ex-chips">
                                    <span className="tp-chip tp-chip-accent"><span className="tp-chip-label">Series</span>{e.sets ?? 0}</span>
                                    <span className="tp-chip tp-chip-default"><span className="tp-chip-label">Reps</span>{e.reps ?? 0}</span>
                                    <span className="tp-chip tp-chip-default"><span className="tp-chip-label">Desc.</span>{e.rest_seconds ?? 0}s</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        <div className="tp-empty" style={{ minHeight: 200 }}>
                          <div className="tp-empty-desc">Sin ejercicios en este día</div>
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

      {/* Modals */}
      <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Asignar plan" compact>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, color: '#5f5f6a' }}>Selecciona los miembros para asignar este plan:</div>
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 260, overflowY: 'auto', margin: '0 -24px', padding: '0 24px' }}>
            {membersList.length === 0 ? (
              <div style={{ fontSize: 12, color: '#5f5f6a' }}>No hay miembros disponibles</div>
            ) : membersList.map(m => {
              const isSelected = selectedMemberIds.includes(m.id);
              const ini = m.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
              return (
                <div key={m.id} onClick={() => toggleMemberSelection(m.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.07)', background: isSelected ? 'rgba(232,93,93,0.12)' : 'transparent', transition: 'background 0.15s' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `1px solid ${isSelected ? '#e85d5d' : 'rgba(255,255,255,0.13)'}`, background: isSelected ? '#e85d5d' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div className={`tp-avatar ${avatarClass(m.id)}`} style={{ width: 28, height: 28 }}>{ini}</div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{m.full_name}</div>
                    {m.email && <div style={{ fontSize: 11, color: '#5f5f6a' }}>{m.email}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
            <button className="tp-btn tp-btn-ghost" onClick={() => setAssignModalOpen(false)}>Cancelar</button>
            <button className="tp-btn tp-btn-primary" onClick={handleAssignMultiple} disabled={selectedMemberIds.length === 0 || assigning}>
              {assigning ? 'Asignando...' : `Asignar (${selectedMemberIds.length})`}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={previewMember !== null} onClose={() => { setPreviewMember(null); setPreviewMembership(null); }} title="Miembro" compact>
        {previewLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 20, height: 20, borderRadius: '999px', border: '2px solid #e85d5d', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite' }} />
          </div>
        ) : previewMember ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className={`tp-avatar ${avatarClass(previewMember.id)}`} style={{ width: 48, height: 48, fontSize: 18 }}>
                {initials(previewMember.full_name)}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{previewMember.full_name}</div>
                {previewMember.role === 'admin' ? <Badge variant="accent" dot>Admin</Badge> : previewMember.role === 'trainer' ? <Badge variant="blue" dot>Entrenador</Badge> : <Badge variant="gray" dot>Miembro</Badge>}
              </div>
            </div>
            <div style={{ paddingTop: 16, paddingBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#5f5f6a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Membresía actual</div>
              {previewMembership ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Row label="Plan" value={previewMembership.membership_types.name} />
                  <Row label="Inicio" value={fmtDate(previewMembership.start_date)} />
                  <Row label="Vencimiento" value={fmtDate(previewMembership.end_date)} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#5f5f6a' }}>Estado</span>
                    {previewMembership.status === 'active' ? <Badge variant="green" dot>Activa</Badge> : previewMembership.status === 'expired' ? <Badge variant="red" dot>Vencida</Badge> : <Badge variant="amber" dot>Cancelada</Badge>}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#5f5f6a' }}>Sin membresía activa</div>
              )}
            </div>
            <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button className="tp-btn tp-btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { setPreviewMember(null); setPreviewMembership(null); navigate(`/members/${previewMember.id}`); }}>
                Ir a perfil completo
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Eliminar plan" compact icon={<IconAlert width="16" height="16" />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            ¿Estás seguro de eliminar el plan <strong>{deleteTarget?.name}</strong>?
          </div>
          <div style={{ fontSize: 12, color: '#5f5f6a', background: 'rgba(241,101,101,0.12)', border: '1px solid rgba(241,101,101,0.2)', borderRadius: '0.25rem', padding: 12, lineHeight: 1.6 }}>
            Se eliminarán todos los ejercicios asociados. Esta acción no se puede deshacer.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <button className="tp-btn tp-btn-ghost" onClick={() => setDeleteTarget(null)}>Cancelar</button>
          <button className="tp-btn" style={{ background: '#f16565', color: '#fff', border: '1px solid #f16565' }} onClick={confirmDelete}>Eliminar</button>
        </div>
      </Modal>

      <RoutineBuilder open={builderOpen} onClose={() => setBuilderOpen(false)} onSave={onBuilderSave} editPlan={builderEditPlan} />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: '#5f5f6a' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#f2f2ef' }}>{value}</span>
    </div>
  );
}
