# TKT-OMEGYM-023: Unificar vistas Mi plan / Mis rutinas

## Metadata
- **Tipo**: Mejora
- **Prioridad**: Media
- **Estado**: Review
- **Módulo**: training-plans
- **Relacionado con**: SPEC_001, TKT-OMEGYM-021
- **Dependencias**: TKT-OMEGYM-021 (completado)
- **Fecha apertura**: 2026-08-21
- **Fecha cierre**: —

## Descripción
El miembro ve todo su entrenamiento en un solo lugar:
1. **Mi plan** fusiona planes asignados (primero) + rutinas personales (después) en las mismas pestañas, con insignia "tuya"/"Creada por ti" y botón Editar que navega a `/my-routines?edit=<id>`.
2. **Mis rutinas** agrega sección de solo lectura "Asignadas por tu entrenador" con detalle expandible.
3. El query param `?edit=` abre el RoutineBuilder automáticamente al llegar a Mis rutinas.

## Archivos Afectados
- src/pages/member/MyPlan.tsx (merge + badges + link editar)
- src/pages/member/MyRoutines.tsx (sección asignada + auto-edit)

## Implementación
- [x] Merge asignadas+personales en MyPlan (orden: asignadas primero)
- [x] Insignia origen en pestañas y header; botón Editar para personales
- [x] Sección "Asignadas por tu entrenador" en Mis rutinas
- [x] Auto-apertura del builder vía ?edit=
- [x] Estado vacío combinado con CTA a Mis rutinas

## Criterios de Aceptación
- [x] Rutina creada aparece como pestaña en Mi plan sin recargar sesión (al volver a entrar)
- [x] Asignadas visibles en Mis rutinas sin acciones destructivas
- [x] Build limpio (npm run build OK)

## Evidencia de Cierre
**Fecha**: 2026-08-21 **Probado por**: Dev asistido por IA **Resultado**: Compilación OK; validación funcional pendiente con cuentas reales (junto a E2E de TKT-OMEGYM-022). **Commit**: pendiente
