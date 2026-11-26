# Proposal

## Why

En la pantalla de Entrenamiento, el menú de acciones (`...`) de una tarjeta de rutina queda tapado por la tarjeta siguiente: las opciones finales («Ocultar de Mi plan» y «Eliminar») no se pueden ver ni pulsar. La animación `animate-slide-up` deja un `transform` permanente en cada tarjeta, creando un *stacking context* que atrapa el `z-index` del menú dentro de su propia tarjeta.

## What Changes

- Dar `position: relative` a las tarjetas de rutinas propias y asignadas.
- Elevar dinámicamente con `z-index` solo la tarjeta cuyo menú esté abierto, para que su menú se pinte por encima de las tarjetas adyacentes.
- Mantener el menú dentro de la tarjeta (sin Portal) y conservar el cierre al pulsar fuera y todas las acciones existentes.
- Verificar visualmente el menú en la primera tarjeta, en una intermedia y en la sección de rutinas asignadas.

## Capabilities

### New Capabilities

- `routine-card-actions`: comportamiento de visualización de los menús de acciones de las tarjetas de rutina en la vista de Entrenamiento, incluida la prioridad de pintado frente a tarjetas vecinas.

### Modified Capabilities

- (ninguna)

## Impact

- `src/pages/member/MyRoutines.tsx`: clases de los `<article>` de rutinas propias y asignadas; estado `menuFor` existente.
- Sin cambios en servicios, esquema de Supabase, dependencias ni rutas.
- Sin cambios rompientes.
