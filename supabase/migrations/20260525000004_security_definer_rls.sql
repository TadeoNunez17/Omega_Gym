-- Omega Gym — Reemplazar get_my_role() por funciones SECURITY DEFINER
-- get_my_role() depende del JWT (no siempre actualizado).
-- is_admin() / is_trainer_or_admin() usan SECURITY DEFINER y consultan
-- profiles.auth_user_id directamente → siempre datos frescos, sin RLS recursion.

-- ============================================
-- 1. Funciones SECURITY DEFINER
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_trainer_or_admin()
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = auth.uid() AND role IN ('admin', 'trainer')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_trainer_or_admin() TO authenticated;

-- ============================================
-- 2. Dropear todas las políticas que usan get_my_role()
-- ============================================

-- profiles (de 20260514000010 — no dropeadas por 20260525000001)
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;

-- profiles (de 20260525000001)
DROP POLICY IF EXISTS "Admin select all" ON profiles;
DROP POLICY IF EXISTS "Trainers can select profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON profiles;

-- membership_types
DROP POLICY IF EXISTS "membership_types_insert" ON membership_types;
DROP POLICY IF EXISTS "membership_types_update" ON membership_types;
DROP POLICY IF EXISTS "membership_types_delete" ON membership_types;

-- memberships
DROP POLICY IF EXISTS "memberships_select" ON memberships;
DROP POLICY IF EXISTS "memberships_insert" ON memberships;
DROP POLICY IF EXISTS "memberships_update" ON memberships;
DROP POLICY IF EXISTS "memberships_delete" ON memberships;

-- payments
DROP POLICY IF EXISTS "payments_select" ON payments;
DROP POLICY IF EXISTS "payments_insert" ON payments;
DROP POLICY IF EXISTS "payments_update" ON payments;
DROP POLICY IF EXISTS "payments_delete" ON payments;

-- training_plans
DROP POLICY IF EXISTS "training_plans_select" ON training_plans;
DROP POLICY IF EXISTS "training_plans_insert" ON training_plans;
DROP POLICY IF EXISTS "training_plans_update" ON training_plans;
DROP POLICY IF EXISTS "training_plans_delete" ON training_plans;

-- plan_exercises
DROP POLICY IF EXISTS "plan_exercises_select" ON plan_exercises;
DROP POLICY IF EXISTS "plan_exercises_insert" ON plan_exercises;
DROP POLICY IF EXISTS "plan_exercises_update" ON plan_exercises;
DROP POLICY IF EXISTS "plan_exercises_delete" ON plan_exercises;

-- check_ins
DROP POLICY IF EXISTS "check_ins_select" ON check_ins;
DROP POLICY IF EXISTS "check_ins_insert" ON check_ins;
DROP POLICY IF EXISTS "check_ins_update" ON check_ins;
DROP POLICY IF EXISTS "check_ins_delete" ON check_ins;

-- ============================================
-- 3. Recrear políticas con is_admin() / is_trainer_or_admin()
-- ============================================

-- profiles
CREATE POLICY "Admin select all" ON profiles FOR SELECT
  USING ((auth_user_id = auth.uid()) OR is_admin());

CREATE POLICY "Trainers can select profiles" ON profiles FOR SELECT
  USING ((auth_user_id = auth.uid()) OR is_trainer_or_admin());

CREATE POLICY "Admin can insert profiles" ON profiles FOR INSERT
  WITH CHECK (is_trainer_or_admin());

CREATE POLICY "Admin can update profiles" ON profiles FOR UPDATE
  USING ((auth_user_id = auth.uid()) OR is_trainer_or_admin());

CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  USING (is_admin());

-- membership_types
CREATE POLICY "membership_types_insert" ON membership_types FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "membership_types_update" ON membership_types FOR UPDATE
  USING (is_admin());

CREATE POLICY "membership_types_delete" ON membership_types FOR DELETE
  USING (is_admin());

-- memberships
CREATE POLICY "memberships_select" ON memberships FOR SELECT
  USING (member_id = auth.uid() OR is_trainer_or_admin());

CREATE POLICY "memberships_insert" ON memberships FOR INSERT
  WITH CHECK (is_trainer_or_admin());

CREATE POLICY "memberships_update" ON memberships FOR UPDATE
  USING (is_admin());

CREATE POLICY "memberships_delete" ON memberships FOR DELETE
  USING (is_admin());

-- payments
CREATE POLICY "payments_select" ON payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.id = payments.membership_id AND m.member_id = auth.uid())
    OR is_trainer_or_admin()
  );

CREATE POLICY "payments_insert" ON payments FOR INSERT
  WITH CHECK (is_trainer_or_admin());

CREATE POLICY "payments_update" ON payments FOR UPDATE
  USING (is_admin());

CREATE POLICY "payments_delete" ON payments FOR DELETE
  USING (is_admin());

-- training_plans
CREATE POLICY "training_plans_select" ON training_plans FOR SELECT
  USING (assigned_to = auth.uid() OR created_by = auth.uid() OR is_trainer_or_admin());

CREATE POLICY "training_plans_insert" ON training_plans FOR INSERT
  WITH CHECK (is_trainer_or_admin());

CREATE POLICY "training_plans_update" ON training_plans FOR UPDATE
  USING (is_trainer_or_admin());

CREATE POLICY "training_plans_delete" ON training_plans FOR DELETE
  USING (is_trainer_or_admin());

-- plan_exercises
CREATE POLICY "plan_exercises_select" ON plan_exercises FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM training_plans tp
    WHERE tp.id = plan_exercises.plan_id
    AND (tp.assigned_to = auth.uid() OR tp.created_by = auth.uid() OR is_trainer_or_admin())
  ));

CREATE POLICY "plan_exercises_insert" ON plan_exercises FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM training_plans tp
    WHERE tp.id = plan_exercises.plan_id
    AND (tp.created_by = auth.uid() OR is_trainer_or_admin())
  ));

CREATE POLICY "plan_exercises_update" ON plan_exercises FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM training_plans tp
    WHERE tp.id = plan_exercises.plan_id
    AND (tp.created_by = auth.uid() OR is_trainer_or_admin())
  ));

CREATE POLICY "plan_exercises_delete" ON plan_exercises FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM training_plans tp
    WHERE tp.id = plan_exercises.plan_id
    AND (tp.created_by = auth.uid() OR is_trainer_or_admin())
  ));

-- check_ins
CREATE POLICY "check_ins_select" ON check_ins FOR SELECT
  USING (member_id = auth.uid() OR is_trainer_or_admin());

CREATE POLICY "check_ins_insert" ON check_ins FOR INSERT
  WITH CHECK (is_trainer_or_admin());

CREATE POLICY "check_ins_update" ON check_ins FOR UPDATE
  USING (is_admin());

CREATE POLICY "check_ins_delete" ON check_ins FOR DELETE
  USING (is_admin());
