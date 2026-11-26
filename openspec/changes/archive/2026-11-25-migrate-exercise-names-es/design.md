# Design

## Context

Ver `proposal.md` para la motivación. El esquema actual define `exercises.external_id TEXT UNIQUE`, `name TEXT NOT NULL`, `category/body_part/equipment/target/muscle_group TEXT NOT NULL` y `name_es TEXT NOT NULL DEFAULT ''` (`supabase/migrations/20260714000001_exercises_catalog.sql:12-27`, `20260714000003_add_name_es.sql:6`). El selector busca por `name` y `name_es` (`src/services/exercises.service.ts:44-47,95-104`) y muestra `name_es || name`, pero rutinas y sesiones guardan copias en `plan_exercises.exercise_name` y `workout_sets.exercise_name`.

El diccionario entregado existe en tres formatos en la raíz. El JSON tiene 1.324 objetos UTF-8 y fue validado 1:1 contra `data/seed/008_exercises_seed.sql` y `009_exercises_full_seed.sql`: mismos IDs, mismos nombres EN y ningún campo vacío. La BD usa 1.324 IDs dispersos en el rango 1..5201; no existen los otros 3.877 IDs del dataset original.

## Goals / Non-Goals

**Goals:**
- Convertir el diccionario en una migration reproducible, revisable e idempotente.
- Hacer que el nombre localizado sea la fuente visible en catálogo, rutinas y sesiones.
- Mantener el nombre EN como identificador legible y las rutas de medios intactas.
- Dejar evidencia verificable en DEV antes de cualquier aplicación en PROD.

**Non-Goals:**
- Insertar ejercicios nuevos ni borrar los inexistentes del diccionario.
- Traducir `equipment`, `target` o `secondary_muscles`.
- Reescribir snapshots sin `exercise_id` ni inferir correspondencias por texto.
- Cambiar componentes React ni políticas RLS.

## Decisions

- **Formato fuente: JSON.** `diccionario_ejercicios.json` evita el parser de comillas de `CSV` (`0272`, `2203`, `2209`, `2297` tienen comas dentro de campos) y la dependencia de `xlsx`. Se conservan los tres archivos en la raíz; la migration se genera desde el JSON. Alternativa descartada: pegar 1.324 `UPDATE` a mano.
- **Clave: `external_id = id`.** Hay 6 nombres EN duplicados en el catálogo (`ez barbell spider curl`, `barbell seated calf raise`, `lever chest press`, `push-up (on stability ball)`, `smith reverse calf raises`, `self assisted inverse leg curl`). Mapear por nombre podría cruzar traducciones. Alternativa descartada: `WHERE name = nombre_original_en`.
- **Columna destino: `name_es`.** La app ya prefiere `name_es || name`; sobrescribir `name` rompería búsquedas históricas y la convivencia con nombres EN. El diccionario es autoritativo, así que sobrescribe también las 50 traducciones de `20260714000003_add_name_es.sql`.
- **Categorías: mapa cerrado de 10 valores.** `category` usa las etiquetas ES ya presentes en el seed (`Pecho`, `Espalda`, `Hombro`, `Cuello`, `Brazo`, `Antebrazo`, `Core`, `Pierna`, `Pantorrilla`, `Cardio`). `body_part` recibe `categoria_en` (coincide con el valor actual en 1.324/1.324 filas) y `muscle_group` recibe `parte_del_cuerpo`.
- **Snapshots por FK.** Se actualizan `plan_exercises` y `workout_sets` mediante join a `exercises.id`; las filas con `exercise_id IS NULL` conservan su texto. Alternativa descartada: matching por `exercise_name = name`, inseguro con duplicados.
- **Generación con script.** `scripts/generate-exercise-name-migration.mjs` valida longitud, IDs únicos, campos obligatorios y nombres EN contra los seeds, escapa comillas y emite un `VALUES` temporal en la migration. Así el SQL es auditable y regenerable sin editar a mano 1.324 filas.
- **Índice de búsqueda.** Se agrega `idx_exercises_name_es_trgm` con `pg_trgm` sobre `name_es`, simétrico al índice existente sobre `name`. No se crea índice sobre `exercise_name`.
- **Aplicación.** La migration se ejecuta como propietario de esquema; RLS no bloquea el `UPDATE`. Se aplica primero en DEV con el script `scripts/apply-migration.mjs` y el token de Management API leído desde `.env` sin imprimirlo. PROD queda explícitamente fuera.

## Risks / Trade-offs

- [Pérdida de detalle en `muscle_group`] → Los valores EN específicos (`hip flexors`, `obliques`) se reemplazan por la parte del cuerpo ES amplia; `target` y `secondary_muscles` conservan el detalle.
- [Corporazón UTF-8] → El script valida los 1.324 registros y la migration se escribe en UTF-8; se verifica un caso con tilde (`0272`, `Muslos y glúteos`).
- [Nombres EN duplicados] → El join es por `external_id`, nunca por texto.
- [Historial sin FK] → Queda intacto por decisión del dueño; se documenta en la spec y en el ticket.
- [RLS de rutinas personales] → No aplica porque la migration corre como owner; no se crean RPCs ni se amplían políticas.
- [PROD sin historial `schema_migrations`] → No se aplica allí en este change; cuando se aplique, se registrará la nota manualmente en `DATABASE_CONFIG.yaml`.
- [Rollback] → Antes de aplicar se guardan conteos y muestra de IDs; la reversión restaura `name_es`, `category`, `body_part`, `muscle_group` y copias desde el estado previo o regenerando la migration inversa desde el JSON original.

## Migration Plan

1. Ejecutar el generador y revisar el SQL resultante (número de filas del `VALUES`, escaping y cabecera).
2. Tomar snapshot de conteos en DEV: ejercicios con `name_es` vacío, copias desalineadas y distribución de `category`.
3. Aplicar `supabase/migrations/20261125000001_exercise_names_es.sql` en DEV con `scripts/apply-migration.mjs`.
4. Recargar caché de PostgREST (`NOTIFY pgrst 'reload schema'`) y verificar: 1.324 `name_es`, `name` intacto, 0 copias desalineadas con FK, categorías válidas y búsqueda ES.
5. Registrar la versión en `DATABASE_CONFIG.yaml`, ejecutar `npm run lint` y `npm run build`, sincronizar spec y archivar el change.
6. PROD: solo después de aprobación separada, con snapshot previo y verificación equivalente.

## Open Questions

- Ninguna. La aplicación en PROD es una decisión de alcance ya definida como fuera de este change.
