# 08_shared_routines_decisions.md

## Decisión: Compartir rutinas de miembros mediante código con copia independiente

**Fecha**: 2026-08-21
**Contexto**: Omega Gym — módulo training-plans (SPEC_001)
**Autor**: Dev asistido por IA

### Problema
Los miembros necesitan crear sus propias rutinas y compartirlas entre sí, garantizando que modificar una rutina compartida jamás afecte la original.

### Opciones Evaluadas

#### Opción 1: Galería pública (columna `visibility`)
**Pros**: ✅ Descubrimiento fácil ✅ Sin fricción de códigos
**Contras**: ❌ Exposición pública no deseada por el dueño ❌ Requiere moderación ❌ Más superficie de RLS

#### Opción 2: Tabla `routine_shares` (compartir 1-a-1 con miembros específicos)
**Pros**: ✅ Control granular de destinatarios
**Contras**: ❌ Tabla + RLS extra ❌ El dueño debe conocer/seleccionar destinatarios ❌ Más queries

#### Opción 3: Código de acceso + fork (elegida)
**Pros**: ✅ Sin exposición pública ni moderación (opt-in por token) ✅ Una sola columna `share_code` + índice único parcial ✅ Copia independiente = cero acoplamiento posterior ✅ RPC SECURITY DEFINER evita abrir SELECT público ✅ Revocación trivial (NULL)
**Contras**: ❌ Requiere intercambiar código fuera de la app ❌ Sin historial de importaciones

### Decisiones Finales

**Selección**: Opción 3 — código `XXXX-XXXX` en `training_plans.share_code` + RPCs SECURITY DEFINER.

**Razones clave**:
1. El código actúa como credencial: la lectura del plan ajeno vive SOLO dentro del RPC, no se abre política SELECT nueva → superficie de ataque mínima.
2. Fork completo (plan + ejercicios) cumple exactamente el requisito "modificar la copia no afecta la original" sin lógica de sincronización.
3. Patrón probado en el proyecto: RPCs SECURITY DEFINER (`is_admin()`, `create_membership_with_payment`, `hard_delete_member`) con `search_path=''`.

### Detalles técnicos adoptados
- Alfabeto Base32 sin ambiguos: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (sin I, O, 0, 1).
- Formato almacenado: `XXXX-XXXX`; importación normaliza entrada (upper + strip no-alnum).
- Idempotencia: `generate_share_code` devuelve el código existente salvo `p_regenerate=true`; reintento máx. 5 ante colisión de índice único.
- `kind='personal'|'trainer'` en lugar de tabla separada: reutiliza `RoutineBuilder`, `ExercisePicker` y servicios existentes; DEFAULT `'trainer'` hace la migración retrocompatible.
- RLS aditiva con traducción `auth_user_id → profiles.id` (patrón de `20260616000001_fix_rls_linked_members.sql`). Las políticas viejas de escritura comparaban `created_by = auth.uid()` directo, roto para miembros vinculados — las nuevas políticas corrigen esto para planes personales.
- Bloqueo de auto-import dentro del RPC (`v_source.created_by = v_profile_id`).

### Aplicación
- Migración: `supabase/migrations/20260821000001_member_shared_routines.sql`
- Servicios: `src/services/routines.service.ts`
- UI: `src/pages/member/MyRoutines.tsx`
- Tickets: TKT-OMEGYM-019 … 022
