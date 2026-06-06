import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { AuthInit } from '@/components/auth/AuthProvider'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { TrainerLayout } from '@/components/layout/TrainerLayout'
import { MemberLayout } from '@/components/layout/MemberLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'

import LoginPage from '@/pages/auth/Login'
import RegisterPage from '@/pages/auth/Register'
import AuthCallbackPage from '@/pages/auth/AuthCallback'
import DashboardPage from '@/pages/dashboard/Dashboard'
import MembersPage from '@/pages/dashboard/Members'
import MemberDetailPage from '@/pages/dashboard/MemberDetail'
import MembershipsPage from '@/pages/dashboard/Memberships'
import PaymentsPage from '@/pages/dashboard/Payments'
import TrainingPlansPage from '@/pages/dashboard/TrainingPlans'
import FingerprintPage from '@/pages/dashboard/Fingerprint'
import ReportsPage from '@/pages/dashboard/Reports'
import CheckInPage from '@/pages/kiosk/CheckIn'
import MyPlanPage from '@/pages/member/MyPlan'
import TrainerPanel from '@/pages/trainer/Panel'
import TrainerMemberships from '@/pages/trainer/Memberships'
import TrainerPlans from '@/pages/trainer/Plans'
import TrainerTemplates from '@/pages/trainer/Templates'

function RootRedirect() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/dashboard" replace />
  if (user.role === 'trainer') return <Navigate to="/trainer/panel" replace />
  return <Navigate to="/my-plan" replace />
}

export default function App() {
  return (
    <AuthInit>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="/check-in" element={<CheckInPage />} />

        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        <Route element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/:id" element={<MemberDetailPage />} />
          <Route path="/memberships" element={<MembershipsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/training-plans" element={<TrainingPlansPage />} />
          <Route path="/fingerprint" element={<FingerprintPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['trainer', 'admin']}><TrainerLayout /></ProtectedRoute>}>
          <Route path="/trainer/panel" element={<TrainerPanel />} />
          <Route path="/trainer/memberships" element={<TrainerMemberships />} />
          <Route path="/trainer/plans" element={<TrainerPlans />} />
          <Route path="/trainer/templates" element={<TrainerTemplates />} />
        </Route>

        <Route element={<ProtectedRoute roles={['member', 'admin']}><MemberLayout /></ProtectedRoute>}>
          <Route path="/my-plan" element={<MyPlanPage />} />
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthInit>
  )
}
