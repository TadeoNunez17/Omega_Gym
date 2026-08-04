# lesson_famous_plans_cross_join.md
## Lección: Planes famosos seed + sintaxis JOIN (VALUES)

**Fecha**: 2026-08-03
**Contexto**: Creación de 5 planes de entrenamiento famosos (Push/Pull/Legs, Upper/Lower, Full Body, Bro Split, StrongLifts 5x5) enlazados al catálogo de 1,324 ejercicios.

### Qué se hizo

1. Se borraron los 4 planes de prueba (`sia`, `Prueba`, `Joto`, `si`) — las FK `ON DELETE CASCADE` limpiaron sus `plan_exercises` y `plan_assignments` automáticamente.
2. Se crearon 5 planes famosos en español, sin asignar, con cada ejercicio enlazado al catálogo vía `exercise_id`.
3. Se generó `data/seed/010_famous_plans_seed.sql` + migración espejo `supabase/migrations/20260803000003_seed_famous_plans.sql`.

### El bug: `JOIN (VALUES ...)` seguido de otro JOIN

Al generar el seed con:

```sql
FROM training_plans tp
JOIN (VALUES ('0025', 'Press de banca', ...), ...) AS v(ext, nm, ...)
JOIN exercises e ON e.external_id = v.ext
WHERE tp.name = '...'
```

Falla con `syntax error at or near "WHERE"`. El problema NO es el `VALUES` en sí ni el alias con lista de columnas; es el **`JOIN (VALUES ...)` sin cláusula `ON` inmediatamente seguido de otro `JOIN`**: el parser de Postgres no lo acepta.

### Solución

Usar `CROSS JOIN` para el `VALUES` (equivalente a `JOIN ... ON true`):

```sql
FROM training_plans tp
CROSS JOIN (VALUES ('0025', 'Press de banca', ...), ...) AS v(ext, nm, ...)
JOIN exercises e ON e.external_id = v.external_id
WHERE tp.name = '...'
```

Casos que SÍ funcionan (verificados en Supabase):
- `JOIN (VALUES (...)) AS v ON true` + siguiente JOIN
- `CROSS JOIN (VALUES (...)) AS v(...)` + siguiente JOIN
- `FROM a, (VALUES (...)) AS v(...) JOIN b ON ...`

### Resultado

- 5 planes, 90 ejercicios totales, todos con `exercise_id` válido.
- 0 asignaciones (planes como borradores listos para asignar).
- Seed idempotente: re-ejecutado sin duplicar (verificación: 5/90/0 se mantiene).

### Aplicación

- Patrón reutilizable para seeds de planes enlazados al catálogo.
- Documentado también en: `data/seed/010_famous_plans_seed.sql`
