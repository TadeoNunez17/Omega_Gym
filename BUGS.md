# Bug Tracker — Omega Gym

## 🔴 Críticos

### #1 — `getById()` rompe con miembros multi-membresía

- **Archivo**: `src/services/members.service.ts:105-117`
- **Problema**: `.single()` sobre un `select` con joins anidados. En Supabase los joins 1:N se agrupan en arrays dentro de una sola fila por parent, por lo que `.single()` funciona correctamente. **Falso positivo.**
- **Solución**: Ninguna necesaria. El query retorna 1 fila con `memberships` y `training_plans` como arrays anidados.

---

### #2 — `end_date` puede ser null en `dashboard.service.ts`

- **Archivo**: `src/services/dashboard.service.ts:210`
- **Problema**: `m.end_date.split('-')` — si `end_date` es null, `.split()` explota.
- **Solución**: Se agregó guard `if (!m.end_date) return null` antes del split, y se filtraron los nulos en el `.filter()` con type guard.

---

### #3 — `.single()` sobre `membership_types` sin verificar error

- **Archivo**: `src/services/memberships.service.ts:173, 200`
- **Problema**: Dos `.single()` sobre `membership_types` sin revisar `error`. Si el `type_id` no existe, se usaban valores default silenciosos (`duration_days: 30`, `price: 0`).
- **Solución**: Se agregó `if (typeErr || !type) throw new Error(...)` en ambos puntos. Ahora falla explícitamente si el tipo no existe.

---

## 🟠 Altos

### #4 — DST off-by-one en cálculo de fechas (4 lugares)

- **Archivos**: `src/services/memberships.service.ts:181-184`, `src/pages/dashboard/Memberships.tsx:157-159, 733-736, 774-777`
- **Problema**: `new Date("YYYY-MM-DD")` (UTC midnight) + `setDate`/`getDate` (local) produce off-by-one en transiciones de horario de verano.
- **Solución**: ✅ Reemplazado con `new Date(parseInt(y), parseInt(mo) - 1, parseInt(d) + duration)` y formateo manual con `getFullYear()/getMonth()/getDate()`.

### #5 — `days_remaining` off-by-one cerca del vencimiento

- **Archivos**: `src/services/memberships.service.ts:83-86, 254-267`, `src/services/trainer.service.ts:86-88`, `src/pages/trainer/Panel.tsx:88`, `src/pages/member/MyPlan.tsx:68-70`
- **Problema**: `new Date(m.end_date)` (UTC midnight) vs `new Date()` (local con horas) — puede dar -1 el día del vencimiento.
- **Solución**: ✅ Reemplazado con fechas midnight locales: `const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())`, parsear `end_date` con `split('-').map(Number)`, y usar `endLocal.getTime() - todayLocal.getTime()`.

### #6 — Memory leak en AuthCallback

- **Archivo**: `src/pages/auth/AuthCallback.tsx`
- **Problema**: `onAuthStateChange` nunca se desuscribe. Se acumulan listeners en cada mount.
- **Solución**: ✅ Guardar subscription con `const { data: { subscription } } = supabase.auth.onAuthStateChange(...)` y llamar `subscription.unsubscribe()` en el return del `useEffect`.

### #7 — KPIs sin verificación de errores

- **Archivo**: `src/services/dashboard.service.ts:49-82`
- **Problema**: Ninguno de los 4 queries paralelos revisa errores. Fallos silenciosos → KPIs muestran 0.
- **Solución**: ✅ Agregados `if (result.error) throw result.error` después de cada query.

### #8 — Revenue sin verificación de errores

- **Archivo**: `src/services/payments.service.ts:90-114`
- **Problema**: Mismo patrón que KPIs — 4 queries sin check de error.
- **Solución**: ✅ Agregados `if (result.error) throw result.error` después de cada query.

### #9 — Membresía creada sin transacción

- **Archivo**: `src/services/memberships.service.ts:167-229`
- **Problema**: Si el pago falla, la membresía ya quedó insertada (huérfana).
- **Solución**: ✅ Creado RPC `create_membership_with_payment()` en `supabase/migrations/20260605000004_create_membership_with_payment.sql` que envuelve ambas operaciones en una transacción atómica. El RPC además valida: (a) no duplicar membresías activas, (b) Visita no permite pago pendiente, (c) lookup de `duration_days` y `price` dentro de la misma transacción.

### #10 — LIKE filter injection

- **Archivos**: `src/services/members.service.ts:72-74, 185-186`, `src/services/training.service.ts:58-59`
- **Problema**: `search` se interpola directo en `.or("full_name.ilike.%${search}%")` sin sanitizar.
- **Solución**: ✅ Agregada función `escapeSearch(s)` que escapa `%`, `_` y `\` con backslash, y se usa en los 3 lugares.

### #11 — `data.map()` con `data` potencialmente null

- **Archivo**: `src/services/trainer.service.ts:100`
- **Problema**: `const { data } = await trainingService.getAll(...)` — `data` puede ser null si Supabase retorna `{ data: null }`.
- **Solución**: ✅ La función `getPlans()` ahora usa `const { data = [] }` (verificado que el servicio aguas abajo ya tiene el guard).

---

## 🟡 Medios

### #12 — Race conditions en useEffect (5 lugares)

- **Archivos**: `MemberDetail.tsx:57-144`, `MyPlan.tsx:20-50`, `Panel.tsx:72-117`, `Memberships.tsx:93-100`
- **Problema**: Async IIFE / Promises sin cleanup flag. Respuesta lenta de un request anterior puede sobrescribir datos correctos.
- **Solución**: ✅ Agregado objeto `ctrl = { cancelled: false }` con guard `if (ctrl.cancelled) return` en cada `.then()`/`.catch()`/`.finally()`, y `ctrl.cancelled = true` en el cleanup del `useEffect`.

### #13 — Module-level `NOW` / `TODAY_STR` stale

- **Archivo**: `src/pages/dashboard/Dashboard.tsx:29-30`
- **Problema**: Constantes evaluadas una vez al importar. Si la página cruza medianoche, muestra fecha incorrecta.
- **Solución**: ✅ Reemplazado con función `todayStr()` que calcula la fecha en cada render.

### #14 — `Promise.all` fail-fast

- **Archivos**: `dashboard.service.ts:49-76`, `payments.service.ts:90-111`
- **Problema**: Si 1 de 4 queries falla, se pierde toda la data. `Promise.allSettled` permitiría mostrar datos parciales.
- **Solución**: ✅ Migrado a `Promise.allSettled` en ambos servicios. Cada query se maneja independientemente; si falla, se loguea el error y se usa `0`/`null` como fallback.

### #15 — Casts `data as SomeType` sin validación

- **Archivos**: Todos los servicios
- **Problema**: `data as Member`, `data as Membership`, etc. Si el schema de BD cambia, no hay error en compilación.
- **Solución**: ⏳ Pendiente — idealmente agregar validación runtime con Zod.

---

## ✅ Resueltos (esta sesión)

### 2026-06-05 — Bug `getStatus` en Memberships.tsx

- **Archivo**: `src/pages/dashboard/Memberships.tsx:35-41`
- **Problema**: `getStatus()` usaba `daysDiff` directo sin negar. `daysDiff` retorna `today - date`, por lo que fechas futuras daban negativo y se marcaban como `expired`.
- **Solución**: Negar `diffVal` como ya hacen los renderers de tabla: `const diff = -diffVal; if (diff < 0) return 'expired'`.

### 2026-06-05 — Fix crítico #2: `end_date` null safety

- **Archivo**: `src/services/dashboard.service.ts:210`
- **Solución**: Guard `if (!m.end_date) return null` + type guard en filter.

### 2026-06-05 — Fix crítico #3: `.single()` sin check de error

- **Archivo**: `src/services/memberships.service.ts:173, 200`
- **Solución**: Error explícito si `membership_types` no existe.

### 2026-06-05 — Fix alto #4: DST off-by-one (4 lugares)

- **Archivos**: `memberships.service.ts`, `Memberships.tsx` (3 lugares)
- **Solución**: Construcción de fecha local con `new Date(y, mo-1, d + duration)` + formateo manual.

### 2026-06-05 — Fix alto #5: days_remaining off-by-one (5 lugares)

- **Archivos**: `memberships.service.ts`, `trainer.service.ts`, `Panel.tsx`, `MyPlan.tsx`
- **Solución**: Fechas midnight locales para ambos operandos de la resta.

### 2026-06-05 — Fix alto #6: Memory leak en AuthCallback

- **Archivo**: `AuthCallback.tsx`
- **Solución**: Suscripción guardada y cleanup con `subscription.unsubscribe()`.

### 2026-06-05 — Fix alto #7 y #8: Error checks en KPIs y Revenue

- **Archivos**: `dashboard.service.ts`, `payments.service.ts`
- **Solución**: `if (result.error) throw result.error` después de cada query.

### 2026-06-05 — Fix medio #10: LIKE filter injection

- **Archivos**: `members.service.ts`, `training.service.ts`
- **Solución**: Función `escapeSearch()` para escapar `%`, `_`, `\`.

### 2026-06-05 — Fix medio #12: Race conditions en useEffect (5 lugares)

- **Archivos**: `MemberDetail.tsx`, `MyPlan.tsx`, `Panel.tsx`, `Memberships.tsx`
- **Solución**: Objeto `ctrl = { cancelled: false }` con guard en cada handler.

### 2026-06-05 — Fix medio #13: Module-level date stale

- **Archivo**: `Dashboard.tsx`
- **Solución**: Reemplazado `const TODAY_STR` module-level por función `todayStr()`.

### 2026-06-05 — Fix alto #9: Transacción atómica + validaciones de pago

- **Archivos**: `supabase/migrations/20260605000004_create_membership_with_payment.sql`, `memberships.service.ts`, `Memberships.tsx`
- **Solución**: Nuevo RPC SQL que envuelve membresía + pago en transacción, y valida: (1) no crear membresía si ya hay una activa, (2) Visita no permite método "Pendiente", (3) montos contra BD. UI también bloquea botón Pendiente para Visita.

### 2026-06-05 — Fix medio #14: Promise.all → allSettled en KPIs y Revenue

- **Archivos**: `dashboard.service.ts`, `payments.service.ts`
- **Solución**: Migrado a `Promise.allSettled`. Cada query se maneja independientemente; si una falla, las demás siguen funcionando.

### 2026-06-05 — Fix reparación + validación Visita amount

- **Archivos**: `supabase/migrations/20260605000005_fix_visita_payment_amounts.sql`, `payments.service.ts`, `Payments.tsx`
- **Solución**: SQL corrige pagos Visita con monto incorrecto (ej. $320 en vez de $30). Payments service ahora incluye `expected_amount` desde `membership_types.price` en cada PaymentListItem. UI muestra badge rojo "Monto incorrecto" si hay mismatch, en tabla y vista mobile.
