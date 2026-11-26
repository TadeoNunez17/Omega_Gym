# Tasks

## 1. Recursos instalables

- [x] 1.1 Configurar un único manifest generado por VitePWA con `manifestFilename: 'manifest.json'`, `start_url: '/'`, `display: 'standalone'`, colores consistentes e iconos PNG 192/512; verificar que `npm run build` emite un solo manifest y que eliminate la dependencia de `public/manifest.json`.
- [x] 1.2 Generar `public/icons/icon-192.png` e `icon-512.png` con propósito `any`/`maskable` y actualizar `apple-touch-icon` a PNG; verificar que ambos archivos existen y que el HTML ya no apunta a un SVG para iOS.

## 2. Estado de instalación

- [x] 2.1 Crear tipos PWA y `src/store/pwa-install.store.ts` capturando `beforeinstallprompt`, `appinstalled` y `userChoice`, con limpieza del evento usado; verificar que el store se importa desde `main.tsx` y que no se consume un prompt agotado.
- [x] 2.2 Crear `src/hooks/usePwaInstall.ts` con detección de iOS/Android, modo standalone y función `install()`; verificar que el hook distingue Android con prompt de Android sin prompt y que oculta el CTA en standalone.

## 3. Interfaz en la landing

- [x] 3.1 Agregar el botón “Instalar app” al hero de la landing solo en móvil y fuera de standalone; verificar que no se muestra en escritorio ni cuando la PWA ya está instalada.
- [x] 3.2 Agregar un `BottomSheet` con guía de Safari para iOS e instrucciones del menú del navegador para Android sin prompt; verificar que el prompt nativo se invoque solo desde el click del usuario en Android.

## 4. No regresión y validación

- [x] 4.1 Confirmar que no se modifican auth, dashboard, rutas protegidas ni Supabase; verificar con revisión del diff que el cambio queda limitado a PWA, landing y documentación.
- [x] 4.2 Ejecutar `npm run lint` y `npm run build` sin errores; verificar que el manifest generado incluye `start_url`, iconos PNG y un único `apple-touch-icon`.

## 5. Cierre

- [x] 5.1 Crear y actualizar `TKT-OMEGYM-055` con evidencia de implementación y validación; verificar que el estado refleja `Review` hasta la QA manual del dueño.
- [x] 5.2 Ejecutar `openspec validate pwa-install-shortcut --strict` y `openspec validate --specs`; verificar que no hay errores.

## Workflow follow-up

- Sincronizar la spec viviente `pwa-install` y archivar el change después de la validación del dueño.
- Escribir el espejo en Obsidian bajo `Omega_Gym/historial/`.
