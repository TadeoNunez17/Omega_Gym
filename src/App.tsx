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
import CheckInPage from '@/pages/kiosk/CheckIn'
import MyPlanPage from '@/pages/member/MyPlan'
import MyMembershipPage from '@/pages/member/MyMembership'
import MyPaymentsPage from '@/pages/member/MyPayments'
import MyCheckinsPage from '@/pages/member/MyCheckins'
import MyProfilePage from '@/pages/member/MyProfile'

function AppLayout() {
  const user = useAuthStore((s) => s.user)
  if (user?.role === 'trainer') return <TrainerLayout />
  return <AdminLayout />
}

function RootRedirect() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin' || user.role === 'trainer') return <Navigate to="/dashboard" replace />
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

        {/* Shared routes — admin + trainer */}
        <Route element={<ProtectedRoute roles={['admin', 'trainer']}><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/memberships" element={<MembershipsPage />} />
          <Route path="/training-plans" element={<TrainingPlansPage />} />
        </Route>

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/members/:id" element={<MemberDetailPage />} />
          {import.meta.env.DEV && <Route path="/fingerprint" element={<FingerprintPage />} />}
        </Route>

        <Route element={<ProtectedRoute roles={['member', 'admin', 'trainer']}><MemberLayout /></ProtectedRoute>}>
          <Route path="/my-plan" element={<MyPlanPage />} />
          <Route path="/my-membership" element={<MyMembershipPage />} />
          <Route path="/my-payments" element={<MyPaymentsPage />} />
          <Route path="/my-checkins" element={<MyCheckinsPage />} />
          <Route path="/my-profile" element={<MyProfilePage />} />
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthInit>
  )
}
