-- Omega Gym — Fix RLS recursion (v2: JWT claim approach)
-- En lugar de subconsultas a profiles (que causan recursión),
-- sincronizamos el role a auth.users.raw_app_meta_data y lo
-- leemos desde auth.jwt() sin tocar la tabla.

-- ============================================
-- 1. Función para sincronizar role a auth.users
-- ============================================
CREATE OR REPLACE FUNCTION public.sync_role_to_app_meta()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. Trigger: cada vez que se crea/actualiza un profile
-- ============================================
DROP TRIGGER IF EXISTS sync_profile_role_trigger ON profiles;
CREATE TRIGGER sync_profile_role_trigger
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_role_to_app_meta();

-- ============================================
-- 3. Modificar handle_new_user para sincronizar al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuario'),
    'member'
  );
  -- raw_app_meta_data se actualiza via trigger sync_profile_role_trigger
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. Backfill: sync role for existing users
-- ============================================
UPDATE auth.users
SET raw_app_meta_data =
  COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', p.role)
FROM public.profiles p
WHERE auth.users.id = p.id
  AND (raw_app_meta_data ->> 'role') IS DISTINCT FROM p.role;

-- ============================================
-- 5. Reemplazar políticas recursivas (ya no hay subconsultas a profiles)
-- ============================================

-- profiles
DROP POLICY IF EXISTS "Admin select all" ON profiles;
DROP POLICY IF EXISTS "Trainers can select profiles" ON profiles;
DROP POLICY IF EXISTS "Own profile select" ON profiles;
DROP POLICY IF EXISTS "Own profile update" ON profiles;

CREATE POLICY "Own profile select" ON profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Own profile update" ON profiles FOR UPDATE
  USING (auth.uid() = id);
CREATE POLICY "Admin select all" ON profiles FOR SELECT
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
CREATE POLICY "Trainers can select profiles" ON profiles FOR SELECT
  USING (auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'trainer'));

-- memberships
DROP POLICY IF EXISTS "Admin manages memberships" ON memberships;
DROP POLICY IF EXISTS "Admin manages all memberships" ON memberships;
DROP POLICY IF EXISTS "Member sees own memberships" ON memberships;

CREATE POLICY "Member sees own memberships" ON memberships FOR SELECT
  USING (member_id = auth.uid());
CREATE POLICY "Admin manages memberships" ON memberships FOR ALL
  USING (auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'trainer'));

-- training_plans
DROP POLICY IF EXISTS "Trainer creates plans" ON training_plans;
DROP POLICY IF EXISTS "Trainers can update plans" ON training_plans;
DROP POLICY IF EXISTS "Trainers can delete plans" ON training_plans;
DROP POLICY IF EXISTS "See own or assigned plans" ON training_plans;

CREATE POLICY "See own or assigned plans" ON training_plans FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'trainer')
  );
CREATE POLICY "Trainer creates plans" ON training_plans FOR INSERT
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'trainer'));
CREATE POLICY "Trainers can update plans" ON training_plans FOR UPDATE
  USING (auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'trainer'));
CREATE POLICY "Trainers can delete plans" ON training_plans FOR DELETE
  USING (auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'trainer'));

-- payments
DROP POLICY IF EXISTS "Admin can manage payments" ON payments;
DROP POLICY IF EXISTS "Member sees own payments" ON payments;

CREATE POLICY "Admin can manage payments" ON payments FOR ALL
  USING (auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'trainer'));
CREATE POLICY "Member sees own payments" ON payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.id = payments.membership_id
    AND memberships.member_id = auth.uid()
  ));

-- check_ins
DROP POLICY IF EXISTS "Admin can insert check_ins" ON check_ins;
DROP POLICY IF EXISTS "Admin can view all check_ins" ON check_ins;
DROP POLICY IF EXISTS "Member sees own check_ins" ON check_ins;

CREATE POLICY "Member sees own check_ins" ON check_ins FOR SELECT
  USING (member_id = auth.uid());
CREATE POLICY "Admin can insert check_ins" ON check_ins FOR INSERT
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'trainer'));
CREATE POLICY "Admin can view all check_ins" ON check_ins FOR SELECT
  USING (auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'trainer'));

-- plan_exercises
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
      OR auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'trainer')
    )
  ));
CREATE POLICY "Trainers can manage exercises" ON plan_exercises FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM training_plans
    WHERE training_plans.id = plan_exercises.plan_id
    AND (
      training_plans.created_by = auth.uid()
      OR auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'trainer')
    )
  ));
CREATE POLICY "Trainers can update exercises" ON plan_exercises FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM training_plans
    WHERE training_plans.id = plan_exercises.plan_id
    AND (
      training_plans.created_by = auth.uid()
      OR auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'trainer')
    )
  ));
CREATE POLICY "Trainers can delete exercises" ON plan_exercises FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM training_plans
    WHERE training_plans.id = plan_exercises.plan_id
    AND (
      training_plans.created_by = auth.uid()
      OR auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'trainer')
    )
  ));

-- membership_types: todos los autenticados pueden ver
DROP POLICY IF EXISTS "Authenticated can view membership types" ON membership_types;
CREATE POLICY "Authenticated can view membership types" ON membership_types FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- 6. Limpiar funciones viejas (ya no se necesitan)
-- ============================================
DROP FUNCTION IF EXISTS public.is_admin_or_trainer();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_same_user(UUID);
