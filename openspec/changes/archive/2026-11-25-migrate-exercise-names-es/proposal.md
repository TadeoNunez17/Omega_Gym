# Proposal

## Why

El catálogo tiene 1.324 ejercicios con `name` en inglés y `name_es` vacío salvo 50 filas, mientras el selector ya busca y muestra el nombre en español. Sin una migración gobernada por `external_id`, los nombres del documento del dueño no llegan al catálogo ni a las copias desnormalizadas de rutinas y sesiones.

## What Changes

- Poblar `exercises.name_es` para los 1.324 `external_id` del diccionario, con precedencia sobre las 50 traducciones anteriores.
- Conservar `exercises.name` en inglés y las rutas de imagen/GIF, que están keyed por `external_id`.
- Normalizar `category` a las 10 etiquetas ES amplias existentes, `body_part` desde `categoria_en` y `muscle_group` desde `parte_del_cuerpo`.
- Actualizar las copias `exercise_name` de `plan_exercises` y `workout_sets` solo donde `exercise_id IS NOT NULL`.
- Crear un índice GIN trigram sobre `name_es` para sostener la búsqueda por español.
- Aplicar la migración en DEV; PROD queda fuera de este change.
- No hay cambios de UI ni breaking changes.

## Capabilities

### New Capabilities

- `exercise-catalog`: define la gobernanza de nombres canónicos, nombres localizados, categorías y etiquetas de parte del cuerpo del catálogo de ejercicios, incluida la consistencia de las copias desnormalizadas.

### Modified Capabilities

- Ninguna.

## Impact

- Fuente: `diccionario_ejercicios.json` (1.324 registros UTF-8, validado 1:1 contra los seeds).
- SQL: nueva migration en `supabase/migrations/` y script generador en `scripts/`.
- Datos: `exercises`, `plan_exercises`, `workout_sets`.
- Búsqueda: `src/services/exercises.service.ts` ya consulta `name` y `name_es`; solo se agrega el índice.
- Documentación: ticket `TKT-OMEGYM-053`, `DATABASE_CONFIG.yaml`, knowledge local y espejo Obsidian al archivar.
- Entornos: solo DEV en este change; PROD requiere aprobación posterior.
