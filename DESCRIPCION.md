# Omega Gym — Descripción Detallada del Proyecto

## 1. Resumen Ejecutivo

**Omega Gym** es un sistema web de gestión de gimnasio diseñado para administrar membresías, controlar pagos, registrar asistencias y asignar planes de entrenamiento a los miembros. La aplicación está construida con **Vite + React 19 + TypeScript** en el frontend, usa **Supabase** (PostgreSQL + Auth + Row Level Security) como backend, y se despliega en **Vercel** como **PWA** (progressive web app) instalable.

El sistema cubre tres perfiles de usuario — **administrador**, **entrenador** y **miembro** — cada uno con su propia vista y permisos. Además permite que los **miembros creen, compartan e importen sus propias rutinas de entrenamiento** mediante códigos de compartición, una extensión reciente del módulo de planes (SPEC_001).

---

## 2. Stack Tecnológico

| Capa | Tecnología | Uso en el proyecto |
|------|-----------|--------------------|
| Frontend | Vite 8 + React 19 | Bundler y librería de UI |
| Lenguaje | TypeScript ~6.0 | Tipado de toda la aplicación |
| Enrutamiento | React Router v7 | Navegación por páginas según rol |
| Base de datos | Supabase (PostgreSQL managed) | Datos, Auth y Storage |
| Auth | Supabase Auth | Login, registro, OAuth Google, recuperación de contraseña |
| Seguridad | Supabase RLS (Row Level Security) | Permisos a nivel de fila por rol |
| Estado global | Zustand v5 | Auth, caché, PWA, sidebar, tema |
| Estilos | Tailwind CSS v4 + tema CSS propio | UI moderna con variables de tema |
| Notificaciones | Sonner | Toasts de éxito/error |
| PWA | vite-plugin-pwa + Workbox | Service worker auto-generado, instalable |
| Iconos | SVG inline | Iconos personalizados en `src/lib/icons.tsx` |

---

## 3. Arquitectura y Estructura del Proyecto

```
omega-gym/
├── src/                          # Código fuente de la aplicación
│   ├── components/
│   │   ├── auth/                 # AuthProvider (AuthInit), ProtectedRoute
│   │   ├── layout/               # AdminLayout, TrainerLayout, MemberLayout, AuthLayout,
│   │   │                         #   Sidebar, BottomNav, PwaUpdateBanner, configs de sidebar
│   │   ├── routine-builder/      # RoutineBuilder, ExercisePicker (constructor de rutinas)
│   │   └── ui/
│   │       ├── atoms/            # Button, Input, Badge, Chip, Avatar, IconButton, etc.
│   │       ├── molecules/        # Modal, TabBar, Pagination, ResponsiveTable, SearchInput
│   │       └── layout/           # BottomNav
│   ├── lib/                      # supabase.ts (cliente), helpers, icons
│   ├── pages/
│   │   ├── auth/                 # Login, Register, ForgotPassword, ResetPassword, AuthCallback
│   │   ├── dashboard/            # Dashboard, Members, MemberDetail, Memberships, Payments,
│   │   │                         #   TrainingPlans, Fingerprint (solo dev)
│   │   ├── member/               # MyPlan, MyRoutines, MyMembership, MyCheckins, MyProfile
│   │   ├── kiosk/                # CheckIn
│   │   └── settings/             # SettingsModal
│   ├── services/                 # auth, members, memberships, payments, training, routines,
│   │                             #   checkIns, dashboard, exercises
│   ├── store/                    # auth, cache, pwa, sidebar, theme (Zustand)
│   ├── styles/                   # CSS adicional (training-plans)
│   ├── App.tsx                   # Router principal
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind v4 + tema personalizado
│
├── supabase/
│   └── migrations/               # Migraciones SQL versionadas (70+ archivos)
│
├── data/supabase/
│   ├── schema/                   # SQL de migraciones de referencia (001-009)
│   ├── seed/                     # Datos de prueba (usuarios demo, limpieza)
│   └── DATABASE_CONFIG.yaml      # Configuración formal de BD
│
├── ai_work_flow/                 # Documentación metodológica
│   ├── docs/specs/               # SPECIFICATION.md + incremental/SPEC_001
│   ├── knowledge/local/          # Decisiones y lecciones aprendidas
│   ├── knowledge/remote/         # Referencias externas
│   └── tickets/                  # TKT-OMEGYM-014 al 026
│
├── public/                       # Íconos PWA, favicon, manifest
├── .env / .env.example / .env.local   # Variables de entorno
├── vercel.json                   # Configuración SPA en Vercel
└── vite.config.ts                # Config de Vite + PWA + Tailwind
```

---

## 4. Roles y Permisos

| Rol | Permisos | Módulos visibles |
|-----|----------|------------------|
| **`admin`** | Acceso total | Dashboard, Miembros, Miembros detalle, Membresías, Pagos, Planes, Fingerprint (dev) |
| **`trainer`** | Gestiona miembros y planes | Dashboard, Miembros, Membresías (editar), Planes de Entrenamiento |
| **`member`** | Solo vista de su información | Mi Plan, Mis Rutinas, Mi Membresía, Mis Check-ins, Mi Perfil |

### Estados de registro de un perfil

El sistema distingue entre un perfil creado por el administrador (miembro pendiente de tener cuenta) y uno con cuenta de autenticación real:

- **`pending`** — Perfil creado por el admin, sin cuenta de auth vinculada (aún no registrado).
- **`claimed`** — Cuenta de auth que fue vinculada y luego desvinculada.
- **`registered`** — Perfil con cuenta de auth activa vinculada.

La vinculación se gestiona mediante la tabla `auth_links` que registra el histórico de enlaces entre perfiles y cuentas de autenticación.

---

## 5. Módulos y Funcionalidades por Rol

### 5.1 Autenticación (`src/pages/auth/`)

- **Login** (`Login.tsx`) — Inicio de sesión con email/contraseña vía Supabase Auth.
- **Registro** (`Register.tsx`) — Creación de cuenta con nombre, email y contraseña; soporta confirmación de email.
- **Google OAuth** — Inicio de sesión con Google (`GoogleButton`).
- **Recuperar contraseña** (`ForgotPassword.tsx`) — Envio de email de reset.
- **Restablecer contraseña** (`ResetPassword.tsx`) — Actualización de contraseña tras el callback.
- **Callback** (`AuthCallback.tsx`) — Maneja el redirect de OAuth y de recuperación de contraseña.
- Servicio: `auth.service.ts` con `login`, `register`, `resendConfirmation`, `requestPasswordReset`, `updatePassword`, `loginWithGoogle`, `deleteAccount` (RPC `delete_my_account`), `getProfile`, `updateProfile`.
- El store `auth.store.ts` (Zustand) orquesta la sesión y el perfil del usuario en `user`, con estados `loading` e `initialized`.

### 5.2 Dashboard de administrador/entrenador (`src/pages/dashboard/Dashboard.tsx`)

Vista general con métricas clave del gimnasio y caché en Zustand (`cache.store.ts`):

- **KPIs**: total de miembros, membresías activas, membresías por vencer (7 días), miembros inactivos, ingreso del mes.
- **Membresías por vencer**: lista con días restantes.
- **Pagos pendientes**: miembros con pagos en estado `pending`.
- **Actividad reciente**: check-ins, nuevas altas, vencimientos, pagos y asignaciones de membresía (últimos 30 días).
- Estado de carga, error y empty con animaciones escalonadas (`stagger`).

### 5.3 Miembros (`src/pages/dashboard/Members.tsx`, `MemberDetail.tsx`)

- **Listado con paginación** (20 por página), búsqueda por nombre/email/teléfono, filtros por rol, estado activo/inactivo y estado de registro.
- **Deduplicación de perfiles** — lógica que agrupa filas con el mismo `full_name|email` para evitar duplicados en el listado.
- **Crear miembro** — el admin crea un perfil `pending` con nombre y rol.
- **Detalle de miembro** (`MemberDetail.tsx`) — muestra membresía activa, planes asignados, y permite **vincular/desvincular** una cuenta de autenticación (flujo de `linkPendingProfile` y `unlink`).
- **Editar, activar/desactivar** (`toggleActive`).
- **Eliminar** — dos niveles:
  - `remove`: borrado "suave" que desvincula la cuenta auth y deja el perfil como `pending`.
  - `hardDelete`: borrado físico vía RPC `hard_delete_member` (protege contra auto-eliminación y borrar el último admin; limpia cuenta auth y elimina en cascada).

### 5.4 Membresías (`src/pages/dashboard/Memberships.tsx`)

- **Tipos de membresía** (`membership_types`): nombre, precio, duración en días, descripción, activo.
  - Incluye el tipo especial **"Visita"** (visita de un día).
- **Asignación de membresía**: vía RPC `create_membership_with_payment` que crea membresía + pago en una transacción.
- **Listado con filtros**: por estado (`active`/`expired`/`cancelled`), rango de fechas, búsqueda, paginación.
- **Días restantes** calculados por cliente hasta la fecha de vencimiento.
- **Membresías por vencer**: alerta configurable (por defecto 7 días).
- Sincronización de estado vía RPC `sync_membership_status` que marca como `expired` las membresías vencidas.

### 5.5 Pagos (`src/pages/dashboard/Payments.tsx`) — solo admin

- **Registro de pagos** con método (`cash`/`card`/`transfer`) y estado (`paid`/`pending`/`cancelled`).
- **Historial** con filtros por estado, método, rango de fechas y búsqueda por miembro.
- **Resumen de ingresos**: total cobrado, pendiente, cancelado y cobrado hoy.
- **Ingresos mensuales del año**: serie por mes.
- Servicio con joins (`memberships` → `profiles`, `membership_types`) para mostrar nombre de miembro y concepto.

### 5.6 Planes de Entrenamiento (`src/pages/dashboard/TrainingPlans.tsx`) — admin + entrenador

- **Crear plan**: nombre, descripción y lista de ejercicios por día.
- **Constructor de rutinas** (`RoutineBuilder` + `ExercisePicker` en `components/routine-builder/`).
- **Agregar ejercicios** del catálogo con series, reps, descanso, músculo, día y enlace de referencia.
- **Asignar plan a múltiples miembros** (`plan_assignments`), además del `assigned_to` heredado.
- **Duplicar plan** como plantilla.
- **Desvincular plan** y eliminar.
- **Indicador de "creadores"**: cada plan muestra su entrenador-creador y los miembros asignados.

### 5.7 Vistas del miembro

#### Mi Plan (`my-plan`)
- Saludo personalizado con tarjeta de bienvenida y avatar de iniciales.
- **Pestañas por plan**: muestra planes asignados por entrenador + rutinas personales visibles, con insignia de origen ("tuya").
- **Pestañas por día** (Lun–Dom) con contador de ejercicios; detecta días de descanso.
- **Acordeón de ejercicios**: series × reps, etiquetas de músculo, **GIF animado** del catálogo, instrucciones en español, notas del entrenador y enlace de referencia.

#### Mis Rutinas (`my-routines`)
- CRUD completo de **rutinas personales** del miembro (`kind='personal'`).
- **Compartir por código**: generar/regenerar/revocar código (`XXXX-XXXX`) vía RPCs `generate_share_code` y `revoke_share_code`.
- **Importar por código**: `import_routine_by_code` crea una copia independiente.
- **Sección "Asignadas por tu entrenador"**: solo lectura con control de visibilidad (ocultar/mostrar en Mi Plan).
- Toggle "En Mi plan" para rutinas personales (`show_in_plan`).

#### Mi Membresía y Mis Pagos (`my-membership`)
- Vista unificada con **TabBar** (`Mi membresía | Pagos`) sincronizada con `?tab=` en la URL.
- Muestra la membresía activa con días restantes, e historial de pagos con modal de recibo.
- `/my-payments` redirige a `/my-membership?tab=pagos`.

#### Mis Check-ins (`my-checkins`)
- Historial de entradas/salidas del miembro (últimas 50).

#### Mi Perfil (`my-profile`)
- Edición de nombre, teléfono y alias.

### 5.8 Kiosco de Check-in (`kiosk/CheckIn.tsx`)

- Registro manual de entrada de un miembro.
- Valida que la membresía esté activa mediante trigger SQL (`validate_active_membership`).
- Métodos de acceso: `fingerprint`, `manual`, `card`.

---

## 6. Base de Datos (Supabase)

### Tablas principales

| Tabla | Propósito | Columnas clave |
|-------|-----------|----------------|
| `profiles` | Perfiles de usuarios/miembros | `id`, `email`, `full_name`, `alias`, `phone`, `avatar_url`, `role`, `is_active`, `auth_user_id`, `registration_status`, `created_at`, `updated_at` |
| `membership_types` | Tipos de membresía | `name`, `price`, `duration_days`, `description`, `is_active` |
| `memberships` | Membresías asignadas | `member_id`, `type_id`, `start_date`, `end_date`, `status` |
| `payments` | Pagos | `membership_id`, `amount`, `payment_date`, `method`, `status`, `notes` |
| `training_plans` | Planes de entrenamiento | `name`, `description`, `assigned_to`, `created_by`, `kind`, `share_code`, `show_in_plan` |
| `plan_exercises` | Ejercicios dentro de un plan | `plan_id`, `exercise_id`, `exercise_name`, `muscle`, `sets`, `reps`, `rest_seconds`, `day`, `notes`, `reference_link`, `order_index` |
| `plan_assignments` | Asignación plan↔miembro | `plan_id`, `member_id`, `visible` |
| `check_ins` | Registros de entrada | `member_id`, `membership_id`, `check_in_time`, `check_out_time`, `method`, `device_id` |
| `workout_logs` | Bitácora de entrenamientos | — |
| `exercises` | Catálogo de ejercicios | `name`, `name_es`, `category`, `body_part`, `equipment`, `muscle_group`, `secondary_muscles`, `instructions_es`, `gif_url`, `image_url`, `is_active` |
| `auth_links` | Historial de vinculación cuenta↔perfil | `profile_id`, `auth_user_id`, `registered_profile_id`, `status` |

### Seguridad (RLS)

Todas las tablas tienen **Row Level Security** habilitada con políticas por rol:
- El miembro ve solo sus datos (membresías, pagos, check-ins, planes asignados).
- El admin ve todo y gestiona todo.
- El entrenador puede crear/editar planes y ver miembros.
- Las rutinas personales siguen una RLS especial: cada miembro solo accede a las suyas mediante RPCs `SECURITY DEFINER`.

### Funciones y RPCs clave

- `handle_new_user` / `on_auth_user_created` — crea perfil automáticamente al registrarse (con lógica de desconexión si el email no está confirmado y dedup por nombre).
- `update_updated_at_column` — triggers de `updated_at` automático.
- `validate_active_membership` — trigger que valida membresía activa al registrar un check-in.
- `sync_membership_status` — marca membresías como `expired` automáticamente.
- `create_membership_with_payment` — crea membresía + pago atómico.
- `generate_share_code` / `revoke_share_code` / `import_routine_by_code` — gestión de códigos de rutinas personales.
- `set_assignment_visibility` — preferencia de visibilidad de plan por miembro.
- `hard_delete_member` — borrado físico seguro (protege último admin y auto-borrado).
- `delete_my_account` — eliminación de cuenta por el propio usuario.
- `link_profile_auth` / `unlink_profile_auth` — vinculación/desvinculación de perfil con cuenta auth.
- `cleanup_orphan_auth_users` — limpieza de cuentas huérfanas.

---

## 7. Funcionalidades Destacadas

1. **Rutinas personales compartibles por código** (SPEC_001) — Los miembros pueden crear, editar y eliminar sus propias rutinas, generar un código para compartirlas y recibir copias independientes de rutinas de otros. Permite compartir solo si los códigos están vigentes y normaliza mayúsculas/minúsculas y guiones al importar.

2. **Catálogo completo de ejercicios** — Tabla `exercises` con cientos de ejercicios en español, GIFs animados, instrucciones, grupo muscular, equipo y músculos secundarios. Reutilizado tanto por entrenadores (al crear planes) como por miembros (al crear rutinas y ver su plan).

3. **Visibilidad de planes por miembro** — Un miembro puede ocultar o mostrar un plan en su vista "Mi Plan" sin afectar a otros miembros que comparten el mismo plan (`plan_assignments.visible`).

4. **Membresía de "Visita"** — Tipo especial de membresía de un día a un precio fijo, excluida de algunos cálculos de membresías "reales".

5. **Vinculación de cuentas (pre-registro/claim)** — El admin puede crear miembros pendientes y luego vincularlos a cuentas que se registran, migrando membresías, planes y check-ins automáticamente.

6. **Caché en cliente (Zustand)** — El dashboard cachea KPIs, pagos pendientes, membresías por vencer y actividad para evitar refetch innecesario.

7. **Borrado físico seguro** — RPCs que protegen la integridad: no deja borrar el último admin ni permitir auto-borrado, limpiando la cuenta de auth correspondiente.

8. **PWA instalable** — Service worker con precaching, banner de actualización (`PwaUpdateBanner`) y store de PWA.

9. **Deduplicación de perfiles** — Lógica en el listado de miembros para agrupar perfiles duplicados por nombre+email.

10. **Tema personalizado** — Variables CSS de tema (light/dark) con sistema de estado en `theme.store.ts`.

---

## 8. Estado del Proyecto

El proyecto está **activo y en desarrollo continuo**. Cuenta con:

- **Migraciones SQL**: 70+ migraciones versionadas en `supabase/migrations/`, desde el schema inicial hasta las funcionalidades recientes (ejercicios, rutinas compartidas, visibilidad de planes).
- **Aplicación en DEV y producción**: el flujo de migraciones se ejecuta vía `db push` en desarrollo, y vía SQL directo por Management API en producción (ref `xlawavqceyprraeyrmtm`), con recarga de caché PostgREST (NOTIFY pgrst).
- **Tickets**: `TKT-OMEGYM-014` al `TKT-OMEGYM-026` documentados en `ai_work_flow/tickets/`.
- **Metodología**: SPEC Driven Development, con `SPECIFICATION.md` y la especificación incremental `SPEC_001_member_shared_routines.md`.

---

## 9. Metodología (SPEC Driven Development)

El proyecto se gestiona con un flujo documental estricto:

- **SPEcs** — `SPECIFICATION.md` (contrato del proyecto) + specs incrementales en `docs/specs/incremental/`.
- **Tickets** — Cada cambio funcional tiene un ticket `TKT-OMEGYM-###` con metadata (tipo, prioridad, estado Open→In Progress→Review→Closed), descripción, archivos afectados y criterios de aceptación.
- **Knowledge local** — Decisiones técnicas y lecciones aprendidas en `knowledge/local/` (ej: `08_shared_routines_decisions.md`, `07_email_verification_decisions.md`).
- **Knowledge remoto** — Referencias a documentación oficial en `knowledge/remote/`.
- **Convenciones de commit** — `tipo(scope): descripción (#TKT-OMEGYM-###)`.
- **Configuración de BD** — `data/supabase/DATABASE_CONFIG.yaml` documenta motor, proyecto, estado del modelo y variables de entorno.

---

## 10. Despliegue y Operación

### Despliegue en Vercel
- SPA configurada con `vercel.json` (rewrites a `index.html`).
- Variables de entorno requeridas: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Build local: `npm run build` (ejecuta `tsc -b && vite build`).

### Scripts
```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

### Variables de entorno (`.env`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## 11. Conclusión

**Omega Gym** es una plataforma completa y funcional de gestión de gimnasio con una arquitectura moderna (Vite + React + Supabase), seguridad a nivel de base de datos (RLS), tres roles diferenciados y una extensión reciente que empodera a los miembros para crear y compartir rutinas de entrenamiento. Sigue una metodología documental rigurosa que mantiene trazabilidad total entre especificaciones, tickets, conocimiento y migraciones de base de datos, en una única base de código lista para desplegar en producción.

---

*Última actualización: 2026-08-28.*
