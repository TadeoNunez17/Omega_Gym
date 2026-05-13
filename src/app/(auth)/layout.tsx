'use client';

import { useState, useEffect } from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative gradient blobs */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%', width: '40%', height: '60%',
        background: 'radial-gradient(circle, rgba(250,204,21,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-5%', width: '35%', height: '50%',
        background: 'radial-gradient(circle, rgba(250,204,21,0.04) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        width: 400, maxWidth: '92vw',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.4s, transform 0.4s',
      }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>Ω Omega Gym</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Sistema de Gestión</div>
        </div>

        {children}
      </div>
    </div>
  );
}
