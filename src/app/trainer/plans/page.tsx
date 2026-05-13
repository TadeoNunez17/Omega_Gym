'use client';

import { useEffect, useState } from 'react';
import { trainerService, type TrainerMember, type TrainerPlan } from '@/services/trainer.service';

const ICON_COLORS = [
  { bg: 'rgba(168,85,247,0.1)', fg: '#c084fc' },
  { bg: 'rgba(59,130,246,0.1)', fg: '#60a5fa' },
  { bg: 'rgba(34,197,94,0.1)', fg: '#4ade80' },
  { bg: 'rgba(236,72,153,0.1)', fg: '#f472b6' },
  { bg: 'rgba(251,146,60,0.1)', fg: '#fb923c' },
];

const PLAN_ICONS = [
  '<path d="M9 11l3 3L22 4"/>',
  '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>',
];

export default function TrainerPlansPage() {
  const [plans, setPlans] = useState<TrainerPlan[]>([]);
  const [members, setMembers] = useState<TrainerMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pMember, setPMember] = useState('');

  useEffect(() => {
    Promise.all([
      trainerService.getPlans(),
      trainerService.getMembers(),
    ])
      .then(([plansData, membersData]) => {
        setPlans(plansData);
        setMembers(membersData);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!pName.trim()) return;
    try {
      const plan = await trainerService.createPlan({
        name: pName.trim(),
        description: pDesc.trim() || undefined,
        assigned_to: pMember || undefined,
      });
      setPlans([plan, ...plans]);
      setModalOpen(false);
      setPName('');
      setPDesc('');
      setPMember('');
    } catch (e: any) {
      alert('Error al crear plan: ' + e.message);
    }
  }

  if (loading) {
    return <div style={{ padding: 28, fontSize: 14, color: 'var(--text-3)' }}>Cargando planes…</div>;
  }

  if (error) {
    return <div style={{ padding: 28, fontSize: 14, color: 'var(--red-text)' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
            Omega Gym <span style={{ color: 'var(--text-2)' }}>›</span> <span style={{ color: 'var(--text-2)' }}>Mis planes</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{plans.length} planes de entrenamiento</div>
        </div>
        <button onClick={() => setModalOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 'var(--radius-sm)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: 'var(--accent)', color: '#000',
            border: 'none', fontFamily: 'inherit',
          }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo plan
        </button>
      </header>

      {plans.length === 0 ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 48, gap: 12, textAlign: 'center',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" style={{ opacity: 0.4 }}>
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>No tienes planes aún</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', maxWidth: 300 }}>Crea tu primer plan de entrenamiento y asígnaselo a uno de tus miembros.</div>
          <button onClick={() => setModalOpen(true)}
            style={{
              marginTop: 8, padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13,
              fontWeight: 500, cursor: 'pointer', background: 'var(--accent)', color: '#000',
              border: 'none', fontFamily: 'inherit',
            }}>
            + Crear plan
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {plans.map((p, i) => {
            const ic = ICON_COLORS[i % ICON_COLORS.length];
            return (
              <div key={p.id} style={{
                padding: '14px 18px', borderBottom: i < plans.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                  background: ic.bg, color: ic.fg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
                    dangerouslySetInnerHTML={{ __html: PLAN_ICONS[i % PLAN_ICONS.length] }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, display: 'flex', gap: 12 }}>
                    {p.assigned_to_name && <span>Asignado a: {p.assigned_to_name}</span>}
                    <span>{p.exercise_count} ejercicio{p.exercise_count !== 1 ? 's' : ''}</span>
                    {p.description && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{p.description}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'DM Mono', monospace" }}>
                    {new Date(p.created_at).toLocaleDateString('es-MX')}
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
      )}

      {modalOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 'var(--radius)', width: 480, maxWidth: '95vw',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Nuevo plan de entrenamiento</div>
              <button onClick={() => setModalOpen(false)}
                style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontFamily: 'inherit' }}>✕</button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FormGroup label="Nombre del plan *">
                <input value={pName} onChange={e => setPName(e.target.value)} placeholder="Ej. Fuerza C — Avanzado"
                  style={inputStyle} />
              </FormGroup>
              <FormGroup label="Descripción">
                <textarea value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Objetivo, observaciones…"
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
              </FormGroup>
              <FormGroup label="Asignar a miembro">
                <select value={pMember} onChange={e => setPMember(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">— Sin asignar —</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </FormGroup>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button onClick={() => setModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, cursor: 'pointer', background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border2)', fontFamily: 'inherit' }}>
                  Cancelar
                </button>
                <button onClick={handleCreate}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, cursor: 'pointer', background: 'var(--accent)', color: '#000', border: 'none', fontFamily: 'inherit' }}>
                  Crear plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

const inputStyle: React.CSSProperties = {
  background: 'var(--surface2)', border: '1px solid var(--border2)',
  color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
  padding: '9px 12px', borderRadius: 'var(--radius-sm)',
  outline: 'none', width: '100%',
};
