import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { LoadingSpinner } from '@/components/ui/atoms/LoadingSpinner';
import { initials, avatarIndex, fmtDate, AVATAR_COLORS } from '@/lib/helpers';
import { membersService, type MemberListItem } from '@/services/members.service';
import { toast } from 'sonner';

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editMode = searchParams.get('edit') === 'true';

  const [member, setMember] = useState<MemberListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', role: '' });

  useEffect(() => {
    if (!id) { navigate('/members'); return; }
    setLoading(true);
    membersService.getById(id)
      .then((data) => {
        setMember(data);
        setForm({
          full_name: data.full_name,
          email: data.email ?? '',
          phone: data.phone ?? '',
          role: data.role,
        });
      })
      .catch((e) => {
        toast.error('Error al cargar miembro: ' + e.message);
        navigate('/members');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSave = async () => {
    if (!member || !id) return;
    if (!form.full_name.trim()) { toast.error('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      await membersService.update(id, {
        full_name: form.full_name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        role: form.role as 'admin' | 'trainer' | 'member',
      });
      toast.success('Miembro actualizado');
      navigate(`/members/${id}`);
    } catch (e: any) {
      toast.error('Error al guardar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Cargando miembro…" />;
  if (!member) return null;

  const m = member;
  const av = avatarIndex(m.id);
  const membership = m.membership_type
    ? { type: m.membership_type, end: m.membership_end }
    : null;

  function statusBadge() {
    if (m.registration_status === 'pending') return <Badge variant="amber" dot>Pendiente</Badge>;
    return m.is_active
      ? <Badge variant="green" dot>Activo</Badge>
      : <Badge variant="red" dot>Inactivo</Badge>;
  }

  function roleBadge(role: string) {
    if (role === 'admin') return <Badge variant="accent" dot>Admin</Badge>;
    if (role === 'trainer') return <Badge variant="blue" dot>Entrenador</Badge>;
    return <Badge variant="gray" dot>Miembro</Badge>;
  }

  const field = (label: string, value: string | React.ReactNode) => (
    <div>
      <div className="text-[11px] text-text-3 uppercase tracking-[0.06em] mb-1">{label}</div>
      <div className="text-[13px] text-text-1">{value}</div>
    </div>
  );

  const inputField = (label: string, value: string, onChange: (v: string) => void, placeholder?: string) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] text-text-2 font-medium">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans" />
    </div>
  );

  return (
    <>
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-bg sticky top-0 z-9">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
          Panel <span className="text-[10px]">›</span>
          <button onClick={() => navigate('/members')} className="hover:text-text-2 transition-colors">Miembros</button>
          <span className="text-[10px]">›</span>
          <span className="text-text-2">{m.full_name}</span>
        </div>
        <div className="flex items-center gap-2">
          {!editMode && (
            <Button variant="primary" size="sm" onClick={() => navigate(`/members/${id}?edit=true`)}>Editar</Button>
          )}
        </div>
      </header>

      <div className="p-4 sm:p-7 flex-1 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-[18px] font-semibold shrink-0"
            style={{ background: AVATAR_COLORS[av].bg, color: AVATAR_COLORS[av].fg }}>
            {initials(m.full_name)}
          </div>
          <div>
            <h1 className="text-[20px] font-semibold">{m.full_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {roleBadge(m.role)}
              {statusBadge()}
            </div>
          </div>
        </div>

        {editMode ? (
          <div className="flex flex-col gap-4 bg-surface border border-border rounded p-6">
            <h2 className="text-[14px] font-semibold text-text-2">Editar información</h2>

            {inputField('Nombre completo *', form.full_name, (v) => setForm((f) => ({ ...f, full_name: v })))}
            {inputField('Correo electrónico', form.email, (v) => setForm((f) => ({ ...f, email: v })))}
            {inputField('Teléfono', form.phone, (v) => setForm((f) => ({ ...f, phone: v })))}

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-text-2 font-medium">Rol</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans">
                <option value="member">Miembro</option>
                <option value="trainer">Entrenador</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 mt-2">
              <Button variant="ghost" onClick={() => navigate(`/members/${id}`)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface border border-border rounded p-6">
            {field('Correo', m.email || <span className="text-text-3">—</span>)}
            {field('Teléfono', m.phone || <span className="text-text-3">—</span>)}

            {field('Membresía', membership
              ? <div>
                  <span>{membership.type}</span>
                  <span className="text-text-3 ml-2">— Vence {fmtDate(membership.end)}</span>
                </div>
              : <span className="text-text-3">Sin membresía</span>
            )}

            {field('Plan asignado', m.plan_name
              ? <span className="inline-flex items-center gap-1 px-[9px] py-[3px] rounded-sm text-[11px] bg-surface2 text-text-2 border border-border">{m.plan_name}</span>
              : <span className="text-text-3">Sin plan</span>
            )}

            {field('Registro', m.registration_status === 'pending' ? 'Pendiente de activación'
              : m.registration_status === 'claimed' ? 'Reclamado (sin registro completo)'
              : 'Completo'
            )}

            {field('Miembro desde', fmtDate(m.created_at))}
          </div>
        )}
      </div>
    </>
  );
}
