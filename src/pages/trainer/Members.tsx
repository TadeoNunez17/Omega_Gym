import { useEffect, useState } from 'react';
import { trainerService, type TrainerMember } from '@/services/trainer.service';

const AVATAR_COLORS = [
  { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  { bg: 'rgba(244,114,182,0.15)', fg: '#f472b6' },
  { bg: 'rgba(168,85,247,0.15)', fg: '#c084fc' },
  { bg: 'rgba(251,146,60,0.15)', fg: '#fb923c' },
  { bg: 'rgba(20,184,166,0.15)', fg: '#2dd4bf' },
  { bg: 'rgba(236,72,153,0.15)', fg: '#f472b6' },
  { bg: 'rgba(34,197,94,0.15)', fg: '#4ade80' },
];

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function TrainerMembersPage() {
  const [members, setMembers] = useState<TrainerMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    trainerService.getMembers()
      .then(setMembers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const selected = selectedId ? members.find(m => m.id === selectedId) : null;

  if (loading) {
    return <div style={{ padding: 28, fontSize: 14, color: 'var(--text-3)' }}>Cargando miembros…</div>;
  }

  if (error) {
    return <div style={{ padding: 28, fontSize: 14, color: 'var(--red-text)' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px clamp(16px, 4vw, 28px)', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
            Omega Gym <span style={{ color: 'var(--text-2)' }}>›</span> <span style={{ color: 'var(--text-2)' }}>Mis miembros</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{members.length} miembros en total</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, flex: 1 }} className="lg:grid-cols-[1fr_340px]">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', alignSelf: 'flex-start' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Miembro', 'Membresía', 'Plan', 'Estado', ''].map(h => (
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
                {members.map((m, i) => {
                  const isSel = selectedId === m.id;
                  const ac = getAvatarColor(i);
                  return (
                    <tr key={m.id} onClick={() => setSelectedId(isSel ? null : m.id)}
                      style={{ cursor: 'pointer', transition: 'background 0.12s', background: isSel ? 'var(--accent-dim)' : 'transparent' }}>
                      <td style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: ac.bg, color: ac.fg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 600, flexShrink: 0,
                          }}>{initials(m.full_name)}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{m.full_name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
                        {m.membership ? (
                          m.membership.days_remaining <= 7 ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px',
                              borderRadius: 100, fontSize: 11, fontWeight: 500,
                              background: 'var(--amber-bg)', color: 'var(--amber-text)',
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)' }}></span>
                              {m.membership.days_remaining}d
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px',
                              borderRadius: 100, fontSize: 11, fontWeight: 500,
                              background: 'var(--green-bg)', color: 'var(--green-text)',
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }}></span>
                              {m.membership.type}
                            </span>
                          )
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px',
                            borderRadius: 100, fontSize: 11, fontWeight: 500,
                            background: 'var(--surface2)', color: 'var(--text-3)',
                            border: '1px dashed var(--border2)',
                          }}>Sin membresía</span>
                        )}
                      </td>
                      <td style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
                        {m.plan ? (
                          <span style={{
                            background: 'var(--purple-bg)', color: 'var(--purple-text)',
                            borderRadius: 'var(--radius-sm)', fontFamily: "'DM Mono', monospace",
                            padding: '2px 8px', fontSize: 11,
                          }}>{m.plan.name}</span>
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
                        <button className="w-12 sm:w-9 h-12 sm:h-9 [&>svg]:w-[22px] [&>svg]:h-[22px] sm:[&>svg]:w-4 sm:[&>svg]:h-4" style={{
                          borderRadius: 'var(--radius-sm)',
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

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', alignSelf: 'flex-start' }}>
          {!selected ? (
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
              <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>Haz clic en cualquier fila para ver su detalle completo.</div>
            </div>
          ) : (
            <MemberDetail member={selected} />
          )}
        </div>
      </div>
    </div>
  );
}

function MemberDetail({ member }: { member: TrainerMember }) {
  const ac = getAvatarColor(0);

  return (
    <>
      <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: ac.bg, color: ac.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 600,
        }}>{initials(member.full_name)}</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{member.full_name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{member.email}</div>
        {member.membership && (
          <div>
            {member.membership.days_remaining <= 7 ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--amber-bg)', color: 'var(--amber-text)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)' }}></span>Vence en {member.membership.days_remaining} días
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--green-bg)', color: 'var(--green-text)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }}></span>{member.membership.type} activa
              </span>
            )}
          </div>
        )}
      </div>

      {member.membership && (
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 10 }}>Membresía</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Tipo</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{member.membership.type}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Días restantes</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: member.membership.days_remaining <= 7 ? 'var(--amber-text)' : 'var(--green-text)' }}>{member.membership.days_remaining} días</span>
          </div>
          <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: member.membership.days_remaining <= 7 ? 'var(--amber)' : 'var(--accent)',
              width: `${Math.max(5, Math.min(100, Math.round((member.membership.days_remaining / 90) * 100)))}%`,
            }} />
          </div>
        </div>
      )}

      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 10 }}>Plan de entrenamiento</div>
        {member.plan ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Plan activo</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--purple-text)' }}>{member.plan.name}</span>
            </div>
            {member.plan.description && (
              <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, marginTop: 4 }}>{member.plan.description}</div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '4px 0' }}>Sin plan asignado</div>
        )}
      </div>

      <div style={{ padding: '14px 18px' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 10 }}>Información</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Teléfono</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{member.phone || '—'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Registrado</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{new Date(member.created_at).toLocaleDateString('es-MX')}</span>
        </div>
      </div>
    </>
  );
}
