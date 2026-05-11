'use client';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(15,15,15,0.92)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, background: 'var(--accent)', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" width="16" height="16">
              <path d="M6 6h1v12H6M17 6h1v12h-1M3 9h3M18 9h3M3 15h3M18 15h3M9 12h6"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>Omega Gym</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface)', border: '1px solid var(--border)',
            padding: '6px 12px 6px 6px', borderRadius: 100, cursor: 'pointer',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'rgba(59,130,246,0.2)', color: '#60a5fa',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 600,
            }}>CR</div>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>Carlos Ramírez</span>
          </div>
          <button style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-3)', fontSize: 12, padding: '6px 12px',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'inherit',
          }}>Salir</button>
        </div>
      </header>
      {children}
    </div>
  );
}
