# Design

## Context

`RoutineBuilder` es una pantalla compartida por rutinas personales y planes del staff; hoy persiste título, descripción y ejercicios, pero no transporta `scheduled_days`. La programación semanal ya vive en `training_plans.scheduled_days` y se edita con `ScheduleSheet` desde `MyRoutines` y `TrainingPlans`. El delta activo `single-page-routine-builder` prohíbe «días en el builder»; esa redacción debe acotarse al reparto por ejercicio, porque `plan_exercises.day` sigue siendo legacy.

## Goals / Non-Goals

**Goals:**

- Reutilizar el mismo builder y el mismo `ScheduleSheet` para ambos roles.
- Mantener una sola representación de días (`0 = lunes … 6 = domingo`) y un solo normalizador.
- Conservar el guardado ya realizado si el prompt se descarta.

**Non-Goals:**

- Migraciones de base de datos ni escritura de `plan_exercises.day`.
- Cambiar el menú `Programar días` existente salvo el comportamiento de `Sin días` dentro del prompt.
- Cambiar la vista «Inicio», las sesiones ni la asignación de planes.

## Decisions

1. **Extraer `DayPills` desde `ScheduleSheet`.** El builder y el sheet comparten las mismas clases visuales y `aria-pressed`. Alternativa: duplicar el markup en el builder; se descarta por riesgo de divergencia de estilos.
2. **Un resultado estructurado de `onSave`.** `RoutineBuilder` entrega `{ planId?, created, name, scheduledDays }` en lugar de solo el id. Así cada padre decide si abre el prompt sin consultar de nuevo la base de datos. Alternativa: que el builder abra el sheet directamente; se descarta porque acoplaría el builder a dos páginas con estados distintos.
3. **Prompt con bandera en el padre.** `MyRoutines` guarda `scheduleFromSave`; `TrainingPlans` reutiliza `scheduleOpen` y añade la misma bandera. El menú existente sigue funcionando con la bandera en `false`.
4. **Normalización centralizada.** `normalizeDays()` elimina duplicados, filtra fuera de `0..6`, ordena y devuelve `null` cuando no queda ningún día. `trainingService.setSchedule` y el builder la comparten.
5. **«Sin días» dependiente del contexto.** `ScheduleSheet` recibe `promptMode`; en modo prompt el botón llama al guardado con `[]` y cierra, mientras que en el menú conserva el borrado local. Alternativa: cambiar el botón en todos los contextos; se descarta para no alterar flujos ya validados.

## Risks / Trade-offs

- [El builder se remonta con `key` en cada apertura] → la semilla de días se lee una sola vez; el `snapshot` incluye días para que `Cancelar` detecte cambios solo en esa sección.
- [Doble escritura al crear sin días y luego elegir días en el prompt] → es aceptable: la creación ya ocurrió y `setSchedule` solo actualiza `scheduled_days`.
- [El token de PROD suele ir por detrás de DEV] → no hay migración nueva; `scheduled_days` ya está aplicado en PROD según `DATABASE_CONFIG.yaml`.
- [Contradicción documental con `single-page-routine-builder`] → se ajusta su proposal y su spec delta antes de archivar este cambio.

## Migration Plan

Sin migración de esquema. Despliegue de código; rollback consiste en revertir los archivos de UI/servicios. Los datos de `scheduled_days` creados con este flujo son compatibles con el menú anterior.
