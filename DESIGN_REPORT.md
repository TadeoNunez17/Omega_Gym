# Reporte de Diseño — Omega Gym

> **Versión:** 1.0  
> **Fecha:** 2026-06-23  
> **Propósito:** Documentar la arquitectura, navegación, componentes y flujo de datos del sistema por rol de usuario para facilitar mejoras futuras.

---

## 1. Visión General

### Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + TypeScript 6 |
| Bundler | Vite 8 |
| Routing | React Router v7 (BrowserRouter, `<Outlet>` anidados) |
| Backend | Supabase (PostgreSQL 17 + Auth + RLS) |
| Estado global | Zustand 5 (auth, sidebar, theme) |
| Estilos | Tailwind CSS v4 |
| Notificaciones | Sonner |
| PWA | vite-plugin-pwa (NetworkFirst para Supabase) |
| Deploy | Vercel (SPA rewrites) |

### Tema visual

- **Esquema:** Dark por defecto, toggle a light
- **Acento:** `#e85d5d` (rojo) — usado en botones activos, badges, iconos seleccionados, progress bars
- **Superficies:** `bg` → fondo negro, `surface` → tarjetas gris oscuro, `surface2` → hover/inputs
- **Texto:** `text` → blanco, `text-2` → gris claro, `text-3` → gris medio
- **Animaciones:** `animate-slide-up` con clases `stagger-1` a `stagger-7` para entrada escalonada

### PWA

- Service worker auto-generado con `generateSW`
- Caché NetworkFirst para peticiones a `*.supabase.co`
- Manifiesto con nombre "Omega Gym", theme color oscuro, iconos SVG

---

## 2. Sistema de Autenticación

### Flujo completo

```
Usuario visita /login o /register
         │
         ▼
    ┌──────────┐
    │ ¿Tiene   │
    │ sesión?  │─── Sí ──→ RootRedirect según rol
    └────┬─────┘
         │ No
         ▼
   ┌──────────┐
   │ Login /  │
   │ Register │
   └────┬─────┘
        │
        ▼
  Supabase Auth (email+password / Google OAuth)
        │
        ▼
  Trigger handle_new_user() en auth.users
  → Busca profile pendiente por email o phone
  → Si existe: actualiza auth_user_id, registration_status = 'registered'
  → Si no: crea profile nuevo con role 'member'
        │
        ▼
  AuthStore.initialize() → getSession() + getProfile()
  → Guarda user + role en Zustand
        │
        ▼
  ProtectedRoute verifica rol
  → Redirige a ruta por defecto del rol
```

### Roles y routing post-login

| Rol | Ruta default | Layout |
|-----|-------------|--------|
| `admin` | `/dashboard` | AdminLayout |
| `trainer` | `/trainer/panel` | TrainerLayout |
| `member` | `/my-plan` | MemberLayout |

### auth_links (desacoplamiento profile ↔ auth)

Evolución clave del sistema: los profiles tienen su propio UUID independiente de `auth.users.id`. La tabla `auth_links` y la columna `auth_user_id` en `profiles` manejan el linking/unlinking. Esto permite:

- Pre-registration (admin crea profile → usuario reclama cuenta)
- Unlinking (profile revierte a `pending` si se elimina el auth user)
- Re-linking con prioridad a `registered_profile_id`

---

## 3. Navegación por Rol

### 3.1 Admin — AdminLayout

```
┌─────────────────────────────────────────────────────┐
│  Desktop (lg+)                  Mobile              │
│  ┌─────┬──────────────────┐    ┌──────────────────┐ │
│  │Icon │                  │    │   (sin hamburger) │ │
│  │Rail │   <Outlet />     │    │                  │ │
│  │  ☰  │   (contenido)    │    │   <Outlet />     │ │
│  │  📊 │                  │    │   (contenido)    │ │
│  │  👥 │                  │    │                  │ │
│  │  💳 │                  │    │                  │ │
│  │  💰 │                  │    │                  │ │
│  │  📋 │                  │    ├──────────────────┤ │
│  │  🔒 │                  │    │   BottomNav      │ │
│  │  📈 │                  │    │ 📊👥💳💰⚙️     │ │
│  │  👤 │                  │    └──────────────────┘ │
│  │  🌙 │                  │                         │
│  └─────┴──────────────────┘                         │
└─────────────────────────────────────────────────────┘
```

| Elemento | Desktop | Mobile |
|----------|---------|--------|
| Icon rail (izquierda) | `hidden lg:flex` | Oculto |
| Sidebar lateral (panel) | Se abre desde ☰ en rail | Oculto (`hidden lg:flex`) |
| Hamburger | No visible | Eliminado |
| BottomNav | Oculto (`lg:hidden`) | 5 tabs fijos abajo |
| Settings Modal | Desde sidebar o BottomNav | Desde BottomNav ⚙️ |

**BottomNav items (admin):** Dashboard, Miembros, Membresías, Pagos, Ajustes (⚙️ abre modal)

### 3.2 Trainer — TrainerLayout

Misma estructura que AdminLayout con los mismos principios responsive.

**BottomNav items (trainer):** Mi panel, Miembros, Planes, Plantillas, Ajustes (⚙️ abre modal)

### 3.3 Member — MemberLayout

```
┌──────────────────────────────────────┐
│  Desktop (lg+)      Mobile          │
│  ┌───┬──────────┐  ┌──────────────┐│
│  │ICN│          │  │  (sin hamb.) ││
│  │ ☰ │  Page    │  │              ││
│  │ 📋 │  content │  │  Page       ││
│  │ 💳 │          │  │  content    ││
│  │ 💰 │          │  │              ││
│  │ 📅 │          │  ├──────────────┤│
│  │ 👤 │          │  │  BottomNav   ││
│  │ 🌙 │          │  │📋💳💰📅👤││
│  └───┴──────────┘  └──────────────┘│
└──────────────────────────────────────┘
```

**BottomNav items (member):** Plan, Membresía, Pagos, Asistencia, Perfil

### 3.4 Kiosk — Sin layout

Página standalone en `/check-in`, sin layout wrapper, sin BottomNav.

---

## 4. Admin — 8 páginas

### 4.1 Dashboard (`/dashboard`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Contenido en `p-4 sm:p-7`, encabezado con grid hero, sin header decorativo |
| **Componentes** | MetricCard (6 KPIs: miembros activos, vencidos, próximos a vencer, visitas hoy, ingresos mes, pagos pendientes), iconos SVG inline |
| **Datos** | `dashboard.service.ts` — KPIs, revenue, activity, pending payments |
| **Acciones** | Redirección rápida a miembros, pagos, check-in |
| **Estados** | Loading spinner, skeleton mientras carga |

**Flujo de datos:**
```
Dashboard.tsx
  └─ useEffect → dashboardService.getKPIs() → setKPIs()
  └─ useEffect → dashboardService.getRevenue(month) → setRevenue()
  └─ useEffect → dashboardService.getPendingPayments() → setPending()
  └─ Renderiza MetricCards + tablas
```

### 4.2 Miembros (`/members`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | PageHeader + SearchInput + TabBar (Todos/Activos/Vencidos) + tabla |
| **Componentes** | Modal (crear/editar), ResponsiveTable, Pagination, EmptyState, Chip, Badge, Avatar |
| **Servicio** | `members.service.ts` — CRUD, search, filter, pagination |
| **Estados** | Loading, empty ("Sin miembros"), error toast, paginación 20 por página |

### 4.3 MemberDetail (`/members/:id`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | PageHeader con back + nombre + avatar + badges de estado |
| **Componentes** | TabBar (Info/Membresía/Pagos/Plan/Check-ins), Badge, Modal, MetricCard |
| **Datos** | 5 servicios distintos cargados en paralelo |
| **Estados** | Loading por cada pestaña, error toast individual |

### 4.4 Membresías (`/memberships`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Dos secciones: tipos de membresía (cards) + tabla de membresías asignadas |
| **Componentes** | Modal (crear tipo, editar tipo, asignar membresía), Chip, Badge, MetricCard |
| **Servicio** | `memberships.service.ts` — tipos CRUD + asignaciones CRUD + expiring |
| **Estados** | Loading, empty, error toast, paginación |

### 4.5 Pagos (`/payments`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | PageHeader + filtros (fecha, método, estado) + tabla + paginación |
| **Componentes** | Modal (crear/editar pago), Badge, Chip, MetricCard (total ingresos) |
| **Servicio** | `payments.service.ts` — CRUD, revenue summary, pending count |
| **Estados** | Loading, empty, error toast, 50 por página |

### 4.6 TrainingPlans (`/training-plans`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Grid de cards + modal editor con pestañas por día |
| **Componentes** | Modal con tabs, Input fields dinámicos por ejercicio, Chip |
| **Servicio** | `training.service.ts` — planes CRUD + ejercicios CRUD + duplicar plantilla |
| **Estados** | Loading, empty ("Sin planes"), error toast |

### 4.7 Fingerprint (`/fingerprint`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Asistente paso a paso (wizard) con estados |
| **Componentes** | Modal de confirmación, iconos de estado (pending/success/error) |
| **Flujo** | Seleccionar miembro → escanear (simulado) → confirmar → resultado |
| **Servicio** | `checkIns.service.ts` — create check-in |
| **Estados** | Por paso del wizard, loading en escaneo simulado |

### 4.8 Reports (`/reports`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Grid de 6 cards de reporte |
| **Componentes** | Card clickeable con icono + descripción + badge de estado |
| **Datos** | Placeholder — cada card muestra "Preparando reporte…" |
| **Exportación** | CSV export stub (console.log), sin implementación real |

---

## 5. Trainer — 5 páginas

### 5.1 Panel (`/trainer/panel`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | MetricCards + tabla de miembros + sección de check-in rápido |
| **Componentes** | MetricCard, ResponsiveTable, Badge, Chip |
| **Servicio** | `trainer.service.ts` (delega a members, checkIns, dashboard) |
| **Estados** | Loading, empty, error toast |

### 5.2 Miembros (`/trainer/members`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Tabla de miembros con búsqueda (solo lectura) |
| **Componentes** | ResponsiveTable, SearchInput, Badge, Chip (check-in), EmptyState |
| **Servicio** | `members.service.ts` — getAll con filtros |
| **Estados** | Loading, empty, error toast |
| **Nota** | Solo lectura — trainer no puede crear/editar miembros |

### 5.3 Membresías (`/trainer/memberships`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Tabla de membresías asignadas (solo lectura) |
| **Componentes** | ResponsiveTable, Badge (estado), Pagination |
| **Servicio** | `memberships.service.ts` — getAll |
| **Estados** | Loading, empty, error toast |

### 5.4 Planes (`/trainer/plans`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Cards de planes + modal editor con ejercicios por día |
| **Componentes** | Modal, Input dinámico, Chip, Badge |
| **Servicio** | `training.service.ts` — CRUD planes y ejercicios |
| **Estados** | Loading, empty, error toast |
| **Nota** | Trainer puede crear y asignar planes a miembros |

### 5.5 Plantillas (`/trainer/templates`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Cards de planes plantilla (solo lectura) |
| **Componentes** | Card, Badge ("Plantilla"), Chip |
| **Servicio** | `training.service.ts` — getTemplates |
| **Estados** | Loading, empty, error toast |
| **Nota** | Solo vista — no se pueden editar ni eliminar plantillas |

---

## 6. Member — 5 páginas

Todas las páginas de member comparten:

- **Header uniforme:** Círculo con icono de pesa (fondo `bg-accent`) + "Omega Gym" (subtitle) + nombre de página (title)
- **Contenedor:** `p-4 sm:p-7 flex-1` (mismo que admin, sin `max-w`)

### 6.1 MyPlan (`/my-plan`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Header + greeting banner + selector de día + grid de ejercicios + notas del plan |
| **Componentes** | Chip (series/reps/descanso), botón de timer por ejercicio, card de notas |
| **Datos** | `training.service.ts` — getByMember + getExercises |
| **Timer** | Por ejercicio: botón play ▶️ (36px, `bg-accent text-black`), cuenta regresiva, cambia a ⏸️ (pause), al llegar a 0 muestra "¡Listo!" 2s, danger rojo si < 10s |
| **Estados** | Loading, sin plan ("Tu entrenador aún no te ha asignado un plan"), día de descanso, día sin ejercicios |

### 6.2 MyMembership (`/my-membership`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Header + alerta de vencimiento (si ≤ 7 días) + card de membresía + card de detalles + historial |
| **Componentes** | Badge (verde "Activa"), progress bar (4px), Chip, detalles en filas |
| **Datos** | `memberships.service.ts` — getActiveWithType + getByMember |
| **Progress** | "Período" label + porcentaje + barra 4px + "X días restantes de Y" |
| **Detalles** | Duración, precio, miembro desde |
| **Historial** | Todas las membresías anteriores con badge "Completada" (verde) o "Cancelada" (roja) |
| **Estados** | Loading, sin membresía activa, vencimiento próximo |

### 6.3 MyPayments (`/my-payments`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Header + 2 MetricCards + últimos detalles de pago + historial |
| **Componentes** | MetricCard (total pagado, conteo), Modal (recibo), Badge (estado) |
| **Datos** | `payments.service.ts` — getByMember |
| **MetricCards** | "Pagado este año" + "Pagos registrados" |
| **Último pago** | Card con fecha, monto, método, estado |
| **Historial** | Filas con concepto + fecha + método (izquierda), monto + badge (derecha) |
| **Recibo Modal** | Modal centrado con monto grande, badge de estado, concepto, método, fecha, notas, footer decorativo |
| **Estados** | Loading, sin pagos |

### 6.4 MyCheckins (`/my-checkins`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Header + 2 MetricCards + calendario mensual + historial reciente |
| **Componentes** | MetricCard (este mes, racha), calendario grid con leyenda de colores |
| **Datos** | `checkIns.service.ts` — getByMember |
| **MetricCards** | "Este mes" + "Racha actual" |
| **Calendario** | Grid 7-columnas, días con check-in → `bg-accent text-black`, hoy → dotted border, vacío → gris |
| **Leyenda** | 3 items: Check-in (cuadro lleno), Hoy (borde punteado), Sin registro (vacío) |
| **Historial** | Últimos 20 check-ins con fecha, hora, método y badge "Check-in" |
| **Estados** | Loading, sin registros |

### 6.5 MyProfile (`/my-profile`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Header + avatar card (centrado) + 2 MetricCards + filas de información + botón cerrar sesión |
| **Componentes** | Badge (rol + membresía activa), MetricCard (meses como miembro, visitas totales) |
| **Datos** | `memberships.service.ts` (getActiveWithType), `checkIns.service.ts` (getByMember) |
| **Avatar card** | W-20 h-20, círculo con iniciales (color basado en hash del nombre) |
| **Filas info** | Email, teléfono, miembro desde → cada una con icono de color |
| **Logout** | Botón rojo full-width con icono de salida |
| **Estados** | Loading, usuario no autenticado |

---

## 7. Kiosk — 1 página

### CheckIn (`/check-in`)

| Aspecto | Detalle |
|---------|---------|
| **Layout** | Fullscreen centrado, diseño tipo quiosco táctil |
| **Componentes** | Button grande, LoadingSpinner, lista de check-ins recientes |
| **Flujo** | Estado inicial → seleccionar método → escanear (simulado) → confirmar → éxito/error |
| **Métodos** | Huella, Manual, Tarjeta |
| **Datos** | `checkIns.service.ts` — create + getToday |
| **Audio** | Simulado con console.log |
| **Estados** | Idle → scanning → verifying → success/error |

---

## 8. Librería de Componentes UI

### 8.1 Átomos (7)

| Componente | Props clave | Propósito |
|-----------|------------|-----------|
| `Avatar` | `name`, `size?`, `url?` | Círculo con iniciales o imagen |
| `Badge` | `variant` (accent/green/red/amber/gray/blue), `dot?`, `children` | Etiqueta de estado |
| `Button` | `variant`, `size`, `loading`, `disabled`, `onClick` | Botón con variante primary/secondary/ghost |
| `Chip` | `value`, `label`, `accent?` | Par valor-etiqueta compacto (ej. "8 Reps") |
| `IconButton` | `icon`, `onClick`, `size?`, `variant?` | Botón cuadrado solo con icono |
| `Input` | `label`, `error`, `type`, `as?` ('select'), `options?` | Input con label flotante y select |
| `LoadingSpinner` | `text?`, `size?` | Spinner centrado con texto opcional |
| `MetricCard` | `icon`, `label`, `value`, `color` (accent/green/gray/blue) | Card de métrica con icono |

### 8.2 Moléculas (6)

| Componente | Props clave | Propósito |
|-----------|------------|-----------|
| `Modal` | `open`, `onClose`, `title`, `icon?`, `compact?`, `children` | Slide-over panel con backdrop y animación |
| `PageHeader` | `title`, `subtitle?`, `actions?`, `back?` | Encabezado de página con acciones |
| `Pagination` | `page`, `total`, `onChange` | Paginación numérica |
| `ResponsiveTable` | `columns`, `data`, `onRowClick?`, `mobileCard` | Tabla: desktop en columnas, mobile en cards |
| `SearchInput` | `value`, `onChange`, `placeholder?` | Input de búsqueda con icono de lupa y debounce |
| `TabBar` | `tabs`, `active`, `onChange` | Barra de pestañas horizontal |

### 8.3 Layout

| Componente | Propósito |
|-----------|-----------|
| `BottomNav` | Barra de navegación inferior fija para mobile. Acepta `items`, `icons`, `onSettings` por props |

---

## 9. Servicios y Flujo de Datos

### Patrón general

```
Página (useEffect)
    │
    ▼
Servicio (llamada a Supabase)
    │
    ▼
Supabase client (REST + RLS)
    │
    ▼
Respuesta → setState en página → render
```

Cada página sigue el patrón:

```typescript
const [data, setData] = useState<T[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const ctrl = { ignore: false }
  servicio.metodo(user.id).then(d => {
    if (!ctrl.ignore) setData(d)
  }).finally(() => {
    if (!ctrl.ignore) setLoading(false)
  })
  return () => { ctrl.ignore = true }
}, [user])
```

No se usa React Query / SWR. No hay custom hooks. No hay manejo formal de errores con `AppError`.

### Los 9 servicios

| Servicio | Métodos exportados | Tablas |
|----------|-------------------|--------|
| `auth.service.ts` | `login`, `register`, `getSession`, `getProfile`, `logout` | auth.users, profiles |
| `members.service.ts` | `getAll` (search/filter/paginate), `getById`, `create`, `update`, `delete` | profiles |
| `memberships.service.ts` | `getTypes`, `getAll`, `getByMember`, `getActiveByMember`, `getActiveWithType`, `create`, `update`, `delete`, `getExpiring` | membership_types, memberships |
| `payments.service.ts` | `getAll` (filter/paginate), `getByMember`, `create`, `update`, `getPendingCount`, `getRevenueSummary` | payments |
| `training.service.ts` | `getAll`, `getByMember`, `getExercises`, `create`, `update`, `delete`, `duplicateTemplate` | training_plans, plan_exercises |
| `checkIns.service.ts` | `getByMember`, `create`, `getToday`, `getMonthlyCounts` | check_ins |
| `dashboard.service.ts` | `getKPIs`, `getRevenue`, `getDistribution`, `getRecentActivity`, `getPendingPayments` | multiple tables |
| `trainer.service.ts` | Wrapper que delega a members, checkIns, dashboard services | — |
| `sms.service.ts` | `sendNotification` (console.log) | — |

### Manejo de errores

- Los servicios **no tienen try/catch** — propagan el error al componente
- Las páginas tienen `try/catch` opcional con `toast.error` o `console.error`
- No existe la clase `AppError` ni los códigos de error definidos en SPEC

---

## 10. Sistema de Estilos

### Tokens CSS (definidos en `index.css` via `@theme`)

```css
:root {
  --bg: #0a0a0a;
  --surface: #111;
  --surface2: #1a1a1a;
  --border: #222;
  --border2: #333;
  --text: #f5f5f5;
  --text-2: #a3a3a3;
  --text-3: #666;
  --accent: #e85d5d;
  --accent-dim: rgba(232, 93, 93, 0.1);
  --green: #22c55e;
  --green-bg: rgba(34, 197, 94, 0.1);
  --green-text: #4ade80;
  --red: #ef4444;
  --red-bg: rgba(239, 68, 68, 0.1);
  --red-text: #f87171;
  --amber-text: #fbbf24;
  --logo-bg: rgba(232, 93, 93, 0.15);
  --logo-border: rgba(232, 93, 93, 0.3);
  --logo-omega: #e85d5d;
  --sidebar-w: 260px;
  --radius-sm: 8px;
}
```

### Light mode

Toggle via `data-theme="light"` en `<html>`. Inversión de colores: fondos claros, texto oscuro.

### Animaciones

- `animate-slide-up`: entrada desde abajo con opacidad
- `stagger-1` a `stagger-7`: `animation-delay` progresivo para entradas escalonadas
- `row-hover`: hover sutil en filas de tabla
- `animate-fade-in`: para "¡Listo!" en timer

### Responsive

- **Breakpoint:** `lg:` (1024px)
- **Mobile first:** estilos base = mobile, `lg:` override para desktop
- **Mobile:** BottomNav fijo abajo, `pb-16` en main
- **Desktop:** Icon rail izquierdo fijo, sidebar se abre con toggle

---

## 11. PWA

| Aspecto | Configuración |
|---------|--------------|
| **Strategy** | `generateSW` (Workbox auto-generado) |
| **Runtime caching** | URL `*.supabase.co` → NetworkFirst, expires 1 día |
| **Precache** | 11 entries (~906 KiB): JS, CSS, HTML, manifest, iconos |
| **Register** | `registerSW.js` auto-injectado por plugin |
| **Update** | Service worker auto-actualiza en recarga |

---

## 12. Estado Actual vs SPEC

### Construido ✅

- 46 migraciones de base de datos con schema completo
- Auth con pre-registration, linking/unlinking, OAuth Google
- 8 páginas admin, 5 trainer, 5 member, 1 kiosk
- Sistema de layouts responsive con BottomNav para cada rol
- 13 componentes UI
- 9 servicios de datos
- PWA con service worker
- Sistema de temas (dark/light)
- Settings modal

### No construido ❌ (definido en SPEC pero ausente)

| Feature | Referencia SPEC | Estado |
|---------|----------------|--------|
| Tests unitarios (Vitest) | §13.1 | No implementado |
| Tests integración | §13.1 | No implementado |
| Tests E2E (Playwright) | §13.1 | No implementado |
| Zod validation schemas | §2 | No implementado |
| React Query / SWR caching | §11.5, §18.1 | No implementado — usa useEffect puro |
| Custom hooks de datos | §14.1 | No implementado — lógica en páginas |
| `AppError` class + `ErrorCodes` | §16.1 | No implementado |
| Error boundary global | §16.3 | No implementado |
| `handleError` hook con Sonner | §16.4 | No implementado |
| Seed data (`data/supabase/seed/`) | §5.4.2 | No existe |
| Índices de BD (definidos en SPEC) | §5.4.8 | No verificados |
| Soft delete (`deleted_at`) | §5.4.8 | No implementado en todas las tablas |
| Reportes funcionales (CSV real) | §4.8 | Solo stubs |

---

## Apéndice A: Diagrama de Navegación

```
                                ┌─────────────┐
                                │   /login     │
                                │   /register  │
                                └──────┬──────┘
                                       │
                                  ┌────▼────┐
                                  │  Auth   │
                                  │  Check  │
                                  └────┬────┘
                          ┌────────────┼────────────┐
                          ▼            ▼            ▼
                    ┌──────────┐ ┌──────────┐ ┌──────────┐
                    │  Admin   │ │  Trainer │ │  Member  │
                    │  Layout  │ │  Layout  │ │  Layout  │
                    └────┬─────┘ └────┬─────┘ └────┬─────┘
           ┌────────────┼──────┐  ┌───┼────┐  ┌───┼────┐
           ▼            ▼      ▼  ▼   ▼    ▼  ▼   ▼    ▼
       ┌──────┐    ┌──────┐  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
       │Dashboard│  │Members│  │…│ │Panel│ │…│ │Plan│ │…│
       └────────┘  └───────┘  └──┘ └────┘ └──┘ └───┘ └──┘
        (7 more)             (4 more)       (4 more)
```

---

## Apéndice B: Flujo de Datos Simplificado

```
[Browser] ──HTTP──> [Vercel (SPA)]
                        │
                   [React App]
                        │
              ┌─────────┼─────────┐
              │         │         │
           [Auth]   [Zustand]  [Services]
              │         │         │
              └─────────┼─────────┘
                        │
              Supabase Client (REST)
                        │
                   ┌────▼────┐
                   │Supabase │
                   │(Postgres│
                   │ + Auth  │
                   │ + RLS)  │
                   └─────────┘
```

---

*Fin del reporte — Documentación generada el 2026-06-23*
