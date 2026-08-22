# TKT-OMEGYM-021: Página "Mis Rutinas" para miembros + router

## Metadata
- **Tipo**: Feature
- **Prioridad**: Alta
- **Estado**: Review
- **Módulo**: training-plans
- **Relacionado con**: SPEC_001, TKT-OMEGYM-019, TKT-OMEGYM-020
- **Dependencias**: Bloqueado por TKT-OMEGYM-020 · Bloquea a TKT-OMEGYM-022
- **Fecha apertura**: 2026-08-21
- **Fecha cierre**: —

## Descripción
Nueva página `/my-routines` (ProtectedRoute `['member']`) con listado de rutinas personales del miembro, creación/edición reutilizando `RoutineBuilder` + `ExercisePicker`, eliminación con confirmación y vista de detalle por día (patrón MyPlan). Entrada en navegación del layout de miembro.

## Archivos Afectados
- src/pages/member/MyRoutines.tsx (nuevo)
- src/App.tsx (ruta)
- Layout/nav de member

## Implementación
- [x] Listado + estados vacío/carga/error
- [x] Crear/editar vía RoutineBuilder (kind='personal')
- [x] Eliminar con confirmación en dos pasos inline
- [x] Ruta /my-routines y navegación conectada (sidebar + BottomNav, solo rol member)
- [x] Extra: detalle expandible por día, badge "Compartida", modal compartir (copiar/regenerar/revocar), modal importar

## Criterios de Aceptación
- [x] Miembro gestiona sus rutinas sin acceso a datos ajenos (RLS + filtro created_by)
- [x] Trainer/admin no ve la entrada de navegación (la ruta existe pero sin link)
- [x] Build y lint limpios (npm run build OK)

## Evidencia de Cierre
**Fecha**: — **Probado por**: — **Resultado**: — **Commit**: —

