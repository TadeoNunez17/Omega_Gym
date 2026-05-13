'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Toaster, toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setSubmitting(true);
    try {
      await register(email, password, name);
      const user = useAuthStore.getState().user;
      if (user?.role === 'member') router.push('/member/my-plan');
      else router.push('/login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrarse';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Crear cuenta</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Regístrate como miembro del gimnasio</div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>Nombre completo</label>
          <input
            type="text"
            placeholder="Ej. Carlos Ramirez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
              color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
              padding: '10px 14px', borderRadius: 'var(--radius-sm)', outline: 'none',
            }}
          />
        </div>

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
                padding: '10px 14px', borderRadius: 'var(--radius-sm)', outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>Confirmar</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
                padding: '10px 14px', borderRadius: 'var(--radius-sm)', outline: 'none',
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%', padding: '11px 0', borderRadius: 'var(--radius-sm)',
            background: submitting ? 'var(--accent-dim)' : 'var(--accent)',
            color: '#000', border: 'none',
            fontSize: 14, fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', marginTop: 4,
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
        <Toaster position="top-center" />
      </form>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-3)' }}>
        ¿Ya tienes cuenta?{' '}
        <a href="/login" style={{ color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 500 }}>
          Iniciar sesión
        </a>
      </div>

      <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5, textAlign: 'center' }}>
        Al registrarte aceptas nuestros términos y condiciones.
      </div>
    </div>
  );
}
