# Implementacion: Catalogo de Ejercicios — Resumen Completo

**Fecha**: 2026-07-15  
**Estado**: Completado  
**Compilacion**: 0 errores TypeScript

---

## 1. Que se hizo

Se integro un catalogo de 50 ejercicios con GIFs animados, instrucciones en espanol y datos de equipo/musculo al sistema de planes de entrenamiento. Los entrenadores ahora buscan ejercicios en el catalogo en vez de escribirlos a mano, y los miembros ven animaciones + instrucciones paso a paso en su plan.

---

## 2. Base de Datos

### Migracion: `supabase/migrations/20260714000001_exercises_catalog.sql`
- Tabla `exercises` con 17 columnas (id, external_id, name, category, body_part, equipment, target, muscle_group, secondary_muscles, instructions_es, gif_url, image_url, is_active, created_at)
- Columna `exercise_id` agregada a `plan_exercises` (UUID FK nullable)
- RLS habilitado: lectura publica autenticada, escritura solo admin
- 4 indices para busquedas frecuentes

### Seed: `supabase/migrations/20260714000002_seed_exercises.sql`
- 50 registros INSERT con `ON CONFLICT DO NOTHING`

### Schema referencial: `data/supabase/schema/008_exercises_catalog.sql`
### Datos semilla: `data/seed/008_exercises_seed.sql`

---

## 3. Archivos Creados

| Archivo | Tipo | Descripcion |
|---------|------|-------------|
| `src/services/exercises.service.ts` | Servicio | CRUD completo: getAll, getById, getByIds, search, getCategories, getEquipment, getMuscleGroups |
| `src/components/routine-builder/ExercisePicker.tsx` | Componente | Buscador de catalogo con filtros por categoria, GIF thumbnails, toggle catalogo/personalizado |
| `public/exercises/gifs/*.gif` | Assets | 50 GIFs animados 180x180 del dataset |
| `public/exercises/images/*.jpg` | Assets | 50 thumbnails 180x180 |
| `ai_work_flow/knowledge/local/05_exercises_catalog_decisions.md` | Documentacion | Registro de datos y decisiones de seleccion |
| `ai_work_flow/knowledge/local/06_exercises_catalog_implementation.md` | Documentacion | Este archivo |

---

## 4. Archivos Modificados

### `src/services/training.service.ts`
- Tipo `PlanExercise`: agregado `exercise_id: string | null`
- Tipo `ExerciseInput`: agregado `exercise_id?: string | null`
- Funcion `upsertExercises`: incluye `exercise_id` en upsert
- Funcion `duplicate`: duplica `exercise_id` al copiar planes

### `src/components/routine-builder/RoutineBuilder.tsx`
- Import de `ExercisePicker`
- Nuevo estado `exExerciseId` para rastrear ejercicio seleccionado del catalogo
- Tipo `EditPlanData.exercises[]`: agregado `exercise_id`
- `openEditForm`: setea `exercise_id` al editar ejercicio existente
- `saveExercise`: incluye `exercise_id` en el ejercicio guardado
- Formulario: `Input` de nombre reemplazado por `ExercisePicker` (busqueda con GIFs, filtros de categoria, toggle catalogo/personalizado)
- Lista de ejercicios: muestra thumbnail GIF cuando `reference_link` termina en `.gif`

### `src/pages/member/MyPlan.tsx`
- Import de `exercisesService`
- Nuevo estado `catalogMap` (Map<string, Exercise>) y `expandedInstructions` (Set<string>)
- Carga catalogo despues de cargar ejercicios: `exercisesService.getByIds(catalogIds)`
- Cada ejercicio muestra:
  - GIF animacion completa (max-h 220px)
  - Badge de equipo (no bodyweight)
  - Seccion expandible "Como hacer este ejercicio" con instrucciones en espanol

### `src/pages/dashboard/TrainingPlans.tsx`
- Import de `exercisesService`
- Nuevo estado `catalogMap` y `expandedInstructions`
- `loadDetail`: despues de cargar ejercicios, busca datos del catalogo para exercises con `exercise_id`
- Panel de detalle muestra:
  - Thumbnail GIF (max-w 240px)
  - Badge de equipo
  - Seccion expandible "Como hacer este ejercicio"

---

## 5. Flujo de Datos

```
Entrenador crea/edita plan
  → RoutineBuilder abre
  → ExercisePicker muestra busqueda con GIFs + filtros de categoria
  → Entrenador selecciona ejercicio del catalogo (o escribe manual)
  → exercise_id + reference_link (gif_url) se guardan en plan_exercises

Miembro ve su plan (MyPlan.tsx)
  → Carga exercises de plan_assignments
  → Identifica exercise_ids unicos
  → Fetch batch: exercisesService.getByIds(catalogIds)
  → Renderiza GIF + instrucciones por cada ejercicio con exercise_id

Admin ve detalle del plan (TrainingPlans.tsx)
  → Mismo flujo: fetch catalogo por exercise_ids del plan
  → Renderiza thumbnails + instrucciones expandibles
```

---

## 6. UI del ExercisePicker

- Barra de busqueda con debounce 300ms
- Filtros de categoria: Pecho, Espalda, Pierna, Hombro, Brazo, Core, Cardio, Todos
- Cada resultado muestra: thumbnail GIF, nombre, badge musculo, badge equipo
- Toggle "Catalogo" / "Manual" para escribir nombre libremente
- Al seleccionar: auto-rellena nombre, musculo, referencia (gif_url)

---

## 7. UI en MyPlan (Miembro)

- GIF animacion completa arriba de cada tarjeta de ejercicio
- Badge musculo (accent) + badge equipo (surface3)
- Seccion expandible con instrucciones paso a paso en espanol
- Timer de descanso + grid de series existente sin cambios

---

## 8. UI en TrainingPlans (Admin)

- Panel derecho muestra thumbnail GIF (240px max) debajo de cada ejercicio
- Badge de equipo junto al badge de musculo
- Seccion expandible "Como hacer este ejercicio" con instrucciones
- Se mantiene el diseno existente: Muscle badge, Video link, Chips de series/reps/descanso

---

## 9. Dependencias

No se agregaron dependencias nuevas. Todo usa:
- Supabase JS Client (ya existente)
- React state (ya existente)
- Tailwind CSS (ya existente)

---

## 10. Proximo paso sugerido

- Agregar mas ejercicios al catalogo (actualmente 50 de 1,324 disponibles)
- Filtro por nivel de dificultad
- Busqueda por musculo secundario
