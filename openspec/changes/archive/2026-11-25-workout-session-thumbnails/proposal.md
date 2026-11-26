# Proposal

## Why

La sesión de entrenamiento muestra cada ejercicio solo como texto, aunque el catálogo ya tiene una imagen JPG y un GIF por movimiento. Mostrar una miniatura al iniciar la rutina permite reconocer el ejercicio sin abrir la ficha de técnica y no requiere cambios de base de datos.

## What Changes

- Mostrar una miniatura por ejercicio en lugar del círculo numerado de cada tarjeta de la sesión.
- Eliminar el indicador numérico; el orden se conserva por la posición de la tarjeta.
- Priorizar el JPG estático del catálogo para no animar varias tarjetas a la vez.
- Caer al GIF del catálogo, luego a `reference_link` y finalmente a un placeholder.
- Precargar en una sola consulta los ejercicios del catálogo usados por la sesión y reutilizarlos en la ficha de técnica.
- Mantener el GIF completo y las indicaciones en la ficha que se abre al tocar el encabezado.
- Sin cambios de esquema, sin nuevas APIs y sin **BREAKING**.

## Capabilities

### New Capabilities

- `workout-session-media`: presentación de la demostración visual de cada ejercicio durante una sesión de entrenamiento, incluida la prioridad de imagen, los fallbacks y el reuso de la ficha de técnica.

### Modified Capabilities

## Impact

- `src/components/workout/WorkoutSession.tsx`: estado de precarga, miniatura en lugar del número y reuso del detalle.
- `src/services/exercises.service.ts`: se reutiliza `getByIds`; no se requiere un nuevo método.
- `exercises.gif_url`, `exercises.image_url` y `plan_exercises.reference_link` como fuentes existentes.
- `public/exercises/images/` y `public/exercises/gifs/` como recursos ya disponibles.
- Ticket `TKT-OMEGYM-054`; sin migración ni aplicación en PROD.
