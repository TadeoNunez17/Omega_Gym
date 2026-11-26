# Proposal

## Why

La programación semanal ya existe a nivel de plan (`training_plans.scheduled_days`), pero solo se configura desde el menú «Programar días» de una rutina o plan ya guardado. Quien crea una rutina desde el builder no puede elegir sus días ni recibe una invitación para hacerlo, así que termina el flujo con una rutina que no aparece en «Inicio».

## What Changes

- Añadir una sección compacta `DÍAS PROGRAMADOS (OPCIONAL)` en el builder compartido, justo debajo de la tarjeta de Título/Objetivo, con pastillas `Lun` a `Dom` y el mismo acento visual del `ScheduleSheet`.
- Guardar la selección en `training_plans.scheduled_days` al crear o actualizar rutinas personales (`kind='personal'`) y planes del staff (`kind='trainer'`). Los ejercicios siguen guardándose con `day = null`.
- Al guardar una entidad **nueva** sin días seleccionados, abrir automáticamente el `ScheduleSheet` existente para programarla antes de cerrar el flujo. Aplicar también a planes nuevos del staff.
- En ese prompt, el botón `Sin días` pasa a confirmar y cerrar (persiste `null`); en el menú «Programar días» existente conserva su comportamiento actual de solo limpiar la selección.
- Cerrar/descartar el prompt no deshace el guardado: la rutina o plan queda creado sin días y se puede programar después.
- **BREAKING**: ninguna. No hay cambios de esquema; `scheduled_days` ya está migrado en DEV y PROD.

## Capabilities

### New Capabilities

- `routine-builder-scheduling`: programación semanal a nivel de plan desde el builder y confirmación guiada de días al crear una rutina o plan.

### Modified Capabilities

<!-- No hay capabilities en `openspec/specs/` que cambien. El delta activo `single-page-routine-builder` se ajusta por separado para aclarar que prohibía el reparto por ejercicio, no la programación del plan. -->

## Impact

- **Código**: `src/components/routine-builder/RoutineBuilder.tsx`, `src/components/routine-builder/types.ts`, `src/components/schedule/ScheduleSheet.tsx`, nuevo `src/components/schedule/DayPills.tsx`, `src/lib/dates.ts`, `src/services/training.service.ts`, `src/pages/member/MyRoutines.tsx`, `src/pages/dashboard/TrainingPlans.tsx`.
- **Datos**: solo `training_plans.scheduled_days` (ya existente); `plan_exercises.day` permanece legacy y sin escrituras.
- **Documentación**: ajuste del delta `single-page-routine-builder` y addendum en `ai_work_flow/knowledge/local/11_plan_schedule_and_sessions_decisions.md`.
- **Riesgo**: bajo. El builder es compartido; se preservan las dos firmas de `onSave` mediante un objeto de resultado y se mantienen las claves de remontaje de los sheets.
- **Verificación**: `npm run build`, `npm run lint` y comprobación manual de los cuatro flujos (crear/editar rutina y crear/editar plan). No hay suite E2E instalada.
