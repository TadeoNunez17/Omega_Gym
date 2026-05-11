'use client';

import { useState } from 'react';

const DAY_NAMES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

const EXERCISES_DB: Record<number, any[] | null> = {
  0: [
    { name:'Press de banca plano',      muscle:'Pecho',         sets:4, reps:10, rest:90,  note:'Barra olímpica' },
    { name:'Press inclinado mancuernas',muscle:'Pecho',         sets:3, reps:12, rest:60,  note:'' },
    { name:'Aperturas con cable',       muscle:'Pecho',         sets:3, reps:15, rest:60,  note:'Cable cruzado' },
    { name:'Fondos en paralelas',       muscle:'Tríceps',       sets:3, reps:12, rest:60,  note:'' },
    { name:'Extensión tríceps polea',   muscle:'Tríceps',       sets:4, reps:12, rest:60,  note:'' },
  ],
  1: [
    { name:'Jalón al pecho',            muscle:'Espalda',       sets:4, reps:10, rest:90,  note:'Agarre ancho' },
    { name:'Remo con barra',            muscle:'Espalda',       sets:4, reps:10, rest:90,  note:'' },
    { name:'Remo con mancuerna',        muscle:'Espalda',       sets:3, reps:12, rest:60,  note:'Apoyo en banco' },
    { name:'Curl de bíceps barra',      muscle:'Bíceps',        sets:3, reps:12, rest:60,  note:'' },
    { name:'Curl martillo',             muscle:'Bíceps',        sets:3, reps:12, rest:60,  note:'' },
  ],
  2: [
    { name:'Sentadilla libre',          muscle:'Cuádriceps',    sets:4, reps:8,  rest:120, note:'Prioridad técnica' },
    { name:'Prensa de piernas',         muscle:'Cuádriceps',    sets:3, reps:12, rest:90,  note:'' },
    { name:'Extensión de cuádriceps',   muscle:'Cuádriceps',    sets:3, reps:15, rest:60,  note:'' },
    { name:'Curl femoral tumbado',      muscle:'Isquiotibiales',sets:4, reps:12, rest:60,  note:'' },
    { name:'Pantorrillas de pie',       muscle:'Gemelos',       sets:4, reps:20, rest:45,  note:'' },
  ],
  3: [
    { name:'Press militar barra',       muscle:'Deltoides',     sets:4, reps:10, rest:90,  note:'' },
    { name:'Elevaciones laterales',     muscle:'Deltoides',     sets:4, reps:15, rest:60,  note:'' },
    { name:'Pájaro con mancuernas',     muscle:'Deltoides post',sets:3, reps:15, rest:60,  note:'' },
    { name:'Encogimientos de hombros',  muscle:'Trapecios',     sets:3, reps:12, rest:60,  note:'' },
    { name:'Plancha abdominal',         muscle:'Core',          sets:3, reps:60, rest:45,  note:'Segundos' },
  ],
  4: [
    { name:'Peso muerto convencional',  muscle:'Espalda baja',  sets:3, reps:8,  rest:120, note:'Técnica perfecta' },
    { name:'Dominadas asistidas',       muscle:'Espalda',       sets:3, reps:8,  rest:90,  note:'' },
    { name:'Hip thrust',               muscle:'Glúteo',         sets:4, reps:12, rest:60,  note:'' },
    { name:'Abdominales en polea',      muscle:'Core',          sets:3, reps:15, rest:45,  note:'' },
  ],
  5: null,
  6: null,
};

interface Plan {
  id: number;
  name: string;
  desc: string;
  type: 'assigned' | 'template' | 'draft';
  trainer: string;
  member: string | null;
  memberAv: string | null;
  avClass: string;
  days: number;
  exercises: Record<number, any[] | null>;
}

let nextId = 7;

const INITIAL_PLANS: Plan[] = [
  { id:1, name:'Fuerza A',      desc:'Pecho, espalda, piernas, hombros y core. Hipertrofia intermedia.',   type:'assigned', trainer:'Miguel Torres', member:'Carlos Ramírez',  memberAv:'CR', avClass:'av-0', days:5, exercises:EXERCISES_DB },
  { id:2, name:'Cardio Plus',   desc:'Programa cardiovascular de 6 semanas. Ideal para pérdida de peso.',  type:'assigned', trainer:'Diana Salazar',  member:'Sofía López',     memberAv:'SL', avClass:'av-1', days:5, exercises:EXERCISES_DB },
  { id:3, name:'Fuerza B',      desc:'Variante de Fuerza A con énfasis en tren inferior y compuestos.',    type:'assigned', trainer:'Miguel Torres', member:'Ana Gutiérrez',   memberAv:'AG', avClass:'av-3', days:5, exercises:EXERCISES_DB },
  { id:4, name:'Movilidad',     desc:'Rutina de flexibilidad y movilidad articular. 5 días semanales.',    type:'assigned', trainer:'Diana Salazar',  member:'Valeria Cruz',    memberAv:'VC', avClass:'av-5', days:5, exercises:EXERCISES_DB },
  { id:5, name:'Principiante General', desc:'Plan base para nuevos miembros. Adaptación y técnica.',       type:'template', trainer:'Miguel Torres', member:null,              memberAv:null, avClass:'',    days:4, exercises:EXERCISES_DB },
  { id:6, name:'Hipertrofia Avanzada', desc:'Plan de 5 días para atletas con experiencia mayor a 2 años.', type:'draft',   trainer:'Admin',         member:null,              memberAv:null, avClass:'',    days:5, exercises:EXERCISES_DB },
];

const AV_STYLES: Record<string, { bg: string; fg: string }> = {
  'av-0': { bg: 'rgba(59,130,246,0.2)', fg: '#60a5fa' },
  'av-1': { bg: 'rgba(16,185,129,0.2)', fg: '#34d399' },
  'av-3': { bg: 'rgba(168,85,247,0.2)', fg: '#c084fc' },
  'av-5': { bg: 'rgba(20,184,166,0.2)', fg: '#2dd4bf' },
};

export default function TrainingPlansPage() {
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [fName, setFName] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fTrainer, setFTrainer] = useState('Miguel Torres');
  const [fType, setFType] = useState('assigned');
  const [fMember, setFMember] = useState('');

  const selectedPlan = plans.find(p => p.id === selectedId) || null;

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

  const totalEx = selectedPlan
    ? Object.values(selectedPlan.exercises).flat().filter(Boolean).length
    : 0;

  const typeBadge = (type: string) => {
    if (type === 'template') return { label: 'Plantilla', cls: { background: 'rgba(168,85,247,0.1)', color: '#c084fc' } };
    if (type === 'assigned') return { label: 'Asignado', cls: { background: 'var(--green-bg)', color: 'var(--green-text)' } };
    return { label: 'Sin asignar', cls: { background: 'var(--surface3)', color: 'var(--text-3)', border: '1px solid var(--border)' } };
  };

  function handleCreate() {
    if (!fName.trim()) return;
    const newPlan: Plan = {
      id: nextId++,
      name: fName.trim(),
      desc: fDesc,
      type: fType as any,
      trainer: fTrainer,
      member: fType === 'assigned' ? fMember || null : null,
      memberAv: fType === 'assigned' && fMember ? fMember.split(' ').map(w=>w[0]).join('').slice(0,2) : null,
      avClass: 'av-0',
      days: 5,
      exercises: EXERCISES_DB,
    };
    setPlans([...plans, newPlan]);
    setModalOpen(false);
    setFName(''); setFDesc(''); setFType('assigned'); setFMember(''); setFTrainer('Miguel Torres');
    setSelectedId(newPlan.id);
    setSelectedDay(0);
  }

  const metrics = {
    total: plans.length,
    assigned: plans.filter(p => p.type === 'assigned').length,
    templates: plans.filter(p => p.type === 'template').length,
    draft: plans.filter(p => p.type === 'draft').length,
  };

  return (
    <div style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Planes de Entrenamiento</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>Crea, edita y asigna rutinas a los miembros del gym</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button ghost onClick={() => setModalOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Nueva plantilla
          </Button>
          <Button primary onClick={() => setModalOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo plan
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <MetricCard color="#a855f7" label="Total de planes" value={metrics.total} sub="Creados en el sistema" />
        <MetricCard color="#22c55e" label="Planes asignados" value={metrics.assigned} sub="Con miembro activo" />
        <MetricCard color="#3b82f6" label="Plantillas" value={metrics.templates} sub="Reutilizables" />
        <MetricCard color="#f59e0b" label="Sin asignar" value={metrics.draft} sub="Disponibles" />
      </div>

      {/* Master-detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, minHeight: 500 }}>
        {/* Left panel */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar plan o miembro…"
                style={{
                  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                  color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
                  padding: '8px 12px 8px 34px', borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
            {[{key:'all',label:'Todos'},{key:'assigned',label:'Asignados'},{key:'template',label:'Plantillas'},{key:'draft',label:'Sin asignar'}].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{
                  fontSize: 11, padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                  border: filter === f.key ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: filter === f.key ? 'var(--accent)' : 'transparent',
                  color: filter === f.key ? '#000' : 'var(--text-3)',
                  fontWeight: filter === f.key ? 500 : 400,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}>{f.label}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredPlans.map(p => {
              const badge = typeBadge(p.type);
              const exCount = Object.values(p.exercises).flat().filter(Boolean).length;
              const isSel = selectedPlan?.id === p.id;
              return (
                <div key={p.id} onClick={() => { setSelectedId(p.id); setSelectedDay(0); }}
                  style={{
                    padding: '14px 16px', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'background 0.12s',
                    display: 'flex', flexDirection: 'column', gap: 8,
                    background: isSel ? 'var(--accent-dim)' : 'transparent',
                    borderLeft: isSel ? '2px solid var(--accent)' : '2px solid transparent',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{p.member ? `→ ${p.member}` : p.trainer}</div>
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 500,
                      whiteSpace: 'nowrap', flexShrink: 0,
                      ...badge.cls,
                    }}>{badge.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ChipSm icon="check" text={`${exCount} ejercicios`} />
                    <ChipSm icon="calendar" text={`${p.days} días / semana`} />
                  </div>
                </div>
              );
            })}
            {filteredPlans.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Sin resultados</div>
            )}
          </div>
        </div>

        {/* Right detail panel */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {!selectedPlan ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', minHeight: 300, gap: 12,
              textAlign: 'center', padding: 40,
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22" style={{ color: 'var(--text-3)' }}>
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Selecciona un plan</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', maxWidth: 260, lineHeight: 1.5 }}>Haz clic en cualquier plan de la lista para ver sus ejercicios y detalles.</div>
            </div>
          ) : (
            <>
              {/* Detail header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>{selectedPlan.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{selectedPlan.desc}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
                      borderRadius: 100, fontSize: 10, fontWeight: 500, ...typeBadge(selectedPlan.type).cls,
                    }}>{typeBadge(selectedPlan.type).label}</span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
                      borderRadius: 100, fontSize: 10, fontWeight: 500,
                      background: 'var(--surface2)', color: 'var(--text-3)', border: '1px solid var(--border)',
                    }}>Por {selectedPlan.trainer}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
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

              {/* Assigned bar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)',
              }}>
                {selectedPlan.member ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: AV_STYLES[selectedPlan.avClass]?.bg || 'rgba(255,255,255,0.05)',
                        color: AV_STYLES[selectedPlan.avClass]?.fg || '#888',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 600, flexShrink: 0,
                      }}>{selectedPlan.memberAv}</div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Asignado a</div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedPlan.member}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <MiniBtn>Ver miembro</MiniBtn>
                      <MiniBtn>Quitar</MiniBtn>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Sin miembro asignado</div>
                    <MiniBtn accent>+ Asignar miembro</MiniBtn>
                  </>
                )}
              </div>

              {/* Day tabs */}
              <div style={{ display: 'flex', gap: 6, padding: '14px 24px', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
                {DAY_NAMES.map((d, i) => {
                  const exs = selectedPlan.exercises[i];
                  const isRest = exs === null;
                  return (
                    <button key={d} onClick={() => setSelectedDay(i)}
                      style={{
                        flexShrink: 0, padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer',
                        border: selectedDay === i ? '1px solid var(--accent)' : '1px solid var(--border)',
                        background: selectedDay === i ? 'var(--accent)' : 'transparent',
                        color: selectedDay === i ? '#000' : isRest ? 'var(--text-3)' : 'var(--text-2)',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                      }}>
                      {d}{!isRest && exs ? <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.7 }}>({exs.length})</span> : ''}
                    </button>
                  );
                })}
              </div>

              {/* Exercises */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {(() => {
                  const exs = selectedPlan.exercises[selectedDay];
                  if (exs === null) {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 10, textAlign: 'center' }}>
                        <div style={{ fontSize: 32 }}>🧘</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>Día de descanso</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Sin ejercicios programados. El descanso es parte del entrenamiento.</div>
                      </div>
                    );
                  }
                  return (
                    <>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)',
                      }}>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {DAY_NAMES[selectedDay]} · {exs.length} ejercicio{exs.length !== 1 ? 's' : ''}
                        </span>
                        <button style={{
                          display: 'flex', alignItems: 'center', gap: 5, fontSize: 11,
                          color: 'var(--accent)', background: 'var(--accent-dim)',
                          border: '1px solid rgba(232,255,71,0.15)',
                          padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Agregar ejercicio
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {exs.map((e, i) => (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '14px 24px', borderBottom: i < exs.length - 1 ? '1px solid var(--border)' : 'none',
                            transition: 'background 0.12s',
                          }}>
                            <div style={{ color: 'var(--text-3)', cursor: 'grab', display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
                              {[0,1,2].map(j => <span key={j} style={{ display: 'block', width: 12, height: 1.5, background: 'currentColor', borderRadius: 2 }} />)}
                            </div>

                            <div style={{
                              width: 24, height: 24, borderRadius: '50%',
                              background: 'var(--surface3)', border: '1px solid var(--border2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 600, color: 'var(--text-3)', flexShrink: 0,
                            }}>{i + 1}</div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{e.muscle}</div>
                              {e.note && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, fontStyle: 'italic' }}>{e.note}</div>}
                            </div>

                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <ExChip value={e.sets} label="Series" accent />
                              <ExChip value={e.reps} label="Reps" />
                              <ExChip value={`${e.rest}s`} label="Descanso" />
                            </div>

                            <button style={{
                              width: 26, height: 26, borderRadius: 'var(--radius-sm)',
                              background: 'transparent', border: '1px solid var(--border)',
                              color: 'var(--text-3)', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                            }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 'var(--radius)', width: 520, maxWidth: '95vw', maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Nuevo plan de entrenamiento</div>
              <button onClick={() => setModalOpen(false)}
                style={{
                  width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-3)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontFamily: 'inherit',
                }}>✕</button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                Información general
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormGroup full label="Nombre del plan *">
                  <input value={fName} onChange={e => setFName(e.target.value)} placeholder="Ej. Fuerza A — Intermedio"
                    style={inputStyle} />
                </FormGroup>
                <FormGroup full label="Descripción">
                  <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Objetivo del plan, observaciones generales…"
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} />
                </FormGroup>
                <FormGroup label="Creado por">
                  <select value={fTrainer} onChange={e => setFTrainer(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="Miguel Torres">Miguel Torres (Entrenador)</option>
                    <option value="Diana Salazar">Diana Salazar (Entrenador)</option>
                    <option value="Admin">Administrador</option>
                  </select>
                </FormGroup>
                <FormGroup label="Tipo">
                  <select value={fType} onChange={e => setFType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="assigned">Asignar a miembro</option>
                    <option value="template">Guardar como plantilla</option>
                    <option value="draft">Sin asignar (borrador)</option>
                  </select>
                </FormGroup>
                {fType === 'assigned' && (
                  <FormGroup full label="Asignar a miembro">
                    <select value={fMember} onChange={e => setFMember(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">— Seleccionar miembro —</option>
                      <option>Carlos Ramírez</option>
                      <option>Sofía López</option>
                      <option>Ana Gutiérrez</option>
                      <option>Paola Rivas</option>
                      <option>Héctor Gómez</option>
                    </select>
                  </FormGroup>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
              <Button ghost onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button primary onClick={handleCreate}>Crear plan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function Button({ children, primary, ghost, onClick }: { children: React.ReactNode; primary?: boolean; ghost?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 16px', borderRadius: 'var(--radius-sm)',
      fontSize: 13, fontWeight: 500, cursor: 'pointer',
      fontFamily: 'inherit',
      background: primary ? 'var(--accent)' : 'transparent',
      color: primary ? '#000' : 'var(--text-2)',
      border: ghost ? '1px solid var(--border2)' : 'none',
    }}>
      {children}
    </button>
  );
}

function MetricCard({ color, label, value, sub }: { color: string; label: string; value: number; sub: string }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '18px 20px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em', color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function ChipSm({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
        {icon === 'check'
          ? <path d="M9 11l3 3L22 4"/>
          : <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
      </svg>
      {text}
    </div>
  );
}

function IconBtn({ children, title, danger }: { children: React.ReactNode; title: string; danger?: boolean }) {
  return (
    <button title={title} style={{
      width: 32, height: 32, borderRadius: 'var(--radius-sm)',
      background: 'transparent', border: '1px solid var(--border)',
      color: danger ? 'var(--red-text)' : 'var(--text-3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.15s',
    }}>
      {children}
    </button>
  );
}

function MiniBtn({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <button style={{
      fontSize: 11, padding: '5px 10px', borderRadius: 'var(--radius-sm)',
      border: accent ? '1px solid rgba(232,255,71,0.2)' : '1px solid var(--border2)',
      background: accent ? 'var(--accent-dim)' : 'transparent',
      color: accent ? 'var(--accent)' : 'var(--text-2)',
      cursor: 'pointer', fontFamily: 'inherit',
    }}>{children}</button>
  );
}

function ExChip({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: accent ? 'var(--accent-dim)' : 'var(--surface2)',
      border: accent ? '1px solid rgba(232,255,71,0.2)' : '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '5px 10px', minWidth: 48,
    }}>
      <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "'DM Mono', monospace", lineHeight: 1, ...(accent ? { color: 'var(--accent)' } : {}) }}>{value}</span>
      <span style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{label}</span>
    </div>
  );
}

function FormGroup({ children, label, full }: { children: React.ReactNode; label: string; full?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: full ? '1 / -1' : undefined }}>
      <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'var(--surface2)', border: '1px solid var(--border2)',
  color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
  padding: '9px 12px', borderRadius: 'var(--radius-sm)',
  outline: 'none', width: '100%',
};
