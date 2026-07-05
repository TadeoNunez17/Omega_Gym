-- Omega Gym — RLS: miembros pueden leer planes asignados vía plan_assignments
-- Las políticas de training_plans y plan_exercises ya manejan la
-- traducción auth_user_id → profiles.id, pero nunca fueron actualizadas
-- para incluir plan_assignments (many-to-many).
-- Esto causaba que un miembro asignado vía plan_assignments (no legacy
-- assigned_to) no pudiera SELECT training_plans ni plan_exercises.
-- ============================================

-- ============================================
-- 1. training_plans — SELECT
--    Agregar: el miembro puede leer si tiene una
--    asignación activa en plan_assignments.
-- ============================================
DROP POLICY IF EXISTS training_plans_select ON training_plans;

CREATE POLICY training_plans_select ON training_plans FOR SELECT
USING (
  assigned_to IN (SELECT profiles.id FROM profiles WHERE profiles.auth_user_id = auth.uid())
  OR created_by IN (SELECT profiles.id FROM profiles WHERE profiles.auth_user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM plan_assignments
    WHERE plan_assignments.plan_id = training_plans.id
    AND plan_assignments.member_id IN (
      SELECT profiles.id FROM profiles WHERE profiles.auth_user_id = auth.uid()
    )
  )
  OR is_trainer_or_admin()
);

-- ============================================
-- 2. plan_exercises — SELECT
--    Agregar: el miembro puede leer ejercicios de
--    planes asignados vía plan_assignments.
-- ============================================
DROP POLICY IF EXISTS plan_exercises_select ON plan_exercises;

CREATE POLICY plan_exercises_select ON plan_exercises FOR SELECT
USING (EXISTS (
  SELECT 1 FROM training_plans tp
  WHERE tp.id = plan_exercises.plan_id
  AND (
    tp.assigned_to IN (SELECT profiles.id FROM profiles WHERE profiles.auth_user_id = auth.uid())
    OR tp.created_by IN (SELECT profiles.id FROM profiles WHERE profiles.auth_user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM plan_assignments
      WHERE plan_assignments.plan_id = tp.id
      AND plan_assignments.member_id IN (
        SELECT profiles.id FROM profiles WHERE profiles.auth_user_id = auth.uid()
      )
    )
    OR is_trainer_or_admin()
  )
));
