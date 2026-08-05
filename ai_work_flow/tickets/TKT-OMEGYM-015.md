# TKT-OMEGYM-015: Autenticación — Verificación de email/teléfono (OTP diferido)

## Metadata
- **Tipo**: Feature
- **Prioridad**: Media
- **Estado**: Review
- **Módulo**: auth
- **Relacionado con**: SPECIFICATION.md (sección 11.1 Autenticación y Roles)
- **Ticket Externo**: REQ-OMEGYM-0XX
- **Fecha apertura**: 2026-08-04
- **Fecha cierre**: (pendiente)

## Descripción
Se evaluó un flujo de verificación por **OTP de 6 dígitos** (email y SMS) al
registrarse. Tras implementarlo, **se decidió revertir** la autenticación al
flujo original **por contraseña** (email o teléfono + contraseña). El registro
y login vuelven a usar `supabase.auth.signUp` / `signInWithPassword`.

**Decisiones tomadas**:
- **Revertido**: identidad passwordless vía OTP → se descarta por ahora y queda
  **diferido**.
- **Vigente**: registro y login por **email o teléfono + contraseña** (flujo
  original).
- El OTP podrá retomarse en un ticket futuro si se desea verificación por código.

## Dependencias
- **Bloqueado por**: TKT-OMEGYM-003 (protección de rutas/roles) — cerrado
- **Bloquea a**: (ninguno)

## Estado de la implementación (revert)
- [x] `auth.service.ts` → `login` (`signInWithPassword`), `register` (`signUp`)
- [x] `auth.store.ts` → acciones `login` / `register`
- [x] `Login.tsx` → formulario email + contraseña (restaurado)
- [x] `Register.tsx` → formulario nombre + email + teléfono + contraseña (restaurado)
- [x] `npm run build` pasa

> **Nota**: Las funciones `sendOtp` / `verifyOtp` fueron removidas junto con el
> revert. El diseño OTP (2 pasos, `signInWithOtp`/`verifyOtp`) queda documentado
> en el historial de este ticket si se retoma.

## Archivos Afectados (estado final del revert)
- `src/services/auth.service.ts`
- `src/store/auth.store.ts`
- `src/pages/auth/Login.tsx`
- `src/pages/auth/Register.tsx`

## Estimación
1 día (implementación + revert)

## Criterios de Aceptación
- [ ] Login por email + contraseña funciona y redirige por rol
- [ ] Registro por email O teléfono + contraseña crea cuenta y perfil
- [ ] El build de producción pasa sin errores

## Pendiente (fuera de este ticket)
- **OTP de 6 dígitos (email y/o SMS)** al registrarse: diferido, ticket aparte.
  - Requiere SMTP (Resend) para email: `config.toml` `[auth.email.smtp]`
    (host `smtp.resend.com`, port `465`, user `resend`, pass `env(RESEND_API_KEY)`)
    y dashboard hosting → Authentication → SMTP Settings.
  - Requiere **dominio verificado en Resend** (SPF/DKIM; opcional DMARC) para
    enviar a terceros; con `onboarding@resend.dev` solo llega al dueño de la cuenta.
  - SMS requiere Twilio (por ahora desactivado en `config.toml`).
- **Seguridad**: la API Key de Resend compartida en el chat debe rotarse.

## Evidencia de Cierre
**Fecha**: (pendiente)
**Probado por**: (pendiente)
**Resultado**: (pendiente)
**Commit**: `refactor(auth): revert to email/phone + password login (#TKT-OMEGYM-015)`