-- Omega Gym — Fix RLS recursion
-- Las políticas que hacen subconsultas a profiles causan recursión infinita.
-- Se reemplazan usando funciones SECURITY DEFINER que no activan RLS.

-- ============================================
-- Helper functions (SECURITY DEFINER = bypass RLS)
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin_or_trainer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'));
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_same_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() = user_id;
$$;

-- ============================================
-- Recreate policies on profiles
-- ============================================
DROP POLICY IF EXISTS "Admin select all" ON profiles;
DROP POLICY IF EXISTS "Trainers can select profiles" ON profiles;
DROP POLICY IF EXISTS "Own profile select" ON profiles;
DROP POLICY IF EXISTS "Own profile update" ON profiles;

CREATE POLICY "Admin select all" ON profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Trainers can select profiles" ON profiles FOR SELECT
  USING (public.is_admin_or_trainer());

CREATE POLICY "Own profile select" ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin_or_trainer());

CREATE POLICY "Own profile update" ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- Recreate policies on memberships
-- ============================================
DROP POLICY IF EXISTS "Admin manages memberships" ON memberships;
DROP POLICY IF EXISTS "Admin manages all memberships" ON memberships;
DROP POLICY IF EXISTS "Member sees own memberships" ON memberships;

CREATE POLICY "Admin manages all memberships" ON memberships FOR ALL
  USING (public.is_admin_or_trainer());

CREATE POLICY "Member sees own memberships" ON memberships FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "Admin manages memberships" ON memberships FOR INSERT
  WITH CHECK (public.is_admin_or_trainer());

-- ============================================
-- Recreate policies on training_plans
-- ============================================
DROP POLICY IF EXISTS "Trainer creates plans" ON training_plans;
DROP POLICY IF EXISTS "Trainers can update plans" ON training_plans;
DROP POLICY IF EXISTS "Trainers can delete plans" ON training_plans;
DROP POLICY IF EXISTS "See own or assigned plans" ON training_plans;

CREATE POLICY "See own or assigned plans" ON training_plans FOR SELECT
  USING (assigned_to = auth.uid() OR created_by = auth.uid() OR public.is_admin_or_trainer());

CREATE POLICY "Trainer creates plans" ON training_plans FOR INSERT
  WITH CHECK (public.is_admin_or_trainer());

CREATE POLICY "Trainers can update plans" ON training_plans FOR UPDATE
  USING (public.is_admin_or_trainer());

CREATE POLICY "Trainers can delete plans" ON training_plans FOR DELETE
  USING (public.is_admin_or_trainer());

-- ============================================
-- Recreate policies on payments
-- ============================================
DROP POLICY IF EXISTS "Admin can manage payments" ON payments;
DROP POLICY IF EXISTS "Member sees own payments" ON payments;

CREATE POLICY "Admin can manage payments" ON payments FOR ALL
  USING (public.is_admin_or_trainer());

CREATE POLICY "Member sees own payments" ON payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.id = payments.membership_id
    AND memberships.member_id = auth.uid()
  ));

-- ============================================
-- Recreate policies on check_ins
-- ============================================
DROP POLICY IF EXISTS "Admin can insert check_ins" ON check_ins;
DROP POLICY IF EXISTS "Admin can view all check_ins" ON check_ins;
DROP POLICY IF EXISTS "Member sees own check_ins" ON check_ins;

CREATE POLICY "Member sees own check_ins" ON check_ins FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "Admin can insert check_ins" ON check_ins FOR INSERT
  WITH CHECK (public.is_admin_or_trainer());

CREATE POLICY "Admin can view all check_ins" ON check_ins FOR SELECT
  USING (public.is_admin_or_trainer());

-- ============================================
-- Recreate policies on plan_exercises
-- ============================================
DROP POLICY IF EXISTS "See own plan exercises" ON plan_exercises;
DROP POLICY IF EXISTS "Trainers can manage exercises" ON plan_exercises;
DROP POLICY IF EXISTS "Trainers can update exercises" ON plan_exercises;
DROP POLICY IF EXISTS "Trainers can delete exercises" ON plan_exercises;

CREATE POLICY "See own plan exercises" ON plan_exercises FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM training_plans
    WHERE training_plans.id = plan_exercises.plan_id
    AND (
      training_plans.assigned_to = auth.uid()
      OR training_plans.created_by = auth.uid()
      OR public.is_admin_or_trainer()
    )
  ));

CREATE POLICY "Trainers can manage exercises" ON plan_exercises FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM training_plans
    WHERE training_plans.id = plan_exercises.plan_id
    AND (
      training_plans.created_by = auth.uid()
      OR public.is_admin_or_trainer()
    )
  ));

CREATE POLICY "Trainers can update exercises" ON plan_exercises FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM training_plans
    WHERE training_plans.id = plan_exercises.plan_id
    AND (
      training_plans.created_by = auth.uid()
      OR public.is_admin_or_trainer()
    )
  ));

CREATE POLICY "Trainers can delete exercises" ON plan_exercises FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM training_plans
    WHERE training_plans.id = plan_exercises.plan_id
    AND (
      training_plans.created_by = auth.uid()
      OR public.is_admin_or_trainer()
    )
  ));
