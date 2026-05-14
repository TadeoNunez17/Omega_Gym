import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from '@/components/ui/layout/BottomNav'

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-bg">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <main className="flex-1 flex flex-col min-h-screen pb-16 lg:pb-0 lg:ml-[220px]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
