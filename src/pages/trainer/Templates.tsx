import { useEffect, useState } from 'react';
import { trainerService, type TrainerTemplate } from '@/services/trainer.service';

const TEMPLATE_ICONS = [
  '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
];

const ICON_COLORS = [
  { bg: 'rgba(168,85,247,0.1)', fg: '#c084fc' },
  { bg: 'rgba(59,130,246,0.1)', fg: '#60a5fa' },
  { bg: 'rgba(34,197,94,0.1)', fg: '#4ade80' },
];

export default function TrainerTemplatesPage() {
  const [templates, setTemplates] = useState<TrainerTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trainerService.getTemplates()
      .then(setTemplates)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: 28, fontSize: 14, color: 'var(--text-3)' }}>Cargando plantillas…</div>;
  }

  if (error) {
    return <div style={{ padding: 28, fontSize: 14, color: 'var(--red-text)' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px clamp(16px, 4vw, 28px)', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
            Omega Gym <span style={{ color: 'var(--text-2)' }}>›</span> <span style={{ color: 'var(--text-2)' }}>Plantillas</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{templates.length} plantillas guardadas</div>
        </div>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 'var(--radius-sm)',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          background: 'var(--accent)', color: '#000',
          border: 'none', fontFamily: 'inherit',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva plantilla
        </button>
      </header>

      {templates.length === 0 ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 48, gap: 12, textAlign: 'center',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" style={{ opacity: 0.4 }}>
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>No hay plantillas aún</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', maxWidth: 300 }}>Guarda un plan como plantilla para reutilizarlo con otros miembros.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {templates.map((t, i) => {
            const ic = ICON_COLORS[i % ICON_COLORS.length];
            return (
              <div key={t.id} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: 18,
                display: 'flex', flexDirection: 'column', gap: 12,
                cursor: 'pointer', transition: 'border-color 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                    background: ic.bg, color: ic.fg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
                      dangerouslySetInnerHTML={{ __html: TEMPLATE_ICONS[i % TEMPLATE_ICONS.length] }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{t.exercise_count} ejercicio{t.exercise_count !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                {t.description && (
                  <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>{t.description}</div>
                )}
                <div style={{
                  fontSize: 11, color: 'var(--text-3)', fontFamily: "'DM Mono', monospace",
                  paddingTop: 8, borderTop: '1px solid var(--border)',
                }}>
                  Creada el {new Date(t.created_at).toLocaleDateString('es-MX')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
