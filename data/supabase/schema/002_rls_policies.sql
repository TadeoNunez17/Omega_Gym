-- Omega Gym — RLS Policies complementarias
-- Estado: active
-- Fecha: 2026-05-14
-- ============================================
-- Nota: Ejecutar después de 001_initial.sql
-- Estas políticas habilitan el flujo completo
-- de la SPA (kiosko, panel trainer, MyPlan, etc.)
-- ============================================

-- ============================================
-- profiles: trainers y admins pueden ver todos los perfiles
-- ============================================
CREATE POLICY "Trainers can select profiles" ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')));

-- ============================================
-- membership_types: todos los autenticados pueden ver
-- ============================================
CREATE POLICY "Authenticated can view membership types" ON membership_types FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- memberships: trainers y admins pueden ver todas
-- ============================================
CREATE POLICY "Admin manages all memberships" ON memberships FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')));

-- member sees own memberships ya existe en 001

-- ============================================
-- payments: admin/trainer pueden ver todos; miembro ve los suyos
-- ============================================
CREATE POLICY "Admin can manage payments" ON payments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')));

CREATE POLICY "Member sees own payments" ON payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.id = payments.membership_id
    AND memberships.member_id = auth.uid()
  ));

-- ============================================
-- plan_exercises: quien ve el plan ve los ejercicios
-- ============================================
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

CREATE POLICY "Trainers can manage exercises" ON plan_exercises FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM training_plans
    WHERE training_plans.id = plan_exercises.plan_id
    AND (
      training_plans.created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    )
  ));

CREATE POLICY "Trainers can update exercises" ON plan_exercises FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM training_plans
    WHERE training_plans.id = plan_exercises.plan_id
    AND (
      training_plans.created_by = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    )
  ));

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
-- check_ins: admin/trainer pueden insertar; miembro ve las suyas
-- ============================================
CREATE POLICY "Admin can insert check_ins" ON check_ins FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')));

CREATE POLICY "Admin can view all check_ins" ON check_ins FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')));

-- ============================================
-- training_plans: admin/trainer pueden update y delete
-- ============================================
CREATE POLICY "Trainers can update plans" ON training_plans FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')));

CREATE POLICY "Trainers can delete plans" ON training_plans FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')));
