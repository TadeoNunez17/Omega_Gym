import { useState } from 'react';

const MEMBERS = [
  { name:'Carlos Ramírez', email:'carlos@correo.com', av:'CR', avC:'av-0', membresia:'Mensual',    memDays:24, plan:'Fuerza A',   status:'active' },
  { name:'Sofía López',    email:'sofia@correo.com',  av:'SL', avC:'av-1', membresia:'Trimestral', memDays:31, plan:'Cardio Plus',status:'active' },
  { name:'Ana Gutiérrez',  email:'ana@correo.com',    av:'AG', avC:'av-3', membresia:'Anual',      memDays:260,plan:'Fuerza B',   status:'active' },
  { name:'Paola Rivas',    email:'paola@correo.com',  av:'PR', avC:'av-4', membresia:'Trimestral', memDays:75, plan:'Fuerza A',   status:'active' },
  { name:'Héctor Gómez',   email:'hector@correo.com', av:'HG', avC:'av-5', membresia:'Mensual',    memDays:3,  plan:null,         status:'active' },
];

const INITIAL_PLANS = [
  { name:'Fuerza A',    members:['Carlos Ramírez','Paola Rivas'], days:5, icon:'pi-purple' },
  { name:'Cardio Plus', members:['Sofía López'],                  days:5, icon:'pi-blue'   },
  { name:'Fuerza B',    members:['Ana Gutiérrez'],                days:5, icon:'pi-green'  },
];

const INITIAL_NOTES = [
  { member:'Carlos Ramírez', avC:'av-0', av:'CR', text:'Aumentó peso en press de banca a 70 kg. Técnica correcta. Continuar progresión lineal.',         time:'Hoy 10:30' },
  { member:'Sofía López',    avC:'av-1', av:'SL', text:'Completó los 30 minutos de cardio sin pausa. Subir intensidad la próxima sesión a nivel 9.',       time:'Ayer 09:00' },
  { member:'Ana Gutiérrez',  avC:'av-3', av:'AG', text:'Reforzar técnica en peso muerto. La espalda baja se redondea al superar 60 kg.',                   time:'29 abr' },
  { member:'Héctor Gómez',   avC:'av-5', av:'HG', text:'Primera semana. Adaptación bien. Asignar plan de principiante la próxima sesión.',                 time:'28 abr' },
];

const AV_STYLES: Record<string, { bg: string; fg: string }> = {
  'av-0': { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  'av-1': { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  'av-2': { bg: 'rgba(244,114,182,0.15)', fg: '#f472b6' },
  'av-3': { bg: 'rgba(168,85,247,0.15)', fg: '#c084fc' },
  'av-4': { bg: 'rgba(251,146,60,0.15)', fg: '#fb923c' },
  'av-5': { bg: 'rgba(20,184,166,0.15)', fg: '#2dd4bf' },
};

export default function TrainerPanelPage() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pMember, setPMember] = useState('');
  const [nMember, setNMember] = useState('Carlos Ramírez');
  const [nText, setNText] = useState('');

  const m = selectedIdx !== null ? MEMBERS[selectedIdx] : null;

  function selectMember(i: number) {
    setSelectedIdx(prev => prev === i ? null : i);
  }

  function guardarPlan() {
    if (!pName.trim()) return;
    setPlans([...plans, { name: pName.trim(), members: pMember ? [pMember] : [], days: 5, icon: 'pi-pink' }]);
    setPlanModalOpen(false);
    setPName(''); setPDesc(''); setPMember('');
  }

  function guardarNota() {
    if (!nText.trim()) return;
    const member = MEMBERS.find(x => x.name === nMember);
    setNotes([{ member: nMember, avC: member?.avC || 'av-0', av: member?.av || '??', text: nText.trim(), time: 'Ahora' }, ...notes]);
    setNoteModalOpen(false);
    setNText('');
  }

  const planIcons = [
    '<path d="M9 11l3 3L22 4"/>',
    '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>',
  ];

  return (
    <div style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Breadcrumb header */}
      <header style={{
        padding: '0 0 0 0', height: 'auto', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: 'none', background: 'transparent',
        position: 'static',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
          Omega Gym <span style={{ color: 'var(--text-2)' }}>›</span> <span style={{ color: 'var(--text-2)' }}>Mi panel</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setNoteModalOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: 'transparent', color: 'var(--text-2)',
              border: '1px solid var(--border2)', fontFamily: 'inherit',
            }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Nueva nota
          </button>
          <button onClick={() => setPlanModalOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: 'var(--accent)', color: '#000',
              border: 'none', fontFamily: 'inherit',
            }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo plan
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #ec4899, #a855f7, transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(236,72,153,0.15)', color: '#f472b6',
            border: '2px solid rgba(236,72,153,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 600, flexShrink: 0,
          }}>MT</div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Bienvenido de vuelta</div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>Miguel Torres</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>Entrenador certificado · miguel@omegagym.com · Lun–Vie 7:00–14:00</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          <HeroStat value={5} label="Mis miembros" color="#f472b6" />
          <HeroStat value={3} label="Planes activos" color="#c084fc" />
          <HeroStat value={1} label="Sin plan aún" color="#fbbf24" />
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <MetricCard color="#ec4899" label="Miembros a mi cargo" value={5} sub="Activos en el gym" />
        <MetricCard color="#22c55e" label="Con plan asignado" value={4} sub="En entrenamiento" />
        <MetricCard color="#a855f7" label="Planes que creé" value={3} sub="Rutinas activas" />
        <MetricCard color="#f59e0b" label="Membresías por vencer" value={2} sub="En mis miembros" />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        {/* Left: members + plans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Members table */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Mis miembros</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Solo lectura — contacta al admin para hacer cambios</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>5 miembros</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Miembro','Membresía','Plan asignado','Estado',''].map(h => (
                      <th key={h} style={{
                        padding: '10px 18px', textAlign: 'left',
                        fontSize: 10, fontWeight: 500, color: 'var(--text-3)',
                        textTransform: 'uppercase', letterSpacing: '0.07em',
                        background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MEMBERS.map((mem, i) => {
                    const isSel = selectedIdx === i;
                    const av = AV_STYLES[mem.avC];
                    return (
                      <tr key={i} onClick={() => selectMember(i)}
                        style={{ cursor: 'pointer', transition: 'background 0.12s', background: isSel ? 'var(--accent-dim)' : 'transparent' }}>
                        <td style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: av.bg, color: av.fg,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 600, flexShrink: 0,
                            }}>{mem.av}</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500 }}>{mem.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{mem.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
                          {mem.memDays <= 7 ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px',
                              borderRadius: 100, fontSize: 11, fontWeight: 500,
                              background: 'var(--amber-bg)', color: 'var(--amber-text)',
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)' }}></span>
                              {mem.memDays}d
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px',
                              borderRadius: 100, fontSize: 11, fontWeight: 500,
                              background: 'var(--green-bg)', color: 'var(--green-text)',
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }}></span>
                              {mem.membresia}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
                          {mem.plan ? (
                            <span style={{
                              background: 'var(--purple-bg)', color: 'var(--purple-text)',
                              borderRadius: 'var(--radius-sm)', fontFamily: "'DM Mono', monospace",
                              padding: '2px 8px', fontSize: 11,
                            }}>{mem.plan}</span>
                          ) : (
                            <span style={{
                              background: 'var(--surface2)', color: 'var(--text-3)',
                              border: '1px dashed var(--border2)', borderRadius: 'var(--radius-sm)',
                              fontSize: 11, padding: '2px 8px',
                            }}>Sin plan</span>
                          )}
                        </td>
                        <td style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px',
                            borderRadius: 100, fontSize: 11, fontWeight: 500,
                            background: 'var(--green-bg)', color: 'var(--green-text)',
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }}></span>
                            Activo
                          </span>
                        </td>
                        <td style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                          <button style={{
                            width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                            background: 'transparent', border: '1px solid var(--border)',
                            color: 'var(--text-3)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
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

          {/* My plans */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Mis planes de entrenamiento</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Planes que he creado</div>
              </div>
              <button onClick={() => setPlanModalOpen(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  background: 'var(--accent)', color: '#000', border: 'none', fontFamily: 'inherit',
                }}>
                + Nuevo
              </button>
            </div>
            {plans.map((p, i) => {
              const iconColors: Record<string, {bg: string;fg: string}> = {
                'pi-purple': { bg: 'rgba(168,85,247,0.1)', fg: '#c084fc' },
                'pi-blue': { bg: 'rgba(59,130,246,0.1)', fg: '#60a5fa' },
                'pi-green': { bg: 'rgba(34,197,94,0.1)', fg: '#4ade80' },
                'pi-pink': { bg: 'rgba(236,72,153,0.1)', fg: '#f472b6' },
              };
              const ic = iconColors[p.icon] || iconColors['pi-purple'];
              return (
                <div key={i} style={{
                  padding: '12px 18px', borderBottom: i < plans.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.12s', cursor: 'pointer',
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 'var(--radius-sm)',
                    background: ic.bg, color: ic.fg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"
                      dangerouslySetInnerHTML={{ __html: planIcons[i % 3] }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{p.days} días/semana · {p.members.join(', ')}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--text-3)' }}>
                      {p.members.length} miembro{p.members.length > 1 ? 's' : ''}
                    </span>
                    <button style={{
                      width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                      background: 'transparent', border: '1px solid var(--border)',
                      color: 'var(--text-3)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: member detail */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {!m ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', textAlign: 'center', padding: 32, gap: 10,
              minHeight: 300,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20" style={{ color: 'var(--text-3)' }}>
                  <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                </svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Selecciona un miembro</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>Haz clic en cualquier fila para ver su estado, membresía y plan asignado.</div>
            </div>
          ) : (
            <>
              {/* Detail hero */}
              <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: AV_STYLES[m.avC]?.bg, color: AV_STYLES[m.avC]?.fg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 600,
                }}>{m.av}</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{m.email}</div>
                <div>
                  {m.memDays <= 7 ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--amber-bg)', color: 'var(--amber-text)' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)' }}></span>Vence en {m.memDays} días
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--green-bg)', color: 'var(--green-text)' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }}></span>{m.membresia} activa
                    </span>
                  )}
                </div>
              </div>

              {/* Membresía section */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 10 }}>Membresía</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Tipo</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{m.membresia}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Días restantes</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: m.memDays <= 7 ? 'var(--amber-text)' : 'var(--green-text)' }}>{m.memDays} días</span>
                </div>
                <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: m.memDays <= 7 ? 'var(--amber)' : 'var(--accent)',
                    width: `${Math.max(5, Math.min(100, Math.round((m.memDays / (m.membresia === 'Anual' ? 365 : m.membresia === 'Trimestral' ? 90 : 30)) * 100)))}%`,
                  }} />
                </div>
              </div>

              {/* Plan section */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 10 }}>Plan de entrenamiento</div>
                {m.plan ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Plan activo</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--purple-text)' }}>{m.plan}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Frecuencia</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>5 días / semana</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                      {['L','M','X','J','V','S','D'].map((d, i) => (
                        <span key={d} style={{
                          padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: 11,
                          background: i < 5 ? 'var(--accent-dim)' : 'var(--surface2)',
                          color: i < 5 ? 'var(--accent)' : 'var(--text-3)',
                          border: i < 5 ? '1px solid rgba(232,255,71,0.2)' : '1px solid var(--border)',
                        }}>{d}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '8px 0' }}>Este miembro aún no tiene plan asignado.</div>
                )}
              </div>

              {/* Actions */}
              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {m.plan ? (
                  <button style={{
                    width: '100%', padding: 9, borderRadius: 'var(--radius-sm)', fontSize: 12,
                    fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                    border: '1px solid var(--accent)', background: 'var(--accent)', color: '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar plan
                  </button>
                ) : (
                  <button onClick={() => setPlanModalOpen(true)}
                    style={{
                      width: '100%', padding: 9, borderRadius: 'var(--radius-sm)', fontSize: 12,
                      fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                      border: '1px solid var(--accent)', background: 'var(--accent)', color: '#000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Crear plan para {m.name.split(' ')[0]}
                  </button>
                )}
                <button onClick={() => setNoteModalOpen(true)}
                  style={{
                    width: '100%', padding: 9, borderRadius: 'var(--radius-sm)', fontSize: 12,
                    fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                    border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
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

      {/* Notes */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Notas de seguimiento</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Observaciones sobre el progreso de tus miembros</div>
          </div>
          <button onClick={() => setNoteModalOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: 'transparent', color: 'var(--text-2)',
              border: '1px solid var(--border2)', fontFamily: 'inherit',
            }}>
            + Nota
          </button>
        </div>
        {notes.map((n, i) => {
          const av = AV_STYLES[n.avC];
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 18px', borderBottom: i < notes.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: av.bg, color: av.fg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 600, flexShrink: 0, marginTop: 2,
              }}>{n.av}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{n.member}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2, lineHeight: 1.5 }}>{n.text}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{n.time}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Modal */}
      {planModalOpen && (
        <Modal onClose={() => setPlanModalOpen(false)} title="Nuevo plan de entrenamiento">
          <FormGroup label="Nombre del plan *">
            <input value={pName} onChange={e => setPName(e.target.value)} placeholder="Ej. Fuerza C — Avanzado"
              style={{ ...inputStyle }} />
          </FormGroup>
          <FormGroup label="Descripción">
            <textarea value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Objetivo, observaciones…"
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
          </FormGroup>
          <FormGroup label="Asignar a miembro">
            <select value={pMember} onChange={e => setPMember(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">— Guardar como plantilla —</option>
              {MEMBERS.map(m => <option key={m.name}>{m.name}</option>)}
            </select>
          </FormGroup>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button onClick={() => setPlanModalOpen(false)}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, cursor: 'pointer', background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border2)', fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button onClick={guardarPlan}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, cursor: 'pointer', background: 'var(--accent)', color: '#000', border: 'none', fontFamily: 'inherit' }}>
              Crear plan
            </button>
          </div>
        </Modal>
      )}

      {/* Note Modal */}
      {noteModalOpen && (
        <Modal onClose={() => setNoteModalOpen(false)} title="Nueva nota de seguimiento">
          <FormGroup label="Miembro">
            <select value={nMember} onChange={e => setNMember(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              {MEMBERS.map(m => <option key={m.name}>{m.name}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Nota *">
            <textarea value={nText} onChange={e => setNText(e.target.value)} placeholder="Ej. Mejoró técnica en sentadilla. Aumentar peso la próxima sesión."
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
          </FormGroup>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button onClick={() => setNoteModalOpen(false)}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, cursor: 'pointer', background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border2)', fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button onClick={guardarNota}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, cursor: 'pointer', background: 'var(--accent)', color: '#000', border: 'none', fontFamily: 'inherit' }}>
              Guardar nota
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Helpers ── */

function HeroStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function MetricCard({ color, label, value, sub }: { color: string; label: string; value: number; sub: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em', color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function FormGroup({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

function Modal({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border2)',
        borderRadius: 'var(--radius)', width: 480, maxWidth: '95vw', maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontFamily: 'inherit' }}>✕</button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'var(--surface2)', border: '1px solid var(--border2)',
  color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
  padding: '9px 12px', borderRadius: 'var(--radius-sm)',
  outline: 'none', width: '100%',
};
