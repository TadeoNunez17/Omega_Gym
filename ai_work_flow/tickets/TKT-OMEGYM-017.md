# TKT-OMEGYM-017: Autenticación — Login con Google (OAuth)

## Metadata
- **Tipo**: Feature
- **Prioridad**: Media
- **Estado**: Open
- **Módulo**: auth
- **Relacionado con**: SPECIFICATION.md (sección 11.1 Autenticación y Roles)
- **Ticket Externo**: REQ-OMEGYM-0XX
- **Fecha apertura**: 2026-08-04
- **Fecha cierre**: (pendiente)

## Descripción
Habilitar **"Continuar con Google"** como método de inicio de sesión/registro
usando el proveedor OAuth de **Supabase Auth** (Google como identity provider).

El botón ya está implementado en el frontend (arriba del formulario en
`/login` y `/register`, con divisor "o con tu correo"), pero **temporalmente
solo muestra un aviso** (`toast.info('Próximamente disponible')`) porque el
proveedor **no está habilitado** en Supabase y faltan las credenciales OAuth
del propietario.

Cuando se complete la configuración, el flujo será:
```
Botón → supabase.auth.signInWithOAuth('google') → pantalla de Google
→ Google devuelve el code al callback de Supabase
→ Supabase crea/vincula la sesión → redirige a ${origin}/auth/callback
→ AuthCallback obtiene perfil y redirige por rol
```

Nota: al entrar con Google, el email viene verificado por Google, por lo que
**no** aplica la confirmación de correo del TKT-OMEGYM-016.

## Dependencias
- **Bloqueado por**: TKT-OMEGYM-003 (protección de rutas/roles) — cerrado
- **Bloquea a**: (ninguno)

## Configuración necesaria

### 1. Google Cloud Console (manual, propietario)
- Crear una credencial **OAuth 2.0 Client ID** (tipo "Web application").
- En "Authorized redirect URIs" agregar el callback de cada proyecto Supabase:
  - DEV: `https://jaltwjcipyrnmvjkdqdp.supabase.co/auth/v1/callback`
  - PROD: `https://xlawavqceyprraeyrmtm.supabase.co/auth/v1/callback`
- Obtener **Client ID** y **Client Secret**.

### 2. Supabase (vía Management API, cuando existan credenciales)
- `PATCH /v1/projects/<ref>/config/auth` en ambos proyectos (DEV y PROD):
  - `external_google_enabled = true`
  - `external_google_client_id = <Client ID>`
  - `external_google_secret = <Client Secret>`
- Verificar que existe un trigger que cree el perfil en `profiles` al primer
  login de un usuario nuevo (si no, crearlo para que `getProfile` no falle).

### Estado actual del frontend
- `GoogleButton.tsx` presente en Login y Register, **solo con aviso**.
- `authService.loginWithGoogle` / `authStore.loginWithGoogle` ya existen y
  usan `signInWithOAuth(provider:'google', redirectTo: origin/auth/callback)`.
- `AuthCallback.tsx` ya resuelve el flujo OAuth (exchange + redirect por rol).

## Archivos Afectados
- `src/components/ui/atoms/GoogleButton.tsx` → botón con aviso temporal.
- `src/pages/auth/Login.tsx` → `<GoogleButton />` arriba del formulario.
- `src/pages/auth/Register.tsx` → `<GoogleButton />` arriba del formulario.
- `src/services/auth.service.ts` → `loginWithGoogle` (ya listo).
- `src/store/auth.store.ts` → `loginWithGoogle` (ya listo).
- `src/pages/auth/AuthCallback.tsx` → manejo OAuth (ya listo).

## Estimación
0.5 día (restante: solo configuración externa + verificación)

## Implementación
- [x] Botón "Continuar con Google" visible en Login y Register (arriba)
- [x] Comportamiento temporal: solo muestra mensaje (sin provider)
- [ ] Client ID / Client Secret de Google OAuth provistos por el propietario
- [ ] `external_google_enabled=true` + credenciales aplicadas en DEV y PROD
- [ ] Callback URI de Google Cloud Console agregado para dev y prod
- [ ] Trigger de creación de perfil en `profiles` verificado (o creado)
- [ ] Prueba manual: login con Google crea sesión y redirige por rol

## Criterios de Aceptación
- [ ] Sin credenciales: el botón muestra el aviso (sin errores)
- [ ] Con credenciales: el clic abre la pantalla de Google
- [ ] Primer login con Google crea sesión y perfil (rol `member`)
- [ ] Tras el flujo, redirige por rol (admin/trainer/member)
- [ ] El build de producción pasa sin errores

## Evidencia de Cierre
**Fecha**: (pendiente)
**Probado por**: (pendiente)
**Resultado**: (pendiente) — Botón frontend listo y verificado con aviso
temporal; build OK. Pendiente: credenciales OAuth y habilitación del provider.
**Commit**: `feat(auth): google sign-in button (#TKT-OMEGYM-017)`
