# Tasks

## 1. Fuente y generador

- [x] 1.1 Crear `scripts/generate-exercise-name-migration.mjs` que lea `diccionario_ejercicios.json`, valide 1.324 IDs únicos, campos obligatorios y nombres EN contra los seeds; verificar que el modo `--check` imprime 1324 registros, 0 faltantes y 0 diferencias.
- [x] 1.2 Generar `supabase/migrations/20261125000001_exercise_names_es.sql` desde el JSON; verificar que el `VALUES` temporal tiene 1.324 filas y que los casos con coma y tilde (`0272`, `2203`, `2209`, `2297`) están escapados correctamente.

## 2. Migration

- [x] 2.1 Actualizar `exercises.name_es`, `category`, `body_part` y `muscle_group` por `external_id` con el mapa cerrado de categorías; verificar que `name`, `gif_url`, `image_url` e `instructions_es` no aparecen en ningún `SET`.
- [x] 2.2 Sincronizar `plan_exercises.exercise_name` y `workout_sets.exercise_name` solo con `exercise_id IS NOT NULL`; verificar que la migration no contiene joins por texto ni actualizaciones para filas sin FK.
- [x] 2.3 Crear `idx_exercises_name_es_trgm` con `IF NOT EXISTS`; verificar que la migration es reejecutable y termina con `NOTIFY pgrst 'reload schema'`.

## 3. Aplicación y verificación en DEV

- [x] 3.1 Tomar snapshot previo de DEV y aplicar la migration con `scripts/apply-migration.mjs` al project ref DEV; verificar que el script reporta éxito sin imprimir `SUPABASE_ACCESS_TOKEN`.
- [x] 3.2 Verificar en DEV que 1.324 ejercicios tienen `name_es`, que `name` sigue idéntico al diccionario, que 0 filas con FK tienen `exercise_name` desalineado y que las categorías son solo las 10 permitidas.
- [x] 3.3 Verificar búsqueda por `Press de banca con barra` y por `barbell bench press` devuelve `external_id = '0025'`, y que un ejercicio personalizado sin `name_es` sigue encontrable por su nombre original.

## 4. Documentación y calidad

- [x] 4.1 Actualizar `data/supabase/DATABASE_CONFIG.yaml` y `ai_work_flow/knowledge/local/06_exercises_catalog_implementation.md` con la versión aplicada en DEV, el alcance y PROD pendiente; verificar que no aparecen credenciales.
- [x] 4.2 Ejecutar `npm run lint` y `npm run build`; verificar que ambos terminan sin errores, y ejecutar `openspec validate --change "migrate-exercise-names-es"` sin errores.

## Workflow follow-up

- Sincronizar la spec viviente y archivar el change después de la revisión.
- Escribir el espejo en Obsidian bajo `Omega_Gym/historial/`.
- Aplicar en PROD solo con aprobación explícita posterior.
