-- Omega Gym — RLS Policies complementarias + backfill
-- ============================================
-- Nota: Requiere que 001_initial.sql se haya aplicado primero.
-- Estas políticas habilitan el flujo completo de la SPA.
-- ============================================

-- ============================================
-- Extensiones
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- profiles: trainers y admins pueden ver todos los perfiles
-- ============================================
DROP POLICY IF EXISTS "Trainers can select profiles" ON profiles;
CREATE POLICY "Trainers can select profiles" ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')));

-- ============================================
-- membership_types: todos los autenticados pueden ver
-- ============================================
DROP POLICY IF EXISTS "Authenticated can view membership types" ON membership_types;
CREATE POLICY "Authenticated can view membership types" ON membership_types FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- memberships: trainers y admins pueden ver todas
-- ============================================
DROP POLICY IF EXISTS "Admin manages all memberships" ON memberships;
CREATE POLICY "Admin manages all memberships" ON memberships FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')));

-- ============================================
-- payments: admin/trainer pueden ver todos; miembro ve los suyos
-- ============================================
DROP POLICY IF EXISTS "Admin can manage payments" ON payments;
CREATE POLICY "Admin can manage payments" ON payments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')));

DROP POLICY IF EXISTS "Member sees own payments" ON payments;
CREATE POLICY "Member sees own payments" ON payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.id = payments.membership_id
    AND memberships.member_id = auth.uid()
  ));

-- ============================================
-- plan_exercises: quien ve el plan ve los ejercicios
-- ============================================
DROP POLICY IF EXISTS "See own plan exercises" ON plan_exercises;
CREATE POLICY "See own plan exercises" ON plan_exercises FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM training_plans
    WHERE training_plans.id = plan_exercises.plan_id
    AND (
      training_plans.assigned_to = auth.uid()
      OR training_plans.created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    )
  ));

DROP POLICY IF EXISTS "Trainers can manage exercises" ON plan_exercises;
CREATE POLICY "Trainers can manage exercises" ON plan_exercises FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM training_plans
    WHERE training_plans.id = plan_exercises.plan_id
    AND (
      training_plans.created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    )
  ));

DROP POLICY IF EXISTS "Trainers can update exercises" ON plan_exercises;
CREATE POLICY "Trainers can update exercises" ON plan_exercises FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM training_plans
    WHERE training_plans.id = plan_exercises.plan_id
    AND (
      training_plans.created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    )
  ));

DROP POLICY IF EXISTS "Trainers can delete exercises" ON plan_exercises;
CREATE POLICY "Trainers can delete exercises" ON plan_exercises FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM training_plans
    WHERE training_plans.id = plan_exercises.plan_id
    AND (
      training_plans.created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    )
  ));

-- ============================================
-- check_ins: admin/trainer pueden insertar; admin/trainer ven todas
-- ============================================
DROP POLICY IF EXISTS "Admin can insert check_ins" ON check_ins;
CREATE POLICY "Admin can insert check_ins" ON check_ins FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')));

DROP POLICY IF EXISTS "Admin can view all check_ins" ON check_ins;
CREATE POLICY "Admin can view all check_ins" ON check_ins FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')));

-- ============================================
-- training_plans: admin/trainer pueden update y delete
-- ============================================
DROP POLICY IF EXISTS "Trainers can update plans" ON training_plans;
CREATE POLICY "Trainers can update plans" ON training_plans FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')));

DROP POLICY IF EXISTS "Trainers can delete plans" ON training_plans;
CREATE POLICY "Trainers can delete plans" ON training_plans FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')));

-- ============================================
-- Backfill: crear profiles para users que ya existen
-- ============================================
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data ->> 'full_name', 'Usuario'), 'member'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
