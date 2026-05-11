'use client';

import { useState, useEffect } from 'react';

interface CheckEvent {
  name: string; av: string; avC: string; time: string;
}

const SCENARIOS: Record<string, {
  name?: string; av?: string; avC?: string;
  status: 'success'|'warn'|'error';
  badge: string; badgeText: string; msg: string; sub: string;
}> = {
  success: {
    name:'Carlos Ramírez', av:'CR', avC:'av-0',
    status:'success', badge:'rb-ok', badgeText:'Entrada registrada',
    msg:'Bienvenido, Carlos. Tu entrada fue registrada exitosamente.',
    sub:'Membresía mensual · Válida hasta 25 may 2026',
  },
  success2: {
    name:'Sofía López', av:'SL', avC:'av-1',
    status:'success', badge:'rb-ok', badgeText:'Entrada registrada',
    msg:'Bienvenida, Sofía. Tu entrada fue registrada exitosamente.',
    sub:'Membresía trimestral · Válida hasta 1 jun 2026',
  },
  warn: {
    name:'Luis Medina', av:'LM', avC:'av-4',
    status:'warn', badge:'rb-warn', badgeText:'Membresía vencida',
    msg:'Luis, tu membresía venció el 20 de abril. Acércate a recepción para renovarla.',
    sub:'Acceso restringido hasta renovar membresía.',
  },
  error: {
    status:'error', badge:'rb-err', badgeText:'No reconocido',
    msg:'La huella no coincide con ningún miembro registrado.',
    sub:'Intenta de nuevo o acércate a recepción.',
  },
  inactive: {
    name:'Jorge Nava', av:'JN', avC:'av-2',
    status:'error', badge:'rb-err', badgeText:'Miembro inactivo',
    msg:'Jorge, tu cuenta está inactiva. Contacta a recepción para más información.',
    sub:'Acceso no permitido.',
  },
  manual: {
    status:'error', badge:'rb-warn', badgeText:'Acceso manual',
    msg:'Modo de acceso manual. Por favor identifícate en recepción.',
    sub:'Un administrador habilitará el acceso.',
  },
};

const AV_STYLES: Record<string, { bg: string; fg: string }> = {
  'av-0': { bg: 'rgba(59,130,246,0.2)', fg: '#60a5fa' },
  'av-1': { bg: 'rgba(16,185,129,0.2)', fg: '#34d399' },
  'av-2': { bg: 'rgba(244,114,182,0.2)', fg: '#f472b6' },
  'av-4': { bg: 'rgba(251,146,60,0.2)', fg: '#fb923c' },
};

export default function CheckInKioskPage() {
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sensorState, setSensorState] = useState<'idle'|'scanning'|'success'|'error'|'warn'>('idle');
  const [result, setResult] = useState<typeof SCENARIOS[keyof typeof SCENARIOS] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [recent, setRecent] = useState<CheckEvent[]>([]);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  function simular(tipo: string) {
    if (scanning) return;
    setScanning(true);
    const sc = SCENARIOS[tipo];
    if (!sc) return;

    setSensorState('scanning');
    setResult(null);
    setTimeout(() => {
      setSensorState(sc.status as any);
      setResult(sc);

      if (sc.status === 'success' && sc.name) {
        const ts = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        setRecent(prev => [{ name: sc.name!, av: sc.av!, avC: sc.avC!, time: ts }, ...prev].slice(0, 20));
      }

      setTimeout(() => {
        setSensorState('idle');
        setResult(null);
        setScanning(false);
      }, 4000);
    }, 2000);
  }

  const resultCard = result ? (
    result.name ? (
      <div style={{
        background: result.status === 'success' ? 'rgba(34,197,94,0.04)' : result.status === 'warn' ? 'rgba(245,158,11,0.04)' : 'rgba(239,68,68,0.04)',
        border: `1px solid ${result.status === 'success' ? 'rgba(34,197,94,0.3)' : result.status === 'warn' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
        borderRadius: 'var(--radius)',
        padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        textAlign: 'center', minHeight: 280, justifyContent: 'center',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: (result.avC ? AV_STYLES[result.avC] : { bg: 'rgba(255,255,255,0.05)' }).bg,
          color: (result.avC ? AV_STYLES[result.avC] : { fg: '#888' }).fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 700,
        }}>{result.av}</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{result.name}</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{result.sub}</div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600,
          background: result.status === 'success' ? 'var(--green-bg)' : result.status === 'warn' ? 'var(--amber-bg)' : 'var(--red-bg)',
          color: result.status === 'success' ? 'var(--green-text)' : result.status === 'warn' ? 'var(--amber-text)' : 'var(--red-text)',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: result.status === 'success' ? 'var(--green)' : result.status === 'warn' ? 'var(--amber)' : 'var(--red)',
          }}></span>
          {result.badgeText}
        </span>
        <div style={{ fontSize: 13, lineHeight: 1.5 }}>{result.msg}</div>
        <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--text-3)' }}>
          {time?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) || ''}
        </div>
      </div>
    ) : (
      <div style={{
        background: result.status === 'error' ? 'rgba(239,68,68,0.04)' : 'rgba(245,158,11,0.04)',
        border: `1px solid ${result.status === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
        borderRadius: 'var(--radius)',
        padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        textAlign: 'center', minHeight: 280, justifyContent: 'center',
      }}>
        <div style={{ fontSize: 40 }}>{result.status === 'error' ? '❌' : '⚠️'}</div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600,
          background: result.status === 'warn' ? 'var(--amber-bg)' : 'var(--red-bg)',
          color: result.status === 'warn' ? 'var(--amber-text)' : 'var(--red-text)',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: result.status === 'warn' ? 'var(--amber)' : 'var(--red)' }}></span>
          {result.badgeText}
        </span>
        <div style={{ fontSize: 13, lineHeight: 1.5 }}>{result.msg}</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{result.sub}</div>
        <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--text-3)' }}>
          {time?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) || ''}
        </div>
      </div>
    )
  ) : null;

  return (
    <div suppressHydrationWarning style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      background: '#0a0a0a', color: 'var(--text)',
      fontFamily: "'DM Sans', sans-serif",
      display: 'grid', gridTemplateRows: 'auto 1fr auto',
    }}>
      <style>{`
        @keyframes scanDown { 0%{top:5%} 100%{top:95%} }
      `}</style>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--accent)', borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
              <path d="M6 6h1v12H6M17 6h1v12h-1M3 9h3M18 9h3M3 15h3M18 15h3M9 12h6"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Omega Gym</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>Check-in con huella dactilar</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--green-text)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }}></span>
            Lector activo
          </div>
          <div suppressHydrationWarning>
            <div style={{ fontSize: 22, fontWeight: 600, fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em', color: 'var(--text-2)' }}>
              {mounted && time ? time.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'right' }}>
              {mounted && time ? time.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Center */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, padding: 40 }}>
        {/* Sensor */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <div style={{
            width: 260, height: 260, borderRadius: '50%',
            border: `2px solid ${
              sensorState === 'scanning' ? 'var(--accent)' :
              sensorState === 'success' ? 'var(--green)' :
              sensorState === 'error' || sensorState === 'warn' ? sensorState === 'warn' ? 'var(--amber)' : 'var(--red)' :
              'var(--border2)'
            }`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', transition: 'border-color 0.4s',
          }}>
            {sensorState === 'scanning' && (
              <div style={{
                position: 'absolute', inset: -8, borderRadius: '50%',
                border: '2px solid transparent',
                borderTopColor: 'var(--accent)',
              }} />
            )}
            <div style={{
              width: 200, height: 200, borderRadius: '50%',
              background: sensorState === 'scanning' ? 'rgba(232,255,71,0.04)' :
                          sensorState === 'success' ? 'rgba(34,197,94,0.08)' :
                          sensorState === 'error' ? 'rgba(239,68,68,0.08)' :
                          sensorState === 'warn' ? 'rgba(245,158,11,0.08)' :
                          'var(--surface)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 16, position: 'relative', overflow: 'hidden',
              transition: 'background 0.4s',
            }}>
              {sensorState === 'scanning' && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, height: 3,
                  background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                  animation: 'scanDown 1.5s ease-in-out infinite',
                }} />
              )}

              {sensorState === 'success' ? (
                <svg viewBox="0 0 60 60" fill="none" width="60" height="60">
                  <circle cx="30" cy="30" r="28" stroke="#4ade80" strokeWidth="2.5"/>
                  <polyline points="18,30 26,38 42,22" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : sensorState === 'error' ? (
                <svg viewBox="0 0 60 60" fill="none" width="60" height="60">
                  <circle cx="30" cy="30" r="28" stroke="#f87171" strokeWidth="2.5"/>
                  <line x1="20" y1="20" x2="40" y2="40" stroke="#f87171" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="40" y1="20" x2="20" y2="40" stroke="#f87171" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              ) : sensorState === 'warn' ? (
                <svg viewBox="0 0 60 60" fill="none" width="60" height="60">
                  <circle cx="30" cy="30" r="28" stroke="#fbbf24" strokeWidth="2.5"/>
                  <line x1="30" y1="18" x2="30" y2="34" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="30" cy="42" r="2" fill="#fbbf24"/>
                </svg>
              ) : (
                <svg viewBox="0 0 90 90" fill="none" width="90" height="90" style={{ transition: 'all 0.4s' }}>
                  <path d="M45 12C27.3 12 13 26.3 13 44" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M45 12C62.7 12 77 26.3 77 44" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M45 22C32 22 22 32 22 44" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M45 22C58 22 68 32 68 44" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M45 32C38 32 32 38 32 44" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M45 32C52 32 58 38 58 44" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M45 32 L45 78" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M22 44 C22 62 30 74 45 78" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M68 44 C68 62 60 74 45 78" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M32 44 C32 58 37 68 45 74" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M58 44 C58 58 53 68 45 74" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              )}

              <div style={{
                fontSize: 14, fontWeight: 500, textAlign: 'center',
                color: sensorState === 'scanning' ? 'var(--accent)' :
                       sensorState === 'success' ? 'var(--green-text)' :
                       sensorState === 'error' ? 'var(--red-text)' :
                       sensorState === 'warn' ? 'var(--amber-text)' :
                       'var(--text-3)',
                transition: 'color 0.4s',
              }}>
                {sensorState === 'idle' ? 'Listo' : sensorState === 'scanning' ? 'Leyendo huella…' : sensorState === 'success' ? '¡Bienvenido!' : sensorState === 'warn' ? 'Atención' : 'No reconocido'}
              </div>
            </div>
          </div>

          <div style={{
            fontSize: 15, fontWeight: 600, color: 'var(--text-3)',
            textAlign: 'center', maxWidth: 240, lineHeight: 1.4,
            transition: 'color 0.4s',
          }}>
            {sensorState === 'idle' ? 'Coloca tu dedo sobre el lector para registrar tu entrada' :
             sensorState === 'scanning' ? 'Mantén el dedo quieto…' :
             sensorState === 'success' ? 'Puedes pasar. ¡Buen entrenamiento!' :
             sensorState === 'warn' ? 'Acércate a recepción.' :
             'No se pudo identificar la huella.'}
          </div>
        </div>

        {/* Right side */}
        <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Result card */}
          {resultCard || (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: 28,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              textAlign: 'center', minHeight: 280, justifyContent: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 4 }}>🏋️</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-2)' }}>Esperando identificación</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>Acerca tu dedo al lector de huella para registrar tu entrada o salida del gym.</div>
            </div>
          )}

          {/* Recent */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-3)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Entradas recientes de hoy</span>
              <span style={{ color: 'var(--green-text)', fontWeight: 500 }}>{recent.length}</span>
            </div>
            {recent.length === 0 ? (
              <div style={{ padding: '16px 18px', fontSize: 12, color: 'var(--text-3)' }}>Sin registros aún.</div>
            ) : (
              <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                {recent.map((r, i) => {
                  const av = AV_STYLES[r.avC] || { bg: 'rgba(255,255,255,0.05)', fg: '#888' };
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: av.bg, color: av.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{r.av}</div>
                      <div style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{r.name}</div>
                      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--text-3)' }}>{r.time}</div>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demo buttons */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', padding: '14px 32px',
        background: 'rgba(232,255,71,0.03)', borderTop: '1px solid rgba(232,255,71,0.1)',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-3)', alignSelf: 'center', marginRight: 4 }}>Simular lectura:</span>
        <DemoBtn color="g" onClick={() => simular('success')}>✓ Huella reconocida (Carlos)</DemoBtn>
        <DemoBtn color="g" onClick={() => simular('success2')}>✓ Huella reconocida (Sofía)</DemoBtn>
        <DemoBtn color="a" onClick={() => simular('warn')}>⚠ Membresía vencida</DemoBtn>
        <DemoBtn color="r" onClick={() => simular('error')}>✕ Huella no reconocida</DemoBtn>
        <DemoBtn color="r" onClick={() => simular('inactive')}>✕ Miembro inactivo</DemoBtn>
      </div>

      {/* Bottom bar */}
      <div style={{
        padding: '14px 32px', borderTop: '1px solid var(--border)',
        background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
          Omega Gym · Terminal de check-in · Registros guardados en <code style={{ fontSize: 11, background: 'var(--surface2)', padding: '1px 6px', borderRadius: 4, color: 'var(--text-2)' }}>check_ins</code> · Supabase
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => simular('manual')}
            style={{ fontSize: 12, padding: '7px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Acceso manual
          </button>
          <button onClick={() => window.location.reload()}
            style={{ fontSize: 12, padding: '7px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Reiniciar terminal
          </button>
        </div>
      </div>
    </div>
  );
}

function DemoBtn({ children, color, onClick }: { children: React.ReactNode; color: 'g'|'r'|'a'; onClick: () => void }) {
  const colors: Record<string, React.CSSProperties> = {
    g: { borderColor: 'rgba(34,197,94,0.3)', color: 'var(--green-text)' },
    r: { borderColor: 'rgba(239,68,68,0.3)', color: 'var(--red-text)' },
    a: { borderColor: 'rgba(245,158,11,0.3)', color: 'var(--amber-text)' },
  };
  return (
    <button onClick={onClick}
      style={{
        fontSize: 11, padding: '6px 12px', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border2)', background: 'transparent',
        color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'inherit',
        ...colors[color],
      }}>
      {children}
    </button>
  );
}
