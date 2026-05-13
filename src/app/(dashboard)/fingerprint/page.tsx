'use client';

import { useState } from 'react';

interface Member {
  name: string; email: string; av: string; avC: string; hasHuella: boolean;
}

const MEMBERS: Member[] = [
  { name:'Carlos Ramírez',  email:'carlos@correo.com',  av:'CR', avC:'av-0', hasHuella:true  },
  { name:'Sofía López',     email:'sofia@correo.com',   av:'SL', avC:'av-1', hasHuella:false },
  { name:'Ana Gutiérrez',   email:'ana@correo.com',     av:'AG', avC:'av-3', hasHuella:true  },
  { name:'Luis Medina',     email:'luis@correo.com',    av:'LM', avC:'av-4', hasHuella:false },
  { name:'Valeria Cruz',    email:'val@correo.com',     av:'VC', avC:'av-5', hasHuella:false },
  { name:'Roberto Félix',   email:'rober@correo.com',   av:'RF', avC:'av-0', hasHuella:false },
  { name:'Diana Salazar',   email:'diana@correo.com',   av:'DS', avC:'av-1', hasHuella:true  },
  { name:'Jorge Nava',      email:'jorge@correo.com',   av:'JN', avC:'av-2', hasHuella:false },
  { name:'Paola Rivas',     email:'paola@correo.com',   av:'PR', avC:'av-3', hasHuella:false },
  { name:'Héctor Gómez',    email:'hector@correo.com',  av:'HG', avC:'av-4', hasHuella:false },
];

const AV_STYLES: Record<string, { bg: string; fg: string }> = {
  'av-0': { bg: 'rgba(59,130,246,0.15)', fg: '#60a5fa' },
  'av-1': { bg: 'rgba(16,185,129,0.15)', fg: '#34d399' },
  'av-2': { bg: 'rgba(244,114,182,0.15)', fg: '#f472b6' },
  'av-3': { bg: 'rgba(168,85,247,0.15)', fg: '#c084fc' },
  'av-4': { bg: 'rgba(251,146,60,0.15)', fg: '#fb923c' },
  'av-5': { bg: 'rgba(20,184,166,0.15)', fg: '#2dd4bf' },
};

export default function FingerprintPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Member | null>(null);
  const [step, setStep] = useState(0); // 0=idle,1=scanning,2=done
  const [scans, setScans] = useState(0);
  const [sensorState, setSensorState] = useState<'idle'|'scanning'|'success'|'error'>('idle');
  const [history, setHistory] = useState<{name:string;av:string;avC:string;time:string}[]>([]);

  const filtered = MEMBERS.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.includes(search)
  );

  function selectMember(m: Member) {
    setSelected(m);
    resetScanner();
  }

  function resetScanner() {
    setStep(0);
    setScans(0);
    setSensorState('idle');
  }

  function startCapture() {
    if (!selected) return;
    setStep(1);
    setScans(0);
    setSensorState('scanning');
    let i = 0;
    const delays = [1800, 2200, 1600];
    function nextScan() {
      if (i >= 3) {
        onAllScanned();
        return;
      }
      setTimeout(() => {
        setScans(prev => {
          const next = prev + 1;
          if (next < 3) {
            setTimeout(nextScan, 800);
          } else {
            setTimeout(() => {
              nextScan();
            }, 100);
          }
          return next;
        });
        i++;
      }, delays[i] || 1800);
    }
    nextScan();
  }

  function onAllScanned() {
    setSensorState('scanning');
    setTimeout(() => {
      setSensorState('success');
      setStep(2);
      const now = new Date();
      const ts = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      if (selected) {
        setHistory(prev => [{ name: selected.name, av: selected.av, avC: selected.avC, time: ts }, ...prev]);
        setSelected({ ...selected, hasHuella: true });
      }
    }, 2600);
  }

  const av = selected ? AV_STYLES[selected.avC] : null;

  return (
    <div style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Breadcrumb + reader status */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 0, height: 'auto', borderBottom: 'none', background: 'transparent', position: 'static',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
          Panel <span style={{ color: 'var(--text-2)' }}>›</span> <span style={{ color: 'var(--text-2)' }}>Registro de Huella Dactilar</span>
        </div>
        <span style={{
          fontSize: 12, color: 'var(--text-3)', background: 'var(--surface)',
          border: '1px solid var(--border)', padding: '6px 12px',
          borderRadius: 'var(--radius-sm)', fontFamily: "'DM Mono', monospace",
        }}>
          Lector: <span style={{ color: 'var(--green-text)' }}>● Conectado</span>
        </span>
      </header>

      {/* Page title */}
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Registro de Huella Dactilar</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
          Captura y guarda el template de huella de cada miembro en <code style={{ background: 'var(--surface2)', padding: '1px 6px', borderRadius: 4, fontSize: 12, color: 'var(--accent)' }}>profiles.huella_template</code>
        </div>
      </div>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Member list */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Seleccionar miembro</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Haz clic para iniciar el registro</div>
            </div>
          </div>
          <div style={{ padding: 10, borderBottom: '1px solid var(--border)', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar miembro…"
              style={{
                width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
                padding: '8px 12px 8px 34px', borderRadius: 'var(--radius-sm)', outline: 'none',
              }} />
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {filtered.map(m => {
              const isSel = selected?.name === m.name;
              return (
                <div key={m.name} onClick={() => selectMember(m)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 16px', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'background 0.12s',
                    background: isSel ? 'var(--accent-dim)' : 'transparent',
                    borderLeft: isSel ? '2px solid var(--accent)' : '2px solid transparent',
                  }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: AV_STYLES[m.avC].bg, color: AV_STYLES[m.avC].fg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600, flexShrink: 0,
                  }}>{m.av}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{m.email}</div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {m.hasHuella ? (
                      <span style={{ fontSize: 10, background: 'var(--green-bg)', color: 'var(--green-text)', padding: '2px 8px', borderRadius: 100, fontWeight: 500 }}>✓ Huella</span>
                    ) : (
                      <span style={{ fontSize: 10, background: 'var(--surface2)', color: 'var(--text-3)', padding: '2px 8px', borderRadius: 100, border: '1px dashed var(--border2)' }}>Sin huella</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!selected ? (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: 60, textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>👆</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Selecciona un miembro</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Elige un miembro de la lista para registrar o actualizar su huella dactilar.</div>
            </div>
          ) : (
            <>
              {/* Selected member */}
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: 20,
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: av?.bg, color: av?.fg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, fontWeight: 600, flexShrink: 0,
                }}>{selected.av}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>{selected.email}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  {selected.hasHuella ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 100, fontSize: 10, fontWeight: 500, background: 'var(--green-bg)', color: 'var(--green-text)' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }}></span>Huella registrada
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 100, fontSize: 10, fontWeight: 500, background: 'var(--red-bg)', color: 'var(--red-text)' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)' }}></span>Sin huella
                    </span>
                  )}
                </div>
              </div>

              {/* Warning */}
              {selected.hasHuella && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12,
                  background: 'var(--amber-bg)', color: 'var(--amber-text)',
                  border: '1px solid rgba(245,158,11,0.2)',
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>Este miembro ya tiene una huella registrada. Continuar <strong>reemplazará</strong> el template actual en <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: 3 }}>profiles.huella_template</code>.</span>
                </div>
              )}

              {/* Scanner */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Sensor de huella</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                      {sensorState === 'scanning' ? 'Mantenlo quieto hasta escuchar el pitido' : sensorState === 'success' ? 'Template registrado correctamente' : 'Coloca el dedo sobre el lector cuando estés listo'}
                    </div>
                  </div>
                </div>

                <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                  {/* Steps */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
                    {['Inicio','Escaneo','Verificación','Guardado'].map((label, i) => {
                      const state = step > i ? 'done' : step === i && sensorState !== 'idle' ? 'active' : '';
                      const isActive = state === 'active';
                      const isDone = state === 'done';
                      return (
                        <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                          {i < 3 && (
                            <div style={{ position: 'absolute', left: '50%', right: '-50%', height: 1, top: 14, background: 'var(--border2)', zIndex: 0 }} />
                          )}
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            border: isDone ? '1px solid var(--green)' : isActive ? '1px solid var(--accent)' : '1px solid var(--border2)',
                            background: isDone ? 'var(--green-bg)' : isActive ? 'var(--accent-dim)' : 'var(--surface2)',
                            color: isDone ? 'var(--green-text)' : isActive ? 'var(--accent)' : 'var(--text-3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 600, zIndex: 1,
                          }}>
                            {isDone ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            ) : (i + 1)}
                          </div>
                          <div style={{ fontSize: 10, color: isDone ? 'var(--green-text)' : isActive ? 'var(--accent)' : 'var(--text-3)', textAlign: 'center' }}>{label}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sensor */}
                  <div style={{
                    width: 180, height: 220,
                    background: sensorState === 'scanning' ? 'rgba(232,255,71,0.04)' : sensorState === 'success' ? 'rgba(34,197,94,0.06)' : sensorState === 'error' ? 'rgba(239,68,68,0.06)' : 'var(--surface2)',
                    border: `2px solid ${
                      sensorState === 'scanning' ? 'var(--accent)' :
                      sensorState === 'success' ? 'var(--green)' :
                      sensorState === 'error' ? 'var(--red)' : 'var(--border2)'
                    }`,
                    borderRadius: 20,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 16, position: 'relative', overflow: 'hidden',
                    transition: 'border-color 0.3s, background 0.3s',
                  }}>
                    {sensorState === 'scanning' && (
                      <div style={{
                        position: 'absolute', left: 0, right: 0, height: 2,
                        background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                        animation: 'scanDown 1.5s ease-in-out infinite',
                        opacity: 1,
                      }} />
                    )}
                    <svg className="fp-icon" viewBox="0 0 80 80" fill="none" width="72" height="72"
                      style={{ transition: 'all 0.3s' }}>
                      {sensorState === 'success' ? (
                        <><circle cx="40" cy="40" r="28" stroke="#4ade80" strokeWidth="3"/><polyline points="28,40 36,48 52,32" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></>
                      ) : sensorState === 'error' ? (
                        <><circle cx="40" cy="40" r="28" stroke="#f87171" strokeWidth="3"/><line x1="30" y1="30" x2="50" y2="50" stroke="#f87171" strokeWidth="3" strokeLinecap="round"/><line x1="50" y1="30" x2="30" y2="50" stroke="#f87171" strokeWidth="3" strokeLinecap="round"/></>
                      ) : (
                        <>
                          <path d="M40 10C23.4 10 10 23.4 10 40" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="3" strokeLinecap="round"/>
                          <path d="M40 10C56.6 10 70 23.4 70 40" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="3" strokeLinecap="round"/>
                          <path d="M40 20C28.9 20 20 28.9 20 40" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="3" strokeLinecap="round"/>
                          <path d="M40 20C51.1 20 60 28.9 60 40" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="3" strokeLinecap="round"/>
                          <path d="M40 30C34.5 30 30 34.5 30 40" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="3" strokeLinecap="round"/>
                          <path d="M40 30C45.5 30 50 34.5 50 40" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="3" strokeLinecap="round"/>
                          <path d="M40 30 L40 70" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="3" strokeLinecap="round"/>
                          <path d="M20 40 C20 55 28 65 40 70" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="3" strokeLinecap="round"/>
                          <path d="M60 40 C60 55 52 65 40 70" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="3" strokeLinecap="round"/>
                          <path d="M30 40 C30 51 34 60 40 65" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="3" strokeLinecap="round"/>
                          <path d="M50 40 C50 51 46 60 40 65" stroke={sensorState === 'scanning' ? '#e8ff47' : 'var(--text-3)'} strokeWidth="3" strokeLinecap="round"/>
                        </>
                      )}
                    </svg>
                    <div style={{
                      fontSize: 13, fontWeight: 500, textAlign: 'center',
                      color: sensorState === 'scanning' ? 'var(--accent)' : sensorState === 'success' ? 'var(--green-text)' : sensorState === 'error' ? 'var(--red-text)' : 'var(--text-3)',
                    }}>
                      {sensorState === 'idle' ? 'Esperando…' : sensorState === 'scanning' ? (scans < 3 ? 'Coloca el dedo…' : 'Procesando…') : sensorState === 'success' ? '¡Huella guardada!' : 'Error'}
                    </div>
                  </div>

                  {/* Scan progress */}
                  {step === 1 && (
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <span style={{ color: 'var(--text-2)' }}>Capturas realizadas</span>
                        <span style={{ color: 'var(--accent)', fontFamily: "'DM Mono', monospace" }}>{scans} / 3</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[0,1,2].map(i => (
                          <div key={i} style={{
                            flex: 1, height: 6, borderRadius: 3,
                            background: i < scans ? 'var(--accent)' : 'var(--surface2)',
                            border: i === scans && sensorState === 'scanning' ? '1px solid var(--accent)' : i < scans ? '1px solid var(--accent)' : '1px solid var(--border)',
                            transition: 'all 0.3s',
                          }} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                    <button onClick={startCapture}
                      disabled={sensorState === 'scanning'}
                      style={{
                        flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                        fontSize: 13, fontWeight: 500, cursor: sensorState === 'scanning' ? 'not-allowed' : 'pointer',
                        background: 'var(--accent)', color: '#000',
                        border: 'none', fontFamily: 'inherit', opacity: sensorState === 'scanning' ? 0.4 : 1,
                      }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {sensorState === 'success'
                          ? <polyline points="1 4 1 10 7 10"/>
                          : <><path d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/><path d="M17.657 16.657L13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/></>}
                      </svg>
                      {sensorState === 'success' ? 'Repetir captura' : 'Iniciar captura'}
                    </button>
                    {sensorState === 'scanning' && (
                      <button onClick={resetScanner}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                          fontSize: 13, cursor: 'pointer',
                          background: 'transparent', color: 'var(--text-2)',
                          border: '1px solid var(--border2)', fontFamily: 'inherit',
                        }}>
                        Cancelar
                      </button>
                    )}
                  </div>

                  {/* Success message */}
                  {sensorState === 'success' && (
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, width: '100%',
                      background: 'var(--green-bg)', color: 'var(--green-text)',
                      border: '1px solid rgba(34,197,94,0.2)',
                    }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0, marginTop: 1 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <div>
                        <strong>Huella registrada exitosamente.</strong><br />
                        <span style={{ fontSize: 11, opacity: 0.8 }}>
                          Template guardado en <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 4px', borderRadius: 3 }}>profiles.huella_template</code>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Info alert */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12,
                background: 'var(--blue-bg)', color: 'var(--blue-text)',
                border: '1px solid rgba(59,130,246,0.2)',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <div>
                  <strong>Flujo de registro</strong><br />
                  Se realizan <strong>3 capturas</strong> de la misma huella. El SDK del lector genera un template ISO/IEC 19794-2 que se almacena como <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: 3 }}>bytea</code> en Supabase. Pide al miembro que retire y vuelva a colocar el dedo entre cada captura.
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* History */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Historial de registros</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Últimas huellas capturadas en esta sesión</div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{history.length} registro{history.length !== 1 ? 's' : ''}</span>
        </div>
        {history.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Aún no se han registrado huellas en esta sesión.</div>
        ) : (
          history.map((h, i) => {
            const avS = AV_STYLES[h.avC];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: avS.bg, color: avS.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{h.av}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Template guardado en profiles.huella_template</div>
                </div>
                <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--text-3)' }}>{h.time}</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 500, background: 'var(--green-bg)', color: 'var(--green-text)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }}></span>OK
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
