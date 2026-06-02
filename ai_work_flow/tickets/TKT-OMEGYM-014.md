# TKT-OMEGYM-014: Configurar Google OAuth en Supabase

## Metadata
- **Tipo**: Configuración
- **Prioridad**: Alta
- **Estado**: Open
- **Módulo**: auth
- **Relacionado con**: SPECIFICATION.md (sección 11.1 Autenticación y Roles)
- **Fecha apertura**: 2026-06-02
- **Fecha cierre**:

## Descripción
Configurar Google como proveedor OAuth en Supabase para permitir inicio de sesión con Google. El código frontend ya está implementado (loginWithGoogle en auth.service + botón en Login.tsx + AuthCallback.tsx), solo falta la configuración externa en Google Cloud Console y Supabase Dashboard.

## Dependencias
- **Bloquea a**: N/A

## Archivos Afectados
- Ninguno (configuración externa)
- Código relacionado: `src/services/auth.service.ts`, `src/store/auth.store.ts`, `src/pages/auth/Login.tsx`, `src/pages/auth/AuthCallback.tsx`

## Implementación
- [ ] Crear proyecto en Google Cloud Console
- [ ] Configurar OAuth consent screen
- [ ] Crear OAuth Client ID (Web application)
- [ ] Agregar redirect URI: `https://jaltwjcipyrnmvjkdqdp.supabase.co/auth/v1/callback`
- [ ] Copiar Client ID y Client Secret
- [ ] Activar Google provider en Supabase Dashboard (Authentication → Providers → Google)
- [ ] Pegar Client ID y Client Secret en Supabase
- [ ] (Opcional) Agregar `VITE_GOOGLE_CLIENT_ID` en `.env` local

## Criterios de Aceptación
- [ ] El botón "Continuar con Google" en Login.tsx redirige a la pantalla de Google
- [ ] Tras autenticarse en Google, el usuario vuelve al sistema y es redirigido según su rol
- [ ] La sesión se crea correctamente en Supabase Auth

## Evidencia de Cierre
**Fecha**:
**Probado por**:
**Resultado**:
