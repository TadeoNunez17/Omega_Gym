# Design

## Context

La landing pública `/` es el `start_url` de la PWA y el primer punto de contacto. Hoy hay dos manifest: el enlazado en `index.html` y el generado por VitePWA, con colores distintos. Solo hay iconos SVG y `apple-touch-icon` apunta a uno de ellos. No existe lógica de instalación ni detección de modo standalone en `src/`.

## Goals / Non-Goals

**Goals:**
- Capturar el evento de instalación antes de que la landing termine de montarse.
- Ofrecer un CTA útil en móvil sin simular capacidades que el navegador no tiene.
- Hacer que la PWA cumpla criterios de instalación en Chromium y que iOS use un icono PNG real.
- Reutilizar `BottomSheet`, `ListGroup` y los tokens visuales existentes.

**Non-Goals:**
- Envolver la app en Capacitor o publicarla en App Store/Google Play.
- Agregar el CTA dentro de la navegación autenticada.
- Modificar Supabase, esquema, RLS o autenticación.
- Forzar la instalación automática ni mostrar prompts repetidos.

## Decisions

- **Manifest único generado por VitePWA**: configurar `manifestFilename: 'manifest.json'`, eliminar `public/manifest.json` y dejar que `vite.config.ts` sea la única fuente. Alternativa descartada: mantener el archivo estático actual, porque produce dos definiciones y colores divergentes.
- **Iconos PNG dedicados**: generar `icon-192.png` e `icon-512.png` desde la marca existente, con padding para maskable, y conservar los SVG para fidelidad vectorial. Alternativa descartada: usar solo SVG, porque Chromium e iOS son menos fiables con ese formato para instalación.
- **Store modular capturado al arranque**: agregar `pwa-install.store.ts` importado desde `main.tsx`, junto al store PWA actual, para no perder `beforeinstallprompt`. Alternativa descartada: escuchar dentro de `Landing`, donde el evento pudo ocurrir antes del mount.
- **Hook delgado para consumo**: `usePwaInstall` lee el store, deriva plataforma y modo standalone, y expone `install()`. La lógica del evento queda en el store, no en la página.
- **Detección conservadora**: `isStandalone` usa `matchMedia('(display-mode: standalone)')` y `navigator.standalone`; iOS se detecta por userAgent/IPadOS; Android por userAgent. Si no hay señales claras, no se afirma que es móvil.
- **CTA solo en el hero de landing**: visible en móvil, oculto en escritorio y standalone. No se agrega a `MoreSheet` ni Ajustes, según la decisión del dueño.
- **Comportamiento por plataforma**: Android con evento válido llama `prompt()` dentro del gesto del usuario; Android sin evento e iOS abren una hoja con pasos. iOS nunca intenta abrir un prompt nativo.

## Risks / Trade-offs

- [iOS no expone prompt programable] → La hoja explica Safari → Compartir → Agregar a pantalla de inicio; no se promete instalación automática.
- [El evento puede no dispararse en Android] → Se muestra instrucciones del menú del navegador y se indica que la PWA debe estar servida por HTTPS.
- [El evento solo se puede usar una vez] → El store lo limpia tras `prompt()`, `appinstalled` o `userChoice`.
- [Detección de standalone incompleta en algunos navegadores] → El CTA puede aparecer en un caso ya instalado; se mitiga con `navigator.standalone` y media query.
- [Generación de PNG desde SVG] → Revisar visualmente que el logo no quede recortado en el padding maskable.

## Migration Plan

- No hay migración de base de datos ni cambios de entorno.
- El build genera el manifest y el service worker; el rollback consiste en revertir `index.html`, `vite.config.ts`, archivos de iconos y componentes tocados.
- Las rutas y sesiones de usuario no cambian.
