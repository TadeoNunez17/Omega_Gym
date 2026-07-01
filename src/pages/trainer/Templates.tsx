import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainerService, type TrainerTemplate } from '@/services/trainer.service';
import { Button } from '@/components/ui/atoms/Button';
import { Modal } from '@/components/ui/molecules/Modal';
import { Input } from '@/components/ui/atoms/Input';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { IconPlus } from '@/lib/icons';
import { toast } from 'sonner';

const ICON_COLORS = [
  { bg: 'rgba(168,85,247,0.1)', fg: '#c084fc' },
  { bg: 'rgba(59,130,246,0.1)', fg: '#60a5fa' },
  { bg: 'rgba(34,197,94,0.1)', fg: '#4ade80' },
];

const TEMPLATE_ICONS = [
  '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
];

const staggerClass = (i: number) => {
  const map = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4'];
  return map[i] || 'stagger-1';
};

export default function TrainerTemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TrainerTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tName, setTName] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    trainerService.getTemplates()
      .then(setTemplates)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!tName.trim()) return;
    setSaving(true);
    try {
      const tpl = await trainerService.createPlan({
        name: tName.trim(),
        description: tDesc.trim() || undefined,
        is_template: true,
      });
      setTemplates((prev) => [{
        id: tpl.id,
        name: tpl.name,
        description: tpl.description,
        exercise_count: tpl.exercise_count,
        created_at: tpl.created_at,
      }, ...prev]);
      setModalOpen(false);
      setTName('');
      setTDesc('');
      toast.success('Plantilla creada');
    } catch (e: any) {
      toast.error('Error al crear plantilla: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-4 sm:p-7 text-sm text-text-3">Cargando plantillas…</div>;
  }

  if (error) {
    return <div className="p-4 sm:p-7 text-sm text-red-text">Error: {error}</div>;
  }

  return (
    <>
      <div className="noise-overlay" />
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-surface2 sticky top-0 z-9">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
          <div className="w-4 h-4 shrink-0 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full" width="16" height="16"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
          <span className="text-text-4 mx-0.5">/</span>
          <span className="font-medium text-text-1">Plantillas</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} icon={<IconPlus />}>
            Nueva plantilla
          </Button>
        </div>
      </header>

      <div className="p-4 sm:p-7 flex-1">
        <div className="relative mb-7 overflow-hidden rounded-xl bg-gradient-to-br from-surface to-surface2 border border-border p-5 sm:p-7">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ background: 'radial-gradient(600px circle at 20% 30%, var(--accent), transparent)' }} />
          <div className="relative">
            <PageHeader
              title="Plantillas"
              description={`${templates.length} ${templates.length === 1 ? 'plantilla' : 'plantillas'} guardadas`}
            />
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-center bg-surface border border-border rounded">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40 text-text-3">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <div className="text-sm font-semibold text-text-2">No hay plantillas aún</div>
            <div className="text-xs text-text-3 max-w-[300px]">Guarda un plan como plantilla para reutilizarlo con otros miembros.</div>
            <Button variant="primary" size="sm" className="mt-2" onClick={() => setModalOpen(true)}>
              + Crear plantilla
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map((t, i) => {
              const ic = ICON_COLORS[i % ICON_COLORS.length];
              return (
                <div key={t.id}
                  onClick={() => navigate('/trainer/plans')}
                  className={`animate-slide-up ${staggerClass(i)} bg-surface border border-border rounded-lg p-[18px] flex flex-col gap-3 cursor-pointer transition-all duration-150 hover:border-accent/30 hover:-translate-y-[0.5px] active:scale-[0.98]`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
                      style={{ background: ic.bg, color: ic.fg }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
                        dangerouslySetInnerHTML={{ __html: TEMPLATE_ICONS[i % TEMPLATE_ICONS.length] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold">{t.name}</div>
                      <div className="text-[11px] text-text-3 mt-0.5">{t.exercise_count} ejercicio{t.exercise_count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  {t.description && (
                    <div className="text-[12px] text-text-3 leading-relaxed line-clamp-2">{t.description}</div>
                  )}
                  <div className="text-[11px] text-text-3 font-mono pt-2 border-t border-border">
                    Creada el {new Date(t.created_at).toLocaleDateString('es-MX')}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva plantilla" className="max-w-[400px]" icon={<IconPlus width="16" height="16" />}>
          <Input label="Nombre de la plantilla *" value={tName} onChange={e => setTName(e.target.value)} placeholder="Ej. Pecho y tríceps" />
          <Input label="Descripción" value={tDesc} onChange={e => setTDesc(e.target.value)} placeholder="Objetivo, observaciones…" />
          <div className="text-[11px] text-text-3 bg-surface2 border border-border rounded-sm px-3 py-2.5">Las plantillas están disponibles para asignarse a cualquier miembro desde la sección de planes.</div>
          <div className="flex justify-end gap-[10px] pt-4 border-t border-border mt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={!tName.trim() || saving}>{saving ? 'Guardando…' : 'Crear plantilla'}</Button>
          </div>
        </Modal>
      </div>
    </>
  );
}
