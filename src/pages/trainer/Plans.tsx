import { useEffect, useState } from 'react';
import { trainerService, type TrainerMember, type TrainerPlan } from '@/services/trainer.service';
import { trainingService } from '@/services/training.service';
import { Button } from '@/components/ui/atoms/Button';
import { Modal } from '@/components/ui/molecules/Modal';
import { Input, Select } from '@/components/ui/atoms/Input';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { IconPlus } from '@/lib/icons';
import { toast } from 'sonner';

const ICON_COLORS = [
  { bg: 'rgba(168,85,247,0.1)', fg: '#c084fc' },
  { bg: 'rgba(59,130,246,0.1)', fg: '#60a5fa' },
  { bg: 'rgba(34,197,94,0.1)', fg: '#4ade80' },
  { bg: 'rgba(236,72,153,0.1)', fg: '#f472b6' },
  { bg: 'rgba(251,146,60,0.1)', fg: '#fb923c' },
];

const PLAN_ICONS = [
  '<path d="M9 11l3 3L22 4"/>',
  '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>',
];

const staggerClass = (i: number) => {
  const map = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5'];
  return map[i] || 'stagger-1';
};

export default function TrainerPlansPage() {
  const [plans, setPlans] = useState<TrainerPlan[]>([]);
  const [members, setMembers] = useState<TrainerMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pMember, setPMember] = useState('');
  const [editTarget, setEditTarget] = useState<TrainerPlan | null>(null);
  const [eName, setEName] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eSaving, setESaving] = useState(false);

  useEffect(() => {
    Promise.all([
      trainerService.getPlans(),
      trainerService.getMembers(),
    ])
      .then(([plansData, membersData]) => {
        setPlans(plansData);
        setMembers(membersData);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!pName.trim()) return;
    try {
      const plan = await trainerService.createPlan({
        name: pName.trim(),
        description: pDesc.trim() || undefined,
        assigned_to: pMember || undefined,
      });
      setPlans([plan, ...plans]);
      setModalOpen(false);
      setPName('');
      setPDesc('');
      setPMember('');
    } catch (e: any) {
      toast.error('Error al crear plan: ' + e.message);
    }
  }

  function openEdit(plan: TrainerPlan) {
    setEditTarget(plan);
    setEName(plan.name);
    setEDesc(plan.description ?? '');
    setPMember(plan.assigned_to || '');
  }

  async function saveEdit() {
    if (!editTarget || !eName.trim()) return;
    setESaving(true);
    try {
      await trainingService.update(editTarget.id, {
        name: eName.trim(),
        description: eDesc.trim() || null,
        assigned_to: pMember || null,
      });
      setPlans((prev) => prev.map((pl) => pl.id === editTarget.id ? { ...pl, name: eName.trim(), description: eDesc.trim() || null, assigned_to: pMember || null } : pl));
      toast.success('Plan actualizado');
      setEditTarget(null);
    } catch (e: any) {
      toast.error('Error al actualizar plan: ' + e.message);
    } finally {
      setESaving(false);
    }
  }

  if (loading) {
    return <div className="p-4 sm:p-7 text-sm text-text-3">Cargando planes…</div>;
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
          <span className="font-medium text-text-1">Mis planes</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo plan
          </Button>
        </div>
      </header>

      <div className="p-4 sm:p-7 flex-1">
        <div className="relative mb-7 overflow-hidden rounded-xl bg-gradient-to-br from-surface to-surface2 border border-border p-5 sm:p-7">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ background: 'radial-gradient(600px circle at 20% 30%, var(--accent), transparent)' }} />
          <div className="relative">
            <PageHeader
              title="Mis planes"
              description={`${plans.length} ${plans.length === 1 ? 'plan' : 'planes'} de entrenamiento creados`}
            />
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-center bg-surface border border-border rounded">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40 text-text-3">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <div className="text-sm font-semibold text-text-2">No tienes planes aún</div>
            <div className="text-xs text-text-3 max-w-[300px]">Crea tu primer plan de entrenamiento y asígnaselo a uno de tus miembros.</div>
            <Button variant="primary" size="sm" className="mt-2" onClick={() => setModalOpen(true)}>
              + Crear plan
            </Button>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded overflow-hidden">
            {plans.map((p, i) => {
              const ic = ICON_COLORS[i % ICON_COLORS.length];
              return (
                <div key={p.id} className={`flex items-start sm:items-center gap-3 px-[18px] py-3.5 animate-slide-up ${staggerClass(i)} ${i < plans.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
                    style={{ background: ic.bg, color: ic.fg }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
                      dangerouslySetInnerHTML={{ __html: PLAN_ICONS[i % PLAN_ICONS.length] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium">{p.name}</div>
                    <div className="text-[11px] text-text-3 mt-0.5 flex gap-3 flex-wrap">
                      {p.assigned_to_name && <span>Asignado a: {p.assigned_to_name}</span>}
                      <span>{p.exercise_count} ejercicio{p.exercise_count !== 1 ? 's' : ''}</span>
                      {p.description && <span className="truncate max-w-[200px]">{p.description}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-text-3 font-mono hidden sm:inline">
                      {new Date(p.created_at).toLocaleDateString('es-MX')}
                    </span>
                    <button onClick={() => openEdit(p)} className="w-10 sm:w-7 h-10 sm:h-7 [&>svg]:w-[18px] [&>svg]:h-[18px] sm:[&>svg]:w-[13px] sm:[&>svg]:h-[13px] rounded-[var(--radius-sm)] bg-transparent border border-border text-text-3 cursor-pointer flex items-center justify-center hover:bg-surface2 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo plan de entrenamiento" className="max-w-[400px]" icon={<IconPlus width="16" height="16" />}>
          <Input label="Nombre del plan *" value={pName} onChange={e => setPName(e.target.value)} placeholder="Ej. Fuerza C — Avanzado" />
          <Input label="Descripción" value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Objetivo, observaciones…" />
          <Select label="Asignar a miembro" value={pMember} onChange={e => setPMember(e.target.value)}>
            <option value="">— Sin asignar —</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
          </Select>
          <div className="flex justify-end gap-[10px] pt-4 border-t border-border mt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleCreate}>Crear plan</Button>
          </div>
        </Modal>

        <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Editar plan" className="max-w-[400px]" icon={<IconPlus width="16" height="16" />}>
          <Input label="Nombre del plan *" value={eName} onChange={e => setEName(e.target.value)} placeholder="Ej. Fuerza C — Avanzado" />
          <Input label="Descripción" value={eDesc} onChange={e => setEDesc(e.target.value)} placeholder="Objetivo, observaciones…" />
          <Select label="Asignar a miembro" value={pMember} onChange={e => setPMember(e.target.value)}>
            <option value="">— Sin asignar —</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
          </Select>
          <div className="flex justify-end gap-[10px] pt-4 border-t border-border mt-2">
            <Button variant="ghost" size="sm" onClick={() => setEditTarget(null)} disabled={eSaving}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={saveEdit} disabled={!eName.trim() || eSaving}>{eSaving ? 'Guardando…' : 'Guardar cambios'}</Button>
          </div>
        </Modal>
      </div>
    </>
  );
}
