# TKT-OMEGYM-020: Servicio routines.service.ts (cliente de rutinas personales)

## Metadata
- **Tipo**: Feature
- **Prioridad**: Alta
- **Estado**: Review
- **Módulo**: training-plans
- **Relacionado con**: SPEC_001, TKT-OMEGYM-019
- **Dependencias**: Bloqueado por TKT-OMEGYM-019 · Bloquea a TKT-OMEGYM-021
- **Fecha apertura**: 2026-08-21
- **Fecha cierre**: —

## Descripción
Servicio tipado que envuelve las RPCs nuevas y el CRUD personal: `getMine()`, `createPersonal()`, `updatePersonal()` (+ reemplazo de ejercicios), `deletePersonal()`, `generateShareCode(planId, regenerate?)`, `revokeShareCode(planId)`, `importByCode(code)`. Errores como mensajes en español listos para toast.

## Archivos Afectados
- src/services/routines.service.ts (nuevo)
- src/services/training.service.ts (solo si se extraen helpers compartidos)

## Implementación
- [x] Tipos (Routine, RoutineListItem)
- [x] Funciones sobre supabase.rpc(...) y CRUD personal
- [x] Errores con mensaje en español listo para toast (los RPC ya los lanzan)

## Criterios de Aceptación
- [x] Sin `any`; compila con tsc -b
- [x] No rompe training.service existente (solo se extendió create() con kind opcional)

## Evidencia de Cierre
**Fecha**: — **Probado por**: — **Resultado**: — **Commit**: —

