# TKT-OMEGYM-054: Mostrar miniatura del ejercicio en la sesión de entrenamiento

## Metadata
- **Tipo**: Mejora (UI)
- **Prioridad**: Media
- **Estado**: Review
- **Módulo**: training-plans / member-workout
- **Relacionado con**: `SPECIFICATION.md` (§11.4 Planes de Entrenamiento), `openspec/changes/workout-session-thumbnails/`
- **Ticket Externo**: — (solicitud directa del dueño del proyecto)
- **Fecha apertura**: 2026-11-25
- **Fecha cierre**: —

## Descripción

Al iniciar una rutina, la pantalla de entrenamiento muestra cada ejercicio solo
como texto y con un círculo numerado. El dueño solicitó que la imagen del
ejercicio aparezca en ese mismo lugar, en lugar del número. La sesión ya permite
ajustar peso y reps, marcar cada serie y guardar al tocar `Finalizar`; esas
interacciones no cambian.

## Alcance

**Dentro**
- Sustituir el círculo numerado por una miniatura de tamaño fijo en cada tarjeta de la sesión.
- Usar `image_url` del catálogo como primera fuente, luego `gif_url`, `reference_link` y placeholder.
- Precargar los ejercicios del catálogo de la sesión en una sola consulta y reutilizarlos en la ficha de técnica.
- Conservar el orden de los ejercicios por la posición de las tarjetas.
- Verificar en 360 px y con temas claro/oscuro.

**Fuera**
- Modificar la tabla `SERIE/KGS/REPS`, el marcado de series ni el guardado al tocar `Finalizar`.
- Agregar columnas, migraciones o cambios en RLS.
- Aplicar cambios en PROD.
- Rediseñar el bottom sheet de técnica.

## Decisiones

- La miniatura ocupa el lugar del número circular; el número se elimina.
- El JPG estático es la fuente preferida para evitar animar varias tarjetas a la vez.
- `exercisesService.getByIds` resuelve el catálogo en una sola llamada; `getById` queda como respaldo en la ficha.
- Las respuestas tardías se descartan con una bandera de cancelación local.

## Dependencias

- **Bloqueado por**: —
- **Bloquea a**: —

## Archivos Afectados

- `src/components/workout/WorkoutSession.tsx`
- `openspec/changes/workout-session-thumbnails/` (change)
- `openspec/specs/workout-session-media/spec.md` (spec viviente)
- `ai_work_flow/tickets/TKT-OMEGYM-054.md`

## Estimación

1–2 h

## Implementación

- [x] Precarga de catálogo por `exercise_id` en una sola consulta
- [x] Reuso del catálogo en la ficha de técnica con respaldo `getById`
- [x] Miniatura en lugar del círculo numerado con cadena de fallback
- [ ] Verificación visual en 360 px con JPG, GIF y sin recursos
- [x] `npm run lint` y `npm run build`
- [x] Validación OpenSpec y sincronización de spec

## Criterios de Aceptación

- [x] Cada tarjeta de la sesión muestra una miniatura en el lugar del número.
- [x] No se muestra el indicador numérico circular y el orden se conserva por posición.
- [ ] La miniatura usa JPG cuando existe y cae a GIF, `reference_link` o placeholder sin imagen rota.
- [ ] La ficha de técnica muestra la demostración completa sin esqueleto de carga cuando el catálogo ya se resolvió.
- [ ] Peso/reps, marcado de series y guardado al `Finalizar` siguen funcionando.
- [x] `npm run lint`, `npm run build` y validaciones OpenSpec pasan sin errores.
- [x] PROD no se modifica en este ticket.

## Evidencia de Cierre

**Fecha**: 2026-11-25  
**Probado por**: Tadeo Nuñez (asistido por opencode)  
**Resultado**: `npm run lint` terminó sin errores. `npm run build` terminó correctamente (`✓ built in 6.11s`) con solo warnings no bloqueantes de tamaño de chunk, tiempos de plugins y Browserslist desactualizado. `openspec validate workout-session-thumbnails --strict` devolvió válido; `openspec validate --specs` devolvió `4 passed, 0 failed` tras sincronizar `workout-session-media`. Revisión del diff: la tabla `SERIE/KGS/REPS`, el marcado de series y el guardado al `Finalizar` permanecen intactos. Queda pendiente la QA visual del dueño en 360 px con JPG, GIF y sin recursos, además de temas claro/oscuro. PROD no fue modificado.  
**Commit**: — (sin commit solicitado)
