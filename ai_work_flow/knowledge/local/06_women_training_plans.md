# 06_women_training_plans.md

## Rutinas de Entrenamiento para Mujeres

**Fecha**: 2026-08-03
**Estado**: Completado
**Build**: 0 errores TypeScript

---

## Resumen

Se crearon 3 rutinas de entrenamiento famosas/populares para mujeres, en español, sin asignar (como borradores), con **todos los ejercicios enlazados al catálogo** (`exercise_id` → GIF + instrucciones). Se reutilizó el patrón `CROSS JOIN (VALUES ...)` de la migración 010.

## Planes creados

| Plan | Referencia | Días | Ejercicios | Enfoque |
|------|-----------|------|-----------|---------|
| Strong Curves | Bret Contreras | 3 (0,2,4) | 18 | Glúteo + tren superior (A, B, C) |
| Glute Focus | Estilo Glute Lab | 3 (0,2,4) | 16 | Énfasis intenso en glúteo + core |
| Thinner Leaner Stronger | Mike Matthews | 4 (0,1,3,4) | 24 | Upper/Lower para mujeres |

**Total**: 58 ejercicios, todos enlazados al catálogo.

## Ejercicios clave de glúteo usados (catálogo)

- `1409` barbell glute bridge
- `0196` cable pull through
- `0130` bench hip extension
- `3236` resistance band hip thrusts
- `0597` lever seated hip abduction
- `0710` side hip abduction
- `0228` cable standing hip extension
- `3561` glute bridge march / `3562` barbell glute bridge on bench
- `3645` single leg bridge

## Base de datos

- Total planes en `training_plans`: **8** (5 famosos + 3 mujer)
- Total ejercicios en `plan_exercises`: **148**
- Asignaciones: **0** (los 8 planes quedan como borradores)
- Seed idempotente: re-ejecutado sin duplicar (verificado: 8/148/0 se mantiene)

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `data/seed/011_women_plans_seed.sql` | Seed DNS (idempotente) |
| `supabase/migrations/20260803000004_seed_women_plans.sql` | Migración espejo |
| `src/pages/dashboard/TrainingPlans.tsx` | UI (sin cambios; consume los planes) |

## Nota

La rutina **BBG (Kayla Itsines)** no se incluyó porque es principalmente HIIT en casa y encaja mal con el catálogo de gimnasio. Si se desea como plan de peso corporal, habría que adaptarla.

## Próximo paso sugerido

- Asignar los planes (famosos o de mujer) a los miembros desde `/training-plans`.