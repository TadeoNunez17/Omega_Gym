import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from '@/components/ui/layout/BottomNav'
import { paymentsService } from '@/services/payments.service'

export function AdminLayout() {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    paymentsService.getPendingCount().then(setPendingCount).catch(() => {})
  }, [])

  return (
    <div className="flex min-h-screen bg-bg">
      <div className="hidden lg:block">
        <Sidebar pendingPaymentsCount={pendingCount} />
      </div>
      <main className="flex-1 flex flex-col min-h-screen pb-16 lg:pb-0 lg:ml-[220px]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
