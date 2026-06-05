import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipsService, type MembershipListItem, type MembershipType } from '@/services/memberships.service';
import { membersService, type MemberListItem } from '@/services/members.service';
import { Modal } from '@/components/ui/molecules/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { IconButton } from '@/components/ui/atoms/IconButton';
import { LoadingSpinner } from '@/components/ui/atoms/LoadingSpinner';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { SearchInput } from '@/components/ui/molecules/SearchInput';
import { TabBar } from '@/components/ui/molecules/TabBar';
import { Pagination } from '@/components/ui/molecules/Pagination';
import { ResponsiveTable, type Column } from '@/components/ui/molecules/ResponsiveTable';
import { IconEye, IconEdit, IconPlus, IconCalendar } from '@/lib/icons';
import { initials, fmtDate, daysDiff, avatarIndex, AVATAR_COLORS } from '@/lib/helpers';
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
  isVisita: boolean;
}

function getStatus(m: Member): MembershipStatus {
  if (m.isVisita) return 'active';
  const d = daysDiff(m.vence);
  if (d === null || d < 0) return 'expired';
  if (d <= 7) return 'warning';
  return 'active';
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
    isVisita: item.type_name === 'Visita',
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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'pending' | ''>('');
  const [saving, setSaving] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editType, setEditType] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editStatus, setEditStatus] = useState<string>('active');
  const [editSaving, setEditSaving] = useState(false);

  const [previewTarget, setPreviewTarget] = useState<Member | null>(null);
  const [previewMember, setPreviewMember] = useState<MemberListItem | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const navigate = useNavigate();

  useEffect(() => {
    if (!previewTarget) { setPreviewMember(null); return; }
    setPreviewLoading(true);
    membersService.getById(previewTarget.member_id)
      .then(setPreviewMember)
      .catch(() => setPreviewMember(null))
      .finally(() => setPreviewLoading(false));
  }, [previewTarget]);

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
  const isVisita = selTypeData?.name === 'Visita';
  const computedEnd = startDate && selTypeData
    ? isVisita
      ? startDate
      : (() => {
          const d = new Date(startDate);
          d.setDate(d.getDate() + selTypeData.duration_days);
          return d.toISOString().split('T')[0];
        })()
    : '';

  const resetForm = useCallback(() => {
    setSelMember('');
    setSelType('');
    setStartDate('');
    setPaymentMethod('');
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
        payment_method: paymentMethod || undefined,
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
  }, [selMember, selType, startDate, computedEnd, paymentMethod, resetForm]);

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

  const columns: Column<Member>[] = [
    {
      key: 'name',
      label: 'Miembro',
      render: (m) => {
        const av = avatarIndex(m.id);
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
              style={{ background: AVATAR_COLORS[av].bg, color: AVATAR_COLORS[av].fg }}>
              {initials(m.name)}
            </div>
            <div>
              <div className="font-medium text-[13px]">{m.name}</div>
              <div className="text-[11px] text-text-3 mt-0.5">{m.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (m) => (
        <span className="font-mono text-[12px] text-text-2">{m.plan}</span>
      ),
    },
    {
      key: 'inicio',
      label: 'Inicio',
      hide: 'lg',
      render: (m) => <span className="text-[12px]">{fmtDate(m.inicio)}</span>,
    },
    {
      key: 'vence',
      label: 'Vencimiento',
      render: (m) => {
        if (m.isVisita) return <div className="text-[12px] text-text-3">—</div>;
        const diff = daysDiff(m.vence);
        return (
          <div>
            <div className="text-[12px]">{fmtDate(m.vence)}</div>
            {diff !== null && m.status === 'active' && <div className="text-[11px] text-text-3 mt-0.5">{diff} días restantes</div>}
            {diff !== null && m.status === 'warning' && <div className="text-[11px] text-amber-text mt-0.5">Vence en {diff} día{diff === 1 ? '' : 's'}</div>}
            {diff !== null && m.status === 'expired' && <div className="text-[11px] text-red-text mt-0.5">Venció hace {Math.abs(diff)} días</div>}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Estado',
      render: (m) => {
        if (m.status === 'active') return <Badge variant="green" dot>Activa</Badge>;
        if (m.status === 'warning') return <Badge variant="amber" dot>Por vencer</Badge>;
        return <Badge variant="red" dot>Vencida</Badge>;
      },
    },
    {
      key: 'actions',
      label: '',
      render: (m) => (
        <div className="flex gap-1.5 justify-end">
          <IconButton title="Ver detalle" onClick={() => setPreviewTarget(m)}>
            <IconEye width="13" height="13" />
          </IconButton>
          <IconButton title="Editar" onClick={() => openEditModal(m)}>
            <IconEdit width="13" height="13" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-bg sticky top-0 z-9">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
          Panel <span className="text-[10px]">›</span>
          <span className="text-text-2">Membresías</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button variant="primary" size="sm" icon={<IconPlus />} onClick={() => { resetForm(); setModalOpen(true); }}>
            Nueva membresía
          </Button>
        </div>
      </header>

      <div className="p-4 sm:p-7 flex-1">
        <PageHeader title="Membresías" description="Control de membresías activas, vencidas y próximas a vencer" />

        {/* METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Activas', value: activeCount, color: 'green', sub: 'Al corriente' },
            { label: 'Por vencer', value: warnCount, color: 'amber', sub: 'En los próximos 7 días' },
            { label: 'Vencidas', value: expiredCount, color: 'red', sub: 'Sin renovar' },
          ].map((m) => (
            <div key={m.label} className="relative bg-surface border border-border rounded overflow-hidden p-[18px]">
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `var(--${m.color})` }} />
              <div className="text-[11px] text-text-3 uppercase tracking-[0.06em] mb-2.5">{m.label}</div>
              <div className="text-[32px] font-semibold leading-none -tracking-[0.03em]" style={{ color: `var(--${m.color}-text)` }}>{m.value}</div>
              <div className="text-[11px] text-text-3 mt-1.5">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* ALERT BANNER */}
        {(warnCount > 0 || expiredCount > 0) && (
          <div className="bg-amber-bg border border-amber/20 rounded-sm p-[10px_16px] flex items-center gap-2.5 text-xs text-amber-text mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
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

        {/* Loading */}
        {loading && <LoadingSpinner text="Cargando membresías…" />}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-[60px] text-red-text">Error: {error}</div>
        )}

        {/* Table / Cards */}
        {!loading && !error && (
          <div className="bg-surface border border-border rounded overflow-hidden">
            <ResponsiveTable
              columns={columns}
              data={rows}
              keyExtractor={(m) => m.id}
              cardTitle={(m) => m.name}
              cardSubtitle={(m) => m.email}
              cardAvatar={(m) => {
                const av = avatarIndex(m.id);
                return (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0"
                    style={{ background: AVATAR_COLORS[av].bg, color: AVATAR_COLORS[av].fg }}>
                    {initials(m.name)}
                  </div>
                );
              }}
              cardFields={[
                { label: 'Plan', value: (m) => <span className="font-mono text-[12px] text-text-2">{m.plan}</span> },
                { label: 'Inicio', value: (m) => <span className="text-[12px]">{fmtDate(m.inicio)}</span> },
                {
                  label: 'Vencimiento',
                  value: (m) => {
                    if (m.isVisita) return <span className="text-[12px] text-text-3">—</span>;
                    const diff = daysDiff(m.vence);
                    return (
                      <div>
                        {m.status === 'active' && diff !== null && <span className="text-[12px]">{fmtDate(m.vence)} ({diff}d)</span>}
                        {m.status === 'warning' && diff !== null && <span className="text-[12px] text-amber-text">{fmtDate(m.vence)} ({diff}d)</span>}
                        {m.status === 'expired' && diff !== null && <span className="text-[12px] text-red-text">{fmtDate(m.vence)} ({Math.abs(diff)}d)</span>}
                        {diff === null && <span className="text-[12px]">{fmtDate(m.vence)}</span>}
                      </div>
                    );
                  },
                },
                {
                  label: 'Estado',
                  value: (m) => {
                    if (m.status === 'active') return <Badge variant="green" dot>Activa</Badge>;
                    if (m.status === 'warning') return <Badge variant="amber" dot>Por vencer</Badge>;
                    return <Badge variant="red" dot>Vencida</Badge>;
                  },
                },
                {
                  label: '',
                  value: (m) => (
                    <div className="flex gap-1.5">
                      <IconButton title="Ver detalle" onClick={() => setPreviewTarget(m)}>
                        <IconEye width="13" height="13" />
                      </IconButton>
                      <IconButton title="Editar" onClick={() => openEditModal(m)}>
                        <IconEdit width="13" height="13" />
                      </IconButton>
                    </div>
                  ),
                },
              ]}
              emptyMessage="No se encontraron membresías con ese criterio."
            />

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
        )}
      </div>

      <Modal compact icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      } title="PREVIEW" open={previewTarget !== null} onClose={() => setPreviewTarget(null)}>
        {previewLoading ? (
          <div className="flex flex-col items-center py-10 gap-4">
            <div className="w-[64px] h-[64px] rounded-full bg-surface2 animate-pulse" />
            <div className="w-32 h-4 rounded bg-surface2 animate-pulse" />
            <div className="w-20 h-5 rounded-sm bg-surface2 animate-pulse" />
            <div className="w-full space-y-3 mt-4">
              <div className="h-4 rounded bg-surface2 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-surface2 animate-pulse" />
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="h-[52px] rounded bg-surface2 animate-pulse" />
                <div className="h-[52px] rounded bg-surface2 animate-pulse" />
                <div className="h-[52px] rounded bg-surface2 animate-pulse" />
                <div className="h-[52px] rounded bg-surface2 animate-pulse" />
              </div>
            </div>
          </div>
        ) : previewMember && previewTarget ? (
          <div className="flex flex-col gap-0">
            <div className="flex flex-col items-center mb-6">
              <div className="w-[64px] h-[64px] rounded-full flex items-center justify-center text-[22px] font-semibold mb-3"
                style={{ background: AVATAR_COLORS[avatarIndex(previewMember.id)].bg, color: AVATAR_COLORS[avatarIndex(previewMember.id)].fg }}>
                {initials(previewMember.full_name)}
              </div>
              <div className="text-[17px] font-semibold">{previewMember.full_name}</div>
              <div className="mt-1.5">
                {previewMember.role === 'member' ? <Badge variant="blue" dot>Miembro</Badge> : previewMember.role === 'trainer' ? <Badge variant="purple" dot>Entrenador</Badge> : <Badge variant="accent" dot>Admin</Badge>}
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3.5">
              <div className="flex items-center gap-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-3 shrink-0">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="text-[12px] text-text-2">{previewMember.email}</span>
              </div>
              {previewMember.phone && (
                <div className="flex items-center gap-3">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-3 shrink-0">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="text-[12px] text-text-2">{previewMember.phone}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="text-[11px] text-text-3 uppercase tracking-[0.08em] mb-3">Membresía actual</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface2 rounded px-3 py-2.5">
                  <div className="text-[10px] text-text-3 uppercase tracking-[0.06em]">Plan</div>
                  <div className="text-[13px] font-medium mt-0.5">{previewTarget!.plan}</div>
                </div>
                <div className="bg-surface2 rounded px-3 py-2.5">
                  <div className="text-[10px] text-text-3 uppercase tracking-[0.06em]">Inicio</div>
                  <div className="text-[12px] mt-0.5">{fmtDate(previewTarget!.inicio)}</div>
                </div>
                <div className="bg-surface2 rounded px-3 py-2.5">
                  <div className="text-[10px] text-text-3 uppercase tracking-[0.06em]">Vencimiento</div>
                  <div className="text-[12px] mt-0.5">{fmtDate(previewTarget!.vence)}</div>
                </div>
                <div className="bg-surface2 rounded px-3 py-2.5">
                  <div className="text-[10px] text-text-3 uppercase tracking-[0.06em]">Estado</div>
                  <div className="mt-0.5">
                    {previewTarget!.status === 'active' ? <Badge variant="green" dot>Activa</Badge> : previewTarget!.status === 'warning' ? <Badge variant="amber" dot>Por vencer</Badge> : <Badge variant="red" dot>Vencida</Badge>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border text-center">
              <Button variant="primary" onClick={() => { setPreviewTarget(null); navigate(`/members/${previewTarget!.member_id}`); }}>
                Ir a perfil completo
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-16 text-text-3 text-[13px]">No se pudo cargar la información del miembro.</div>
        )}
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva membresía" className="max-w-[400px]" icon={<IconPlus width="16" height="16" />}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] text-text-2 font-medium tracking-[0.03em]">Tipo de membresía *</label>
            <div className="grid grid-cols-2 gap-2">
              {membershipTypes.filter((t) => t.is_active).map((type) => {
                const selected = selType === type.id;
                const isVisitaType = type.name === 'Visita';
                return (
                  <button key={type.id} type="button"
                    onClick={() => {
                      setSelType(type.id);
                      if (isVisitaType) setStartDate(today);
                    }}
                    className={`relative flex flex-col items-start p-3 rounded-sm border text-left transition-all duration-150 cursor-pointer font-sans
                      ${selected
                        ? 'border-accent bg-accent/8 ring-1 ring-accent/40'
                        : 'border-border2 bg-surface2 hover:border-text-3'
                      }`}
                  >
                    <div className={`text-[13px] font-semibold ${selected ? 'text-accent' : 'text-text'}`}>
                      {type.name}
                    </div>
                    <div className="text-[18px] font-bold tracking-tight mt-1">
                      ${type.price.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-text-3 mt-0.5">
                      {isVisitaType ? 'Hoy · 1 día' : `${type.duration_days} días`}
                    </div>
                    {selected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selType && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-text-2 font-medium">Miembro *</label>
                <select
                  value={selMember}
                  onChange={(e) => setSelMember(e.target.value)}
                  className="bg-surface2 border border-border2 text-text text-[13px] px-3 py-[9px] rounded-sm outline-none w-full font-sans cursor-pointer"
                >
                  <option value="">Seleccionar miembro</option>
                  {memberList.filter((m) => m.role === 'member').map((m) => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>

              {isVisita ? (
                <div className="border border-accent/20 bg-accent/5 rounded-sm p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[12px] text-text-2 font-medium tracking-[0.03em] uppercase">Pase del día</div>
                    <Badge variant="accent" dot>Vence hoy</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-text">
                    <IconCalendar width="14" height="14" className="text-text-3 shrink-0" />
                    {new Date(startDate || today).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="mt-2 text-[11px] text-text-3 leading-relaxed">
                    Membresía válida únicamente el día de hoy. No requiere renovación.
                  </div>
                </div>
              ) : (
                <>
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
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] text-text-2 font-medium">Fecha de vencimiento</label>
                      <div className="flex items-center gap-2 text-[13px] text-text px-3 py-[9px] bg-surface2 border border-border2 rounded-sm opacity-80">
                        <IconCalendar width="13" height="13" className="text-text-3 shrink-0" />
                        {new Date(computedEnd).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {selMember && (
                <div className="text-[11px] text-text-3 bg-amber-bg border border-amber/20 rounded-sm p-2.5 leading-relaxed">
                  {isVisita
                    ? 'Se creará un pase de Visita con vencimiento hoy. El miembro podrá ingresar el día de hoy únicamente.'
                    : 'La fecha de vencimiento se calcula automáticamente según la duración del tipo de membresía seleccionado.'}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[12px] text-text-2 font-medium tracking-[0.03em]">Método de pago <span className="text-text-3 font-normal">(opcional)</span></label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { value: 'cash' as const, label: 'Efectivo' },
                    { value: 'transfer' as const, label: 'Transferencia' },
                    { value: 'pending' as const, label: 'Pendiente', center: true },
                  ].map((opt) => {
                    const selected = paymentMethod === opt.value;
                    return (
                      <button key={opt.value} type="button"
                        onClick={() => setPaymentMethod(selected ? '' : opt.value)}
                        className={`flex items-center gap-2 px-3 py-[9px] rounded-sm border text-[12px] font-medium transition-all duration-150 cursor-pointer font-sans
                          ${(opt as any).center ? 'col-span-2 justify-center' : 'text-left'}
                          ${selected
                            ? 'border-accent bg-accent/8 ring-1 ring-accent/40 text-accent'
                            : 'border-border2 bg-surface2 hover:border-text-3 text-text-2'
                          }`}
                      >
                        {selected && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        <span className={selected ? 'text-accent' : 'text-text-2'}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                {selTypeData && paymentMethod && (
                  <div className="flex items-center gap-2 text-[12px] text-text-2 px-3 py-2 bg-surface2 border border-border2 rounded-sm">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-3 shrink-0">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <span><strong className="text-text">${selTypeData.price.toLocaleString()}</strong> — {paymentMethod === 'pending' ? 'Pendiente' : 'Pagado'} · {new Date(startDate || today).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2.5 mt-1">
          <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarMembresia} disabled={!selMember || !selType || !startDate || saving}>
            {saving ? 'Guardando…' : 'Guardar membresía'}
          </Button>
        </div>
      </Modal>

      <Modal open={editId !== null} onClose={() => setEditId(null)} title="Editar membresía" className="max-w-[400px]" icon={<IconEdit width="16" height="16" />}>
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
