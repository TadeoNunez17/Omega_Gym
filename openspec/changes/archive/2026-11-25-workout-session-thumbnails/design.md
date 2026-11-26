# Design

## Context

Ver `proposal.md` para la motivación. `WorkoutSession` ya recibe `PlanExercise[]` con `exercise_id` y `reference_link`, siembra su estado al montarse y abre una ficha de técnica que consulta el catálogo por ejercicio. El catálogo expone `image_url` y `gif_url`, y `exercisesService.getByIds` ya permite traer varios ejercicios en una consulta. Los padres remontan el overlay con `key` en cada apertura, por lo que no se requiere sincronización con cambios posteriores del plan.

## Goals / Non-Goals

**Goals:**

- Mostrar una miniatura estable en lugar del círculo numerado sin cambiar la interacción de marcado de series.
- Resolver las fuentes visuales con una sola consulta por sesión y reutilizar ese resultado en la ficha.
- Caer al GIF, a `reference_link` y al placeholder sin romper la tarjeta ni la ficha.

**Non-Goals:**

- Precargar el catálogo completo ni animar todas las tarjetas.
- Modificar `plan_exercises`, `workout_sets` ni el guardado de sesiones.
- Rediseñar el bottom sheet ni agregar migraciones o despliegues a PROD.

## Decisions

- **Precarga única en la sesión**: al abrir, reunir los `exercise_id` únicos y resolverlos con `getByIds`. Se descartó una consulta por tarjeta porque multiplicaría peticiones y dejaría tarjetas cargando de forma desordenada.
- **Caché compartida con la ficha**: el resultado de la precarga se guarda por `exercise_id` y lo consume también `openDetail`; si el id no estaba en el batch o la consulta falló, `openDetail` mantiene `getById` como respaldo. Se descartó mantener dos cachés independientes porque duplicaría trabajo.
- **JPG estático primero**: la miniatura prefiere `image_url`, luego `gif_url`, luego `reference_link` y finalmente un placeholder. Se descartó usar `reference_link` directo porque animaría simultáneamente todas las tarjetas de la rutina.
- **Miniatura en lugar del número circular**: el botón que abre la ficha sustituye el círculo numerado por la imagen con `alt=""`; el número se elimina y el orden queda implícito en la secuencia de tarjetas. Se descartó añadir una columna o fila nueva para no desplazar las series.
- **Protección contra respuestas tardías**: la precarga usa una bandera de cancelación local, igual que el detalle actual, para no actualizar una sesión ya cerrada o remontada.

## Risks / Trade-offs

- [La consulta inicial añade latencia] → Se limita a los ids del plan, se ejecuta en paralelo al render y falla de forma silenciosa sin bloquear la sesión.
- [Ejercicios personalizados sin catálogo] → Se usa `reference_link` o el placeholder; la ficha conserva las notas locales.
- [GIFs pesados como fallback] → Solo se usan cuando no hay JPG y con carga diferida.
- [Pérdida del número visible] → El orden se conserva por la posición de las tarjetas; una numeración explícita se evaluaría en otro change.
- [Respuestas fuera de orden] → La bandera de cancelación impide actualizar el estado tras cerrar o remontar.

## Migration Plan

Sin migración de base de datos ni aplicación en PROD. La implementación se limita a `WorkoutSession.tsx`; rollback consiste en revertir ese archivo. La verificación es manual en 360 px con ejercicios con JPG, sin JPG pero con GIF y sin recursos, además de `npm run lint`, `npm run build` y validaciones OpenSpec.
