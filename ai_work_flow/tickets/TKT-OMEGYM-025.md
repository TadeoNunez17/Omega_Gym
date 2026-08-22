# TKT-OMEGYM-025: Visibilidad por miembro de planes asignados en Mi plan

## Metadata
- **Tipo**: Feature
- **Prioridad**: Media
- **Estado**: Review
- **Módulo**: training-plans
- **Relacionado con**: SPEC_001, TKT-OMEGYM-024
- **Dependencias**: TKT-OMEGYM-024 (completado)
- **Fecha apertura**: 2026-08-21
- **Fecha cierre**: —

## Descripción
Extiende el toggle "En Mi plan" a los planes asignados por entrenadores. Clave de diseño: un plan puede estar asignado a varios miembros (plan_assignments N:M), por lo que la preferencia es **por miembro** — ocultar no afecta a los demás.

## Solución
- `plan_assignments.visible BOOLEAN NOT NULL DEFAULT true` (preferencia individual).
- RPC `set_assignment_visibility(p_plan_id, p_visible)` SECURITY DEFINER:
  - Actualiza solo la fila donde `member_id = auth.uid()`.
  - Fallback legacy para planes con `assigned_to` sin fila de asignación (ahí reutiliza `training_plans.show_in_plan`, que ya es por-miembro al ser asignación única).
  - RAISE si el llamador no tiene relación con el plan.
- Sin cambios de RLS (el RPC hace la autorización).

## Archivos Afectados
- supabase/migrations/20260821130000_assigned_plan_visibility.sql (nueva, aplicada a DEV)
- src/services/training.service.ts (getByMemberAll +visible; setAssignedVisibility RPC)
- src/pages/member/MyRoutines.tsx (switch en asignadas; encabezado sin "solo lectura")
- src/pages/member/MyPlan.tsx (filtro visible !== false en asignadas)

## Criterios de Aceptación
- [ ] Switch en tarjetas asignadas alterna y persiste tras recargar
- [ ] Plan oculto desaparece de Mi plan del que lo ocultó pero sigue visible para otros miembros del mismo plan
- [ ] Miembro NO puede alterar planes que no le pertenecen (RPC rechaza)

## Evidencia de Cierre
**Fecha**: 2026-08-21 **Probado por**: Dev asistido por IA **Resultado**: Build OK; migración aplicada en DEV (jaltwjci...). Validación funcional manual pendiente (junto a E2E de TKT-022). **Commit**: pendiente

## Fix (2026-08-21) — migración 20260821140000
El RPC original comparaba `member_id`/`assigned_to` contra `auth.uid()`, pero en cuentas vinculadas/pre-registradas `profiles.id ≠ auth.uid()` → 0 filas + excepción "No autorizado" (el switch no persistía). Corregido con la traducción estándar del proyecto (`profiles.auth_user_id = auth.uid()`), control `FOUND` y `search_path=''`. Aplicada SOLO en DEV.
---
**Evidencia aplicación a PRODUCCIÓN (ref xlawavqceyprraeyrmtm)**: 2026-08-21 — migraciones de esta sesión aplicadas vía SQL directo (Management API), PostgREST recargado; verificación OK (columnas kind/share_code/show_in_plan/visible, RPCs generate_share_code/revoke_share_code/import_routine_by_code/set_assignment_visibility + grants, 6 políticas RLS personales). Ver data/supabase/DATABASE_CONFIG.yaml.
