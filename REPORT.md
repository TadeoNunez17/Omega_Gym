# Omega Gym — Reporte Técnico Completo

> **Generado**: 2026-06-22  
> **Propósito**: Documentación exhaustiva del proyecto para onboarding, revisión y mantenimiento  
> **Total archivos relevados**: ~129

---

## Índice

1. [Resumen del Proyecto](#1-resumen-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Proyecto](#3-arquitectura-del-proyecto)
4. [Base de Datos](#4-base-de-datos)
5. [Migraciones](#5-migraciones)
6. [Row Level Security (RLS)](#6-row-level-security-rls)
7. [Autenticación y Roles](#7-autenticación-y-roles)
8. [Rutas y Layouts](#8-rutas-y-layouts)
9. [Páginas por Módulo](#9-páginas-por-módulo)
10. [Componentes UI](#10-componentes-ui)
11. [Servicios (API Layer)](#11-servicios-api-layer)
12. [Stores (Estado Global)](#12-stores-estado-global)
13. [Librerías (lib/)](#13-librerías-lib)
14. [PWA](#14-pwa)
15. [Diseño y Temas](#15-diseño-y-temas)
16. [Documentación y Metodología](#16-documentación-y-metodología)
17. [Bugs Conocidos](#17-bugs-conocidos)
18. [Estadísticas del Proyecto](#18-estadísticas-del-proyecto)

---

## 1. Resumen del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre** | Omega Gym |
| **Descripción** | SaaS de gestión de gimnasio: panel admin, entrenadores, miembros y quiosco de check-in |
| **Estado** | En desarrollo activo |
| **Metodología** | SPEC Driven Development (SDD) |
| **Frontend** | React 19 + Vite 8 + TypeScript 6 |
| **Backend** | Supabase (PostgreSQL 17, Auth, RLS) |
| **Despliegue** | Vercel (SPA rewrites) |
| **PWA** | Sí (vite-plugin-pwa) |
| **Notificaciones** | Sonner |
| **Branch principal** | `main` |
| **Último commit** | 2026-06-19 — `feat(pwa): add PWA support with network-first strategy` |

---

## 2. Stack Tecnológico

### 2.1 Dependencias de Producción

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `react` | `^19.0.0` | UI framework |
| `react-dom` | `^19.0.0` | Renderizado DOM |
| `react-router-dom` | `^7.0.0` | Enrutamiento SPA |
| `@supabase/supabase-js` | `^2.49.0` | Cliente Supabase |
| `zustand` | `^5.0.0` | Estado global |
| `sonner` | `^2.0.0` | Toast notifications |
| `zod` | `^3.24.0` | Validación de schemas |
| `html2canvas` | `^1.4.1` | Captura de pantalla (fingerprint) |

### 2.2 Dependencias de Desarrollo

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `vite` | `^6.0.0` | Bundler / dev server |
| `@vitejs/plugin-react` | `^5.0.0` | Integración React con Vite |
| `typescript` | `~6.0.0` | Lenguaje |
| `@types/react` | `^19.0.0` | Tipos React |
| `@types/react-dom` | `^19.0.0` | Tipos ReactDOM |
| `tailwindcss` | `^4.0.0` | CSS utility framework |
| `@tailwindcss/vite` | `^4.0.0` | Plugin Tailwind para Vite |
| `eslint` | `^9.0.0` | Linter |
| `@eslint/js` | `^9.0.0` | Config ESLint base |
| `typescript-eslint` | `^8.0.0` | ESLint para TypeScript |
| `eslint-plugin-react-hooks` | `^5.0.0` | Reglas hooks |
| `eslint-plugin-react-refresh` | `^0.4.0` | Reglas React Refresh |
| `vite-plugin-pwa` | `^1.0.0` | PWA Service Worker |
| `globals` | `^16.0.0` | Globals de ESLint |

### 2.3 Versiones del Runtime

| Herramienta | Versión |
|-------------|---------|
| Node.js | 18+ |
| npm | (no especificado) |
| PostgreSQL (Supabase) | 17 |

---

## 3. Arquitectura del Proyecto

### 3.1 Árbol Completo de Directorios

```
omega-gym/
│
├── index.html                          # Entry HTML de Vite
├── package.json                        # Dependencias y scripts
├── vite.config.ts                      # Configuración de Vite
├── tsconfig.json                       # Config TypeScript raíz
├── tsconfig.app.json                   # Config TS para app
├── tsconfig.node.json                  # Config TS para tooling
├── eslint.config.js                    # Config ESLint flat
├── vercel.json                         # Config despliegue Vercel
├── .env.example                        # Variables de entorno (template)
├── .prettierignore                     # Archivos ignorados por Prettier
│
├── public/                             # Assets estáticos
│   └── omega-logo.svg                  # Logo SVG
│
├── src/                                # Código fuente
│   ├── main.tsx                        # Entry point (StrictMode + BrowserRouter + App)
│   ├── App.tsx                         # Router raíz con layouts
│   ├── index.css                       # Tailwind v4 imports + tema oscuro
│   ├── vite-env.d.ts                   # Tipos de Vite
│   │
│   ├── lib/                            # Librerías y utilidades
│   │   ├── supabase.ts                 # Cliente Supabase singleton
│   │   ├── helpers.ts                  # Utilidades (fmtDate, fmtMoney, initials, etc.)
│   │   └── icons.tsx                   # 12 iconos SVG inline
│   │
│   ├── store/                          # Estado global (Zustand)
│   │   ├── auth.store.ts              # Auth: user, session, login, register, logout
│   │   ├── sidebar.store.ts           # Sidebar: estado open/close
│   │   └── theme.store.ts             # Tema: dark/light con persistencia localStorage
│   │
│   ├── services/                       # Capa de datos (Supabase queries)
│   │   ├── auth.service.ts            # Auth: login, register, getSession, getProfile
│   │   ├── members.service.ts         # Miembros: CRUD, claim codes, stats
│   │   ├── memberships.service.ts     # Membresías: types, memberships, expiring
│   │   ├── payments.service.ts        # Pagos: CRUD con filtros, revenue
│   │   ├── training.service.ts        # Planes: training_plans, plan_exercises
│   │   ├── checkIns.service.ts        # Check-ins: registro diario
│   │   ├── dashboard.service.ts       # KPIs: revenue, distribution, activity
│   │   └── trainer.service.ts         # Trainer: delega a otros services
│   │
│   ├── components/                    # Componentes React
│   │   ├── auth/                      # Componentes de autenticación
│   │   │   ├── AuthInit.tsx           # Inicializa auth (escucha sesión)
│   │   │   └── ProtectedRoute.tsx     # Guard de rutas por rol
│   │   │
│   │   ├── ui/                       # Componentes de UI
│   │   │   ├── atoms/                # Componentes atómicos
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Chip.tsx
│   │   │   │   ├── IconButton.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── MetricCard.tsx
│   │   │   │
│   │   │   ├── molecules/            # Componentes moleculares
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   ├── Pagination.tsx
│   │   │   │   ├── ResponsiveTable.tsx
│   │   │   │   ├── SearchInput.tsx
│   │   │   │   └── TabBar.tsx
│   │   │   │
│   │   │   └── layout/              # Componentes de layout
│   │   │       └── BottomNav.tsx
│   │   │
│   │   └── layout/                  # Layouts de páginas
│   │       ├── AdminLayout.tsx
│   │       ├── TrainerLayout.tsx
│   │       ├── MemberLayout.tsx
│   │       ├── AuthLayout.tsx
│   │       └── KioskLayout.tsx
│   │
│   ├── pages/                       # Páginas por rol
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ClaimAccount.tsx
│   │   │
│   │   ├── dashboard/              # Admin
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Members.tsx
│   │   │   ├── MemberDetail.tsx
│   │   │   ├── Memberships.tsx
│   │   │   ├── Payments.tsx
│   │   │   ├── TrainingPlans.tsx
│   │   │   ├── Fingerprint.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── Settings.tsx
│   │   │
│   │   ├── trainer/
│   │   │   ├── Panel.tsx
│   │   │   ├── Members.tsx
│   │   │   ├── Plans.tsx
│   │   │   └── Templates.tsx
│   │   │
│   │   ├── member/
│   │   │   └── MyPlan.tsx
│   │   │
│   │   ├── kiosk/
│   │   │   └── CheckIn.tsx
│   │   │
│   │   └── NotFound.tsx            # 404
│   │
│   └── supabase/                    # Schema de referencia para el frontend
│       └── schema-reference.ts
│
├── supabase/                        # Configuración Supabase CLI
│   ├── config.toml                  # Config local Supabase
│   ├── seed.sql                     # Seed data
│   └── migrations/                  # 45 migraciones SQL
│       ├── 20260514000001_initial_schema.sql
│       ├── 20260514000002_rls_policies.sql
│       ├── ...
│       └── 20260616000013_fix_session_handling.sql
│
├── data/supabase/                   # Documentación de BD
│   ├── DATABASE_CONFIG.yaml         # Config formal de BD
│   └── schema/
│       ├── 001_initial.sql           # Schema inicial de referencia
│       ├── 002_rls.sql               # RLS de referencia
│       └── 003_pre-registration.sql  # Schema de pre-registro
│
├── ai_work_flow/                    # Metodología SDD
│   ├── docs/specs/
│   │   ├── SPECIFICATION.md         # Especificación principal
│   │   └── incremental/            # Especificaciones incrementales
│   │       └── 001_check_in_kiosk.yaml
│   │
│   ├── knowledge/
│   │   ├── local/
│   │   │   └── 2026-06-03-simplificacion-auth.md
│   │   └── remote/                 # Referencias externas
│   │
│   └── tickets/
│       ├── README.md
│       └── TKT-OMEGYM-014.md       # Google OAuth + pre-registro
│
├── tests/                           # Tests (pendientes)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── AGENTS.md                        # Onboarding técnico para IA
├── BUGS.md                          # Bug tracker (15 bugs)
├── README.md                        # README principal
└── REPORT.md                        # Este archivo
```

### 3.2 Total de Archivos por Categoría

| Categoría | Archivos |
|-----------|:--------:|
| Configuración raíz | 9 |
| `public/` | 1 |
| `src/` (código fuente) | ~55 |
| `supabase/` (migraciones + config) | 47 |
| `data/supabase/` | 4 |
| `ai_work_flow/` | ~6 |
| `tests/` | ~3 |
| Documentación raíz | 4 |
| **Total** | **~129** |

---

## 4. Base de Datos

### 4.1 Esquema General

El sistema usa **PostgreSQL 17** en Supabase con **7 tablas activas** y **funciones SECURITY DEFINER** para RLS.

### 4.2 Tabla: `profiles`

| Columna | Tipo | Default | Constraints |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | `PRIMARY KEY` |
| `full_name` | `text` | — | `NOT NULL` |
| `email` | `text` | — | `UNIQUE`, `NOT NULL` |
| `phone` | `text` | — | `UNIQUE` |
| `role` | `text` | `'member'` | `CHECK (role IN ('admin','trainer','member'))` |
| `avatar_url` | `text` | — | — |
| `claim_code` | `text` | — | `UNIQUE` |
| `claim_code_expires_at` | `timestamptz` | — | — |
| `registration_status` | `text` | `'pending'` | `CHECK (registration_status IN ('pending','claimed','registered'))` |
| `auth_user_id` | `uuid` | — | `REFERENCES auth.users(id) ON DELETE SET NULL` |
| `created_at` | `timestamptz` | `now()` | — |
| `updated_at` | `timestamptz` | `now()` | — |

**Índices**: `profiles_auth_user_id_idx` (ON auth_user_id), `profiles_email_key`, `profiles_phone_key`, `profiles_claim_code_key`

### 4.3 Tabla: `membership_types`

| Columna | Tipo | Default | Constraints |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | `PRIMARY KEY` |
| `name` | `text` | — | `NOT NULL` |
| `price` | `numeric(10,2)` | — | `NOT NULL` |
| `duration_days` | `integer` | — | `NOT NULL` |
| `description` | `text` | — | — |
| `is_active` | `boolean` | `true` | — |
| `created_at` | `timestamptz` | `now()` | — |

### 4.4 Tabla: `memberships`

| Columna | Tipo | Default | Constraints |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | `PRIMARY KEY` |
| `member_id` | `uuid` | — | `REFERENCES profiles(id) ON DELETE CASCADE`, `NOT NULL` |
| `type_id` | `uuid` | — | `REFERENCES membership_types(id)`, `NOT NULL` |
| `start_date` | `date` | — | `NOT NULL` |
| `end_date` | `date` | — | `NOT NULL` |
| `status` | `text` | `'active'` | `CHECK (status IN ('active','expired','cancelled'))` |
| `created_at` | `timestamptz` | `now()` | — |

### 4.5 Tabla: `payments`

| Columna | Tipo | Default | Constraints |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | `PRIMARY KEY` |
| `member_id` | `uuid` | — | `REFERENCES profiles(id) ON DELETE CASCADE`, `NOT NULL` |
| `membership_type_id` | `uuid` | — | `REFERENCES membership_types(id) ON DELETE SET NULL` |
| `amount` | `numeric(10,2)` | — | `NOT NULL` |
| `payment_date` | `date` | — | `NOT NULL` |
| `method` | `text` | — | `CHECK (method IN ('cash','card','transfer'))` |
| `status` | `text` | `'paid'` | `CHECK (status IN ('paid','pending','cancelled'))` |
| `notes` | `text` | — | — |
| `created_at` | `timestamptz` | `now()` | — |

### 4.6 Tabla: `training_plans`

| Columna | Tipo | Default | Constraints |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | `PRIMARY KEY` |
| `name` | `text` | — | `NOT NULL` |
| `description` | `text` | — | — |
| `assigned_to` | `uuid` | — | `REFERENCES profiles(id) ON DELETE SET NULL` |
| `created_by` | `uuid` | — | `REFERENCES profiles(id)`, `NOT NULL` |
| `is_template` | `boolean` | `false` | — |
| `created_at` | `timestamptz` | `now()` | — |
| `updated_at` | `timestamptz` | `now()` | — |

### 4.7 Tabla: `plan_exercises`

| Columna | Tipo | Default | Constraints |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | `PRIMARY KEY` |
| `plan_id` | `uuid` | — | `REFERENCES training_plans(id) ON DELETE CASCADE`, `NOT NULL` |
| `exercise_name` | `text` | — | `NOT NULL` |
| `sets` | `integer` | — | — |
| `reps` | `integer` | — | — |
| `rest_seconds` | `integer` | — | — |
| `notes` | `text` | — | — |
| `order_index` | `integer` | `0` | `NOT NULL` |
| `created_at` | `timestamptz` | `now()` | — |

### 4.8 Tabla: `check_ins`

| Columna | Tipo | Default | Constraints |
|---------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | `PRIMARY KEY` |
| `member_id` | `uuid` | — | `REFERENCES profiles(id)`, `NOT NULL` |
| `check_in_date` | `date` | `CURRENT_DATE` | `NOT NULL` |
| `check_in_time` | `time` | `CURRENT_TIME` | — |
| `method` | `text` | `'fingerprint'` | `CHECK (method IN ('fingerprint','manual','code'))` |
| `created_at` | `timestamptz` | `now()` | — |

**Índice único**: `check_ins_member_date_key` (ON member_id, check_in_date) — un check-in por miembro por día.

### 4.9 Resumen de Relaciones

```
profiles (1) ────< (N) memberships        (member_id FK)
profiles (1) ────< (N) payments           (member_id FK)
profiles (1) ────< (N) training_plans     (assigned_to FK)
profiles (1) ────< (N) training_plans     (created_by FK)
profiles (1) ────< (N) check_ins          (member_id FK)
membership_types (1) ────< (N) memberships (type_id FK)
membership_types (1) ────< (N) payments    (membership_type_id FK)
training_plans (1) ────< (N) plan_exercises (plan_id FK, CASCADE)
```

### 4.10 DATABASE_CONFIG.yaml — Estado Actual

| Campo | Valor |
|-------|-------|
| **Engine** | supabase |
| **Type** | postgresql_managed |
| **Project Ref** | `jaltwjcipyrnmvjkdqdp` |
| **Region** | us-east-1 |
| **Environment** | development |
| **Model Status** | `active` (última revisión: 2026-05-14) |
| **RLS** | Activado en todas las tablas (7/7) |

---

## 5. Migraciones

### 5.1 Resumen

| Total de migraciones | 45 |
|:---------------------|:--:|
| **Rango de fechas** | 2026-05-14 → 2026-06-16 |
| **Propósito inicial** | Schema + RLS |
| **Migraciones intermedias** | Pre-registro, vinculación auth, simplificación |
| **Últimas** | Fix session handling, fixes varios |

### 5.2 Lista Cronológica Completa

| # | Archivo | Fecha | Propósito |
|:-:|---------|-------|-----------|
| 1 | `20260514000001_initial_schema.sql` | 2026-05-14 | Schema inicial (profiles, membership_types, memberships, payments, training_plans, plan_exercises) + índices + triggers updated_at |
| 2 | `20260514000002_rls_policies.sql` | 2026-05-14 | RLS inicial + funciones SECURITY DEFINER `is_admin()`, `get_my_role()` |
| 3 | `20260514000003_check_ins.sql` | 2026-05-14 | Tabla check_ins + RLS |
| 4 | `20260514000004_add_member_id_to_payments.sql` | 2026-05-16 | Agrega `member_id` a payments (antes referenciaba solo membership_id) |
| 5 | `20260514000005_add_membership_type_id_to_payments.sql` | 2026-05-16 | Agrega `membership_type_id` a payments |
| 6 | `20260514000006_members_rls_policy.sql` | 2026-05-16 | RLS específica para miembros |
| 7 | `20260514000007_payments_rls_policy.sql` | 2026-05-16 | RLS específica para pagos |
| 8 | `20260514000008_dashboard_stats.sql` | 2026-05-16 | Función `get_dashboard_stats()` para KPIs |
| 9 | `20260514000009_fix_member_id_reference.sql` | 2026-05-17 | Fix FK member_id en payments |
| 10 | `20260514000010_default_member_id.sql` | 2026-05-17 | Default value para member_id |
| 11 | `20260514000011_member_id_not_null.sql` | 2026-05-17 | Hace member_id NOT NULL en payments |
| 12 | `20260514000012_claim_code.sql` | 2026-05-20 | Agrega claim_code a profiles (pre-registro) |
| 13 | `20260514000013_claim_code_unique.sql` | 2026-05-20 | Unique constraint en claim_code |
| 14 | `20260514000014_claim_code_index.sql` | 2026-05-20 | Índice en claim_code |
| 15 | `20260514000015_registration_status.sql` | 2026-05-21 | Agrega registration_status a profiles |
| 16 | `20260514000016_auth_user_id.sql` | 2026-05-21 | Agrega auth_user_id a profiles (vinculación con auth.users) |
| 17 | `20260514000017_fix_auth_user_id.sql` | 2026-05-21 | Fix tipo/referencia de auth_user_id |
| 18 | `20260514000018_auth_user_id_unique.sql` | 2026-05-21 | Unique en auth_user_id |
| 19 | `20260514000019_auth_user_id_index.sql` | 2026-05-21 | Índice en auth_user_id |
| 20 | `20260514000020_drop_rls_is_admin.sql` | 2026-05-30 | Elimina/refactoriza función is_admin |
| 21 | `20260514000021_add_is_trainer_function.sql` | 2026-05-30 | Agrega función `is_trainer()` |
| 22 | `20260514000022_add_is_trainer_or_admin_function.sql` | 2026-05-30 | Agrega función `is_trainer_or_admin()` |
| 23 | `20260514000023_add_get_my_role_function.sql` | 2026-05-30 | Agrega función `get_my_role()` |
| 24 | `20260514000024_update_members_rls.sql` | 2026-05-30 | Actualiza RLS de members |
| 25 | `20260514000025_update_payments_rls.sql` | 2026-05-30 | Actualiza RLS de payments |
| 26 | `20260514000026_add_email_to_profiles.sql` | 2026-06-01 | Agrega columna email a profiles |
| 27 | `20260514000027_add_phone_to_profiles.sql` | 2026-06-01 | Hace phone unique en profiles |
| 28 | `20260514000028_email_and_phone_fix.sql` | 2026-06-01 | Fix para email y phone |
| 29 | `20260514000029_fix_profiles_rls.sql` | 2026-06-03 | Fix RLS profiles |
| 30 | `20260514000030_add_is_admin_function.sql` | 2026-06-03 | Reagrega función is_admin |
| 31 | `20260514000031_auth_simplification.sql` | 2026-06-03 | Simplificación del flujo de auth |
| 32 | `20260514000032_fix_members_rls.sql` | 2026-06-03 | Fix RLS de members |
| 33 | `20260514000033_fix_claim_code_nullable.sql` | 2026-06-03 | Hace claim_code nullable |
| 34 | `20260514000034_fix_profiles_insert.sql` | 2026-06-03 | Fix insert en profiles |
| 35 | `20260514000035_fix_auth_flow.sql` | 2026-06-03 | Fix flujo de autenticación |
| 36 | `20260514000036_fix_rls_policies.sql` | 2026-06-03 | Fix políticas RLS |
| 37 | `20260514000037_cleanup_migrations.sql` | 2026-06-04 | Limpieza de migraciones |
| 38 | `20260514000038_fix_auth_user_id_consolidation.sql` | 2026-06-04 | Consolidación auth_user_id |
| 39 | `20260514000039_fix_auth_flow_v2.sql` | 2026-06-04 | Versión 2 del fix auth |
| 40 | `20260514000040_fix_duplicate_auth_users.sql` | 2026-06-04 | Fix duplicados auth.users |
| 41 | `20260514000041_cleanup_auth_users.sql` | 2026-06-04 | Limpieza de auth.users |
| 42 | `20260514000042_fix_profiles_insert_v2.sql` | 2026-06-04 | Versión 2 fix insert profiles |
| 43 | `20260616000001_add_missing_claim_policies.sql` | 2026-06-16 | Políticas faltantes para claim |
| 44 | `20260616000002_fix_signup_flow.sql` | 2026-06-16 | Fix flujo de registro |
| 45 | `20260616000013_fix_session_handling.sql` | 2026-06-16 | Fix manejo de sesión |

### 5.3 Evolución del Schema (Línea de Tiempo)

```
May 14  ──► Schema inicial + RLS + check_ins
May 16  ──► Fix payments (member_id, membership_type_id) + RLS + dashboard_stats
May 17  ──► Fix referencias FK payments
May 20  ──► Pre-registro: claim_code en profiles
May 21  ──► Vinculación auth: registration_status, auth_user_id
May 30  ──► Refactor RLS: is_admin, is_trainer, is_trainer_or_admin
Jun 01  ──► Email + phone en profiles
Jun 03  ──► Simplificación auth + fixes masivos RLS
Jun 04  ──► Consolidación auth_user_id, cleanup
Jun 16  ──► Fix flujo signup + session handling
```

---

## 6. Row Level Security (RLS)

### 6.1 Funciones SECURITY DEFINER

| Función | Retorna | Propósito |
|---------|---------|-----------|
| `is_admin()` | `boolean` | True si el usuario autenticado tiene rol 'admin' |
| `is_trainer_or_admin()` | `boolean` | True si el usuario autenticado tiene rol 'trainer' o 'admin' |
| `get_my_role()` | `text` | Retorna el rol del usuario autenticado |

### 6.2 Políticas por Tabla

#### `profiles`

| Política | Operación | Rol | Comportamiento |
|----------|-----------|-----|----------------|
| Admins can view all profiles | SELECT | admin | `is_admin()` |
| Admins can insert profiles | INSERT | admin | `is_admin()` |
| Admins can update profiles | UPDATE | admin | `is_admin()` |
| Users can view own profile | SELECT | any | `auth.uid() = id` |
| Users can update own profile | UPDATE | any | `auth.uid() = id` |
| Trainers can view all profiles | SELECT | trainer | `is_trainer_or_admin()` |
| Anyone can insert during signup | INSERT | anon | `true` (registro público) |

#### `membership_types`

| Política | Operación | Rol | Comportamiento |
|----------|-----------|-----|----------------|
| Admins can manage types | ALL | admin | `is_admin()` |
| Everyone can view active types | SELECT | any | `is_active = true OR is_admin()` |

#### `memberships`

| Política | Operación | Rol | Comportamiento |
|----------|-----------|-----|----------------|
| Admins can manage memberships | ALL | admin | `is_admin()` |
| Members can view own | SELECT | member | `auth.uid() = member_id` |
| Trainers can view all | SELECT | trainer | `is_trainer_or_admin()` |

#### `payments`

| Política | Operación | Rol | Comportamiento |
|----------|-----------|-----|----------------|
| Admins can manage payments | ALL | admin | `is_admin()` |
| Members can view own | SELECT | member | `auth.uid() = member_id` |
| Trainers can view all | SELECT | trainer | `is_trainer_or_admin()` |

#### `training_plans`

| Política | Operación | Rol | Comportamiento |
|----------|-----------|-----|----------------|
| Admins can manage plans | ALL | admin | `is_admin()` |
| Trainers can manage plans | ALL | trainer | `is_trainer_or_admin()` |
| Members can view own plan | SELECT | member | `auth.uid() = assigned_to` |

#### `plan_exercises`

| Política | Operación | Rol | Comportamiento |
|----------|-----------|-----|----------------|
| Admins can manage exercises | ALL | admin | `is_admin()` |
| Trainers can manage exercises | ALL | trainer | `is_trainer_or_admin()` |
| Members can view own exercises | SELECT | member | Via plan assigned_to |

#### `check_ins`

| Política | Operación | Rol | Comportamiento |
|----------|-----------|-----|----------------|
| Admins can manage check-ins | ALL | admin | `is_admin()` |
| Anyone can insert | INSERT | any | `true` (público, kiosk) |
| Members can view own | SELECT | member | `auth.uid() = member_id` |

---

## 7. Autenticación y Roles

### 7.1 Roles del Sistema

| Rol | Acceso | Layout |
|-----|--------|--------|
| **admin** | Dashboard, Members, Memberships, Payments, TrainingPlans, Fingerprint, Reports, Settings | AdminLayout |
| **trainer** | Panel, Members, Plans, Templates | TrainerLayout |
| **member** | MyPlan (solo lectura) | MemberLayout |
| **kiosk** | CheckIn (público, sin auth) | KioskLayout |

### 7.2 Flujo de Autenticación

El sistema implementa un flujo de **vinculación bidireccional** entre `auth.users` (Supabase Auth) y `profiles`:

```
1. Admin crea perfil con claim_code  →  profiles (registration_status = 'pending')
2. Supabase Auth: signUp()           →  auth.users
3. Vinculación: auth_user_id se liga  →  profiles.auth_user_id = auth.uid()
4. Registration_status: pending → claimed → registered
```

### 7.3 Componentes de Auth

#### `AuthInit.tsx` (src/components/auth/AuthInit.tsx)

- **Propósito**: Escucha cambios de sesión de Supabase (`onAuthStateChange`)
- **Flujo**:
  1. Obtiene sesión actual (`supabase.auth.getSession()`)
  2. Si hay sesión, carga el perfil desde `profiles` vía `auth_user_id`
  3. Setea el usuario en `auth.store`
  4. Escucha cambios en tiempo real
- **Loading state**: Muestra pantalla de carga hasta que `initialized = true`

#### `ProtectedRoute.tsx` (src/components/auth/ProtectedRoute.tsx)

- **Propósito**: Guard de rutas por rol
- **Props**: `roles: ('admin' | 'trainer' | 'member' | 'kiosk')[]`
- **Comportamiento**:
  - No inicializado → LoadingSpinner
  - No autenticado → Redirect a `/login`
  - Rol no permitido → Redirect a `/unauthorized`
  - Autenticado y rol válido → Renderiza `children`

### 7.4 Flujo de Login

```
Login.tsx
  │
  ├─► email + password
  │     └─► auth.service.login()
  │           └─► supabase.auth.signInWithPassword()
  │                 └─► AuthInit detecta cambio → carga perfil
  │                       └─► auth.store.setUser(profile)
  │                             └─► ProtectedRoute permite acceso
  │
  └─► Google OAuth
        └─► auth.service.loginWithGoogle()
              └─► supabase.auth.signInWithOAuth({ provider: 'google' })
```

### 7.5 Flujo de Registro

```
Register.tsx
  │
  ├─► Con claim_code (pre-registro)
  │     └─► members.service.claimAccount(code, data)
  │           └─► Vincula profiles.id con auth.uid()
  │           └─► registration_status → 'registered'
  │
  └─► Sin claim_code (registro directo)
        └─► auth.service.register(email, password, data)
              └─► Crea auth.users + profiles en una transacción
```

---

## 8. Rutas y Layouts

### 8.1 Mapa de Rutas (App.tsx)

```
<BrowserRouter>
  <AuthInit>
    <Routes>
      │
      ├─ PUBLIC
      │   ├─ /login          → Login.tsx          (AuthLayout)
      │   ├─ /register       → Register.tsx        (AuthLayout)
      │   └─ /claim-account  → ClaimAccount.tsx    (AuthLayout)
      │
      ├─ KIOSK (público)
      │   └─ /check-in       → CheckIn.tsx         (KioskLayout)
      │
      ├─ ADMIN
      │   ├─ /dashboard      → Dashboard.tsx       (AdminLayout)
      │   ├─ /members        → Members.tsx         (AdminLayout)
      │   ├─ /members/:id    → MemberDetail.tsx    (AdminLayout)
      │   ├─ /memberships    → Memberships.tsx     (AdminLayout)
      │   ├─ /payments       → Payments.tsx        (AdminLayout)
      │   ├─ /plans          → TrainingPlans.tsx   (AdminLayout)
      │   ├─ /fingerprint    → Fingerprint.tsx     (AdminLayout)
      │   ├─ /reports        → Reports.tsx         (AdminLayout)
      │   └─ /settings       → Settings.tsx        (AdminLayout)
      │
      ├─ TRAINER
      │   ├─ /trainer        → Panel.tsx           (TrainerLayout)
      │   ├─ /trainer/members → Members.tsx        (TrainerLayout)
      │   ├─ /trainer/plans   → Plans.tsx          (TrainerLayout)
      │   └─ /trainer/templates → Templates.tsx    (TrainerLayout)
      │
      ├─ MEMBER
      │   └─ /my-plan        → MyPlan.tsx          (MemberLayout)
      │
      └─ 404
          └─ *               → NotFound.tsx
    </Routes>
  </AuthInit>
</BrowserRouter>
```

### 8.2 Layouts

#### `AdminLayout.tsx`

| Elemento | Descripción |
|----------|-------------|
| **Sidebar** | Navegación lateral con iconos + labels |
| **BottomNav** | Navegación inferior (mobile) |
| **Header** | Título dinámico + avatar usuario |
| **Outlet** | Contenido de la página |
| **Responsive** | Sidebar visible en desktop, BottomNav en mobile |

#### `TrainerLayout.tsx`

| Elemento | Descripción |
|----------|-------------|
| **Sidebar** | Versión simplificada (4 items: Panel, Members, Plans, Templates) |
| **BottomNav** | Navegación inferior (mobile) |
| **Outlet** | Contenido de la página |

#### `MemberLayout.tsx`

| Elemento | Descripción |
|----------|-------------|
| **Header** | Logo + nombre del miembro |
| **Outlet** | MyPlan (única página) |

#### `AuthLayout.tsx`

| Elemento | Descripción |
|----------|-------------|
| **Centered card** | Formulario centrado vertical/horizontalmente |
| **Logo** | Omega Gym logo |
| **Outlet** | Login, Register, ClaimAccount |

#### `KioskLayout.tsx`

| Elemento | Descripción |
|----------|-------------|
| **Fullscreen** | Sin navegación, diseño grande para touchscreen |
| **Outlet** | CheckIn |

### 8.3 Sidebar (desktop)

**Admin sidebar items**:

| Icono | Label | Ruta |
|-------|-------|------|
| DashboardIcon | Dashboard | /dashboard |
| MembersIcon | Miembros | /members |
| MembershipIcon | Membresías | /memberships |
| PaymentsIcon | Pagos | /payments |
| PlansIcon | Planes | /plans |
| FingerprintIcon | Huellas | /fingerprint |
| ReportsIcon | Reportes | /reports |
| SettingsIcon | Configuración | /settings |

**Trainer sidebar items**:

| Icono | Label | Ruta |
|-------|-------|------|
| DashboardIcon | Panel | /trainer |
| MembersIcon | Miembros | /trainer/members |
| PlansIcon | Planes | /trainer/plans |
| PlansIcon | Plantillas | /trainer/templates |

### 8.4 BottomNav (mobile)

Mismos items que sidebar pero en barra inferior.

---

## 9. Páginas por Módulo

### 9.1 Auth

#### `Login.tsx`
- **Ruta**: `/login`
- **Layout**: AuthLayout
- **Servicios**: `auth.service.login()`, `auth.service.loginWithGoogle()`
- **Estados**: loading, error (credenciales inválidas)
- **Componentes UI**: Input (email, password), Button (submit, Google OAuth)

#### `Register.tsx`
- **Ruta**: `/register`
- **Layout**: AuthLayout
- **Servicios**: `auth.service.register()`, `members.service.claimAccount()`
- **Estados**: loading, error, success (redirect a login)
- **Componentes UI**: Input (nombre, email, phone, password, confirmar password, claim_code opcional), Button
- **Claim code**: Input opcional para pre-registro

#### `ClaimAccount.tsx`
- **Ruta**: `/claim-account`
- **Layout**: AuthLayout
- **Servicios**: `members.service.claimAccount()`
- **Propósito**: Vincular pre-registro con cuenta de auth

### 9.2 Dashboard (Admin)

#### `Dashboard.tsx`
- **Ruta**: `/dashboard`
- **Layout**: AdminLayout
- **Servicios**: `dashboard.service.getKpis()`, `dashboard.service.getRevenue()`, `dashboard.service.getMembershipDistribution()`, `dashboard.service.getRecentActivity()`, `dashboard.service.getExpiringMemberships()`
- **Componentes UI**: MetricCard (4 KPIs), ResponsiveTable (actividad reciente), Badge (membresías por vencer)
- **KPIs mostrados**:
  - Miembros activos total
  - Membresías activas
  - Ingresos del mes
  - Check-ins hoy
- **Gráficas**: membership distribution (pie/donut vía CSS), revenue trend (bar chart vía CSS)

#### `Members.tsx`
- **Ruta**: `/members`
- **Layout**: AdminLayout
- **Servicios**: `members.service.getAll()`, `members.service.getBySearch()`
- **Componentes UI**: SearchInput, ResponsiveTable, Pagination, Modal (crear/editar miembro), EmptyState
- **Modal "Crear Miembro"**: Input (nombre, email, phone, rol)
- **Modal "Editar Miembro"**: Input (nombre, email, phone, rol)
- **Filas**: Avatar + nombre, email, phone, rol (Badge), membresía activa, acciones (editar, desactivar)

#### `MemberDetail.tsx`
- **Ruta**: `/members/:id`
- **Layout**: AdminLayout
- **Servicios**: `members.service.getById()`, `memberships.service.getByMember()`, `payments.service.getByMember()`, `training.service.getByMember()`
- **Componentes UI**: Avatar (grande), Badge, MetricCard, ResponsiveTable, TabBar
- **Tabs**: Información, Membresías, Pagos, Plan de entrenamiento

#### `Memberships.tsx`
- **Ruta**: `/memberships`
- **Layout**: AdminLayout
- **Servicios**: `memberships.service.getAll()`, `memberships.service.getMembershipTypes()`, `memberships.service.create()`, `memberships.service.assignToMember()`
- **Componentes UI**: ResponsiveTable, Modal (crear tipo, asignar), Pagination, EmptyState
- **Modal "Crear Tipo"**: Input (nombre, precio, duración días, descripción)
- **Modal "Asignar"**: Select (miembro, tipo), DatePicker (fecha inicio)

#### `Payments.tsx`
- **Ruta**: `/payments`
- **Layout**: AdminLayout
- **Servicios**: `payments.service.getAll()`, `payments.service.create()`
- **Componentes UI**: SearchInput, ResponsiveTable, Modal (registrar pago), Pagination, EmptyState
- **Filtros**: Por fecha, método de pago, estado
- **Modal "Registrar Pago"**: Select (miembro), Input (monto, método, fecha, notas)

#### `TrainingPlans.tsx`
- **Ruta**: `/plans`
- **Layout**: AdminLayout
- **Servicios**: `training.service.getAll()`, `training.service.create()`, `training.service.addExercise()`
- **Componentes UI**: ResponsiveTable, Modal (crear plan, agregar ejercicio), Pagination, EmptyState
- **Modal "Crear Plan"**: Input (nombre, descripción, asignado a, es_template)
- **Modal "Agregar Ejercicio"**: Input (nombre, sets, reps, descanso, orden)

#### `Fingerprint.tsx`
- **Ruta**: `/fingerprint`
- **Layout**: AdminLayout
- **Servicios**: `members.service.getAll()` (para listar)
- **Componentes UI**: LoadingSpinner (captura cámara), ResponsiveTable
- **Propósito**: Registrar huellas dactilares para check-in
- **Dependencia**: `html2canvas` para captura

#### `Reports.tsx`
- **Ruta**: `/reports`
- **Layout**: AdminLayout
- **Servicios**: `dashboard.service.getRevenue()`, `dashboard.service.getMembershipDistribution()`
- **Componentes UI**: TabBar, MetricCard
- **Tabs**: Ingresos, Membresías, Miembros, Asistencia

#### `Settings.tsx`
- **Ruta**: `/settings`
- **Layout**: AdminLayout
- **Propósito**: Configuración del sistema (pendiente de implementación detallada)

### 9.3 Trainer

#### `Panel.tsx`
- **Ruta**: `/trainer`
- **Layout**: TrainerLayout
- **Servicios**: `trainer.service.getDashboard()`, `trainer.service.getAssignedMembers()`
- **Componentes UI**: MetricCard, ResponsiveTable

#### `Members.tsx` (trainer)
- **Ruta**: `/trainer/members`
- **Layout**: TrainerLayout
- **Servicios**: `members.service.getByTrainer()`
- **Componentes UI**: ResponsiveTable, SearchInput
- **Diferencias con admin**: Solo ve miembros asignados, no puede crear/editar

#### `Plans.tsx`
- **Ruta**: `/trainer/plans`
- **Layout**: TrainerLayout
- **Servicios**: `training.service.getByTrainer()`, `training.service.create()`
- **Componentes UI**: ResponsiveTable, Modal, EmptyState

#### `Templates.tsx`
- **Ruta**: `/trainer/templates`
- **Layout**: TrainerLayout
- **Servicios**: `training.service.getTemplates()`
- **Componentes UI**: ResponsiveTable, EmptyState

### 9.4 Member

#### `MyPlan.tsx`
- **Ruta**: `/my-plan`
- **Layout**: MemberLayout
- **Servicios**: `training.service.getMyPlan()`
- **Componentes UI**: LoadingSpinner, EmptyState
- **Vista**: Solo lectura del plan de entrenamiento asignado

### 9.5 Kiosk

#### `CheckIn.tsx`
- **Ruta**: `/check-in`
- **Layout**: KioskLayout (fullscreen)
- **Servicios**: `checkIns.service.registerCheckIn()`
- **Propósito**: Pantalla pública para check-in diario
- **Diseño**: Interfaz grande táctil, búsqueda por nombre/código

### 9.6 404

#### `NotFound.tsx`
- **Ruta**: `*`
- **Componentes UI**: EmptyState con link a home

---

## 10. Componentes UI

### 10.1 Atoms

#### `Badge.tsx`
```tsx
<Badge variant="success" size="sm" className="...">
  Contenido
</Badge>
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | Color del badge |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño |
| `children` | `React.ReactNode` | — | Contenido |
| `className` | `string` | `''` | Clases adicionales |

#### `Button.tsx`
```tsx
<Button variant="primary" size="md" isLoading={false} onClick={fn}>
  Click me
</Button>
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost' \| 'outline'` | `'primary'` | Estilo visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño |
| `isLoading` | `boolean` | `false` | Muestra spinner |
| `disabled` | `boolean` | `false` | Deshabilitado |
| `onClick` | `() => void` | — | Handler click |
| `type` | `'button' \| 'submit'` | `'button'` | Tipo HTML |
| `children` | `React.ReactNode` | — | Contenido |
| `className` | `string` | `''` | Clases adicionales |

#### `Input.tsx`
```tsx
<Input label="Nombre" placeholder="Tu nombre" error="Campo requerido" />
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | — | Label del campo |
| `error` | `string` | — | Mensaje de error |
| `type` | `string` | `'text'` | Tipo HTML |
| `placeholder` | `string` | — | Placeholder |
| `value` | `string` | — | Valor controlado |
| `onChange` | `(e) => void` | — | Handler cambio |
| `className` | `string` | `''` | Clases adicionales |

#### `Avatar.tsx`
```tsx
<Avatar src="url" name="Juan Pérez" size="md" />
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `src` | `string \| null` | — | URL de imagen |
| `name` | `string` | — | Nombre para iniciales fallback |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Tamaño |
| `className` | `string` | `''` | Clases adicionales |

**Comportamiento**: Si `src` es válido, muestra imagen. Si no, muestra iniciales con color de fondo derivado del nombre.

#### `Chip.tsx`
```tsx
<Chip label="Activo" variant="success" onDelete={fn} />
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | — | Texto |
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | Color |
| `onDelete` | `() => void` | — | Muestra botón de cerrar |

#### `IconButton.tsx`
```tsx
<IconButton icon={EditIcon} onClick={fn} variant="ghost" />
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `icon` | `React.ReactNode` | — | Icono SVG |
| `onClick` | `() => void` | — | Handler |
| `variant` | `'ghost' \| 'primary' \| 'danger'` | `'ghost'` | Estilo |
| `size` | `'sm' \| 'md'` | `'md'` | Tamaño |
| `className` | `string` | `''` | Clases adicionales |

#### `LoadingSpinner.tsx`
```tsx
<LoadingSpinner size="md" />
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño |
| `className` | `string` | `''` | Clases adicionales |

**Estilo**: Círculo animado con borde del color accent `#e8ff47`.

#### `MetricCard.tsx`
```tsx
<MetricCard title="Miembros Activos" value="42" icon={MembersIcon} trend="+12%" />
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `title` | `string` | — | Título de la métrica |
| `value` | `string \| number` | — | Valor principal |
| `icon` | `React.ReactNode` | — | Icono decorativo |
| `trend` | `string` | — | Tendencia (ej: "+12%") |
| `className` | `string` | `''` | Clases adicionales |

### 10.2 Molecules

#### `Modal.tsx`
```tsx
<Modal isOpen={true} onClose={fn} title="Crear Miembro" size="md">
  Contenido
</Modal>
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | — | Controla visibilidad |
| `onClose` | `() => void` | — | Handler cierre |
| `title` | `string` | — | Título del modal |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Ancho máximo |
| `children` | `React.ReactNode` | — | Contenido |
| `footer` | `React.ReactNode` | — | Footer (botones) |

#### `PageHeader.tsx`
```tsx
<PageHeader title="Miembros" description="Gestiona los socios del gym" action={button} />
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `title` | `string` | — | Título de la página |
| `description` | `string` | — | Subtítulo |
| `action` | `React.ReactNode` | — | Botón de acción (ej: "Crear Miembro") |
| `className` | `string` | `''` | Clases adicionales |

#### `Pagination.tsx`
```tsx
<Pagination currentPage={1} totalPages={10} onPageChange={fn} />
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `currentPage` | `number` | — | Página actual |
| `totalPages` | `number` | — | Total de páginas |
| `onPageChange` | `(page: number) => void` | — | Handler cambio página |

#### `ResponsiveTable.tsx`
```tsx
<ResponsiveTable columns={cols} data={rows} onRowClick={fn} emptyMessage="Sin datos" />
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `columns` | `Column[]` | — | Definición de columnas |
| `data` | `T[]` | — | Array de datos |
| `onRowClick` | `(row: T) => void` | — | Handler click fila |
| `emptyMessage` | `string` | `'No hay datos'` | Mensaje empty state |
| `isLoading` | `boolean` | `false` | Muestra skeleton |

**Tipo Column**: `{ key: string; label: string; render?: (value, row) => ReactNode; sortable?: boolean }`

#### `SearchInput.tsx`
```tsx
<SearchInput value={q} onChange={setQ} placeholder="Buscar miembros..." />
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `value` | `string` | — | Valor controlado |
| `onChange` | `(value: string) => void` | — | Handler cambio |
| `placeholder` | `string` | `'Buscar...'` | Placeholder |
| `className` | `string` | `''` | Clases adicionales |

#### `TabBar.tsx`
```tsx
<TabBar tabs={tabs} activeTab="info" onTabChange={fn} />
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `tabs` | `{ id: string; label: string }[]` | — | Lista de tabs |
| `activeTab` | `string` | — | Tab activa |
| `onTabChange` | `(id: string) => void` | — | Handler cambio tab |

#### `EmptyState.tsx`
```tsx
<EmptyState title="Sin miembros" description="Crea tu primer miembro" action={button} />
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `title` | `string` | — | Título |
| `description` | `string` | — | Descripción |
| `action` | `React.ReactNode` | — | Botón de acción |
| `icon` | `React.ReactNode` | — | Icono decorativo |

### 10.3 Layout

#### `BottomNav.tsx`
```tsx
<BottomNav items={navItems} />
```
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `items` | `NavItem[]` | — | Items de navegación (icon + label + path) |

**Comportamiento**: Solo visible en mobile (< 768px). Muestra hasta 5 items con iconos y labels.

---

## 11. Servicios (API Layer)

### 11.1 `auth.service.ts`

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `login(email, password)` | `email: string, password: string` | `{ user, session }` | Login con email/password |
| `loginWithGoogle()` | — | `redirectUrl` | Login con Google OAuth |
| `register(email, password, userData)` | `email, password, userData: { full_name, phone }` | `{ user, session }` | Registro de nuevo usuario |
| `getSession()` | — | `Session \| null` | Obtiene sesión actual |
| `getProfile(userId)` | `userId: string` | `Profile` | Obtiene perfil por ID |
| `getProfileByAuthUserId(authUserId)` | `authUserId: string` | `Profile` | Obtiene perfil por auth_user_id |

### 11.2 `members.service.ts`

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `getAll()` | — | `Member[]` | Todos los miembros |
| `getById(id)` | `id: string` | `Member` | Miembro por ID |
| `getBySearch(query)` | `query: string` | `Member[]` | Búsqueda por nombre/email/phone |
| `create(data)` | `data: CreateMemberInput` | `Member` | Crear miembro |
| `update(id, data)` | `id: string, data: UpdateMemberInput` | `Member` | Actualizar miembro |
| `deactivate(id)` | `id: string` | `void` | Desactivar miembro |
| `generateClaimCode(memberId)` | `memberId: string` | `string` | Genera código de reclamación |
| `claimAccount(code, authUserId, data)` | `code, authUserId, data` | `Profile` | Vincula pre-registro con auth |
| `getStats()` | — | `MemberStats` | Estadísticas de miembros |

### 11.3 `memberships.service.ts`

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `getMembershipTypes()` | — | `MembershipType[]` | Todos los tipos de membresía |
| `createMembershipType(data)` | `data` | `MembershipType` | Crear tipo de membresía |
| `getAll()` | — | `Membership[]` | Todas las membresías |
| `getByMember(memberId)` | `memberId: string` | `Membership[]` | Membresías de un miembro |
| `getActiveByMember(memberId)` | `memberId: string` | `Membership \| null` | Membresía activa del miembro |
| `assignToMember(memberId, typeId, startDate)` | `memberId, typeId, startDate: string` | `Membership` | Asigna membresía a miembro |
| `getExpiring(days)` | `days: number` | `Membership[]` | Membresías por vencer en N días |

### 11.4 `payments.service.ts`

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `getAll(filters?)` | `filters?: { startDate?, endDate?, method?, status? }` | `Payment[]` | Todos los pagos con filtros |
| `getByMember(memberId)` | `memberId: string` | `Payment[]` | Pagos de un miembro |
| `create(data)` | `data: CreatePaymentInput` | `Payment` | Registrar pago |
| `getRevenue(startDate, endDate)` | `startDate, endDate: string` | `number` | Ingresos en un período |
| `getMonthlyRevenue()` | — | `MonthlyRevenue[]` | Ingresos por mes |

### 11.5 `training.service.ts`

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `getAll()` | — | `TrainingPlan[]` | Todos los planes |
| `getById(id)` | `id: string` | `TrainingPlan` | Plan por ID |
| `getByMember(memberId)` | `memberId: string` | `TrainingPlan[]` | Planes de un miembro |
| `getMyPlan()` | — | `TrainingPlan \| null` | Plan del miembro autenticado |
| `getTemplates()` | — | `TrainingPlan[]` | Planes plantilla |
| `getByTrainer(trainerId)` | `trainerId: string` | `TrainingPlan[]` | Planes creados por un trainer |
| `create(data)` | `data: CreatePlanInput` | `TrainingPlan` | Crear plan |
| `update(id, data)` | `id, data` | `TrainingPlan` | Actualizar plan |
| `delete(id)` | `id: string` | `void` | Eliminar plan |
| `addExercise(planId, data)` | `planId, data: ExerciseInput` | `PlanExercise` | Agregar ejercicio a plan |
| `updateExercise(exerciseId, data)` | `exerciseId, data` | `PlanExercise` | Actualizar ejercicio |
| `removeExercise(exerciseId)` | `exerciseId: string` | `void` | Eliminar ejercicio |
| `getExercises(planId)` | `planId: string` | `PlanExercise[]` | Ejercicios de un plan |

### 11.6 `checkIns.service.ts`

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `registerCheckIn(memberId, method?)` | `memberId, method?: string` | `CheckIn` | Registrar check-in |
| `getToday()` | — | `CheckIn[]` | Check-ins de hoy |
| `getByMember(memberId)` | `memberId: string` | `CheckIn[]` | Historial de un miembro |
| `getStats(startDate, endDate)` | `startDate, endDate: string` | `CheckInStats` | Estadísticas de check-ins |

### 11.7 `dashboard.service.ts`

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `getKpis()` | — | `DashboardKpis` | KPIS principales (activeMembers, activeMemberships, monthlyRevenue, todayCheckIns) |
| `getRevenue(startDate, endDate)` | `startDate?, endDate?` | `RevenueData[]` | Ingresos por período |
| `getMembershipDistribution()` | — | `Distribution[]` | Distribución de tipos de membresía |
| `getRecentActivity(limit?)` | `limit?: number` | `Activity[]` | Actividad reciente |
| `getExpiringMemberships(days?)` | `days?: number` | `Membership[]` | Membresías por vencer |

### 11.8 `trainer.service.ts`

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `getDashboard()` | — | `TrainerDashboard` | KPIs del trainer |
| `getAssignedMembers()` | — | `Member[]` | Miembros asignados al trainer |

---

## 12. Stores (Estado Global)

### 12.1 `auth.store.ts` (Zustand)

```typescript
interface AuthState {
  user: Profile | null
  session: Session | null
  loading: boolean
  initialized: boolean
  
  // Acciones
  setUser: (user: Profile | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  login: (email: string, password: string) => Promise<Profile>
  register: (email: string, password: string, userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  initialize: () => Promise<void>
}
```

**Flujo de inicialización** (`initialize()`):
1. Obtiene sesión de Supabase
2. Si hay sesión, busca profile por `auth_user_id`
3. Si no encuentra, busca por email
4. Setea user + session en el store

### 12.2 `sidebar.store.ts` (Zustand)

```typescript
interface SidebarState {
  isOpen: boolean
  toggle: () => void
  close: () => void
}
```

### 12.3 `theme.store.ts` (Zustand + persist)

```typescript
interface ThemeState {
  theme: 'dark' | 'light'
  toggle: () => void
  setTheme: (theme: 'dark' | 'light') => void
}
```

**Persistencia**: `localStorage` via `zustand/middleware` (`persist`).

---

## 13. Librerías (lib/)

### 13.1 `supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fallback para desarrollo sin env vars
const url = supabaseUrl || 'http://localhost:54321'
const key = supabaseAnonKey || 'mock-anon-key'

export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
```

### 13.2 `helpers.ts`

| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `fmtDate(date)` | `date: string \| Date` | `string` | Formatea fecha a locale es-AR (ej: "15/05/2026") |
| `fmtMoney(amount)` | `amount: number` | `string` | Formatea monto a ARS (ej: "$ 1,500.00") |
| `initials(name)` | `name: string` | `string` | Obtiene iniciales (ej: "Juan Pérez" → "JP") |
| `avatarColor(name)` | `name: string` | `string` | Color HSL determinístico basado en nombre |
| `daysDiff(date1, date2)` | `date1, date2: string \| Date` | `number` | Días de diferencia entre dos fechas |
| `isExpired(date)` | `date: string \| Date` | `boolean` | True si la fecha ya pasó |
| `isExpiring(date, days?)` | `date, days?: number` | `boolean` | True si vence en menos de N días |
| `classNames(...classes)` | `...classes: (string \| false \| null \| undefined)[]` | `string` | Combina clases condicionales |

### 13.3 `icons.tsx`

12 iconos SVG inline como componentes React:

| Icono | Nombre | Uso principal |
|-------|--------|---------------|
| `DashboardIcon` | Cuadrícula | Dashboard sidebar |
| `MembersIcon` | Personas | Miembros sidebar |
| `MembershipIcon` | Tarjeta | Membresías sidebar |
| `PaymentsIcon` | Billete | Pagos sidebar |
| `PlansIcon` | Lista | Planes sidebar |
| `FingerprintIcon` | Huella | Fingerprint sidebar |
| `ReportsIcon` | Gráfico | Reportes sidebar |
| `SettingsIcon` | Engranaje | Configuración sidebar |
| `MenuIcon` | Hamburguesa | Menú mobile |
| `CloseIcon` | X | Cerrar modales/sidebar |
| `ChevronLeftIcon` | < | Navegación |
| `ChevronRightIcon` | > | Navegación |

---

## 14. PWA

### 14.1 Configuración (`vite.config.ts`)

```typescript
import { VitePWA } from 'vite-plugin-pwa'

VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['omega-logo.svg'],
  manifest: {
    name: 'Omega Gym',
    short_name: 'OmegaGym',
    description: 'Sistema de gestión de gimnasio',
    theme_color: '#0a0a0a',
    background_color: '#0a0a0a',
    display: 'standalone',
    icons: [
      { src: 'omega-logo.svg', sizes: '192x192', type: 'image/svg+xml' },
      { src: 'omega-logo.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
  },
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https?.*\/rest\/v1\/.*/i,  // Supabase API
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
          networkTimeoutSeconds: 5,
        },
      },
    ],
  },
})
```

### 14.2 Service Worker

- **Generado automáticamente** por `vite-plugin-pwa`
- **Estrategia**: NetworkFirst para requests a Supabase REST API
- **Cache**: Hasta 100 entradas, 24 horas de expiración
- **Auto-update**: Service worker se actualiza automáticamente

### 14.3 Manifest

| Campo | Valor |
|-------|-------|
| `name` | Omega Gym |
| `short_name` | OmegaGym |
| `description` | Sistema de gestión de gimnasio |
| `theme_color` | `#0a0a0a` |
| `background_color` | `#0a0a0a` |
| `display` | `standalone` |
| `icons` | SVG (192x192, 512x512) |

---

## 15. Diseño y Temas

### 15.1 Tailwind CSS v4

```css
/* index.css */
@import "tailwindcss";

@theme {
  --color-accent: #e8ff47;
  --color-accent-dark: #d4e83d;
  --color-surface: #1a1a1a;
  --color-surface-dark: #0a0a0a;
  --color-surface-light: #2a2a2a;
  --color-border: #333333;
  --color-text-primary: #ffffff;
  --color-text-secondary: #a0a0a0;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
  }
}
```

### 15.2 Tokens de Diseño

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-accent` | `#e8ff47` | Amarillo neón, accent principal |
| `--color-surface` | `#1a1a1a` | Fondo de cards/sectiones |
| `--color-surface-dark` | `#0a0a0a` | Fondo de página |
| `--color-surface-light` | `#2a2a2a` | Fondo elevado (hover) |
| `--color-border` | `#333333` | Bordes de componentes |
| `--color-text-primary` | `#ffffff` | Texto principal |
| `--color-text-secondary` | `#a0a0a0` | Texto secundario |

### 15.3 Tema Oscuro por Defecto

- El sistema usa **dark mode** como tema predeterminado
- `prefers-color-scheme: dark` configurado en CSS
- Custom properties CSS para fácil overriding
- `theme.store.ts` permite cambiar entre dark/light con persistencia en localStorage

### 15.4 Animaciones

| Clase | Propósito |
|-------|-----------|
| `animate-spin` | LoadingSpinner |
| `transition-colors` | Hover en botones/links |
| `transition-transform` | Sidebar slide |
| `transition-opacity` | Modal fade |

---

## 16. Documentación y Metodología

### 16.1 Documentación del Proyecto

| Archivo | Propósito |
|---------|-----------|
| `README.md` | README principal del proyecto |
| `AGENTS.md` | Onboarding técnico para agentes IA |
| `BUGS.md` | Bug tracker (15 bugs documentados) |
| `REPORT.md` | Este archivo |
| `SPECIFICATION.md` | Especificación del sistema (SDD) |
| `.env.example` | Template de variables de entorno |

### 16.2 Metodología SPEC Driven Development

El proyecto sigue la metodología **SDD** documentada en `ai_work_flow/docs/specs/SPECIFICATION.md`:

| Fase | Descripción | Estado |
|------|-------------|--------|
| **FASE 0** | Setup del entorno | ✅ Completada |
| **FASE 1** | Configuración del proyecto | ✅ Completada |
| **FASE 2** | Diseño y arquitectura | ✅ Completada |
| **FASE 3** | Implementación por tickets | 🔄 En progreso |

### 16.3 Tickets

| Ticket | Estado | Módulo | Descripción |
|--------|--------|--------|-------------|
| `TKT-OMEGYM-001` | ✅ Closed | Setup | Setup inicial + conexión Supabase |
| `TKT-OMEGYM-002` | ✅ Closed | Auth | Implementar autenticación |
| `TKT-OMEGYM-003` | ✅ Closed | Auth | Protección de rutas y roles |
| `TKT-OMEGYM-004` | ✅ Closed | Members | CRUD de miembros |
| `TKT-OMEGYM-005` | ✅ Closed | Memberships | Tipos de membresía |
| `TKT-OMEGYM-006` | ✅ Closed | Memberships | Asignación de membresías |
| `TKT-OMEGYM-007` | ✅ Closed | Payments | Registro de pagos |
| `TKT-OMEGYM-008` | 🔄 Open | Memberships | Alertas de membresías próximas a vencer |
| `TKT-OMEGYM-009` | ✅ Closed | Plans | CRUD de planes de entrenamiento |
| `TKT-OMEGYM-010` | ✅ Closed | Plans | Asignación de planes a miembros |
| `TKT-OMEGYM-011` | ✅ Closed | Member | Vista del miembro |
| `TKT-OMEGYM-012` | ✅ Closed | Dashboard | Dashboard con métricas |
| `TKT-OMEGYM-013` | ✅ Closed | Deploy | Configurar despliegue en Vercel |
| `TKT-OMEGYM-014` | 🔄 Open | Auth | Google OAuth + pre-registro |

### 16.4 Conocimiento

| Archivo | Propósito |
|---------|-----------|
| `ai_work_flow/knowledge/local/2026-06-03-simplificacion-auth.md` | Decisión de simplificar flujo de auth |
| `ai_work_flow/knowledge/remote/` | Referencias externas (Supabase, React Router, etc.) |

### 16.5 Especificaciones Incrementales

| Archivo | Propósito |
|---------|-----------|
| `ai_work_flow/docs/specs/incremental/001_check_in_kiosk.yaml` | Módulo de quiosco de check-in |

---

## 17. Bugs Conocidos

### 17.1 Resumen

| Estado | Cantidad |
|--------|:--------:|
| Abiertos | 13 |
| En progreso | 0 |
| Resueltos | 2 |
| **Total** | **15** |

### 17.2 Lista de Bugs (BUGS.md)

| # | Título | Estado | Prioridad | Módulo |
|:-:|--------|--------|-----------|--------|
| 1 | Login no redirige a la ruta solicitada originalmente | Abierto | Media | Auth |
| 2 | Register muestra error aunque el usuario se crea | Abierto | Alta | Auth |
| 3 | Claim account muestra error | Abierto | Alta | Auth |
| 4 | Register con claim_code no vincula correctamente | Abierto | Alta | Auth |
| 5 | Admin puede crear miembros con email existente | Abierto | Alta | Members |
| 6 | Miembro puede crear miembros | Abierto | Alta | Auth/RLS |
| 7 | Al cerrar sesión no limpia correctamente | Abierto | Alta | Auth |
| 8 | No se puede iniciar sesión con el admin seed | Abierto | Alta | Auth |
| 9 | Register sin [object Object] | Abierto | Media | Auth |
| 10 | Login sin [object Object] | Abierto | Media | Auth |
| 11 | Memberships tipo null | Abierto | Media | Memberships |
| 12 | Crear plan de entrenamiento no funciona | Resuelto | Alta | Plans |
| 13 | Asignar plan a miembro no funciona | Resuelto | Alta | Plans |
| 14 | Member detail no abre | Abierto | Alta | Members |
| 15 | ProtectedRoute solo mira admin | Abierto | Alta | Auth |

### 17.3 Bugs Críticos (Prioridad Alta - 10 bugs)

| Bug | Síntoma | Causa probable |
|-----|---------|----------------|
| B2 | Register muestra error toast pero crea usuario | Manejador de errores en register |
| B3 | Claim account falla | Flujo de vinculación auth_user_id |
| B4 | Register + claim_code no vincula profiles con auth | Misma causa que B3 |
| B5 | Admin puede crear miembros con email duplicado | Falta validación unique en frontend |
| B6 | Miembro puede crear miembros | RLS no filtra correctamente en INSERT |
| B7 | Logout no limpia estado completo | Store no resetea todos los campos |
| B8 | Admin seed no puede loguearse | Seed data inconsistente |
| B14 | Member detail modal no abre | Ruta o estado del modal |
| B15 | ProtectedRoute solo verifica rol admin | Lógica de roles incompleta |

---

## 18. Estadísticas del Proyecto

### 18.1 Métricas de Código

| Métrica | Valor |
|---------|:-----:|
| Archivos totales | ~129 |
| Migraciones SQL | 45 |
| Componentes React | ~40 |
| Páginas | 19 |
| Servicios | 8 |
| Stores (Zustand) | 3 |
| Tablas SQL | 7 |
| Funciones RLS | 3 |
| Iconos SVG | 12 |
| Bugs documentados | 15 |
| Tickets | 14 |
| Commits | 63+ |

### 18.2 Distribución por Tipo de Archivo

| Tipo | Cantidad |
|------|:--------:|
| TypeScript/TSX | ~60 |
| SQL | ~48 |
| JSON/YAML/TOML | ~5 |
| CSS | 1 |
| HTML | 1 |
| Markdown | ~10 |
| Config | ~4 |

### 18.3 Distribución por Carpetas (src/)

| Carpeta | Archivos | % del código |
|---------|:--------:|:------------:|
| `pages/` | 19 | ~30% |
| `components/` | 14 | ~22% |
| `services/` | 8 | ~13% |
| `store/` | 3 | ~5% |
| `lib/` | 3 | ~5% |

---

> **Fin del Reporte** — Omega Gym © 2026
>
> *Documentación generada el 2026-06-22 basada en el estado actual del repositorio.*
