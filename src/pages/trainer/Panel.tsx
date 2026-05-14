import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store'
import { membersService, type MemberListItem } from '@/services/members.service'
import { trainingService, type TrainingPlan, type PlanListItem } from '@/services/training.service'
import { membershipsService } from '@/services/memberships.service'
import { Button } from '@/components/ui/atoms/Button'
import { Input, Select, Textarea } from '@/components/ui/atoms/Input'
import { Modal } from '@/components/ui/molecules/Modal'

const AV_COLORS = [
  { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  { bg: 'rgba(244,114,182,0.15)', fg: '#f472b6' },
  { bg: 'rgba(168,85,247,0.15)', fg: '#c084fc' },
  { bg: 'rgba(251,146,60,0.15)', fg: '#fb923c' },
  { bg: 'rgba(20,184,166,0.15)', fg: '#2dd4bf' },
]

function colorForName(name: string) {
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AV_COLORS.length
  return AV_COLORS[idx]
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'
}

interface NoteItem {
  member: string
  avC: number
  av: string
  text: string
  time: string
}

interface PanelMember {
  id: string
  name: string
  email: string
  av: string
  avC: number
  membresia: string
  memDays: number
  plan: string | null
  status: string
}

interface PanelPlan {
  id: string
  name: string
  members: string[]
  days: number
}

export default function TrainerPanelPage() {
  const user = useAuthStore(s => s.user)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [plans, setPlans] = useState<PanelPlan[]>([]);
  const [members, setMembers] = useState<PanelMember[]>([]);
  const [expiringCount, setExpiringCount] = useState(0)
  const [loading, setLoading] = useState(true);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pMemberId, setPMemberId] = useState('');
  const [nMember, setNMember] = useState('');
  const [nText, setNText] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [membersData, plansData, expiring] = await Promise.all([
          membersService.getAll({ role: 'member', pageSize: 200 }),
          trainingService.getAll({ pageSize: 200 }),
          membershipsService.getExpiring(7),
        ])

        setMembers(membersData.data.map((m: MemberListItem) => ({
          id: m.id,
          name: m.full_name,
          email: m.email || '',
          av: initials(m.full_name),
          avC: m.full_name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AV_COLORS.length,
          membresia: m.membership_type || '—',
          memDays: m.membership_end ? Math.max(0, Math.round((new Date(m.membership_end).getTime() - Date.now()) / 86400000)) : 0,
          plan: m.plan_name || null,
          status: m.is_active ? 'active' : 'inactive',
        })))

        setPlans(plansData.data.map((p: PlanListItem) => ({
          id: p.id,
          name: p.name,
          members: p.member_name ? [p.member_name] : [],
          days: p.days || 5,
        })))

        setExpiringCount(expiring.length)
      } catch (err) {
        console.error('Error loading panel data:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const m = selectedIdx !== null ? members[selectedIdx] : null;

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
      })

      setPlans(prev => [...prev, {
        id: plan.id,
        name: plan.name,
        members: pMemberId
          ? [members.find(m => m.id === pMemberId)?.name || 'Miembro']
          : [],
        days: 5,
      }])

      setPlanModalOpen(false);
      setPName(''); setPDesc(''); setPMemberId('');
    } catch (err) {
      console.error('Error creating plan:', err)
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

  const withPlanCount = members.filter(m => m.plan).length
  const planCount = plans.length

  const planIcons = [
    '<path d="M9 11l3 3L22 4"/>',
    '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>',
  ]

  const iconColors: Record<string, {bg: string;fg: string}> = {
    'pi-purple': { bg: 'rgba(168,85,247,0.1)', fg: '#c084fc' },
    'pi-blue': { bg: 'rgba(59,130,246,0.1)', fg: '#60a5fa' },
    'pi-green': { bg: 'rgba(34,197,94,0.1)', fg: '#4ade80' },
    'pi-pink': { bg: 'rgba(236,72,153,0.1)', fg: '#f472b6' },
  }

  const trainerInitials = user ? initials(user.full_name) : '??'
  const trainerName = user?.full_name || 'Entrenador'
  const trainerEmail = user?.email || ''

  return (
    <div style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-3)', fontSize: 14 }}>
          Cargando panel...
        </div>
      ) : (
        <>
          {/* Breadcrumb header */}
          <header style={{
            padding: '0 28px', height: 58,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)', background: 'var(--bg)',
            position: 'sticky', top: 0, zIndex: 9,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
              Omega Gym
              <span style={{ fontSize: 10 }}>›</span>
              <span style={{ color: 'var(--text-2)' }}>Mi panel</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" size="sm" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>} onClick={() => setNoteModalOpen(true)}>
                Nueva nota
              </Button>
              <Button variant="ghost" size="sm" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>} onClick={() => setPlanModalOpen(true)}>
                Nuevo plan
              </Button>
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
              }}>{trainerInitials}</div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Bienvenido de vuelta</div>
                <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>{trainerName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>Entrenador · {trainerEmail}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 28 }}>
              <HeroStat value={members.length} label="Mis miembros" color="#f472b6" />
              <HeroStat value={planCount} label="Planes activos" color="#c084fc" />
              <HeroStat value={members.length - withPlanCount} label="Sin plan aún" color="#fbbf24" />
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            <MetricCard color="var(--pink)" label="Miembros registrados" value={members.length} sub="En el sistema" />
            <MetricCard color="var(--green)" label="Con plan asignado" value={withPlanCount} sub="En entrenamiento" />
            <MetricCard color="var(--purple)" label="Planes creados" value={planCount} sub="Rutinas activas" />
            <MetricCard color="var(--amber)" label="Membresías por vencer" value={expiringCount} sub="Próximos 7 días" />
          </div>

          {/* Main grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
            {/* Left: members + plans */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Members table */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Miembros</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Contacta al admin para hacer cambios</div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{members.length} miembros</span>
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
                      {members.map((mem, i) => {
                        const isSel = selectedIdx === i;
                        const c = AV_COLORS[mem.avC];
                        return (
                          <tr key={mem.id} onClick={() => selectMember(i)}
                            style={{ cursor: 'pointer', transition: 'background 0.12s', background: isSel ? 'var(--accent-dim)' : 'transparent' }}>
                            <td style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: '50%',
                                  background: c.bg, color: c.fg,
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
                              {mem.memDays <= 7 && mem.memDays > 0 ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px',
                                  borderRadius: 100, fontSize: 11, fontWeight: 500,
                                  background: 'var(--amber-bg)', color: 'var(--amber-text)',
                                }}>
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)' }}></span>
                                  {mem.memDays}d
                                </span>
                              ) : mem.memDays > 0 ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px',
                                  borderRadius: 100, fontSize: 11, fontWeight: 500,
                                  background: 'var(--green-bg)', color: 'var(--green-text)',
                                }}>
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }}></span>
                                  {mem.membresia}
                                </span>
                              ) : (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px',
                                  borderRadius: 100, fontSize: 11, fontWeight: 500,
                                  background: 'var(--red-bg)', color: 'var(--red-text)',
                                }}>
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)' }}></span>
                                  Sin membresía
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
                                background: mem.status === 'active' ? 'var(--green-bg)' : 'var(--red-bg)',
                                color: mem.status === 'active' ? 'var(--green-text)' : 'var(--red-text)',
                              }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: mem.status === 'active' ? 'var(--green)' : 'var(--red)' }}></span>
                                {mem.status === 'active' ? 'Activo' : 'Inactivo'}
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
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Planes de entrenamiento</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Planes registrados en el sistema</div>
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
                {plans.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No hay planes registrados aún.</div>
                ) : (
                  plans.map((p, i) => {
                    const iconKey = ['pi-purple', 'pi-blue', 'pi-green', 'pi-pink'][i % 4];
                    const ic = iconColors[iconKey] || iconColors['pi-purple'];
                    return (
                      <div key={p.id} style={{
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
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{p.days} días/semana · {p.members.join(', ') || 'Sin asignar'}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--text-3)' }}>
                            {p.members.length} miembro{p.members.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
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
                  <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: AV_COLORS[m.avC]?.bg, color: AV_COLORS[m.avC]?.fg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, fontWeight: 600,
                    }}>{m.av}</div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{m.email}</div>
                    <div>
                      {m.memDays > 0 && m.memDays <= 7 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--amber-bg)', color: 'var(--amber-text)' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)' }}></span>Vence en {m.memDays} días
                        </span>
                      ) : m.memDays > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--green-bg)', color: 'var(--green-text)' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }}></span>{m.membresia}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--red-bg)', color: 'var(--red-text)' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)' }}></span>Sin membresía
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 10 }}>Membresía</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Tipo</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{m.membresia}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Días restantes</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: m.memDays <= 7 && m.memDays > 0 ? 'var(--amber-text)' : m.memDays > 0 ? 'var(--green-text)' : 'var(--red-text)' }}>{m.memDays > 0 ? `${m.memDays} días` : '—'}</span>
                    </div>
                  </div>

                  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 10 }}>Plan de entrenamiento</div>
                    {m.plan ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Plan activo</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--purple-text)' }}>{m.plan}</span>
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
                      <button onClick={() => { setPlanModalOpen(true); setPMemberId(m.id) }}
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
            {notes.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Aún no hay notas de seguimiento. Crea una para comenzar.</div>
            ) : (
              notes.map((n, i) => {
                const c = AV_COLORS[n.avC];
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '12px 18px', borderBottom: i < notes.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: c.bg, color: c.fg,
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
              })
            )}
          </div>

          {/* Plan Modal */}
          <Modal open={planModalOpen} onClose={() => setPlanModalOpen(false)} title="Nuevo plan de entrenamiento" className="max-w-[400px]">
            <Input label="Nombre del plan *" value={pName} onChange={e => setPName(e.target.value)} placeholder="Ej. Fuerza C — Avanzado" />
            <Input label="Descripción" value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Objetivo, observaciones…" />
            <Select label="Asignar a miembro" value={pMemberId} onChange={e => setPMemberId(e.target.value)}>
              <option value="">— Guardar como plantilla —</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <Button variant="ghost" size="sm" onClick={() => setPlanModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={guardarPlan}>Crear plan</Button>
            </div>
          </Modal>

          {/* Note Modal */}
          <Modal open={noteModalOpen} onClose={() => setNoteModalOpen(false)} title="Nueva nota de seguimiento" className="max-w-[400px]">
            <Select label="Miembro" value={nMember} onChange={e => setNMember(e.target.value)}>
              <option value="">— Seleccionar —</option>
              {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </Select>
            <Input label="Nota *" value={nText} onChange={e => setNText(e.target.value)} placeholder="Ej. Mejoró técnica en sentadilla. Aumentar peso la próxima sesión." />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <Button variant="ghost" size="sm" onClick={() => setNoteModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={guardarNota}>Guardar nota</Button>
            </div>
          </Modal>
        </>
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

/* ── Helpers ── */
