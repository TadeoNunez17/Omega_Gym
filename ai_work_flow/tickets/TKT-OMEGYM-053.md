# TKT-OMEGYM-053: Migrar nombres de ejercicios del catálogo a español

## Metadata
- **Tipo**: Mejora (datos / migración)
- **Prioridad**: Media
- **Estado**: Closed
- **Módulo**: training-plans / exercises
- **Relacionado con**: `SPECIFICATION.md` (§11.4 Planes de Entrenamiento), `ai_work_flow/knowledge/local/05_exercises_catalog_decisions.md`, `ai_work_flow/knowledge/local/06_exercises_catalog_implementation.md`
- **Ticket Externo**: — (solicitud directa del dueño del proyecto)
- **Fecha apertura**: 2026-11-25
- **Fecha cierre**: 2026-11-25

## Descripción

El catálogo de ejercicios tiene 1.324 filas con `name` en inglés (dataset
`hasaneyldrm/exercises-dataset`) y `name_es` vacío salvo en las 50 filas
iniciales. El dueño entregó un diccionario de 1.324 entradas con el nombre
original en inglés, el nombre en español, la categoría original y la parte del
cuerpo en español. La migración debe poblar el catálogo y las copias
desnormalizadas de planes y sesiones manteniendo el nombre original en `name`.

## Alcance

**Dentro**
- Usar `diccionario_ejercicios.json` como fuente autoritativa (UTF-8, 1.324 registros).
- Rellenar `exercises.name_es` para los 1.324 `external_id`, sobrescribiendo las 50 traducciones previas.
- Mantener `exercises.name` en inglés y conservar `gif_url`, `image_url` e `instructions_es`.
- Normalizar `category` a etiqueta ES amplia, `body_part` desde `categoria_en` y `muscle_group` desde `parte_del_cuerpo`.
- Actualizar `plan_exercises.exercise_name` y `workout_sets.exercise_name` solo cuando `exercise_id IS NOT NULL`.
- Crear índice GIN trigram sobre `name_es` para la búsqueda existente.
- Aplicar primero en DEV; PROD queda pendiente de aprobación explícita.

**Fuera**
- Insertar los 3.877 IDs del dataset que no existen en el catálogo.
- Traducir `equipment`, `target` o `secondary_muscles`.
- Modificar `instructions_es`, rutas de imagen/GIF ni el campo `documento`.
- Actualizar filas históricas sin `exercise_id` mediante matching por texto.
- Cambios en la UI: la app ya prefiere `name_es || name`.

## Decisiones

- **Clave de join**: `exercises.external_id = diccionario.id`; hay 6 nombres EN duplicados en el dataset, así que mapping por nombre es inseguro.
- **Precedencia**: el diccionario manda sobre las 50 traducciones ya cargadas por `20260714000003_add_name_es.sql`.
- **Pérdida aceptada**: `muscle_group` pasa de valores EN específicos a la parte del cuerpo ES amplia del diccionario; el detalle se conserva en `target` y `secondary_muscles`.
- **Snapshots**: se actualizan solo las filas con FK válida; las filas legacy sin `exercise_id` conservan su texto histórico.
- **RLS**: la migration se ejecuta como propietario de esquema; no se cambian políticas.

## Dependencias

- **Bloqueado por**: —
- **Bloquea a**: — (TKT-OMEGYM-022 sigue pendiente de validación E2E de rutinas compartidas)

## Archivos Afectados

- `diccionario_ejercicios.json` (fuente, raíz del repo)
- `scripts/generate-exercise-name-migration.mjs` (nuevo)
- `supabase/migrations/20261125000001_exercise_names_es.sql` (nuevo)
- `data/supabase/DATABASE_CONFIG.yaml` (nota de aplicación en DEV)
- `ai_work_flow/knowledge/local/06_exercises_catalog_implementation.md` (addendum)
- `openspec/changes/migrate-exercise-names-es/` (change)
- `openspec/specs/exercise-catalog/spec.md` (spec viviente)

## Estimación

2–3 h

## Implementación

- [x] Validar 1.324 IDs y nombres EN contra los seeds
- [x] Generar SQL desde JSON con escape UTF-8 y comillas
- [x] Aplicar migration en DEV y recargar PostgREST
- [x] Verificar conteos, categorías, snapshots y búsqueda ES
- [x] `npm run lint` y `npm run build`
- [x] Sincronizar spec y archivar change
- [x] Espejo en Obsidian

## Criterios de Aceptación

- [x] 1.324 filas con `external_id` tienen `name_es` no vacío y distinto del original.
- [x] `exercises.name` sigue siendo exactamente el nombre EN del diccionario.
- [x] 0 diferencias entre `plan_exercises.exercise_name` / `workout_sets.exercise_name` y `exercises.name_es` cuando `exercise_id IS NOT NULL`.
- [x] `category` usa solo las 10 etiquetas ES amplias existentes; `body_part` y `muscle_group` coinciden con el diccionario.
- [x] Búsqueda por nombre en español devuelve resultados.
- [x] Sin regresión en `npm run lint` / `npm run build`.
- [x] PROD no se modifica en este ticket.

## Evidencia de Cierre

**Fecha**: 2026-11-25  
**Probado por**: Tadeo Nuñez (asistido por opencode)  
**Resultado**: `node scripts/generate-exercise-name-migration.mjs --check` → 1324 registros, 0 duplicados, 0 vacíos, 0 faltantes, 0 diferencias de nombre, 0 categorías desconocidas. Migration `20261125000001_exercise_names_es.sql` aplicada en DEV (`jaltwjcipyrnmvjkdqdp`) vía Management API con PostgREST recargado. Verificación SQL: 1324/1324 `name_es` poblados y exactos contra el JSON; `name`, `category`, `body_part` y `muscle_group` sin desalineamientos; 89 copias de `plan_exercises` y 6 de `workout_sets` con FK, 0 desalineadas; índice `idx_exercises_name_es_trgm` presente. Búsquedas ES (`Press de banca con barra`) y EN (`barbell bench press`) devuelven `0025`. Ejercicio custom temporal sin `name_es` localizable por nombre original y eliminado. `npm run lint`, `npm run build` y `openspec validate "migrate-exercise-names-es"` sin errores. PROD no modificado.  
**Commit**: — (sin commit en esta sesión; cambios en working tree)
