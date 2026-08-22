# TKT-OMEGYM-024: Toggle de visibilidad de rutinas personales en Mi plan

## Metadata
- **Tipo**: Feature
- **Prioridad**: Media
- **Estado**: Review
- **Módulo**: training-plans
- **Relacionado con**: SPEC_001, TKT-OMEGYM-023
- **Dependencias**: TKT-OMEGYM-021 (completado)
- **Fecha apertura**: 2026-08-21
- **Fecha cierre**: —

## Descripción
El miembro decide qué rutinas propias aparecen como pestaña en "Mi plan" mediante un switch por tarjeta en Mis rutinas ("En Mi plan"). Las asignadas por el entrenador no son ocultables.

## Archivos Afectados
- supabase/migrations/20260821120000_add_show_in_plan.sql (nueva)
- src/services/routines.service.ts (show_in_plan + setPlanVisibility)
- src/pages/member/MyRoutines.tsx (switch con actualización optimista)
- src/pages/member/MyPlan.tsx (filtro show_in_plan)

## Implementación
- [x] Migración `show_in_plan BOOLEAN NOT NULL DEFAULT true` aplicada a DEV (jaltwjci...)
- [x] Servicio: getMine retorna flag; setPlanVisibility(id, visible)
- [x] Switch optimista con rollback + toast
- [x] Mi plan filtra personales por show_in_plan !== false

## Criterios de Aceptación
- [ ] Switch alterna y persiste tras recargar
- [ ] Rutina oculta desaparece de Mi plan al recargar; sigue editable/compartible en Mis rutinas
- [ ] Asignadas siempre visibles en Mi plan

## Evidencia de Cierre
**Fecha**: 2026-08-21 **Probado por**: Dev asistido por IA **Resultado**: Build OK; migración aplicada en DEV. Validación funcional manual pendiente (junto a E2E de TKT-022). **Commit**: pendiente
---
**Evidencia aplicación a PRODUCCIÓN (ref xlawavqceyprraeyrmtm)**: 2026-08-21 — migraciones de esta sesión aplicadas vía SQL directo (Management API), PostgREST recargado; verificación OK (columnas kind/share_code/show_in_plan/visible, RPCs generate_share_code/revoke_share_code/import_routine_by_code/set_assignment_visibility + grants, 6 políticas RLS personales). Ver data/supabase/DATABASE_CONFIG.yaml.
