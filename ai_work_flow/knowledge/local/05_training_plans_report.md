# 05_training_plans_report.md

## Reporte: Módulo de Planes de Entrenamiento — Omega Gym

**Fecha**: 2026-06-30
**Contexto**: Auditoría inicial solicitada por el desarrollador para decidir próximos pasos.

---

### 1. Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Vite + React 19 + TypeScript |
| Routing | React Router v7 |
| DB | Supabase (PostgreSQL) |
| Service layer | Servicios planos (`src/services/`) |

---

### 2. Base de Datos

#### 2.1 Tabla `training_plans`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | UUID | PK, `gen_random_uuid()` |
| `name` | TEXT | NOT NULL |
| `description` | TEXT | nullable |
| `assigned_to` | UUID | FK → `profiles(id)` ON DELETE CASCADE, nullable |
| `created_by` | UUID | FK → `profiles(id)` ON DELETE CASCADE, NOT NULL |
| `is_template` | BOOLEAN | DEFAULT FALSE |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW(), auto-update vía trigger |

#### 2.2 Tabla `plan_exercises`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | UUID | PK, `gen_random_uuid()` |
| `plan_id` | UUID | FK → `training_plans(id)` ON DELETE CASCADE, nullable |
| `exercise_name` | TEXT | NOT NULL |
| `muscle` | TEXT | nullable (agregado en migration `add_muscle_to_plan_exercises`) |
| `sets` | INTEGER | nullable |
| `reps` | INTEGER | nullable |
| `rest_seconds` | INTEGER | nullable |
| `day` | INTEGER | CHECK (0-6), nullable |
| `notes` | TEXT | nullable |
| `order_index` | INTEGER | NOT NULL DEFAULT 0 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

#### 2.3 RLS Policies

- **SELECT**: miembros ven solo su plan asignado (`assigned_to` = su profile); admin/trainer ven todos
- **INSERT/UPDATE/DELETE**: solo admin/trainer
- Políticas más recientes: `20260616000001_fix_rls_linked_members.sql` (SELECT), `20260525000004_security_definer_rls.sql` (INSERT/UPDATE/DELETE)

#### 2.4 Seed Data

**No existe** seed data para `training_plans` ni `plan_exercises`. Solo hay demo de profiles, memberships y payments.

---

### 3. Servicios

#### 3.1 `src/services/training.service.ts` (220 líneas)

| Método | Firma | Uso actual |
|--------|-------|-----------|
| `getAll(filters?)` | `(PlanFilters) => { data, total }` | Admin list, trainer list |
| `getById(id)` | `(string) => TrainingPlan & { exercises: PlanExercise[] }` | Admin detail panel |
| `create(input)` | `(CreateInput) => TrainingPlan` | Admin modal, trainer modal |
| `getTemplates()` | `() => TrainingPlan[]` | Trainer templates page |
| `update(id, input)` | `(string, UpdateInput) => TrainingPlan` | Trainer edit modal |
| `getByMember(memberId)` | `(string) => TrainingPlan \| null` | Member MyPlan, admin MemberDetail |
| `getExercises(planId)` | `(string) => PlanExercise[]` | Admin detail, member MyPlan |

**Métodos faltantes:**
- ❌ `delete(id)` — eliminar plan
- ❌ `createExercise(planId, input)` — crear ejercicio individual
- ❌ `updateExercise(id, input)` — actualizar ejercicio
- ❌ `deleteExercise(id)` — eliminar ejercicio
- ❌ `upsertExercises(planId, exercises[])` — guardar ejercicios en lote

#### 3.2 `src/services/trainer.service.ts` (152 líneas)

| Método | Uso |
|--------|-----|
| `getMembers()` | Miembros + membresía activa + plan asignado |
| `getPlans()` | Wrapper de `trainingService.getAll()` |
| `getTemplates()` | Wrapper de `trainingService.getTemplates()` |
| `createPlan(input)` | Crea plan con sesión actual |

---

### 4. Páginas

| Ruta | Archivo | Líneas | Rol | Features |
|------|---------|--------|-----|----------|
| `/training-plans` | `TrainingPlans.tsx` | 465 | admin | CRUD completo, búsqueda, filtros, detalle con ejercicios por día, métricas |
| `/trainer/plans` | `Plans.tsx` | 215 | trainer | Lista de planes, crear/editar (sin detalle de ejercicios) |
| `/trainer/templates` | `Templates.tsx` | 162 | trainer | Grid de plantillas, crear plantilla (sin detalle de ejercicios) |
| `/my-plan` | `MyPlan.tsx` | 276 | member | Vista con pestañas de día, ejercicios, timer de descanso |

#### 4.1 Admin: `/training-plans` — `TrainingPlans.tsx`

- Layout dos paneles: lista lateral (340px) + detalle
- Búsqueda + filtros: Todos / Asignados / Plantillas / Sin asignar
- 4 MetricCards: Total, Asignados, Plantillas, Sin asignar
- Panel detalle: cabecera con badges, barra de asignación a miembro, pestañas de día (Lun-Dom), lista de ejercicios por día
- Modal crear plan con tipo (asignado/plantilla/borrador) y selector de miembro
- Botones: Duplicar, Editar, Eliminar (delete no implementado en service)

#### 4.2 Trainer: `/trainer/plans` — `Plans.tsx`

- Sticky header breadcrumb
- Gradient card con PageHeader
- Lista simple de planes con nombre, miembro asignado, conteo de ejercicios
- Modal crear plan (nombre, descripción, miembro)
- Modal editar plan (nombre, descripción, miembro)
- **No tiene vista de detalle con ejercicios**
- **No puede crear/editar ejercicios**

#### 4.3 Trainer: `/trainer/templates` — `Templates.tsx`

- Grid responsive de plantillas (1/2/3 columnas)
- Click → navega a `/trainer/plans`
- Modal crear plantilla (nombre, descripción)
- **No se pueden usar plantillas** (no hay flujo "usar plantilla → asignar a miembro")

#### 4.4 Member: `/my-plan` — `MyPlan.tsx`

- Tarjeta de saludo con avatar
- Plan con pestañas de día (con conteo de ejercicios)
- Grid de ejercicios con Series / Reps
- **Timer de descanso** por ejercicio (cuenta regresiva M:SS)
- Sección notas del plan
- Estado vacío "Sin plan de entrenamiento"

---

### 5 Estado Global

No hay store para training plans. Todo el estado es local en cada página.

---

### 6. Lo que funciona ✅

- Admin: CRUD de planes (crear, listar, ver detalle con ejercicios)
- Admin: Búsqueda y filtros de planes
- Admin: Métricas de planes
- Trainer: Crear y editar planes (solo el plan, sin ejercicios)
- Trainer: Crear plantillas
- Member: Ver plan asignado con ejercicios y timer de descanso
- RLS: miembros solo ven su plan, admin/trainer ven todos
- Sticky header breadcrumbs en todas las páginas (agregadas recientemente)
- `Deleted_at` en `plan_exercises` para soft delete

---

### 7. Lo que falta / se puede mejorar ❌

| # | Carencia | Impacto |
|---|----------|---------|
| 1 | Trainer no puede ver detalle de ejercicios | No puede gestionar rutinas |
| 2 | No hay CRUD de ejercicios en el service | No se pueden crear/editar ejercicios desde el frontend |
| 3 | No hay delete de planes | No se pueden eliminar planes obsoletos |
| 4 | Plantillas no son usables | No hay flujo "usar plantilla" |
| 5 | Sin seed data | No hay datos demo para desarrollo |
| 6 | Admin edit modal no implementado | Solo hay botón visual, no modal de edición |
| 7 | Sin validación Zod | Los formularios no tienen validación tipada |

---

### 8. Próximos Pasos (priorizados)

1. **Escribir reporte** ✅ (este archivo)
2. **Agregar CRUD de ejercicios al service** — `createExercise`, `updateExercise`, `deleteExercise`
3. **Llevar detalle de ejercicios al trainer** — replicar panel derecho de admin en trainer `Plans.tsx`
4. **Agregar seed data** de planes y ejercicios
5. **Implementar flujo plantilla → plan**
6. **Agregar delete de planes**
7. **Validaciones Zod** en formularios

---

### 9. Referencias

- Service: `src/services/training.service.ts`
- Service: `src/services/trainer.service.ts`
- Admin page: `src/pages/dashboard/TrainingPlans.tsx`
- Trainer plans: `src/pages/trainer/Plans.tsx`
- Trainer templates: `src/pages/trainer/Templates.tsx`
- Member view: `src/pages/member/MyPlan.tsx`
- Schema: `supabase/migrations/20260514000001_initial.sql` (líneas 61-101)
- Migraciones RLS: `20260525000004_security_definer_rls.sql`, `20260616000001_fix_rls_linked_members.sql`
