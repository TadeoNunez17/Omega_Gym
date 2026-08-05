# 07_email_verification_decisions.md

## Decisión: Confirmación de email con Supabase Auth (sin backend ni SMTP propio)

**Fecha**: 2026-08-04
**Contexto**: Omega Gym — verificación de correo en el registro de usuarios
**Autor**: Desarrollador (asistido por IA)

### Problema
El registro existente llamaba a `supabase.auth.signUp` sin manejar la
confirmación: no había pantalla de "revisa tu bandeja", no se detectaba a un
usuario pendiente de confirmar, y no estaba configurado el redirect del link.

### Opciones Evaluadas

#### Opción 1: Express + Nodemailer (Gmail SMTP)
**Pros**: ✅ Control total del proceso desde un backend propio
**Contras**: ❌ Requiere crear un servidor desde cero; ❌ rompe la arquitectura
SPA pura del proyecto; ❌ gestionar una app password de Gmail y secretos en
Vercel; ❌ interactúa mal con el modelo `profiles`/RLS existente.

#### Opción 2: Supabase Auth (confirmación integrada)
**Pros**: ✅ Nativo del stack (SPA pura + Supabase); ✅ sin backend ni SMTP
propio; ✅ gateo de acceso automático vía RLS (sin confirmar ⇒ sin sesión);
✅ aprovecha el trigger `handle_new_user` que ya crea el `profile`.
**Contras**: ❌ Personalizar la plantilla del correo requiere plan de pago o
SMTP custom (free tier usa el mailer por defecto); ❌ la config del toggle vive
en el dashboard/Mgmt API de Supabase, no en el código.

### Decisión Final
**Selección**: Opción 2 — Confirmación de email con Supabase Auth.

**Razones**:
1. Consistente con la arquitectura del proyecto (sin backend).
2. Cero mantenimiento de correo propio.
3. Seguridad gratis: un email sin confirmar no obtiene sesión (RLS vigente).

### Aplicación
- Implementar en: TKT-OMEGYM-016
- Archivos: `src/services/auth.service.ts`, `src/store/auth.store.ts`,
  `src/pages/auth/Register.tsx`, `src/pages/auth/AuthCallback.tsx`

---

## Lección 1: Separador de `uri_allow_list` en la Management API

Al escribir MÚLTIPLES URLs de redirect en `uri_allow_list` del endpoint
`PATCH /v1/projects/{ref}/config/auth`, el valor se almacena tal cual se envía.
- El separador por **salto de línea (`\n`) NO se conserva** (las URLs se
  concatenan y corrompen la lista).
- El separador por **coma SÍ se conserva literalmente**, pero no se confirmó
  que GoTrue la interprete como lista.
**Recomendación práctica**: para un único origen, usar una sola entrada limpia
`<origin>/**`. Para el redirect post-confirmación basta con que `site_url`
coincida con el origen de la app (el `emailRedirectTo` queda bajo `site_url`),
evitando depender de entradas múltiples en la lista.

## Lección 2: Personalización de plantilla de correo (free tier)
`PATCH` a `mailer_templates_confirmation_content` o `mailer_subjects_*` puede
fallar con: `"Email template modification is not available for free tier
projects using the default email provider"`. Solución: dejar la plantilla
estándar o configurar SMTP custom.

## Lección 3: Alcance del token en la Management API
Un PAT (`sbp_...`) solo alcanza los proyectos que pertenecen a la cuenta/org
de su dueño. Un proyecto distinto (p.ej. el que referencia `.env`) puede dar
**403** aunque el token sea válido. Confirmar la lista de proyectos alcanzables
(`GET /v1/projects`) antes de asumir acceso.

## Relacionado con
- Tickets: TKT-OMEGYM-015, TKT-OMEGYM-016
- Remote: supabase_auth_reference.md (Supabase Auth)