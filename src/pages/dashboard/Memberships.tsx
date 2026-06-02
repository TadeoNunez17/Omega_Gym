import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipsService, type MembershipListItem, type MembershipType } from '@/services/memberships.service';
import { dashboardService } from '@/services/dashboard.service';
import { membersService, type MemberListItem } from '@/services/members.service';
import { Modal } from '@/components/ui/molecules/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { IconButton } from '@/components/ui/atoms/IconButton';
import { SearchInput } from '@/components/ui/molecules/SearchInput';
import { TabBar } from '@/components/ui/molecules/TabBar';
import { Pagination } from '@/components/ui/molecules/Pagination';
import { IconEye, IconEdit, IconPlus } from '@/lib/icons';
import { toast } from 'sonner';

const ROWS_PER_PAGE = 7;

type MembershipStatus = 'active' | 'warning' | 'expired';

interface Member {
  id: string;
  member_id: string;
  name: string;
  email: string;
  plan: string;
  inicio: string;
  vence: string;
  status: MembershipStatus;
}

function daysDiff(d: string) {
  return Math.round((new Date(d).getTime() - Date.now()) / 86400000);
}

function getStatus(m: Member): MembershipStatus {
  const d = daysDiff(m.vence);
  if (d < 0) return 'expired';
  if (d <= 7) return 'warning';
  return 'active';
}

function initials(n: string) {
  return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function fmtDate(s: string) {
  const [y, mo, d] = s.split('-');
  const m = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(d)} ${m[parseInt(mo) - 1]} ${y}`;
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const AV_COLORS_BG = [
  'rgba(59,130,246,0.15)', 'rgba(16,185,129,0.15)', 'rgba(244,114,182,0.15)',
  'rgba(168,85,247,0.15)', 'rgba(251,146,60,0.15)', 'rgba(20,184,166,0.15)',
];
const AV_COLORS_FG = ['#60a5fa', '#34d399', '#f472b6', '#c084fc', '#fb923c', '#2dd4bf'];

function avatarIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % AV_COLORS_FG.length;
}

function toMember(item: MembershipListItem): Member {
  return {
    id: item.id,
    member_id: item.member_id,
    name: item.member_name,
    email: item.member_email ?? '',
    plan: item.type_name,
    inicio: item.start_date,
    vence: item.end_date,
    status: 'active',
  };
}

export default function MembershipsPage() {
  const [currentFilter, setCurrentFilter] = useState<'all' | MembershipStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [memberList, setMemberList] = useState<MemberListItem[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [selMember, setSelMember] = useState('');
  const [selType, setSelType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [saving, setSaving] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editType, setEditType] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editStatus, setEditStatus] = useState<string>('active');
  const [editSaving, setEditSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [result, mList, types] = await Promise.all([
          membershipsService.getAll({ pageSize: 200 }),
          membersService.getAll({ pageSize: 200 }),
          membershipsService.getTypes(),
        ]);
        setMembers(result.data.map(toMember));
        setMemberList(mList.data);
        setMembershipTypes(types);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const allWithStatus = useMemo(
    () => members.map((m) => ({ ...m, status: getStatus(m) })),
    [members]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allWithStatus
      .filter((m) => currentFilter === 'all' || m.status === currentFilter)
      .filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.plan.toLowerCase().includes(q)
      );
  }, [currentFilter, search, allWithStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * ROWS_PER_PAGE;
  const rows = filtered.slice(start, start + ROWS_PER_PAGE);

  const activeCount = allWithStatus.filter((m) => m.status === 'active').length;
  const warnCount = allWithStatus.filter((m) => m.status === 'warning').length;
  const expiredCount = allWithStatus.filter((m) => m.status === 'expired').length;

  const selTypeData = membershipTypes.find((t) => t.id === selType);
  const computedEnd = startDate && selTypeData
    ? (() => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + selTypeData.duration_days);
        return d.toISOString().split('T')[0];
      })()
    : '';

  const resetForm = useCallback(() => {
    setSelMember('');
    setSelType('');
    setStartDate('');
  }, []);

  const guardarMembresia = useCallback(async () => {
    if (!selMember || !selType || !startDate) return;
    setSaving(true);
    try {
      await membershipsService.create({
        member_id: selMember,
        type_id: selType,
        start_date: startDate,
        end_date: computedEnd,
      });
      setModalOpen(false);
      resetForm();
      const result = await membershipsService.getAll({ pageSize: 200 });
      setMembers(result.data.map(toMember));
      toast.success('Membresía creada correctamente');
    } catch (e: any) {
      toast.error('Error al crear membresía: ' + e.message);
    } finally {
      setSaving(false);
    }
  }, [selMember, selType, startDate, computedEnd, resetForm]);

  const viewMember = useCallback((memberId: string) => {
    navigate(`/members/${memberId}`);
  }, [navigate]);

  const openEditModal = useCallback((membership: Member) => {
    setEditId(membership.id);
    setEditType(membership.plan);
    setEditStart(membership.inicio.split('T')[0]);
    setEditEnd(membership.vence.split('T')[0]);
    setEditStatus(membership.status === 'expired' ? 'expired' : 'active');
  }, []);

  const guardarEdicion = useCallback(async () => {
    if (!editId) return;
    setEditSaving(true);
    try {
      const selectedType = membershipTypes.find((t) => t.name === editType);
      await membershipsService.update(editId, {
        type_id: selectedType?.id ?? '',
        start_date: editStart,
        end_date: editEnd,
        status: editStatus as 'active' | 'expired' | 'cancelled',
      });
      setEditId(null);
      const result = await membershipsService.getAll({ pageSize: 200 });
      setMembers(result.data.map(toMember));
      toast.success('Membresía actualizada correctamente');
    } catch (e: any) {
      toast.error('Error al actualizar: ' + e.message);
    } finally {
      setEditSaving(false);
    }
  }, [editId, editType, editStart, editEnd, editStatus, membershipTypes]);

  return (
    <>
      <header
        style={{
          padding: '0 28px', height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)', background: 'var(--bg)',
          position: 'sticky', top: 0, zIndex: 9,
        }}
        className="flex-wrap gap-2"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
          Panel <span style={{ fontSize: 10 }}>›</span>
          <span style={{ color: 'var(--text-2)' }}>Membresías</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="flex-wrap">

          <Button variant="primary" size="sm" icon={<IconPlus />} onClick={() => { resetForm(); setModalOpen(true); }}>
            Nueva membresía
          </Button>
        </div>
      </header>

      <div style={{ padding: '20px clamp(16px, 4vw, 28px)', flex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Membresías</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
            Control de membresías activas, vencidas y próximas a vencer
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>Cargando membresías…</div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--red-text)' }}>Error: {error}</div>
        )}

        {!loading && !error && (
          <>
            {/* METRICS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Activas', value: activeCount, color: 'green', sub: 'Al corriente' },
                { label: 'Por vencer', value: warnCount, color: 'amber', sub: 'En los próximos 7 días' },
                { label: 'Vencidas', value: expiredCount, color: 'red', sub: 'Sin renovar' },
              ].map((m) => (
                <div key={m.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `var(--${m.color})` }} />
                  <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{m.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em', color: `var(--${m.color}-text)` }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* ALERT BANNER */}
            {(warnCount > 0 || expiredCount > 0) && (
              <div style={{ background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--amber-text)', marginBottom: 16 }}>
                <IconAlert />
                <span>
                  {warnCount > 0 && `${warnCount} membresía${warnCount > 1 ? 's' : ''} por vencer en los próximos 7 días`}
                  {warnCount > 0 && expiredCount > 0 && ' · '}
                  {expiredCount > 0 && `${expiredCount} membresía${expiredCount > 1 ? 's' : ''} vencida${expiredCount > 1 ? 's' : ''} sin renovar`}
                  . Considera contactar a estos miembros.
                </span>
              </div>
            )}

            {/* CONTROLS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
              <div className="flex-1">
                <SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Buscar miembro, plan o email..." />
              </div>
              <div className="overflow-x-auto pb-1">
                <TabBar tabs={[
                  { key: 'all', label: 'Todos' },
                  { key: 'active', label: 'Activos' },
                  { key: 'warning', label: 'Por vencer' },
                  { key: 'expired', label: 'Vencidos' },
                ]} active={currentFilter} onChange={(k) => { setCurrentFilter(k as MembershipStatus | 'all'); setCurrentPage(1); }} />
              </div>
            </div>

            {/* TABLE */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 780 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Miembro</th>
                      <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Plan</th>
                      <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Inicio</th>
                      <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Vencimiento</th>
                      <th style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Estado</th>
                      <th style={{ padding: '11px 18px', textAlign: 'right', fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--surface2)', whiteSpace: 'nowrap' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>
                          No se encontraron membresías con ese criterio.
                        </td>
                      </tr>
                    ) : (
                      rows.map((m) => {
                        const diff = daysDiff(m.vence);
                        const av = avatarIndex(m.id);
                        return (
                          <tr key={m.id} style={{ transition: 'background 0.12s' }}>
                            <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0, background: AV_COLORS_BG[av], color: AV_COLORS_FG[av] }}>
                                  {initials(m.name)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 500, fontSize: 13 }}>{m.name}</div>
                                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{m.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text-2)' }}>
                              {m.plan}
                            </td>
                            <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', fontSize: 12 }}>
                              {fmtDate(m.inicio)}
                            </td>
                            <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                              <div style={{ fontSize: 12 }}>{fmtDate(m.vence)}</div>
                              {m.status === 'active' && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{diff} días restantes</div>}
                              {m.status === 'warning' && <div style={{ fontSize: 11, color: 'var(--amber-text)', marginTop: 3 }}>Vence en {diff} día{diff === 1 ? '' : 's'}</div>}
                              {m.status === 'expired' && <div style={{ fontSize: 11, color: 'var(--red-text)', marginTop: 3 }}>Venció hace {Math.abs(diff)} días</div>}
                            </td>
                            <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                              {m.status === 'active' && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--green-bg)', color: 'var(--green-text)' }}>
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} /> Activa
                                </span>
                              )}
                              {m.status === 'warning' && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--amber-bg)', color: 'var(--amber-text)' }}>
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)' }} /> Por vencer
                                </span>
                              )}
                              {m.status === 'expired' && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, background: 'var(--red-bg)', color: 'var(--red-text)' }}>
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)' }} /> Vencida
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <IconButton title="Ver detalle" onClick={() => viewMember(m.member_id)}>
                                  <IconEye width="13" height="13" />
                                </IconButton>
                                <IconButton title="Editar" onClick={() => openEditModal(m)}>
                                  <IconEdit width="13" height="13" />
                                </IconButton>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
              current={safePage}
              total={totalPages}
              start={start}
              end={Math.min(start + ROWS_PER_PAGE, filtered.length)}
              totalItems={filtered.length}
              label="membresías"
              onChange={setCurrentPage}
            />
            </div>
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva membresía" className="max-w-[400px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-2 font-medium">Miembro *</label>
            <select
              value={selMember}
              onChange={(e) => setSelMember(e.target.value)}
              className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans"
            >
              <option value="">Seleccionar miembro</option>
              {memberList.filter((m) => m.role === 'member').map((m) => (
                <option key={m.id} value={m.id}>{m.full_name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-2 font-medium">Tipo de membresía *</label>
            <select
              value={selType}
              onChange={(e) => setSelType(e.target.value)}
              className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans"
            >
              <option value="">Seleccionar tipo</option>
              {membershipTypes.filter((t) => t.is_active).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — ${t.price.toLocaleString()} · {t.duration_days} días
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-2 font-medium">Fecha de inicio *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans"
            />
          </div>

          {computedEnd && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-text-2 font-medium">Fecha de vencimiento</label>
              <div className="text-text text-[13px] px-3 py-[9px] bg-surface2 border border-border2 rounded-sm opacity-70">
                {new Date(computedEnd).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          )}

          <div className="text-[11px] text-text-3 bg-amber-bg border border-amber/20 rounded-sm p-3 leading-relaxed">
            La fecha de vencimiento se calcula automáticamente según la duración del tipo de membresía seleccionado.
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-2">
          <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarMembresia} disabled={!selMember || !selType || !startDate || saving}>
            {saving ? 'Guardando…' : 'Guardar membresía'}
          </Button>
        </div>
      </Modal>

      <Modal open={editId !== null} onClose={() => setEditId(null)} title="Editar membresía" className="max-w-[400px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-2 font-medium">Tipo de membresía</label>
            <select
              value={editType}
              onChange={(e) => {
                setEditType(e.target.value);
                const t = membershipTypes.find((mt) => mt.name === e.target.value);
                if (t && editStart) {
                  const d = new Date(editStart);
                  d.setDate(d.getDate() + t.duration_days);
                  setEditEnd(d.toISOString().split('T')[0]);
                }
              }}
              className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans"
            >
              {membershipTypes.filter((t) => t.is_active).map((t) => (
                <option key={t.id} value={t.name}>{t.name} — ${t.price.toLocaleString()}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-2 font-medium">Fecha de inicio</label>
            <input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)}
              className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-2 font-medium">Fecha de vencimiento</label>
            <input type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)}
              className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-text-2 font-medium">Estado</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
              className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans"
            >
              <option value="active">Activa</option>
              <option value="expired">Vencida</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-2">
          <Button variant="ghost" onClick={() => setEditId(null)} disabled={editSaving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarEdicion} disabled={!editType || !editStart || !editEnd || editSaving}>
            {editSaving ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
