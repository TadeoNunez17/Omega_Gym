'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // placeholder — conectar con Supabase Auth
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Iniciar sesión</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Accede a tu cuenta del gimnasio</div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>Correo electrónico</label>
          <input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
              color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
              padding: '10px 14px', borderRadius: 'var(--radius-sm)', outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
                padding: '10px 14px', borderRadius: 'var(--radius-sm)', outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer',
                fontSize: 11, fontFamily: 'inherit',
              }}
            >
              {showPw ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            style={{
              background: 'none', border: 'none', color: 'var(--accent-text)',
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button
          type="submit"
          style={{
            width: '100%', padding: '11px 0', borderRadius: 'var(--radius-sm)',
            background: 'var(--accent)', color: '#000', border: 'none',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            marginTop: 4,
          }}
        >
          Entrar
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-3)' }}>
        ¿No tienes cuenta?{' '}
        <a href="/register" style={{ color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 500 }}>
          Registrarse
        </a>
      </div>

      {/* Demo credentials hint */}
      <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--amber-bg)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--amber-text)', lineHeight: 1.5 }}>
        <strong>Demo:</strong> admin@omega.com / admin123 &nbsp;·&nbsp; trainer@omega.com / trainer123
      </div>
    </div>
  );
}
