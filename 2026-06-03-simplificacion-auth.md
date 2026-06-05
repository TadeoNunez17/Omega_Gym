# Simplificación del flujo de Autenticación — 2026-06-03

## Resumen

Se reemplazó el complejo sistema de **claim codes** (código de 6 dígitos + SHA-256 + expiración de 15 min + 3 pasos en UI) por un flujo **bidireccional simple** basado en email y teléfono como llaves de vinculación.

## Cambios

### Base de datos
- **Nueva migración**: `supabase/migrations/20260603000001_simplify_auth_flow.sql`
- El trigger `handle_new_user()` ahora busca perfiles `pending` por **email OR phone** (lee `phone` de `raw_user_meta_data`)
- El trigger completa email/phone del perfil vinculado si estaban vacíos

### Archivos eliminados
| Archivo | Razón |
|---------|-------|
| `src/pages/auth/ClaimAccount.tsx` | Flujo claim code eliminado |
| Ruta `/claim` en `src/App.tsx` | Ya no existe la página |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/services/auth.service.ts` | `register()` acepta `phone` y lo guarda en `options.data` |
| `src/store/auth.store.ts` | `register()` firma: `(email, password, fullName, phone)` |
| `src/pages/auth/Register.tsx` | Campo teléfono obligatorio (10 dígitos). Sin `claimProfileId` ni `useSearchParams` |
| `src/pages/auth/Login.tsx` | Se quitó link "¿Recibiste un código de activación?" |
| `src/services/members.service.ts` | Se eliminaron `sendClaimCode`, `verifyClaimCode`, `claimProfile`, `sha256`, `generateClaimCode`. `create()` ahora chequea duplicados por email/phone antes de insertar. Nueva función `findByEmailOrPhone()` |
| `src/pages/dashboard/Members.tsx` | Se quitó botón "Enviar invitación" de acciones. `guardarMiembro` maneja error de duplicado |
| `src/services/sms.service.ts` | Se eliminó `sendClaimCode` |

### Funciones eliminadas del código
- `sha256()`, `generateClaimCode()` — utilidades
- `sendClaimCode()`, `verifyClaimCode()`, `claimProfile()` — servicio
- `sendClaimCode()` — sms.service

## Flujo final

| Dirección | Comportamiento |
|-----------|---------------|
| Admin crea perfil (pending) → Usuario se registra | Trigger vincula automáticamente por email **o** phone |
| Usuario se registra primero | Se crea como `member`. Admin lo ve en lista y puede editar su rol |
| Admin intenta crear con email/phone ya existente | Error: "Ya existe un usuario con ese email o teléfono. Puedes editar su rol desde la lista" |

## Requisito pendiente

Ejecutar la migración `20260603000001_simplify_auth_flow.sql` en Supabase para activar el trigger actualizado.
