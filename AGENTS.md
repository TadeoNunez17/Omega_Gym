# Omega Gym

Gimnasio SaaS con panel admin, entrenadores, miembros y quiosco de check-in.

## Stack

- **Framework:** React 19 + Vite 8 + TypeScript 6
- **Routing:** React Router v7 (BrowserRouter, layouts anidados con Outlet)
- **State:** Zustand 5 (store de auth)
- **Styling:** Tailwind CSS v4 (modo oscuro, acento amarillo `#e8ff47`)
- **Backend:** Supabase (PostgreSQL 17, auth, RLS)
- **Notifications:** Sonner
- **PWA:** vite-plugin-pwa (cache NetworkFirst para Supabase)
- **Deploy:** Vercel (SPA rewrites)
- **Icons:** SVG inline en `src/lib/icons.tsx`

## Scripts

```
npm run dev      -> vite
npm run build    -> tsc -b && vite build
npm run lint     -> eslint .
npm run preview  -> vite preview
```

## Estructura

```
src/
  main.tsx                  # Entry: StrictMode + BrowserRouter + Toaster + App
  App.tsx                   # Router raíz con layouts anidados
  index.css                 # Tailwind v4 + tema oscuro
  lib/
    supabase.ts             # Cliente Supabase
    helpers.ts              # fmtDate, fmtMoney, initials, avatarColor, daysDiff
    icons.tsx               # 12 iconos SVG inline
  store/
    auth.store.ts           # Zustand: user, loading, login, register, logout, initialize
  services/                 # 9 servicios que envuelven Supabase queries
    auth.service.ts         # login, register, getSession, getProfile
    members.service.ts      # CRUD miembros, claim codes, stats
    memberships.service.ts  # membership_types, memberships, expiring
    payments.service.ts     # pagos con filtros y revenue
    training.service.ts     # training_plans, plan_exercises
    checkIns.service.ts     # check-ins diarios
    dashboard.service.ts    # KPIs, revenue, distribution, activity
    trainer.service.ts      # vistas de entrenador (delega a otros services)
    sms.service.ts          # SMS/email simulados con console.log
  components/
    auth/                   # AuthProvider (init), ProtectedRoute (roles)
    layout/                 # AdminLayout, TrainerLayout, MemberLayout, AuthLayout, Sidebar, BottomNav
    ui/atoms/               # Avatar, Badge, Button, Chip, EmptyState, IconButton, Input, LoadingSpinner, MetricCard
    ui/molecules/           # Modal, PageHeader, Pagination, ResponsiveTable, SearchInput, TabBar
    ui/layout/              # BottomNav
  pages/
    auth/                   # Login, Register, ClaimAccount
    dashboard/              # Dashboard, Members, MemberDetail, Memberships, Payments, TrainingPlans, Fingerprint, Reports
    trainer/                # Panel, Members, Plans, Templates
    member/                 # MyPlan
    kiosk/                  # CheckIn
supabase/
  migrations/               # 16 migraciones (orden cronológico)
  config.toml               # Config local de Supabase
data/supabase/
  schema/                   # SQLs de referencia (initial, rls, pre-registration)
  DATABASE_CONFIG.yaml      # Contrato de base de datos
```

## Base de datos (7 tablas)

- `profiles` — Usuarios (id UUID independiente de auth.users, role: admin/trainer/member, registration_status: pending/claimed/registered, auth_user_id, claim_code_hash)
- `membership_types` — Tipos de membresía (nombre, precio, duración)
- `memberships` — Asignaciones miembro-membresía (member_id FK, start/end_date, estado)
- `payments` — Pagos (member_id FK, amount, fecha, método, referencias)
- `training_plans` — Planes de entrenamiento (template o asignado, assigned_to, created_by)
- `plan_exercises` — Ejercicios de un plan (plan_id FK, ejercicio, series, reps, muscle)
- `check_ins` — Check-in diario (member_id FK, fecha)

RLS implementado con funciones SECURITY DEFINER: `is_admin()`, `is_trainer_or_admin()`.

## Roles y ruteo

- **admin** -> AdminLayout (sidebar + bottom nav): Dashboard, Members, Memberships, Payments, TrainingPlans, Fingerprint, Reports
- **trainer** -> TrainerLayout: Panel, Members, Plans, Templates
- **member** -> MemberLayout: MyPlan
- **kiosk** -> CheckIn (público, standalone)

ProtectedRoute filtra por `roles={['admin']}` | `['trainer','admin']` | `['member','admin']`.

## Convenciones de código

- Archivos: kebab-case para pages/services, PascalCase para componentes
- Servicios: `*.service.ts` con export { método1, método2 } 
- Stores: `*.store.ts` con hook `use*Store`
- Types: inline en cada service (no hay `src/types/`)
- Path alias: `@/*` -> `./src/*`
- UI en español
- Sin tests aún (mencionado en SPEC pero no implementado)
- Sin custom hooks (data fetching con useEffect + useState en pages)
- Sin React Query / SWR
- Errores de servicios propagados a componentes (sin try/catch en services)
