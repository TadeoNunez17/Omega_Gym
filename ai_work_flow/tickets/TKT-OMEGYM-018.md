# TKT-OMEGYM-018: Autenticación — Recuperación de contraseña (Forgot Password)

## Metadata
- **Tipo**: Feature
- **Prioridad**: Alta
- **Estado**: Review
- **Módulo**: auth
- **Relacionado con**: SPECIFICATION.md (sección 11.1 Autenticación y Roles)
- **Ticket Externo**: REQ-OMEGYM-0XX
- **Fecha apertura**: 2026-08-04
- **Fecha cierre**: (pendiente)

## Descripción
Implementar el flujo completo de **"¿Olvidaste tu contraseña?"** usando la
recuperación integrada de **Supabase Auth** (`resetPasswordForEmail` +
`updateUser`), sin backend propio.

Flujo implementado:
```
¿Olvidaste? (/login) → /forgot-password → email → resetPasswordForEmail
→ Supabase envía correo de recuperación (plantilla "Omega Gym" personalizada)
→ al abrir el link → Supabase redirige a /auth/callback con ?code&type=recovery
→ AuthCallback intercambia el code (sesión de recuperación) → /reset-password
→ nueva contraseña → updateUser({ password }) → signOut → login
```

Nota: `updateUser({ password })` requiere sesión activa; la sesión de
recuperación obtenida al intercambiar el code la habilita, por eso **no** se
pide la contraseña anterior para cambiarla.

## Dependencias
- **Bloqueado por**: TKT-OMEGYM-016 (confirmación de email / SMTP custom) — Review
- **Bloquea a**: (ninguno)

## Configuración aplicada en Supabase (Management API)

### Proyecto DEV `jaltwjcipyrnmvjkdqdp` y PROD `xlawavqceyprraeyrmtm`
- `mailer_subjects_recovery="Restablece tu contrasena - Omega Gym"` (aplicado
  en ambos).
- `mailer_templates_recovery_content` = plantilla HTML custom con branding
  "Omega Gym" en `#dc2626`, grid 520px, texto sin acentos y botón
  "Restablecer Contrasena" → `{{ .ConfirmationURL }}` (aplicado en ambos).
- No se requirió cambiar `site_url`/`uri_allow_list`: `redirectTo` apunta a
  `${origin}/auth/callback`, ya permitido (local/`**` desde TKT-016).

## Archivos Afectados
- `src/services/auth.service.ts` → `requestPasswordReset` (resetPasswordForEmail
  con `redirectTo`) y `updatePassword` (updateUser).
- `src/pages/auth/ForgotPassword.tsx` → nuevo: formulario de email + pantalla
  "Revisa tu bandeja" (mismo patrón de Registro).
- `src/pages/auth/ResetPassword.tsx` → nuevo: nueva contraseña (mín. 6) +
  guard de sesión (si no hay sesión de recuperación → `/login`) + signOut al
  guardar.
- `src/pages/auth/Login.tsx` → botón "¿Olvidaste tu contraseña?" ahora es un
  `Link` a `/forgot-password`.
- `src/pages/auth/AuthCallback.tsx` → si `type === 'recovery'`, tras el
  exchange redirige a `/reset-password` (no al dashboard).
- `src/lib/supabase.ts` → `createClient(..., { auth: { detectSessionInUrl:
  false } })`. Fix del flujo: con el cliente v2 (2.105.x) el auto-intercambio
  de la URL borraba `?code&type=recovery` antes de que el callback los leyera,
  por lo que el usuario aterrizaba en la app y no en `/reset-password`.
- `src/pages/auth/AuthCallback.tsx` → el exchange del código ahora se ejecuta
  **siempre que haya `code`** (no solo cuando no existe sesión), para que la
  sesión de recuperación sea la del usuario correcto aunque ya se estuviera
  logeado con otra cuenta.
- `src/App.tsx` → rutas `/forgot-password` y `/reset-password` bajo
  `AuthLayout`.

## Estimación
0.5 día

## Implementación
- [x] Servicio: `requestPasswordReset` + `updatePassword`
- [x] Página `/forgot-password` con pantalla "Revisa tu bandeja"
- [x] Página `/reset-password` con guard de sesión y signOut al guardar
- [x] Botón de Login enlazado
- [x] `AuthCallback` maneja `type=recovery`
- [x] Fix `detectSessionInUrl: false` + exchange siempre con `code` (prueba
  en localhost mostró que sin esto el link caía directo a la app)
- [x] Rutas registradas en `App.tsx`
- [x] Plantilla de recuperación personalizada (DEV + PROD, sin acentos, rojo)
- [x] Build pasa (`npm run build` / `tsc -b`)
- [ ] Prueba manual end-to-end (solicitud real + correo + nueva contraseña)

## Criterios de Aceptación
- [ ] El enlace "¿Olvidaste tu contraseña?" lleva a `/forgot-password`
- [ ] Al pedir el reset llega el correo con branding "Omega Gym" (rojo)
- [ ] El link del correo abre `/reset-password` con sesión de recuperación
- [ ] Se puede guardar una nueva contraseña y vuelve al login
- [ ] Acceder a `/reset-password` sin sesión redirige a `/login`
- [ ] El build de producción pasa sin errores

## Evidencia de Cierre
**Fecha**: (pendiente)
**Probado por**: (pendiente)
**Resultado**: (pendiente) — Código implementado, plantilla de recuperación
aplicada y verificada vía API (sin mojibake, `#dc2626`, `{{ .ConfirmationURL }}`)
en DEV y PROD; build OK. Pendiente prueba manual end-to-end.
**Commit**: `feat(auth): password recovery flow (#TKT-OMEGYM-018)`
