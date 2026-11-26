# Design

## Context

Ver `proposal.md` para la motivación. En `src/pages/member/MyRoutines.tsx` las tarjetas propias y asignadas usan un menú `absolute` con `z-30` dentro de un contenedor `relative`. Las tarjetas propias llevan `animate-slide-up`, cuya animación termina en `transform: translateY(0)` con `forwards` (`src/index.css`); ese `transform` convierte cada `<article>` en un *stacking context* aunque la animación haya terminado. Por tanto, el `z-30` del menú compite solo dentro de su tarjeta: las tarjetas posteriores, con `z-index: auto`, se pintan después y tapan el menú. No hay `overflow: hidden` en la lista ni en las tarjetas que recorte el menú.

## Goals / Non-Goals

**Goals:**

- Que el menú de cualquier tarjeta se pinte por encima de las tarjetas vecinas, sin importar su posición en la lista.
- Mantener un único menú abierto y preservar el comportamiento actual de cierre y de cada acción.
- Solución local a `MyRoutines.tsx`, sin tocar estilos globales compartidos por otras pantallas.

**Non-Goals:**

- Refactorizar `animate-slide-up` ni eliminar transformaciones en otras pantallas.
- Cambiar `ExerciseDetail.tsx` u otros menús fuera de la pantalla de Entrenamiento.
- Migrar los menús a un design system de overlays/Portal.

## Decisions

- **Elevar la tarjeta activa en lugar de usar un Portal.** Al añadir `relative` a los `<article>` y `z-10` condicional cuando `menuFor === id`, la tarjeta activa participa en el contexto de apilamiento de la lista con un `z-index` explícito y gana a las tarjetas con `z-index: auto`, aunque todas tengan `transform`. El menú conserva su `absolute ... z-30` dentro de la tarjeta. Alternativa descartada: `createPortal(..., document.body)`, que escapa de cualquier contexto pero obliga a calcular posición con `getBoundingClientRect()` y a recalcular en scroll/resize, con más riesgo de regresiones para un menú de cinco opciones.
- **Aplicar el mismo patrón a rutinas propias y asignadas.** Aunque solo las propias tienen `animate-slide-up`, ambas secciones comparten el mismo componente de menú y el mismo estado `menuFor`; tratarlas igual evita una inconsistencia visible.
- **No modificar `index.css`.** Cambiar `slideUp` a `none` al terminar afectaría a todas las pantallas que usan la animación; el arreglo se limita a la vista con el problema.

## Risks / Trade-offs

- [Otro contenedor con `transform`/`overflow` envuelve la lista] → Mitigación: verificado el árbol de `PageContainer` y la lista `flex flex-col gap-3`, sin `overflow` ni transformaciones; la verificación manual sigue siendo obligatoria.
- [El z-index de la tarjeta activa persiste tras cerrar el menú] → Mitigación: la clase se calcula desde `menuFor`, por lo que vuelve a `z-auto` al cerrar.
- [El overlay `fixed inset-0 z-20` sigue limitado por el `transform` de la tarjeta] → Mitigación: se conserva tal cual; su función es cerrar al pulsar dentro de la tarjeta y no forma parte del problema de superposición.
