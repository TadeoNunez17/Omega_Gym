import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { paymentsService, type Payment } from '@/services/payments.service'
import { LoadingSpinner } from '@/components/ui/atoms/LoadingSpinner'
import { Badge } from '@/components/ui/atoms/Badge'
import { MetricCard } from '@/components/ui/atoms/MetricCard'
import { Modal } from '@/components/ui/molecules/Modal'
import { fmtDate, fmtMoney } from '@/lib/helpers'

const METHOD_LABEL: Record<string, string> = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' }

const staggerClass = (i: number) => {
  const map = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5']
  return map[i] || ''
}

function IconPaid() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}
function IconCount() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
}

export default function MyPaymentsPage() {
  const user = useAuthStore(s => s.user)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [receipt, setReceipt] = useState<Payment | null>(null)

  useEffect(() => {
    if (!user) return
    const ctrl = { ignore: false }
    paymentsService.getByMember(user.id).then(data => {
      if (!ctrl.ignore) setPayments(data)
    }).finally(() => {
      if (!ctrl.ignore) setLoading(false)
    })
    return () => { ctrl.ignore = true }
  }, [user])

  if (loading) return <LoadingSpinner text="Cargando pagos…" />

  const paidTotal = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const lastPayment = payments.find(p => p.status === 'paid') || payments[0]

  return (<>
      <header className="px-4 sm:px-7 h-14 flex items-center justify-between border-b border-border bg-surface2 sticky top-0 z-9">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-text-3">
          <div className="w-4 h-4 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full" width="16" height="16">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="text-text-4 mx-0.5">/</span>
          <span className="font-medium text-text-1">Mis pagos</span>
        </div>
        <div />
      </header>
    <div className="p-4 sm:p-7 flex-1">


      {payments.length === 0 ? (
        <div className={`bg-surface border border-border rounded-xl p-10 flex flex-col items-center gap-4 text-center animate-slide-up ${staggerClass(1)}`}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </div>
          <div>
            <div className="text-[15px] font-semibold mb-1">Sin pagos registrados</div>
            <div className="text-[13px] text-text-3">Aún no hay transacciones en tu cuenta.</div>
          </div>
        </div>
      ) : (
        <>
          <div className={`grid grid-cols-2 gap-2.5 mb-4 animate-slide-up ${staggerClass(1)}`}>
            <MetricCard icon={<IconPaid />} label="Pagado este año" value={fmtMoney(paidTotal)} color="green" />
            <MetricCard icon={<IconCount />} label="Pagos registrados" value={payments.length} color="accent" />
          </div>

          {lastPayment && (
            <div className={`bg-surface border border-border rounded-xl p-4 mb-4 animate-slide-up ${staggerClass(2)}`}>
              <div className="text-[11px] font-medium text-text-3 uppercase tracking-[0.4px] mb-3">Último pago</div>
              <div className="divide-y divide-[#222]">
                <div className="flex justify-between items-center py-2">
                  <span className="flex items-center gap-2 text-[13px] text-text-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Fecha
                  </span>
                  <span className="text-[13px] font-medium">{fmtDate(lastPayment.payment_date)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="flex items-center gap-2 text-[13px] text-text-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Monto
                  </span>
                  <span className="text-[13px] font-medium">{fmtMoney(lastPayment.amount)} MXN</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="flex items-center gap-2 text-[13px] text-text-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    Método
                  </span>
                  <span className="text-[13px] font-medium">{METHOD_LABEL[lastPayment.method] || lastPayment.method}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="flex items-center gap-2 text-[13px] text-text-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60"><polyline points="20 6 9 17 4 12"/></svg>
                    Estado
                  </span>
                  <span className={`text-[11px] font-medium px-2 py-[3px] rounded-[5px] ${lastPayment.status === 'paid' ? 'bg-green-bg text-green-text' : lastPayment.status === 'pending' ? 'bg-amber-bg text-amber-text' : 'bg-red-bg text-red-text'}`}>
                    {lastPayment.status === 'paid' ? 'Confirmado' : lastPayment.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className={`bg-surface border border-border rounded-xl p-4 animate-slide-up ${staggerClass(3)}`}>
            <div className="text-[11px] font-medium text-text-3 uppercase tracking-[0.4px] mb-3">Historial completo</div>
            {payments.map((p, i) => (
              <div key={p.id} className={`flex items-center justify-between py-2.5 ${i < payments.length - 1 ? 'border-b border-[#222]' : ''}`}>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">{p.concept || 'Membresía'} · {fmtDate(p.payment_date).split(' ')[1] || ''} {fmtDate(p.payment_date).split(' ')[2] || ''}</div>
                  <div className="text-[11px] text-text-3 mt-0.5">{fmtDate(p.payment_date)} · {METHOD_LABEL[p.method] || p.method}</div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className={`text-[13px] font-medium ${p.status === 'paid' ? 'text-green-text' : p.status === 'pending' ? 'text-amber-text' : 'text-red-text'}`}>{fmtMoney(p.amount)}</div>
                  <span className={`inline-block mt-0.5 text-[11px] font-medium px-2 py-[2px] rounded-[5px] ${p.status === 'paid' ? 'bg-green-bg text-green-text' : p.status === 'pending' ? 'bg-amber-bg text-amber-text' : 'bg-red-bg text-red-text'}`}>
                    {p.status === 'paid' ? 'Pagado' : p.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal compact icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      } title="COMPROBANTE" open={receipt !== null} onClose={() => setReceipt(null)}>
        {receipt && (
          <>
            <div className="flex flex-col items-center mb-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-accent-dim mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              <div className="text-[30px] font-semibold font-mono leading-none -tracking-[0.03em]" style={{ color: receipt.status === 'paid' ? 'var(--green-text)' : receipt.status === 'pending' ? 'var(--amber-text)' : 'var(--red-text)' }}>
                {fmtMoney(receipt.amount)}
              </div>
              <div className="mt-2.5">
                {receipt.status === 'paid' ? <Badge variant="green" dot>Pagado</Badge> : receipt.status === 'pending' ? <Badge variant="amber" dot>Pendiente</Badge> : <Badge variant="red" dot>Cancelado</Badge>}
              </div>
            </div>

            <div className="border-t border-dashed border-border pt-4 flex flex-col gap-3.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-text-3 uppercase tracking-[0.06em]">Concepto</span>
                <span className="text-[13px] font-medium text-right max-w-[200px]">{receipt.concept || 'Membresía'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-text-3 uppercase tracking-[0.06em]">Método</span>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
                  {receipt.method === 'cash' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg>}
                  {receipt.method === 'card' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
                  {receipt.method === 'transfer' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>}
                  {METHOD_LABEL[receipt.method] || receipt.method}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-text-3 uppercase tracking-[0.06em]">Fecha</span>
                <span className="text-[13px] font-medium">{fmtDate(receipt.payment_date)}</span>
              </div>
              {receipt.notes && (
                <div className="flex justify-between items-start">
                  <span className="text-[11px] text-text-3 uppercase tracking-[0.06em]">Notas</span>
                  <span className="text-[12px] text-text-2 text-right max-w-[200px] italic">{receipt.notes}</span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-border mt-5 pt-4 flex justify-center">
              <span className="text-[10px] text-text-3 tracking-[0.08em]">omega gym · recibo #{receipt.id.slice(0, 8)}</span>
            </div>
          </>
        )}
      </Modal>
    </div>
    </>
  )
}
