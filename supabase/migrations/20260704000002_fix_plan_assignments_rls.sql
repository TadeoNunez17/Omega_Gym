-- Omega Gym — Fix RLS en plan_assignments
-- La política "Members can view own assignments" comparaba
-- member_id = auth.uid() directamente, pero member_id almacena
-- profiles.id (UUID aleatorio), no el auth.users.id.
-- Para miembros creados con el flujo de pre-registro, profiles.id
-- es un UUID generado por gen_random_uuid() que NO coincide con
-- auth.uid(). La política debe traducir auth.uid() → profiles.id
-- mediante la tabla profiles, mismo patrón usado en training_plans_select.
-- ============================================

DROP POLICY IF EXISTS "Members can view own assignments" ON plan_assignments;

CREATE POLICY "Members can view own assignments" ON plan_assignments FOR SELECT
USING (
  member_id IN (SELECT id FROM profiles WHERE profiles.auth_user_id = auth.uid())
);
