# TKT-OMEGYM-022: Compartir e importar rutinas por código (UI + validación E2E)

## Metadata
- **Tipo**: Feature
- **Prioridad**: Alta
- **Estado**: Open
- **Módulo**: training-plans
- **Relacionado con**: SPEC_001, TKT-OMEGYM-021
- **Dependencias**: Bloqueado por TKT-OMEGYM-021
- **Fecha apertura**: 2026-08-21
- **Fecha cierre**: —

## Descripción
Modal "Compartir" (código grande, copiar al portapapeles, regenerar con confirmación, revocar) e input "Importar con código" en Mis Rutinas. Validación E2E del flujo completo entre dos cuentas miembro: crear → compartir → importar → editar copia → verificar original intacto.

## Archivos Afectados
- src/pages/member/MyRoutines.tsx
- tests/e2e/shared-routines.spec.ts (nuevo)

## Implementación
- [ ] Modal compartir + copiar/regenerar/revocar
- [ ] Import con feedback (éxito/código inválido/auto-import)
- [ ] Prueba E2E documentada

## Criterios de Aceptación
- [ ] Copia independiente verificada (editar copia no altera original)
- [ ] Mensajes de error claros para código inválido/revokeado/propio
- [ ] Evidencia de prueba manual + E2E adjunta

## Evidencia de Cierre
**Fecha**: — **Probado por**: — **Resultado**: — **Commit**: —
---
**Evidencia aplicación a PRODUCCIÓN (ref xlawavqceyprraeyrmtm)**: 2026-08-21 — migraciones de esta sesión aplicadas vía SQL directo (Management API), PostgREST recargado; verificación OK (columnas kind/share_code/show_in_plan/visible, RPCs generate_share_code/revoke_share_code/import_routine_by_code/set_assignment_visibility + grants, 6 políticas RLS personales). Ver data/supabase/DATABASE_CONFIG.yaml.
