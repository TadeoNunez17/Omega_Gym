import { useState, useEffect, useCallback } from 'react';
import { trainingService, type PlanListItem, type PlanExercise } from '@/services/training.service';
import { membersService } from '@/services/members.service';
import { Button } from '@/components/ui/atoms/Button';
import { Chip } from '@/components/ui/atoms/Chip';
import { Modal } from '@/components/ui/molecules/Modal';
import { Input, Select } from '@/components/ui/atoms/Input';
import { MetricCard } from '@/components/ui/atoms/MetricCard';
import { IconPlus } from '@/lib/icons';

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

interface Plan {
  id: string;
  name: string;
  desc: string;
  type: 'assigned' | 'template' | 'draft';
  trainer: string;
  member: string | null;
  memberAv: string | null;
  avClass: string;
  days: number;
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
  if (type === 'template') return { label: 'Plantilla', cls: 'bg-purple-bg text-purple-text' };
  if (type === 'assigned') return { label: 'Asignado', cls: 'bg-green-bg text-green-text' };
  return { label: 'Sin asignar', cls: 'bg-surface3 text-text-3 border border-border' };
}

export default function TrainingPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [fName, setFName] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fType, setFType] = useState('assigned');
  const [fMember, setFMember] = useState('');
  const [members, setMembers] = useState<{ id: string; full_name: string }[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

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
        member: p.member_name,
        memberAv: p.member_name ? p.member_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : null,
        avClass: `av-${avatarIndex(p.id)}`,
        days: p.days || 5,
        exercises: {},
      }));
      setPlans(mapped);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const result = await membersService.getAll({ role: 'member', pageSize: 100 });
      setMembers(result.data.map(m => ({ id: m.id, full_name: m.full_name })));
    } catch {}
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchMembers();
  }, [fetchPlans, fetchMembers]);

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
        return { ...p, exercises: exMap, days };
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
    if (filter === 'template') return p.type === 'template';
    if (filter === 'draft') return p.type === 'draft';
    return true;
  }).filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.member || '').toLowerCase().includes(q);
  });

  const metrics = {
    total: plans.length,
    assigned: plans.filter(p => p.type === 'assigned').length,
    templates: plans.filter(p => p.type === 'template').length,
    draft: plans.filter(p => p.type === 'draft').length,
  };

  async function handleCreate() {
    if (!fName.trim()) return;
    try {
      const plan = await trainingService.create({
        name: fName.trim(),
        description: fDesc || undefined,
        is_template: fType === 'template',
        created_by: '00000000-0000-0000-0000-000000000000',
        assigned_to: fType === 'assigned' && fMember ? fMember : undefined,
      });
      setModalOpen(false);
      setFName(''); setFDesc(''); setFType('assigned'); setFMember('');
      setSelectedId(plan.id);
      setSelectedDay(0);
      fetchPlans();
    } catch (e: any) {
      alert('Error al crear plan: ' + e.message);
    }
  }

  return (
    <div className="p-4 sm:p-7 flex-1 flex flex-col gap-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">Planes de Entrenamiento</div>
          <div className="text-[13px] text-text-2 mt-1">Crea, edita y asigna rutinas a los miembros del gym</div>
        </div>
        <div className="flex gap-[10px]">
          <Button variant="ghost" size="sm" onClick={() => setModalOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
            Nueva plantilla
          </Button>
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo plan
          </Button>
        </div>
      </div>

      {loading && <div className="text-center py-[60px] text-text-3">Cargando planes…</div>}
      {!loading && error && <div className="text-center py-[60px] text-red-text">Error: {error}</div>}
      {!loading && !error && (
        <>
          <div className="flex overflow-x-auto gap-3 sm:grid sm:grid-cols-4">
            <MetricCard color="accent" label="Total de planes" value={metrics.total} sub="Creados en el sistema" />
            <MetricCard color="green" label="Planes asignados" value={metrics.assigned} sub="Con miembro activo" />
            <MetricCard color="blue" label="Plantillas" value={metrics.templates} sub="Reutilizables" />
            <MetricCard color="amber" label="Sin asignar" value={metrics.draft} sub="Disponibles" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 min-h-[500px]">
            {/* Left panel */}
            <div className="bg-surface border border-border rounded overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-text-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar plan o miembro…"
                    className="w-full bg-surface2 border border-border text-text font-sans text-[13px] py-2 pl-[34px] pr-3 rounded-[var(--radius-sm)] outline-none placeholder:text-text-3 focus:border-border2" />
                </div>
              </div>

              <div className="flex gap-1 px-3 py-[10px] border-b border-border">
                {[{key:'all',label:'Todos'},{key:'assigned',label:'Asignados'},{key:'template',label:'Plantillas'},{key:'draft',label:'Sin asignar'}].map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className={`text-[11px] px-[10px] py-[5px] rounded-[var(--radius-sm)] font-sans cursor-pointer transition-all duration-150 ${
                      filter === f.key
                        ? 'bg-accent text-black border border-accent font-medium'
                        : 'bg-transparent text-text-3 border border-border hover:bg-surface2 hover:text-text-2'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredPlans.length === 0 ? (
                  <div className="py-10 text-center text-[13px] text-text-3">Sin resultados</div>
                ) : (
                  filteredPlans.map(p => {
                    const badge = typeBadge(p.type);
                    const exCount = Object.values(p.exercises).flat().filter(Boolean).length;
                    const isSel = selectedPlan?.id === p.id;
                    return (
                      <div key={p.id} onClick={() => { setSelectedId(p.id); setSelectedDay(0); }}
                        className={`px-4 py-3.5 border-b border-border cursor-pointer transition-colors duration-100 flex flex-col gap-2 ${
                          isSel ? 'bg-accent-dim border-l-2 border-l-accent' : 'bg-transparent border-l-2 border-l-transparent'
                        }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[13px] font-semibold">{p.name}</div>
                            <div className="text-[11px] text-text-3 mt-0.5">{p.member ? `→ ${p.member}` : p.trainer}</div>
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
                      <IconBtn title="Duplicar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </IconBtn>
                      <IconBtn title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </IconBtn>
                      <IconBtn title="Eliminar" danger>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </IconBtn>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-surface2">
                    {selectedPlan.member ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-[10px]">
                          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                            style={{ background: AV_COLORS[avatarIndex(selectedPlan.id)].bg, color: AV_COLORS[avatarIndex(selectedPlan.id)].fg }}>
                            {selectedPlan.memberAv}
                          </div>
                          <div>
                            <div className="text-[11px] text-text-3">Asignado a</div>
                            <div className="text-[13px] font-medium">{selectedPlan.member}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-[11px] px-[10px] py-[5px] rounded-[var(--radius-sm)] border border-border2 bg-transparent text-text-2 cursor-pointer font-sans transition-all duration-150 hover:bg-surface hover:text-text"
                            onClick={() => alert('Ver ficha del miembro')}>
                            Ver miembro
                          </button>
                          <button className="text-[11px] px-[10px] py-[5px] rounded-[var(--radius-sm)] border border-border2 bg-transparent text-text-2 cursor-pointer font-sans transition-all duration-150 hover:bg-surface hover:text-text"
                            onClick={() => alert('Quitar asignación')}>
                            Quitar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="text-[13px] text-text-3">Sin miembro asignado</div>
                        <button className="flex items-center gap-1 text-[11px] text-accent bg-accent-dim border border-[rgba(232,255,71,0.15)] px-[10px] py-1 rounded-[var(--radius-sm)] cursor-pointer font-sans transition-all duration-150 hover:bg-accent hover:text-black"
                          onClick={() => alert('Seleccionar miembro para asignar')}>
                          + Asignar miembro
                        </button>
                      </div>
                    )}
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
                        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface2">
                          <span className="text-[11px] text-text-3 uppercase tracking-[0.06em]">
                            {DAY_NAMES[selectedDay]} · {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''}
                          </span>
                          <button className="flex items-center gap-1 text-[11px] text-accent bg-accent-dim border border-[rgba(232,255,71,0.15)] px-[10px] py-1 rounded-[var(--radius-sm)] cursor-pointer font-sans transition-all duration-150 hover:bg-accent hover:text-black">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Agregar ejercicio
                          </button>
                        </div>
                        <div className="flex flex-col">
                          {exercises.map((e: PlanExercise, i: number) => (
                            <div key={e.id} className={`flex items-center gap-[14px] px-6 py-3.5 transition-colors duration-100 ${i < exercises.length - 1 ? 'border-b border-border' : ''}`}>
                              <div className="text-text-3 cursor-grab flex flex-col gap-[3px] shrink-0">
                                {[0,1,2].map(j => <span key={j} className="block w-3 h-[1.5px] bg-current rounded-sm" />)}
                              </div>
                              <div className="w-6 h-6 rounded-full bg-surface3 border border-border2 flex items-center justify-center text-[10px] font-semibold text-text-3 shrink-0">{i + 1}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium truncate">{e.exercise_name}</div>
                                {e.muscle && <div className="text-[10px] text-text-3 mt-0.5">{e.muscle}</div>}
                                {e.notes && <div className="text-[10px] text-text-3 mt-0.5 italic">{e.notes}</div>}
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                <Chip value={e.sets ?? 0} label="Series" accent />

                                <Chip value={e.reps ?? 0} label="Reps" />

                                <Chip value={`${e.rest_seconds ?? 0}s`} label="Descanso" />
                              </div>
                              <button className="w-[26px] h-[26px] rounded-[var(--radius-sm)] bg-transparent border border-border text-text-3 flex items-center justify-center cursor-pointer transition-all duration-150 shrink-0 hover:bg-surface3 hover:text-text-2 hover:border-border2">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo plan de entrenamiento" className="max-w-[400px]" icon={<IconPlus width="16" height="16" />}>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre del plan *" value={fName} onChange={e => setFName(e.target.value)} placeholder="Ej. Fuerza A — Intermedio" />
          <Select label="Tipo" value={fType} onChange={e => setFType(e.target.value)}>
            <option value="assigned">Asignar a miembro</option>
            <option value="template">Guardar como plantilla</option>
            <option value="draft">Sin asignar (borrador)</option>
          </Select>
          <div className={fType === 'assigned' ? 'col-span-2' : 'col-span-2'}>
            <Input label="Descripción" value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Objetivo del plan, observaciones generales…" />
          </div>
          {fType === 'assigned' && (
            <div className="col-span-2">
              <Select label="Asignar a miembro" value={fMember} onChange={e => setFMember(e.target.value)}>
                <option value="">— Seleccionar miembro —</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
              </Select>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-[10px] pt-3">
          <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleCreate}>Crear plan</Button>
        </div>
      </Modal>
    </div>
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

function IconBtn({ children, title, danger }: { children: React.ReactNode; title: string; danger?: boolean }) {
  return (
    <button title={title}
      className={`w-8 h-8 rounded-[var(--radius-sm)] bg-transparent border border-border flex items-center justify-center cursor-pointer transition-all duration-150 ${
        danger ? 'text-red-text hover:bg-red-bg hover:border-[rgba(239,68,68,0.3)]' : 'text-text-3 hover:bg-surface2 hover:text-text hover:border-border2'
      }`}>
      {children}
    </button>
  );
}


