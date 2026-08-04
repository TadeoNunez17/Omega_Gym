# Registro: Catalogo de Ejercicios — 50 Ejercicios Iniciales

**Fecha**: 2026-07-15  
**Fuente**: [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)  
**Licencia datos**: MIT  
**Licencia media**: (c) Gym visual — gymvisual.com (redistribuido con permiso a 180x180)  
**Total integrados**: 50 de 1,324 disponibles

---

## Distribucion por Categoria

| Categoria | Cantidad |
|-----------|----------|
| Pierna (upper legs) | 8 |
| Brazo (upper arms) | 8 |
| Pecho (chest) | 7 |
| Espalda (back) | 7 |
| Hombro (shoulders) | 6 |
| Core (waist) | 6 |
| Pantorrilla (lower legs) | 3 |
| Antebrazo (lower arms) | 2 |
| Cardio (cardio) | 2 |
| Cuello (neck) | 1 |
| **Total** | **50** |

---

## Lista Completa de Ejercicios

| # | Nombre | Categoria | Musculo Objetivo | Equipo | ID Externo |
|---|--------|-----------|------------------|--------|------------|
| 1 | barbell bench press | Pecho | pectorals | barbell | 0025 |
| 2 | dumbbell bench press | Pecho | pectorals | dumbbell | 0289 |
| 3 | dumbbell fly | Pecho | pectorals | dumbbell | 0308 |
| 4 | dumbbell fly on exercise ball | Pecho | pectorals | dumbbell | 1277 |
| 5 | dumbbell pullover | Pecho | pectorals | dumbbell | 0375 |
| 6 | dumbbell pullover hip extension on exercise ball | Pecho | pectorals | dumbbell | 1294 |
| 7 | dumbbell pullover on exercise ball | Pecho | pectorals | dumbbell | 1295 |
| 8 | archer pull up | Espalda | lats | body weight | 3293 |
| 9 | barbell bent over row | Espalda | upper back | barbell | 0027 |
| 10 | barbell shrug | Espalda | traps | barbell | 0095 |
| 11 | cable lat pulldown full range of motion | Espalda | lats | cable | 2330 |
| 12 | dumbbell shrug | Espalda | traps | dumbbell | 0406 |
| 13 | dumbbell side plank with rear fly | Espalda | upper back | dumbbell | 3664 |
| 14 | pull up (neutral grip) | Espalda | lats | body weight | 0651 |
| 15 | barbell deadlift | Pierna | glutes | barbell | 0032 |
| 16 | barbell full squat | Pierna | glutes | barbell | 0043 |
| 17 | barbell full squat (back pov) | Pierna | glutes | barbell | 1461 |
| 18 | barbell full squat (side pov) | Pierna | glutes | barbell | 1462 |
| 19 | barbell romanian deadlift | Pierna | glutes | barbell | 0085 |
| 20 | cable assisted inverse leg curl | Pierna | hamstrings | cable | 3235 |
| 21 | dumbbell romanian deadlift | Pierna | glutes | dumbbell | 1459 |
| 22 | inverse leg curl (bench support) | Pierna | hamstrings | body weight | 0496 |
| 23 | dumbbell front raise | Hombro | delts | dumbbell | 0310 |
| 24 | dumbbell front raise v. 2 | Hombro | delts | dumbbell | 0309 |
| 25 | dumbbell lateral raise | Hombro | delts | dumbbell | 0334 |
| 26 | band front lateral raise | Hombro | delts | band | 0977 |
| 27 | band front raise | Hombro | delts | band | 0978 |
| 28 | band reverse fly | Hombro | delts | band | 0993 |
| 29 | barbell curl | Brazo | biceps | barbell | 0031 |
| 30 | barbell incline close grip bench press | Brazo | triceps | barbell | 1719 |
| 31 | barbell lying preacher curl | Brazo | biceps | barbell | 0059 |
| 32 | barbell preacher curl | Brazo | biceps | barbell | 0070 |
| 33 | barbell reverse preacher curl | Brazo | biceps | barbell | 0081 |
| 34 | barbell seated overhead triceps extension | Brazo | triceps | barbell | 0092 |
| 35 | barbell standing overhead triceps extension | Brazo | triceps | barbell | 0109 |
| 36 | cable hammer curl (with rope) | Brazo | biceps | cable | 0165 |
| 37 | assisted motion russian twist | Core | abs | medicine ball | 0014 |
| 38 | bodyweight incline side plank | Core | abs | body weight | 3544 |
| 39 | cable russian twists (on stability ball) | Core | abs | cable | 0211 |
| 40 | dead bug | Core | abs | body weight | 0276 |
| 41 | front plank with twist | Core | abs | body weight | 0464 |
| 42 | hanging leg raise | Core | abs | body weight | 0472 |
| 43 | barbell seated calf raise | Pantorrilla | calves | barbell | 0088 |
| 44 | barbell seated calf raise | Pantorrilla | calves | barbell | 1371 |
| 45 | barbell standing calf raise | Pantorrilla | calves | barbell | 1372 |
| 46 | barbell wrist curl | Antebrazo | forearms | barbell | 0126 |
| 47 | barbell wrist curl v. 2 | Antebrazo | forearms | barbell | 0125 |
| 48 | burpee | Cardio | cardiovascular system | body weight | 1160 |
| 49 | jump rope | Cardio | cardiovascular system | rope | 2612 |
| 50 | neck side stretch | Cuello | levator scapulae | body weight | 1403 |

---

## Archivos Generados

| Archivo | Descripcion |
|---------|-------------|
| `public/exercises/gifs/*.gif` | 50 GIFs animados 180x180 |
| `public/exercises/images/*.jpg` | 50 Thumbnails 180x180 |
| `data/seed/008_exercises_seed.sql` | SQL de insercion (50 registros) |
| `data/supabase/schema/008_exercises_catalog.sql` | Migracion de tabla + RLS |

---

## ACTUALIZACION 2026-08-03: Catalogo Completo (1,324)

Meses despues del seed inicial, se migro el catalogo completo del dataset.

- **Total integrado**: 1,324 de 1,324 (100%)
- **Fuente**: mismo dataset `hasaneyldrm/exercises-dataset`
- **Media**: 1,324 GIFs + 1,324 thumbnails en `public/exercises/` (~131 MB)
- **Seed**: `data/seed/009_exercises_full_seed.sql` (1,274 filas nuevas vía ON CONFLICT)
- **Migracion espejo**: `supabase/migrations/20260803000002_seed_exercises_full.sql`

### Distribucion por Categoria (final)

| Categoria | Cantidad |
|-----------|----------|
| Brazo | 292 |
| Pierna | 227 |
| Espalda | 203 |
| Core | 169 |
| Pecho | 163 |
| Hombro | 143 |
| Pantorrilla | 59 |
| Antebrazo | 37 |
| Cardio | 29 |
| Cuello | 2 |
| **Total** | **1,324** |

### Refinamientos de la transformacion

1. `instructions_es = instructions.es` (espanol)
2. `name_es` = NULL en filas nuevas (UI usa fallback `name_es || name` → muestra ingles)
3. Categorias mapeadas a espanol; `muscle_group`/`secondary_muscles` en ingles
4. `gif_url`/`image_url` como rutas relativas servidas desde `public/` (la media NUNCA va a BD)
5. Inyeccion por API de management en chunks de 40 con pausa de 2s para no exceder el rate-limit

> **Leccion**: al re-empaquetar filas de un seed multi-fila, cada linea del archivo ya trae coma final; al hacer `join(',\n')` se generan comas dobles (`),,`). Quitar la coma final de cada fila antes de re-unirla.

---

## Decisiones

1. **50 ejercicios iniciales**: suficiente para probar, expandible despues
2. **Criterio de seleccion**: popularidad, instrucciones en espanol, cobertura de categorias
3. **Imagenes en frontend** (`public/exercises/`): mas simple que Supabase Storage para assets estaticos
4. **Categorias en espanol**: mapeo category -> espanol (Pecho, Espalda, Pierna, etc.)
5. **Muscle group en espanol**: mapeo muscle_group -> espanol (Biceps, Cuadriceps, etc.)
6. **RLS publico lectura**: cualquier usuario autenticado puede ver el catalogo
7. **External ID**: se preserva el ID original del dataset para trazabilidad
8. **ON CONFLICT DO NOTHING**: permite re-ejecutar el seed sin duplicar
