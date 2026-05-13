'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-30%', right: '-15%', width: '50%', height: '80%',
        background: 'radial-gradient(circle, rgba(250,204,21,0.07) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%', width: '45%', height: '60%',
        background: 'radial-gradient(circle, rgba(250,204,21,0.05) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        textAlign: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s, transform 0.6s',
      }}>
        <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
          Ω Omega Gym
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-2)', marginTop: 12, maxWidth: 360, lineHeight: 1.6 }}>
          Sistema de gestión de gimnasio — control de membresías, entrenamientos, check-ins y más.
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
          <a
            href="/login"
            style={{
              padding: '11px 28px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--accent)', color: '#000', fontSize: 14, fontWeight: 600,
              textDecoration: 'none', fontFamily: 'inherit',
            }}
          >
            Iniciar sesión
          </a>
          <a
            href="/dashboard"
            style={{
              padding: '11px 28px', borderRadius: 'var(--radius-sm)',
              background: 'transparent', color: 'var(--text-2)', fontSize: 14, fontWeight: 500,
              textDecoration: 'none', border: '1px solid var(--border2)', fontFamily: 'inherit',
            }}
          >
            Dashboard demo
          </a>
        </div>

      </div>
    </div>
  );
}
