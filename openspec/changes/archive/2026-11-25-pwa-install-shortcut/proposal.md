# Proposal

## Why

La app es una PWA instalable, pero el único acceso para agregarla a la pantalla de inicio depende de que el usuario descubra el menú del navegador. La landing pública es la puerta de entrada y `start_url` de la app, por lo que necesita una acción explícita y coherente con las limitaciones reales de Android e iOS.

## What Changes

- Agregar un botón “Instalar app” en el hero de la landing pública, visible solo en móvil.
- Abrir el prompt nativo de instalación en Android cuando `beforeinstallprompt` esté disponible.
- Mostrar una guía de Safari en iOS, donde el prompt no puede dispararse desde la página.
- Ocultar el botón cuando la app ya esté ejecutándose en modo standalone/installed.
- Unificar el manifest PWA en una sola fuente y usar iconos PNG 192/512 con soporte maskable.
- Actualizar `apple-touch-icon` a PNG para que el acceso directo de iOS no use una captura.
- Crear el ticket `TKT-OMEGYM-055` y la spec viviente `pwa-install`.

## Capabilities

### New Capabilities

- `pwa-install`: visibilidad del CTA de instalación, prompt nativo en Android, guía en iOS, estado instalado y recursos que hacen instalable la PWA.

### Modified Capabilities

- Ninguna.

## Impact

- `index.html`, `vite.config.ts`, `public/manifest.json`, `public/icons/`.
- `src/pages/landing/Landing.tsx`.
- Nuevos `src/store/pwa-install.store.ts`, `src/hooks/usePwaInstall.ts` y tipos PWA.
- Componentes existentes `BottomSheet`, `Button` y tokens de tema de `src/index.css`.
- Sin cambios en Supabase, RLS ni variables de entorno.
