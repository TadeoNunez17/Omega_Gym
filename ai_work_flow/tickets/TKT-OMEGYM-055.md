# TKT-OMEGYM-055: Botón para instalar la PWA desde la landing

## Metadata
- **Tipo**: Mejora (PWA / UI)
- **Prioridad**: Media
- **Estado**: Review
- **Módulo**: pwa / landing
- **Relacionado con**: `openspec/changes/pwa-install-shortcut/`, `SPECIFICATION.md` (§12 Despliegue)
- **Ticket Externo**: — (solicitud directa del dueño del proyecto)
- **Fecha apertura**: 2026-11-25
- **Fecha cierre**: —

## Descripción

La landing pública es el `start_url` de la PWA, pero hoy no ofrece una acción para agregar Omega Gym a la pantalla de inicio. Se necesita un botón “Instalar app” que use el prompt nativo cuando el navegador lo permita y que, en iOS, explique el flujo manual desde Safari.

## Alcance

**Dentro**
- Botón “Instalar app” en el hero de la landing, solo en móvil y fuera de standalone.
- Prompt nativo de Android cuando esté disponible.
- Guía de Safari en iOS y fallback por menú del navegador en Android sin prompt.
- Manifest PWA único, iconos PNG 192/512 y `apple-touch-icon` PNG.

**Fuera**
- No agregar el botón a la navegación autenticada.
- No envolver la app en Capacitor ni publicarla en tiendas.
- No modificar Supabase, RLS ni variables de entorno.
- No forzar instalaciones automáticas.

## Decisiones

- El dueño eligió que el botón esté solo en la landing.
- iOS muestra una guía; no se simula un prompt nativo porque la plataforma no lo expone.
- VitePWA será la única fuente del manifest.
- El store de instalación se registra al arranque para no perder `beforeinstallprompt`.

## Dependencias

- **Bloqueado por**: —
- **Bloquea a**: —

## Archivos Afectados

- `vite.config.ts`
- `index.html`
- `public/icons/`
- `src/main.tsx`
- `src/pages/landing/Landing.tsx`
- `src/store/pwa-install.store.ts`
- `src/hooks/usePwaInstall.ts`
- `src/types/pwa.ts`
- `ai_work_flow/tickets/TKT-OMEGYM-055.md`

## Estimación

2–3 h

## Implementación

- [x] Manifest único con iconos PNG y `apple-touch-icon` actualizado
- [x] Store y hook de instalación con detección de plataforma y standalone
- [x] Botón y hoja de instalación en la landing
- [x] Verificación de no regresión en auth/dashboard/Supabase
- [x] `npm run lint` y `npm run build`
- [ ] Validación OpenSpec y QA manual en Android/iOS

## Criterios de Aceptación

- [x] En móvil no instalado aparece “Instalar app” en el hero de la landing.
- [x] En escritorio y en modo standalone no aparece el botón.
- [x] En Android con prompt válido se abre el diálogo nativo desde el toque del usuario.
- [x] En iOS se muestran los pasos Safari → Compartir → Agregar a pantalla de inicio.
- [x] El manifest generado es único, con `start_url` “/”, iconos PNG 192/512 y `apple-touch-icon` PNG.
- [x] `npm run lint`, `npm run build` y validaciones OpenSpec pasan sin errores.
- [ ] QA manual del dueño en Android e iOS.

## Evidencia de Cierre

**Fecha**: 2026-11-25  
**Probado por**: OpenCode  
**Resultado**: Implementación completada. `npm run lint` sin errores; `npm run build` exitoso (`dist/manifest.json` con `lang: 'es'`, `start_url: '/'`, PNG 192/512 y un único `apple-touch-icon` PNG en `dist/index.html`). `openspec status --change "pwa-install-shortcut"` → 4/4; `openspec validate "pwa-install-shortcut" --strict` → válido; spec viviente `openspec/specs/pwa-install/spec.md` sincronizada; `openspec validate --specs` → 5 passed, 0 failed; change archivado en `openspec/changes/archive/2026-11-25-pwa-install-shortcut/`. Sin cambios en auth, dashboard, rutas protegidas ni Supabase. Queda pendiente la QA manual del dueño en Android/iOS, por lo que el ticket permanece en `Review`.  
**Commit**: —
