-- Omega Gym — Fix RLS SELECT policies for linked/claimed members
-- Cuando un miembro es vinculado via linkPendingProfile(), su
-- profiles.id es un UUID independiente de auth.uid() (auth.users.id).
-- Las políticas actuales comparan member_id = auth.uid() directamente,
-- lo cual bloquea las consultas para miembros vinculados.
--
-- Se reemplaza = auth.uid() con IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())

-- memberships
DROP POLICY IF EXISTS "memberships_select" ON memberships;
CREATE POLICY "memberships_select" ON memberships FOR SELECT
  USING (
    member_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR is_trainer_or_admin()
  );

-- payments
DROP POLICY IF EXISTS "payments_select" ON payments;
CREATE POLICY "payments_select" ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.id = payments.membership_id
        AND m.member_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    )
    OR is_trainer_or_admin()
  );

-- training_plans
DROP POLICY IF EXISTS "training_plans_select" ON training_plans;
CREATE POLICY "training_plans_select" ON training_plans FOR SELECT
  USING (
    assigned_to IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR created_by IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR is_trainer_or_admin()
  );

-- plan_exercises
DROP POLICY IF EXISTS "plan_exercises_select" ON plan_exercises;
CREATE POLICY "plan_exercises_select" ON plan_exercises FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM training_plans tp
    WHERE tp.id = plan_exercises.plan_id
      AND (
        tp.assigned_to IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR tp.created_by IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR is_trainer_or_admin()
      )
  ));

-- check_ins
DROP POLICY IF EXISTS "check_ins_select" ON check_ins;
CREATE POLICY "check_ins_select" ON check_ins FOR SELECT
  USING (
    member_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR is_trainer_or_admin()
  );
