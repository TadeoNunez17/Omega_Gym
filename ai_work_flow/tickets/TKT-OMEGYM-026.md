# TKT-OMEGYM-026: Unificar Mi membresía y Mis pagos en una vista

## Metadata
- **Tipo**: Refactoring / Mejora
- **Prioridad**: Media
- **Estado**: Review
- **Módulo**: memberships
- **Fecha apertura**: 2026-08-21
- **Fecha cierre**: —

## Descripción
El miembro ve su membresía y sus pagos en UNA sola ventana con pestañas, en lugar de dos secciones separadas del menú.

Alcance confirmado: SOLO lado miembro. Las páginas admin (`/memberships`, `/payments`), nav de sidebar y configs de entrenador NO se tocaron.

## Archivos Afectados
- src/pages/member/MyMembership.tsx (reescrita: TabBar `Mi membresía | Pagos`, estado en `?tab=`; absorbe todo MyPayments)
- src/pages/member/MyPayments.tsx (ELIMINADO)
- src/App.tsx (`/my-payments` → redirect a `/my-membership?tab=pagos`)
- src/components/layout/MemberLayout.tsx (nav: un item "Membresía")
- src/components/ui/layout/BottomNav.tsx (ídem; libera un slot móvil)

## Implementación
- [x] Carga paralela de membresía + historial + pagos en un solo efecto
- [x] Tabs sincronizadas con URL (?tab=pagos)
- [x] Modal de recibo ahora SÍ se abre (click en fila del historial — antes estaba huérfano)
- [x] Redirect de compatibilidad para bookmarks
- [x] Sin cambios de servicios ni BD

## Criterios de Aceptación
- [ ] Ambas pestañas muestran contenido correcto y persisten al recargar
- [ ] `/my-payments` redirige al tab Pagos
- [ ] Recibo abre desde el historial de pagos
- [ ] Nav móvil muestra un item menos

## Evidencia de Cierre
**Fecha**: 2026-08-21 **Probado por**: Dev asistido por IA **Resultado**: Build OK (135 módulos). Validación manual pendiente. **Commit**: pendiente
