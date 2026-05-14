import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg relative overflow-hidden">
      <div className="absolute -top-1/5 -right-[10%] w-[40%] h-[60%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.06) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-[15%] -left-[5%] w-[35%] h-[50%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.04) 0%, transparent 70%)' }} />
      <div className="w-[400px] max-w-[92vw]">
        <div className="text-center mb-8">
          <div className="text-[28px] font-bold -tracking-[0.03em]">Ω Omega Gym</div>
          <div className="text-[12px] text-text-3 mt-1">Sistema de Gestión</div>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
