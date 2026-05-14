import { useState } from 'react';

const TODAY = new Date('2026-05-01');
const DAY_NAMES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

interface Exercise { name: string; muscle: string; sets: number; reps: number; rest: number; nota: string; }

const PLAN: Record<number, Exercise[] | null> = {
  0: [
    { name: 'Press de banca plano', muscle: 'Pecho', sets: 4, reps: 10, rest: 90, nota: 'Barra olímpica' },
    { name: 'Press inclinado mancuernas', muscle: 'Pecho', sets: 3, reps: 12, rest: 60, nota: '' },
    { name: 'Aperturas con cable', muscle: 'Pecho', sets: 3, reps: 15, rest: 60, nota: 'Cable cruzado' },
    { name: 'Fondos en paralelas', muscle: 'Tríceps', sets: 3, reps: 12, rest: 60, nota: '' },
    { name: 'Extensión de tríceps polea', muscle: 'Tríceps', sets: 4, reps: 12, rest: 60, nota: '' },
  ],
  1: [
    { name: 'Jalón al pecho', muscle: 'Espalda', sets: 4, reps: 10, rest: 90, nota: 'Agarre ancho' },
    { name: 'Remo con barra', muscle: 'Espalda', sets: 4, reps: 10, rest: 90, nota: '' },
    { name: 'Remo con mancuerna', muscle: 'Espalda', sets: 3, reps: 12, rest: 60, nota: 'Apoyo en banco' },
    { name: 'Curl de bíceps barra', muscle: 'Bíceps', sets: 3, reps: 12, rest: 60, nota: '' },
    { name: 'Curl martillo', muscle: 'Bíceps', sets: 3, reps: 12, rest: 60, nota: '' },
  ],
  2: [
    { name: 'Sentadilla libre', muscle: 'Cuádriceps', sets: 4, reps: 8, rest: 120, nota: 'Prioridad técnica' },
    { name: 'Prensa de piernas', muscle: 'Cuádriceps', sets: 3, reps: 12, rest: 90, nota: '' },
    { name: 'Extensión de cuádriceps', muscle: 'Cuádriceps', sets: 3, reps: 15, rest: 60, nota: '' },
    { name: 'Curl femoral tumbado', muscle: 'Isquiotibiales', sets: 4, reps: 12, rest: 60, nota: '' },
    { name: 'Pantorrillas de pie', muscle: 'Gemelos', sets: 4, reps: 20, rest: 45, nota: '' },
  ],
  3: [
    { name: 'Press militar barra', muscle: 'Deltoides', sets: 4, reps: 10, rest: 90, nota: '' },
    { name: 'Elevaciones laterales', muscle: 'Deltoides', sets: 4, reps: 15, rest: 60, nota: '' },
    { name: 'Pájaro con mancuernas', muscle: 'Deltoides posterior', sets: 3, reps: 15, rest: 60, nota: '' },
    { name: 'Encogimientos de hombros', muscle: 'Trapecios', sets: 3, reps: 12, rest: 60, nota: '' },
    { name: 'Plancha abdominal', muscle: 'Core', sets: 3, reps: 60, rest: 45, nota: 'Segundos' },
  ],
  4: [
    { name: 'Peso muerto convencional', muscle: 'Espalda baja', sets: 3, reps: 8, rest: 120, nota: 'Técnica perfecta' },
    { name: 'Dominadas asistidas', muscle: 'Espalda', sets: 3, reps: 8, rest: 90, nota: '' },
    { name: 'Hip thrust', muscle: 'Glúteo', sets: 4, reps: 12, rest: 60, nota: '' },
    { name: 'Abdominales en polea', muscle: 'Core', sets: 3, reps: 15, rest: 45, nota: '' },
  ],
  5: null,
  6: null,
};

const PAGOS = [
  { mes: 'abr 2026', date: '01 abr 2026', monto: 350, metodo: 'Efectivo' },
  { mes: 'mar 2026', date: '01 mar 2026', monto: 350, metodo: 'Transferencia' },
  { mes: 'feb 2026', date: '01 feb 2026', monto: 350, metodo: 'Efectivo' },
];

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: 860, margin: '0 auto', padding: '32px 24px 60px' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' },
  cardTitle: { fontSize: 13, fontWeight: 600 },
  cardSub: { fontSize: 11, color: 'var(--text-3)', marginTop: 2 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500 },
  divider: { height: 1, background: 'var(--border)', margin: '0 -20px' },
  chipVal: { fontSize: 14, fontWeight: 600, fontFamily: "'DM Mono', monospace", lineHeight: 1 },
  chipLabel: { fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 },
};

export default function MyPlanPage() {
  const [day, setDay] = useState(0);
  const exercises = PLAN[day];
  const isRest = exercises === null;

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 28, marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 600, flexShrink: 0,
          }}>CR</div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Bienvenido de vuelta</div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>Carlos Ramírez</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>carlos@correo.com · Miembro desde ene 2026</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--accent)' }}>24</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Días restantes</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--green-text)' }}>5</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Ejercicios hoy</div>
          </div>
        </div>
      </div>

      {/* Grid 2 */}
      <div style={s.grid2}>
        {/* Membresía */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div>
              <div style={s.cardTitle}>Mi membresía</div>
              <div style={s.cardSub}>Estado actual de tu suscripción</div>
            </div>
            <span style={{ ...s.badge, background: 'var(--green-bg)', color: 'var(--green-text)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }}></span>Activa
            </span>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              ['Tipo de plan', 'Mensual'],
              ['Fecha de inicio', '01 abr 2026'],
              ['Fecha de vencimiento', '25 may 2026'],
              ['Último pago', '$350 · efectivo'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 500, fontFamily: "'DM Mono', monospace" }}>{v}</span>
              </div>
            ))}
            <div style={s.divider} />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Progreso de membresía</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)' }}>80%</span>
              </div>
              <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: 'var(--accent)', width: '80%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: "'DM Mono', monospace" }}>01 abr</span>
                <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: "'DM Mono', monospace" }}>25 may</span>
              </div>
            </div>
          </div>
        </div>

        {/* Entrenador */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div>
              <div style={s.cardTitle}>Tu entrenador</div>
              <div style={s.cardSub}>Encargado de tu plan</div>
            </div>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(244,114,182,0.15)', color: '#f472b6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 600, flexShrink: 0,
              }}>MT</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Miguel Torres</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Entrenador certificado</div>
              </div>
            </div>
            <ContactItem icon="phone" label="Teléfono" value="313 567 8901" />
            <ContactItem icon="email" label="Email" value="miguel@omegagym.com" />
            <ContactItem icon="clock" label="Horario de atención" value="Lun – Vie · 7:00 am – 2:00 pm" />
          </div>
        </div>
      </div>

      {/* Plan de entrenamiento */}
      <div style={{ ...s.card, marginBottom: 20 }}>
        <div style={s.cardHeader}>
          <div>
            <div style={s.cardTitle}>Mi plan de entrenamiento</div>
            <div style={s.cardSub}>Fuerza A · Asignado por Miguel Torres</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'var(--accent-dim)', color: 'var(--accent)',
              fontSize: 10, fontWeight: 500, padding: '2px 8px',
              borderRadius: 100, marginTop: 4,
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Activo
            </div>
          </div>
        </div>

        {/* Day tabs */}
        <div style={{ display: 'flex', gap: 6, padding: '16px 20px', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {DAY_NAMES.map((d, i) => (
            <button key={d} onClick={() => setDay(i)}
              style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: i === day ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: i === day ? 'var(--accent)' : 'transparent',
                color: i === day ? '#000' : PLAN[i] === null ? 'var(--text-3)' : 'var(--text-2)',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
              {d}
            </button>
          ))}
        </div>

        {/* Exercises or rest */}
        {isRest ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 36 }}>🧘</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Día de descanso</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>El descanso es parte del entrenamiento. Descansa, hidrátate y recupera.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {exercises.map((e, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 20px', borderBottom: i < exercises.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.12s', cursor: 'default',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--surface2)', border: '1px solid var(--border2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600, color: 'var(--text-3)', flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{e.muscle}{e.nota ? ` · ${e.nota}` : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Chip value={e.sets} label="Series" accent />
                  <Chip value={e.reps} label="Reps" />
                  <Chip value={`${e.rest}s`} label="Descanso" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid 2: pagos + renovación */}
      <div style={s.grid2}>
        {/* Historial pagos */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div>
              <div style={s.cardTitle}>Historial de pagos</div>
              <div style={s.cardSub}>Últimas transacciones</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {PAGOS.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 20px', borderBottom: i < PAGOS.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--green-bg)', color: 'var(--green-text)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Mensual · {p.mes}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{p.date}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono', monospace", color: 'var(--green-text)' }}>${p.monto}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{p.metodo}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Renovación + horarios */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}>Próxima renovación</div>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 'var(--radius-sm)', padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--amber-text)',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Tu membresía vence el <strong>&nbsp;25 de mayo de 2026</strong>&nbsp;— 24 días restantes.
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                Para renovar acércate al gym o comunícate con tu entrenador. Acepta: efectivo, tarjeta o transferencia.
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <span style={{ color: 'var(--text-3)' }}>Siguiente periodo</span>
                <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>25 may → 25 jun 2026</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-3)' }}>Costo estimado</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>$350</span>
              </div>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}>Horario del gym</div>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Lunes – Viernes', '6:00 – 22:00', 'var(--text-2)'],
                ['Sábados', '7:00 – 18:00', 'var(--text-2)'],
                ['Domingos', 'Cerrado', 'var(--red-text)'],
              ].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-3)' }}>{l}</span>
                  <span style={{ color: c, fontFamily: "'DM Mono', monospace" }}>{v}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }}></div>
                <span style={{ fontSize: 11, color: 'var(--green-text)' }}>Abierto ahora</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
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

function ContactItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  const paths: Record<string, string> = {
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>',
    email: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 'var(--radius-sm)',
        background: 'var(--surface2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"
          dangerouslySetInnerHTML={{ __html: paths[icon] || '' }} style={{ color: 'var(--text-3)' }} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{value}</div>
      </div>
    </div>
  );
}
