# TKT-OMEGYM-019: Migración BD — rutinas personales compartibles por código

## Metadata
- **Tipo**: Feature
- **Prioridad**: Alta
- **Estado**: In Progress
- **Módulo**: training-plans / database
- **Relacionado con**: SPEC_001
- **Dependencias**: Ninguna · Bloquea a TKT-OMEGYM-020
- **Fecha apertura**: 2026-08-21
- **Fecha cierre**: —

## Descripción
Migración aditiva: columnas `kind` y `share_code` en `training_plans`, índice único parcial, políticas RLS para CRUD personal de miembros (traducción auth_user_id → profiles.id), RPCs SECURITY DEFINER `generate_share_code` / `revoke_share_code` / `import_routine_by_code`.

## Archivos Afectados
- supabase/migrations/20260821000001_member_shared_routines.sql (nuevo)
- data/supabase/DATABASE_CONFIG.yaml (nota)

## Implementación
- [x] Diseño/knowledge (08_shared_routines_decisions.md)
- [x] SQL escrito
- [x] Aplicada en Supabase DEV (db push 2026-08-21)
- [x] Verificación post-migración (columnas kind/share_code, 6 políticas nuevas, 3 RPCs SECURITY DEFINER; smoke test import_routine_by_code)

## Criterios de Aceptación
- [x] Planes existentes quedan kind='trainer' sin cambios de comportamiento (DEFAULT aditivo)
- [ ] Miembro NO puede escribir planes ajenos ni leer personales ajenas vía API directa (pendiente prueba funcional con JWT real — cubrir en TKT-OMEGYM-020/022)
- [x] RPCs ejecutables solo por authenticated (REVOKE PUBLIC + GRANT authenticated)

## Evidencia de Cierre
**Fecha**: 2026-08-21 **Probado por**: Dev asistido por IA **Resultado**: Push OK en DEV (jaltwjcipyrnmvjkdqdp). Verificación vía Management API: columnas presentes, 20 políticas totales en training_plans+plan_exercises (6 nuevas members_personal_*), funciones con security_definer=true, smoke test devuelve error esperado sin JWT. Estado Review — cierre formal tras pruebas funcionales E2E (TKT-OMEGYM-022). **Commit**: pendiente
---
**Evidencia aplicación a PRODUCCIÓN (ref xlawavqceyprraeyrmtm)**: 2026-08-21 — migraciones de esta sesión aplicadas vía SQL directo (Management API), PostgREST recargado; verificación OK (columnas kind/share_code/show_in_plan/visible, RPCs generate_share_code/revoke_share_code/import_routine_by_code/set_assignment_visibility + grants, 6 políticas RLS personales). Ver data/supabase/DATABASE_CONFIG.yaml.
